# Claude-Code-Auftrag — Lagereintrag: Auftrag/Einsatz mit getrennter Mengen-Aufteilung (Variante C)

Umsetzung der **festgelegten Variante C**: je Lagereintrag können **mehrere Aufträge
und mehrere Einsätze** zugeordnet werden, und die Menge des Eintrags wird **getrennt
je Auftrag und je Einsatz aufgeteilt** (zwei unabhängige Splits, „Modell G"),
abgeglichen gegen die Gesamtmenge. Angezeigt als **Chips mit Menge** direkt im Eintrag.

Zwei Repos, in dieser Reihenfolge:
- **A) Design-System** (`krt-profit/design-system`) — enthält bereits die kanonischen
  Klassen + Specimen + README-Abschnitt (vom Nutzer eingespielt). Im Basetool als
  **Submodul** auf diesen Stand heben.
- **B) Produkt** (`krt-profit/basetool`) — die Lagerverwaltung auf das Chip-Muster mit
  getrennter Mengen-Aufteilung umbauen.

> **Halte dich strikt an den Entwurf.** Kanonische Optik & Verhalten:
> `inventory-entry-multi-assign-quantity-varianten.html` → **Variante C** (Abschnitt
> mit dem grünen „Festgelegt"-Tag) und das Specimen
> `preview/components-entry-assign.html`. Keine eigenen Farben, Abstände, Idiome
> erfinden; nur die dort definierten Systemklassen verwenden.
>
> **Bei Unklarheiten oder nötigen Entscheidungen: erst den Nutzer fragen, nicht raten.**
> Die wahrscheinlichen Entscheidungspunkte sind unten unter „Rückfragen" gesammelt —
> kläre sie, bevor du den betroffenen Teil implementierst.

---

## Quelle der Wahrheit

Im Design-System-Submodul (`.claude/skills/das-kartell-design/`):
- **Optik/Verhalten:** `proposals/inventory-entry-multi-assign-quantity-varianten.html`
  → **Variante C**. Specimen: `preview/components-entry-assign.html`.
- **CSS:** `krt-components.css` → Abschnitt **„Entry associations — split with amounts"**:
  `.assoc-split`, `.assoc-chip` (`--order` / `--mission`) + `.assoc-chip__amt`,
  `.assoc-add` (+ `.assoc-add-wrap`), `.assoc-pop` (+ `.assoc-pop__menge`),
  `.krt-combobox__label`; README → **„Entry associations (split quantities)"**.
- Wiederverwendete, unveränderte Muster: Tree-Table (`.tree-*`), Chip
  (`.chip--success/--muted/--danger` als Rest-Indikator), Combobox (`.krt-combobox*`).

Betroffene Produkt-Dateien (unter `frontend/src/main/resources/`):
- `templates/fragments/inventory-stack-entries.html` — lazy geladene Eintrags-Zeilen
  (`stackEntriesMy` **und** `stackEntriesAdmin`); hier sitzen heute die
  `select.association-select` (Feld `jobOrderId` / `missionId`). **Hauptdatei.**
- `templates/inventory-input.html` — Einbuchen-Formular (Auftrag/Einsatz-Selects).
- `messages.properties` / `messages_de.properties` / `messages_en.properties`.
- `static/js/inventory-*.js` — Seiten-Module hinter den `data-trigger`-Handlern
  (heute `inv-my-update-assoc` / `inv-admin-update-assoc`).
- Backend (`de.greluc.krt.profit.basetool…`): InventoryItem-Entity, `InventoryItemDto`,
  Inventory-Controller/-Service, Flyway-Migration. **Exakte Namen im Repo suchen.**

## Arbeitsweise

- Kleine, prüfbare Commits, ein Block pro Schritt; nach jedem Schritt `./gradlew check`.
- **Erhalten:** i18n (de/en, keine hartkodierten Strings), CSP-Nonce, Lazy-Load
  (ADR-0003), `localStorage`-Expand-State, Optimistic Locking (`version`),
  `sec:authorize`-Gating, `data-trigger`/krtEvents-Delegation.
- Beide Seiten (`/inventory/my`, `/inventory/all`) identisch. Keine nativen Dialoge
  (`confirm/alert/prompt`) — nur KRT-Toasts/-Modals.

---

## TEIL A — Design-System-Submodul heben

1. Sicherstellen, dass `krt-profit/design-system` den aktuellen Stand hat (Klassen,
   Specimen, README — vom Nutzer eingespielt).
2. Im Basetool das Submodul aktualisieren:
   `git -C .claude/skills/das-kartell-design fetch && git -C .claude/skills/das-kartell-design checkout <commit-oder-tag>`,
   dann im Superprojekt den neuen Submodul-Zeiger committen
   (`git add .claude/skills/das-kartell-design`).
3. Falls die Frontend-`styles.css` das DS-CSS gebündelt/portiert einbindet: die neuen
   `.assoc-*`-Klassen + `.krt-combobox__label` dorthin spiegeln (gleicher Sync-Weg wie
   beim Tree-Table-Umbau). Keine Abweichung vom DS-CSS.

## TEIL B — Produkt umbauen

### 1. Datenmodell — zwei getrennte Splits mit Menge
- Statt der Skalare `jobOrderId` / `missionId` am InventoryItem: **zwei getrennte
  Zuordnungslisten** mit je einer Menge —
  `jobOrderAllocations: [{ jobOrderId, amount }]` und
  `missionAllocations: [{ missionId, amount }]`.
- **Flyway-Migration:** zwei Tabellen (z. B. `inventory_item_job_order_allocation` /
  `inventory_item_mission_allocation`) mit `inventory_item_id`, FK und
  `amount` (gleicher Typ/Präzision wie `inventory_item.amount`), Unique auf
  (`inventory_item_id`, FK). Bestehende Einzel-Zuordnungen migrieren
  (siehe Rückfrage 6).
- `InventoryItemDto` liefert beide Listen inkl. Anzeigefeldern (Auftrag `displayId`,
  Mission `name` + `plannedStartTime`) und `amount` je Zuordnung.
- **Abgleich (Server + UI):** je Liste gilt `Σ amount ≤ inventory_item.amount`.
  Ein unverteilter **Rest ≥ 0 ist erlaubt**; **Über-Verteilung** (`Σ > amount`) wird
  **abgelehnt** (Validierungsfehler, kein Speichern). Beide Splits sind unabhängig.
- **Invarianten:** persönlicher Eintrag ⇒ keine Zuordnung
  (`error.inventory.personal.assignment`); Auftrag nur zuordenbar, wenn sein
  `requiredMaterialIds` das Material enthält.

### 2. Endpunkte — Add / Menge ändern / Remove je Zuordnung
Mit `version` (Optimistic Lock) und Rechteprüfung (`LOGISTICIAN/OFFICER/ADMIN`; im
`my`-Kontext eigener Eintrag). Serverseitig `requiredMaterialIds`-, Personal- und
Über-Verteilungs-Regel validieren; 409 bei Version-Konflikt, 422 bei Über-Verteilung.
- `POST /inventory/{my,all}/entry/{id}/allocation` `{ field: jobOrder|mission, targetId, amount, version }` → hinzufügen
- `PATCH …/allocation` `{ field, targetId, amount, version }` → Menge ändern
- `DELETE …/allocation` `{ field, targetId, version }` → entfernen
- Antwort: neue `version` + beide aktualisierten Listen (für optimistisches UI-Update).
(Exakte Route/Verb-Konvention an bestehende Controller anpassen.)

### 3. Template — `fragments/inventory-stack-entries.html` (beide Fragmente)
Je `.tree-field` das `select.association-select` durch die `.assoc-split`-Gruppe
ersetzen — Markup exakt nach Specimen/Variante C:

```html
<div class="tree-field">
  <span class="tree-field-cap" th:text="#{inventory.order}">Auftrag</span>
  <div class="assoc-split" th:data-id="${entry.id}" th:data-field="jobOrder"
       th:data-material-id="${entry.material.id}" th:data-version="${entry.version}"
       th:data-total="${entry.amount}">
    <span class="assoc-chip assoc-chip--order" th:each="a : ${entry.jobOrderAllocations}"
          th:data-target-id="${a.jobOrderId}"
          sec:authorize="hasAnyRole(...)" th:classappend="${entry.personal}? 'is-readonly'"
          data-trigger="inv-my-assoc-edit" th:title="'Auftrag #' + ${a.jobOrderDisplayId}">
      <span th:text="'#' + ${a.jobOrderDisplayId}">#1042</span> ·
      <span class="assoc-chip__amt" th:text="${#numbers.formatDecimal(a.amount,1,'NONE',3,'DEFAULT')}">1.000</span>
    </span>
    <span class="assoc-add-wrap" sec:authorize="hasAnyRole(...)" th:unless="${entry.personal}">
      <button type="button" class="assoc-add" data-trigger="inv-my-assoc-add"
              th:aria-label="#{inventory.assoc.add}"
              th:text="${#lists.isEmpty(entry.jobOrderAllocations)}? #{inventory.assoc.add.label} : '+'">+ Zuordnen</button>
    </span>
    <!-- Rest-Chip: Server rechnet Rest = amount − Σ; Tonklasse entsprechend -->
    <span class="chip" th:if="${!#lists.isEmpty(entry.jobOrderAllocations)}"
          th:classappend="${entry.jobOrderRest == 0}? 'chip--success' : (${entry.jobOrderRest > 0}? 'chip--muted' : 'chip--danger')"
          th:text="${entry.jobOrderRest == 0}? 'Rest 0' : (${entry.jobOrderRest > 0}? ('Rest ' + ... + ' frei') : ...)">Rest 0</span>
  </div>
</div>
```
- Zweites `.tree-field` analog für **Einsatz** (`#{inventory.tree.field.mission}`,
  `assoc-chip--mission`, `data-field="mission"`, Label = `mission.name` [+ Datum],
  `entry.missionAllocations` / `entry.missionRest`).
- **Read-only** (ohne Recht): `sec:authorize`-Zweige entfallen → Chips ohne Klick-Trigger,
  kein Add-Button (wie im heutigen Read-only-Zweig des `stackEntriesAdmin`).
- Alle bestehenden `data-*` (Bookout/Umbuchen/Notiz/Version) unverändert lassen.
- **Add-Kandidaten** je Eintrag als Daten bereitstellen (nicht sichtbar) — Aufträge
  gefiltert nach `requiredMaterialIds` (wie heutiges `<option th:if=…>`), noch nicht
  voll zugeordnet — damit das JS die `.krt-combobox`-Optionen bauen kann.
- Trigger im `admin`-Fragment: `inv-admin-assoc-add` / `-edit`.

### 4. JS — Chips, Mengen-Editor, Suche, Rest (Muster: Variante-C-Code im Entwurf)
An die krtEvents-Delegation anhängen:
- `inv-*-assoc-add` („+ Zuordnen"): `.assoc-pop` mit `.krt-combobox` am
  `.assoc-add-wrap` öffnen; Optionen aus den Kandidaten; Tippfilter mit `<mark>`
  (Option-Label in `.krt-combobox__label` wrappen!); Auswahl → Endpunkt (Menge
  zunächst 0 oder Rest, siehe Rückfrage 3) → Chip einfügen.
- `inv-*-assoc-edit` (Klick auf Chip): `.assoc-pop.assoc-pop__menge` mit Mengenfeld
  + „Entfernen" öffnen; Speichern → PATCH; Entfernen → DELETE; danach Chips + Rest-Chip
  je Gruppe neu berechnen.
- **Rest-Chip** nach jeder Änderung neu setzen: Rest 0 → `chip--success`, Rest > 0 →
  `chip--muted` („… frei"), Über-Verteilung → `chip--danger` + Fehlermeldung, Speichern
  ablehnen. Mengenformat wie `tree-amount` (`#numbers.formatDecimal`, SCU/Stück).
- Nach Lazy-Load/Pagination neue Zeilen ohne Re-Binding (Delegation) — wie bestehende Handler.

### 5. Einbuchen-Formular — `inventory-input.html`
Siehe **Rückfrage 4** (ob Split schon beim Einbuchen oder erst nachträglich im Lager).
Falls Split beim Einbuchen: dieselbe `.assoc-split`-Gruppe je Dimension mit Mengenfeld
und Rest-Abgleich gegen die eingebuchte Menge; Personal-Regel beibehalten.

### 6. i18n (de/en) — neue Schlüssel (Umlaute `\uXXXX`-escaped)
```
inventory.assoc.add=Zuordnen
inventory.assoc.add.label=+ Zuordnen
inventory.assoc.remove=Zuordnung entfernen
inventory.assoc.amount=Menge (SCU)
inventory.assoc.add.order=Auftrag suchen …
inventory.assoc.add.mission=Einsatz suchen …
inventory.assoc.rest.free={0} frei
inventory.assoc.rest.zero=Rest 0
error.inventory.assoc.overallocated=Zugeordnete Menge übersteigt die Bestandsmenge.
notification.success.assoc.saved=Zuordnung gespeichert.
```

---

## Rückfragen an den Nutzer (vor Umsetzung klären)

1. **Abgleich-Strenge:** Rest > 0 ist erlaubt (bestätigt). Soll das UI beim Speichern
   eines Eintrags mit Rest > 0 zusätzlich einen dezenten Hinweis zeigen, oder still bleiben?
2. **Genauigkeit der Menge je Zuordnung:** gleiche Dezimal-/SCU-Präzision wie die
   Eintragsmenge (cSCU/µSCU), oder ganzzahlig?
3. **Default-Menge beim Hinzufügen:** neue Zuordnung startet mit 0, mit dem aktuellen
   Rest, oder mit der vollen Restmenge?
4. **Einbuchen-Formular:** soll die Aufteilung schon beim Einbuchen möglich sein, oder
   erst nachträglich im Lager (Formular dann ohne Split)?
5. **Bookout/Umbuchung:** wenn die Eintragsmenge sinkt und die Splits dann > Menge
   wären — automatisch anteilig kürzen, oder Nutzer zur manuellen Korrektur zwingen
   (Speichern blockiert)?
6. **Migration bestehender Einzel-Zuordnungen:** die vorhandene 1:1-Zuordnung mit der
   **vollen Eintragsmenge** als eine Allocation übernehmen (Vorschlag) — bestätigen?
7. **Rechte:** Reicht die bestehende `LOGISTICIAN/OFFICER/ADMIN`-Gating-Regel auch für
   das Ändern der Menge, oder braucht die Mengen-Änderung ein eigenes Recht?

---

## Definition of Done
1. Ein Lagereintrag trägt auf `/inventory/my` **und** `/inventory/all` mehrere Aufträge
   und mehrere Einsätze, jeweils als Chip **mit Menge** (Auftrag orange, Einsatz blau);
   Menge getrennt je Dimension.
2. „+ Zuordnen" → Suche (Combobox, `<mark>`); Chip-Klick → Mengen-Editor (ändern/entfernen);
   jede Änderung sofort persistiert (mit `version`).
3. Rest-Chip je Gruppe: Rest 0 grün, Rest > 0 neutral „… frei", Über-Verteilung rot +
   serverseitig abgelehnt.
4. Auftrags-Vorschläge material-gefiltert; persönliche Einträge ohne Zuordnung; ohne
   Recht Chips read-only.
5. Flyway-Migration überführt bestehende Einzel-Zuordnungen verlustfrei; Lazy-Load,
   Expand, Filter, Bookout, Notiz, i18n (de/en) weiter funktionsfähig.
6. `./gradlew check` grün; Optik deckt sich mit Variante C in
   `inventory-entry-multi-assign-quantity-varianten.html` + `preview/components-entry-assign.html`.
7. Submodul-Zeiger im Produkt zeigt auf den DS-Commit aus Teil A. Offene Rückfragen
   sind vor der jeweiligen Umsetzung geklärt.
