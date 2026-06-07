# Claude-Code-Auftrag — Design-System aktualisieren + Inventar-Tabellen als Tree-Table umbauen

Repo: `krt-iri/basetool`. Zwei Teile:
- **A) Design-System im Repo auf den aktuellen Stand bringen** (Tokens, Komponenten,
  inkl. der neuen **Tree-Table**-Komponente und der `th`-Farbe).
- **B) `/inventory/all` und `/inventory/my` exakt auf das Tree-Table-Muster umbauen**
  (ein Spaltenkopf, Einrückung, rechtsbündige Zahlen + Qualitäts-Gauge, breite
  beschriftete Selects, bedingte Notiz, Abstand Menge↔Aktion).

## Quelle der Wahrheit
Das `das-kartell-design`-Skill (`.claude/skills/das-kartell-design/`):
- `colors_and_type.css`, `krt-components.css`, `styles.css` (Einstiegspunkt).
- README → Abschnitt **„Tree table (nested data)"** + **„Action hierarchy"**.
- Soll-Optik: `proposals/inventory-table-readability.html` (Vorher/Nachher),
  Specimen `preview/components-tree-table.html`.
- Befundliste: `proposals/inventory-table-audit.md`.

Betroffene Dateien:
- Frontend-CSS: `frontend/.../static/css/styles.css` (bzw. die portierten
  `colors_and_type.css` + `krt-components.css`).
- `frontend/.../templates/inventory-admin.html` (`/inventory/all`, mit Staffel-Spalte).
- `frontend/.../templates/inventory-my.html` (`/inventory/my`, ohne Staffel-Spalte).
- Eintrags-Fragment, das per `/inventory/all/stack/entries` lazy nachgeladen wird
  (ADR-0003) — dort sitzen die Menge/Auftrag/Einsatz/Aktion-Zeilen.

## Arbeitsweise
- Kleine, prüfbare Commits, ein Block pro Schritt. Nach jedem Schritt `./gradlew check`.
- i18n (de/en), CSP-Nonce, Lazy-Load (ADR-0003) und `localStorage`-Expand-State
  **erhalten**. Keine neuen Farben; nur System-Tokens/-Klassen.
- Optik nach jedem Schritt gegen `proposals/inventory-table-readability.html`
  (rechte Spalte) und `preview/components-tree-table.html` abgleichen.

---

## TEIL A — Design-System im Repo aktualisieren

1. **Tokens/Fonts**: `colors_and_type.css` übernehmen (Audiowide; semantische Tokens
   `--color-danger/-success/-warning/-info`; `--color-surface-input`;
   neutrale `label`-Defaults; `@kind`-Annotationen an `--fw-*`/`--lh-body`).
2. **Komponenten**: `krt-components.css` übernehmen — neu darin u. a.:
   - **Tree-Table**-Komponente (`.tree-table`, `.tree-row`, `.tree-head`,
     `.tree-row--group/--mid/--leaf`, `.tree-name`, `.tree-chevron`,
     `.tree-leaf-main`, `.tree-fieldset`/`.tree-field`, `.tree-gauge`,
     `.tree-amount`/`.tree-unit`, `.tree-note*`, `.tree-cell--num`,
     `.tree-cell--actions`, `.btn-xs`).
   - `th`-Textfarbe = `--color-gray-1` (2px-Orange-Unterrule bleibt).
   - Button-Leiter (`.btn--cta/.btn-outline/.btn-ghost/.btn-quiet-danger`),
     `.panel-header`, `.data-value`, Scrollbar-System (falls noch nicht im Repo).
3. **Einstiegspunkt**: `styles.css`, das `colors_and_type.css` + `krt-components.css`
   importiert, als Consumer-Link bereitstellen (oder die bestehende
   Frontend-`styles.css` entsprechend strukturieren).

## TEIL B — Inventar-Tabellen umbauen (beide Seiten identisch)

Aktuell: drei verschachtelte `<table class="krt-table">` (Material → Stack →
Einträge), jede mit eigenem `<thead>`; der Einträge-Kopf wiederholt sich pro
offenem Stack. Ziel: **ein** Tree-Table mit gemeinsamer Spaltenstruktur.

Gemeinsame Spalten (Grid-Template über `--tree-cols`):
**Bestand | Kontext / Zuordnung | Qualität | Menge | Aktion**
(`/inventory/all` zeigt in „Kontext" zusätzlich die Staffel-Pill; `/inventory/my`
ohne — gleiche Spalten, nur Inhalt unterscheidet sich.)

1. **Ein Spaltenkopf** (`.tree-head`, sticky) für die ganze Tabelle. Die drei
   bisherigen `<thead>` entfallen.
2. **Material = `.tree-row--group`**: Orange-Akzentbalken links, Chevron, Name
   (weiß, bold), optionale Kontextzeile „N Nutzer · M Stacks" (`gray-2`),
   Ø-Qualität als `.tree-gauge` (Wert „639 / 796" + Bar = Ø/1000), Gesamtmenge als
   `.tree-amount`.
3. **Stack/Nutzer = `.tree-row--mid`**: 1 Stufe eingerückt + Schiene; Name (Nutzer),
   Kontext = Staffel-Pill (nur `all`) + Standort (einzeilig, Ellipsis, `title`),
   Qualität als Gauge, Menge als `.tree-amount`, rechts „k Einträge" (`gray-2`).
   Lazy-Load der Einträge + `localStorage`-Expand beibehalten.
4. **Eintrag = `.tree-row--leaf`**: `.tree-leaf-main` (spannt Bestand+Kontext+
   Qualität) mit „Eintrag"-Tag und zwei **breiten, beschrifteten** Selects
   (`.tree-field` mit Caption „Auftrag"/„Einsatz") — lange Auftrags-/Einsatznamen
   bleiben lesbar. Menge als `.tree-amount` (Spalte 4), Aktionen in
   `.tree-cell--actions`: „Ausbuchen" `.btn btn-outline btn-xs`, „Notiz"
   `.btn btn-ghost btn-xs` (→ `.btn-outline`, wenn Notiz vorhanden).
5. **Notiz nur bei vorhandener Notiz**: `th:if="${entry.note != null and
   !entry.note.isBlank()}"` → eine `.tree-note`-Zeile mit `.tree-note-box`
   (Orange-Label „Notiz" + Volltext, bis 80ch, Umbruch). Ohne Notiz: keine Zeile.
6. **Abstand Menge ↔ Aktion**: durch `.tree-cell--actions` (linkes Polster) bereits
   gelöst — sicherstellen, dass Wert und Buttons nicht aneinanderkleben.
7. **Zahlen** generell rechtsbündig + `tabular-nums`; Einheit (`SCU`/`Stück`)
   gedämpft via `.tree-unit`; Mengenformat über `#numbers.formatDecimal`
   vereinheitlichen.
8. **Filter-Leiste, Bookout-Modal, Action-Bar-Buttons** unverändert lassen
   (nutzen bereits `.btn--cta/.btn-ghost/.btn-quiet-danger`).

### Hinweis zur Umsetzung
Die Markup-Struktur wechselt von verschachtelten `<table>` zu Grid-`<div>`-Zeilen
(`.tree-row`). Das vereinfacht Einrückung/Ausrichtung erheblich. Falls Tabellen-
Semantik (a11y) gewünscht ist, alternativ `role="treegrid"`/`role="row"`/
`role="gridcell"` auf die Grid-Container setzen. JS für Expand/Collapse + Lazy-Load
anpassen (Selektoren auf `.tree-row--group/--mid` + `.tree-chevron`).

## Definition of Done
1. `/inventory/all` und `/inventory/my` rendern als **ein** Tree-Table mit **einem**
   sticky Kopf; keine wiederholten Ebenen-Köpfe mehr.
2. Material/Stack/Eintrag klar **eingerückt** (Orange-Balken → Schiene → Eintrag);
   Zahlen rechtsbündig + tabellarisch; Qualität als Gauge.
3. Eintrag: breite beschriftete Auftrag/Einsatz-Selects (lange Namen lesbar);
   klarer Abstand zwischen Menge und Aktions-Buttons.
4. **Notiz erscheint nur, wenn vorhanden**, als eingerückte Box mit vollem Text.
5. Lazy-Load, Expand-State, Filter, Bookout, i18n weiterhin funktionsfähig.
6. `./gradlew check` grün; Optik deckt sich mit
   `proposals/inventory-table-readability.html` + `preview/components-tree-table.html`.
