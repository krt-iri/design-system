# Claude-Code-Auftrag — Feature „Materialbörse" (Flotte & Logistik)

Repo: `krt-profit/basetool`. Ziel: die **Materialbörse** unter *Flotte & Logistik*
umsetzen — Plan **und** Implementierung strikt nach dem bereits im Design-System
abgelegten, **finalen** Entwurf. Dieser Auftrag ist bindend.

> **OBERSTE REGEL — DESIGN HAARGENAU ÜBERNEHMEN.**
> Der finale Entwurf ist die verbindliche Spezifikation. Es wird **nichts** am
> Layout, an Abständen, Farben, Klassen, Copy, Reihenfolgen oder Interaktionen
> „verbessert", ergänzt oder weggelassen. Jedes sichtbare Element muss auf eine
> **bestehende KRT-Design-System-Klasse/-Token** abgebildet werden. Weicht die
> Umsetzung optisch vom Entwurf ab, ist sie falsch — nicht der Entwurf.
> Abweichungen sind nur zulässig, wenn eine echte Lücke im Design-System
> nachgewiesen und **vorher** mit dem Auftraggeber geklärt wurde.

---

## SCHRITT 0 (zuerst!) — Design-System-Submodule aktualisieren

Der Entwurf und alle Muster liegen im **Design-System-Submodule** (`krt-profit/design-system`),
das im Basetool-Repo eingebunden ist (i. d. R. unter `.claude/skills/das-kartell-design/`).
**Vor Plan und Code** den Submodule-Pointer auf den aktuellen Stand ziehen:

```bash
git submodule status                       # Pfad des DS-Submodules ermitteln
git submodule update --init --remote <ds-submodule-pfad>
git -C <ds-submodule-pfad> log -1 --oneline # muss die Materialbörse + Sync 2026-07 enthalten
git add <ds-submodule-pfad>                 # Pointer-Bump als eigenen Commit
git commit -m "chore(design-system): submodule auf Materialbörse-Stand aktualisieren"
```

Erst wenn das Submodule die Dateien aus „Quelle der Wahrheit" enthält, geht es weiter.
Der Pointer-Bump ist ein **eigener, erster Commit** und Teil der Definition of Done.

## Quelle der Wahrheit (im Submodule)

- **Verbindlicher Entwurf (pixel-/mus.­genau):**
  `proposals/materialboerse-final.html` + `proposals/materialboerse-final.js`.
  Das ist der interaktive Prototyp im **finalen** Zustand (Layout **Master-Detail**).
- **Foundations:** `colors_and_type.css` (Tokens, Lato), `krt-components.css`
  (Komponenten). `README.md` → Abschnitte *Action hierarchy*, *Master-detail*,
  *Card & chip*, *Sync log — 2026-07*.
- **Specimens** der neu synchronisierten Komponenten:
  `preview/components-markdown.html`, `preview/components-filters.html`,
  `preview/components-presence.html`, `preview/components-master-detail.html`.

Der Prototyp nutzt Vanilla-JS zur Demo. Die **Struktur, Klassen, Copy und
Interaktionslogik** sind bindend; der JS-Code ist **nicht** 1:1 zu kopieren,
sondern in Thymeleaf-Templates + die Produkt-JS-Konventionen zu übersetzen
(siehe *Umsetzungs-Vorgaben*).

---

## Feature-Spezifikation (verbindlicher Umfang)

**Zweck:** zentraler, für alle sichtbarer Marktplatz für zum Tausch freigegebene
Materialien. Angezeigt wird **nur**: welcher Spieler welches Material in welcher
**Qualität** und **Menge** anbietet.

1. **Freigabe im Lager** (Ursprung eines Postens): auf einem Lager-Eintrag eine
   Checkbox **„Für Börse freigeben"**. Aktivieren öffnet den **Bemerkung-Dialog**
   (KRT-Modal): kompakte, **read-only** Fakten-Leiste (Material · Qualität als
   **reine Zahl** · Menge SCU) + Textarea **Bemerkung** (Markdown, **max. 20.000
   Zeichen**, Live-Zeichenzähler). Freigeben → Posten erscheint sofort in der Börse.
   Häkchen entfernen → Posten wird deaktiviert (von der Börse genommen).
   **Der Standort wird nie an die Börse übertragen.**
2. **Börsen-Ansicht** = **Master-Detail** (festgelegtes Layout): schlanke Liste
   links, vollständiges Angebot rechts. Kopf mit einer gefüllten CTA
   **„Material anbieten"** (öffnet denselben Freigabe-Dialog).
3. **Tabs:** „Alle Angebote" (Zähler) · „Meine Angebote" (Zähler). *Die Anzahl steht
   im Tab — es gibt **keine** separate Ergebnis-Zähler-Zeile.*
4. **Filter/Sortierung:** Suche (Material **oder** Spieler), Mindestqualität
   (0–1000), Mindestmenge (SCU), Sortierung: **Qualität ↓ · Menge ↓ · Material A–Z ·
   Neueste zuerst**. *(Kein „nur ohne Interessenten"-Filter — bewusst entfernt.)*
5. **Detail-Bereich:** Material (Titel) · „von {Spieler}" + Staffel-Badge · bei
   eigenem Angebot Marker **„Dein Angebot"** · Fakten **Qualität (reine Zahl, ohne
   „/ 1000") · Menge (SCU) · Freigegeben**. *Kein Feld „Kategorie".* Darunter die
   **volle Bemerkung als gerendertes Markdown** (`.markdown-content`) und die
   **Interessenten**.
6. **Anonymität (Kernprinzip):** **kein Standort/Übergabeort** — nirgends.
   Interessenten-**Namen** sieht **nur der Anbieter**; alle anderen sehen
   ausschließlich die **Anzahl** („N Interessenten" / „Keine Interessenten").
7. **Aktionen:** fremdes Angebot → **„Interesse anmelden"** (`.btn-outline`,
   toggelt zu „zurückziehen"); trägt den Interessenten ein, damit der Anbieter die
   Verhandlung aufnehmen kann. Eigenes Angebot → **„Bemerkung bearbeiten"**
   (`.btn-ghost`) + **„Angebot deaktivieren"** (`.btn-quiet-danger`). Diese beiden
   erscheinen **nur** beim Besitzer.

---

## Plan-Phase — was der Plan zwingend enthalten muss

Bevor Code entsteht, einen Plan schreiben, der **explizit an den Entwurf gebunden**
ist. Der Plan ist erst gültig, wenn er enthält:

1. **Screen-Inventar** aus `materialboerse-final.html`: jede sichtbare Region
   (Kopf+CTA, Tabs, Filterleiste, Master-Liste, Detail-Pane, Freigabe-Modal,
   Lager-Checkbox-Zeile) als eigener Punkt.
2. **Mapping-Tabelle „Element → DS-Klasse/-Token"** für **jedes** Element. Zu
   verwenden sind die **bestehenden** Komponenten, u. a.:
   - Master-Detail: `.master-detail` / `.master-list` / `.master-row(.is-active)` /
     `.detail-pane` · Tabs: `.tab-nav`/`.tab`/`.tab-count` · Fakten: `.kv-compact`
     bzw. `.facts-bar`.
   - Filter/Suche: `.multi-select-*`, `.krt-combobox*` / `.autocomplete-items`,
     `.scu-hint` (SCU-Eingaben) — **keine** Eigenbauten.
   - Bemerkung: `.markdown-content` (serverseitig gerendert, s. u.).
   - Badges/Chips: `.squadron-badge(-foreign)`, `.chip(--primary/--muted)`.
   - Modal: `.krt-modal*` (Freigabe/Bearbeiten) · leere Liste: `.empty-state` ·
     Async: `.krt-loading-indicator` · Feedback: `.notification-toast`.
   - Button-Leiter: **eine** gefüllte `.btn--cta` pro Kontext (Kopf „Material
     anbieten"); `.btn-outline` (Interesse), `.btn-ghost` (Bearbeiten),
     `.btn-quiet-danger` (Deaktivieren).
3. **Liste neuer CSS-Regeln = möglichst leer.** Erlaubt ist ausschließlich
   **Seiten-Komposition** (Grid/Abstände) in einer neuen `materialboerse.css`
   analog `leitung.css`/`promotion-admin.css` — **kein** neues visuelles Vokabular,
   keine neuen Farben. Jede Zeile neues CSS wird im Plan begründet.
4. **Backend-Skizze:** Route/Controller unter *Flotte & Logistik*, Flag
   „für Börse freigegeben" + Bemerkung am Lager-Posten, Interessenten-Relation,
   Sichtbarkeitsregel (Namen nur für Anbieter). i18n-Keys (de/en) gelistet.
5. **Abgleich-Schritt:** „nach jedem Schritt Optik gegen
   `proposals/materialboerse-final.html` prüfen" ist Teil des Plans.

---

## Umsetzungs-Vorgaben (Produkt-Konventionen)

- **Thymeleaf + Spring Boot.** Markup 1:1 an der Entwurfsstruktur; DS-Klassen
  unverändert übernehmen.
- **Markdown:** Bemerkung serverseitig über den vorhandenen `@markdown`-Bean
  rendern (Escaping/Sanitizing) und in `.markdown-content` ausgeben — **keinen**
  Client-Markdown-Renderer bauen (der `md()` im Prototyp ist nur Demo).
- **i18n:** **jede** sichtbare Zeichenkette externalisiert (Deutsch Default, English
  vollständig); Umlaute in `.properties` als `\uXXXX`. Keine hartcodierten Texte.
- **Keine nativen Dialoge** — `confirm()/alert()/prompt()` verboten. KRT-Modal bzw.
  `showKrtConfirm()` + Toasts.
- **Selects/Filter** über die Produkt-Komponenten (Multi-Select-JS,
  `krtSearchableSelect`) — nicht neu erfinden.
- **Ecken scharf** (nur Pills/Radio rund). **Keine Emoji.** **Kein CDN** (CSP) —
  Icons aus dem Sprite. Zahlen `tabular-nums`; deutsches Zahlenformat
  (`#numbers.formatDecimal`).
- **Responsive** über die vier Geräteklassen; Master-Detail fällt auf schmalen
  Screens auf **Liste → Detail** zusammen (Zurück-Button in der Detail-Ansicht).
  Touch-Targets ≥ 44px.
- **A11y:** Tabs (`role="tablist"`/`tab`, Pfeiltasten), Liste/Detail tastaturbedienbar,
  Fokus-Falle + Esc im Modal, sichtbarer Fokusring.
- **Action-Hierarchie einhalten:** genau **eine** gefüllte CTA pro Kontext.

---

## Design-Konformitäts-Checkliste (Selbstprüfung gegen den Entwurf)

- [ ] Börse ist **Master-Detail** (nicht Tabelle, nicht Karten).
- [ ] Tabs „Alle Angebote" / „Meine Angebote" mit Zählern; **keine** Ergebnis-Zähler-Zeile.
- [ ] Filter: Suche (Material/Spieler), Mindestqualität, Mindestmenge, Sortierung
      **inkl. „Material A–Z"**; **kein** „nur ohne Interessenten".
- [ ] Fakten zeigen Qualität als **reine Zahl** (kein „/ 1000"); **kein** „Kategorie".
- [ ] Eigenes Angebot: Marker **„Dein Angebot"** + „Bemerkung bearbeiten" +
      „Angebot deaktivieren"; fremdes Angebot: **nur** „Interesse anmelden".
- [ ] Interessenten-**Namen nur für den Anbieter**; sonst nur Anzahl.
- [ ] **Kein Standort/Übergabeort** irgendwo sichtbar oder übertragen.
- [ ] Bemerkung = gerendertes Markdown (`.markdown-content`); Dialog mit
      **20.000-Zeichen**-Zähler.
- [ ] Ausschließlich DS-Klassen/-Tokens; neue CSS nur Seiten-Komposition.

## Verbote

Kein Abweichen vom finalen Entwurf · keine neuen Farben/Tokens · keine gerundeten
Ecken außer Pills/Radio · keine Emoji · kein CDN · keine hartcodierten Strings ·
kein Client-Markdown-Lib · den Prototyp-JS **nicht** 1:1 kopieren · das Design
**nicht** „verbessern".

## Arbeitsweise & Definition of Done

- Kleine, prüfbare Commits, ein Block pro Schritt; nach jedem Schritt `./gradlew check`.
- Optik nach jedem Schritt gegen `proposals/materialboerse-final.html` abgleichen.

**Done, wenn:**
1. Submodule-Pointer aktualisiert (eigener Commit) und enthält den Materialbörse-Stand.
2. `/materialboerse` unter *Flotte & Logistik* umgesetzt, **optisch deckungsgleich**
   mit `proposals/materialboerse-final.html` (Master-Detail, Tabs, Filter inkl.
   Material-A–Z, Fakten ohne „/ 1000" und ohne Kategorie, „Dein Angebot"-Marker,
   Besitzer-Aktionen, Interessenten-Anonymität).
3. Freigabe im Lager (Checkbox → Markdown-Dialog, 20.000-Zeichen-Zähler) +
   Deaktivieren funktionieren; Standort bleibt privat.
4. Nur DS-Klassen/-Tokens; `materialboerse.css` enthält reine Komposition.
5. i18n (de/en), KRT-Modals/Toasts, Responsive, A11y erfüllt.
6. `./gradlew check` grün; Konformitäts-Checkliste vollständig abgehakt.
