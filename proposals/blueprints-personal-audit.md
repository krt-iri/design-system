# Audit — `/personal-inventory/blueprints` (Meine Blueprints)

**Quelle:** `templates/personal-inventory-blueprints.html` + `static/css/personal-inventory.css` (krt-profit/basetool@main)
**Bewertung:** Die Seite ist bereits **weitgehend design-system-konform und modern** (V3 Master-Detail + Craftability #781). Sie nutzt durchgehend echte DS-Komponenten — kein Rebuild nötig. Es gibt einige **gezielte Hygiene-Abweichungen** in der seiteneigenen CSS sowie eine größere Inkonsistenz beim **Admin-Zwilling**. Nichts davon erfordert, die Seite zu überfrachten — im Gegenteil, die Fixes machen sie *ruhiger*.

---

## Was bereits korrekt ist

- **Tabs** über die DS-Komponente `.tab-nav` / `.tab` / `.tab-count` (Items | Blueprints) — inkl. `aria-current`.
- **Sammlung** als `.master-detail` / `.master-list` / `.master-row(.is-active)` / `.detail-pane` — die kanonische DS-Master-Detail.
- **Leerzustände** über `.empty-state` / `.empty-title` / `.empty-text` (nie eine nackte „Keine Einträge"-Zelle).
- **Zutaten-Qualität** über `.quality-block` / `.quality-row` (0–1000-Slider, Orange-Akzent).
- **Modals** über die *neue* `.krt-modal-overlay` / `.krt-modal` (Orange-Topkante + Eckbrackets), inkl. `--danger`, `--wide`, `.krt-modal-head/-body/-foot`, Close = `btn-icon` mit `aria-label`. Löschen nutzt korrekt `.btn-danger` (nicht mehr `.krt-danger`).
- **Aktionshierarchie:** genau **eine** gefüllte `.btn--cta` (Hinzufügen / Speichern), JSON-Import als `.btn-outline`, Zeilen-Aktionen als `.btn-ghost` / `.btn-quiet-danger` Icon-Buttons.
- **Touch-Targets** ≥ 44px, responsive über die vier Geräteklassen.

→ Strukturell ist die Seite ein gutes Beispiel für korrekte DS-Nutzung.

---

## Abweichungen (in `personal-inventory.css`)

| # | Befund | DS-Regel | Fix |
| :- | :- | :- | :- |
| 1 | **Labels sind orange** — `.form-group label`, `.krt-pi-userform label`, `.krt-bp-staging-label`, `.krt-bp-section-title`, `.krt-bp-recipe-table th` → `color: --color-primary` | Action-Hierarchy (2026-06): *Formular-Labels neutral* (`--color-gray-1`); Orange = Aktion + Identität, nicht jedes Label. Der Eingabe-**Wert** soll das Hellste sein. | Label-Farbe → `--color-gray-1`; Section-Titel → DS-`.section-title` (neutral, mit Haarlinie). |
| 2 | **Volle orange Umrandung** um jede Box — `.krt-personal-inventory { border: 1px solid --color-primary }` | „Zu viel Orange": `.hud-box` = Haarlinie `--color-gray-3` + zwei Eckbrackets; flächiges Orange ist der Anti-Pattern, den die Mission-Detail-Arbeit behoben hat. | Rahmen → `--color-gray-3` (Haarlinie); Akzent über Eckbrackets / `.panel-header`-Leiste statt Vollrahmen. |
| 3 | **Eigener Chip** `.krt-bp-chip` (orange Border) statt der DS-`.chip` | `.chip` (+ `--primary`) ist die kanonische eckige Daten-Marke. | Staging-Chips auf `.chip chip--primary` + Icon-Remove umstellen. |
| 4 | **Radius 4px** auf `.krt-bp-recipe-toggle` (`border-radius: 4px`) | Radius systemweit **0** — einzige Ausnahme: Pills (999px) + Radio. | `border-radius: var(--radius-none)`. |
| 5 | **Doppelte Help-Klasse** `.krt-pi-help` neben dem globalen Muster | Kleinkram-Konsolidierung. | optional vereinheitlichen. |

Keiner dieser Punkte ist visuell „kaputt" — aber alle zusammen lassen die Seite **oranger und lauter** wirken als der Rest der modernisierten App. Sie zu entschärfen ist reine Subtraktion (kein neues UI).

---

## Größere Inkonsistenz: der Admin-Zwilling

`templates/admin/personal-blueprints.html` (`/admin/personal-blueprints`) ist **noch nicht** modernisiert:

- alte Tabelle `.krt-table` / `.krt-pi-table` statt `.data-table` bzw. Master-Detail,
- altes Modal `.modal` / `.modal-content` / `.close (×)` statt `.krt-modal`,
- `.btn krt-danger` (mit `!important`) statt `.btn-danger`,
- `.krt-admin-banner` mit **Gradient** (DS vermeidet Gradients außerhalb des Greeting-Banners).

→ Empfehlung: den Admin-View an `personal-inventory-blueprints.html` angleichen (gleiche Master-Detail + `.krt-modal` + Chips), plus den Member-`<select>` als einziges Zusatz-Element. Das ist die größte tatsächliche „Korrektheits"-Lücke.

---

## Usability / Erkennbarkeit — ohne Überfrachtung

1. **Craft-Badge in der Master-Liste konsequent zeigen** (grün „craftbar" / gelb „n fehlt"). Heute steht in der Liste nur Name + Notiz-Stift — das wichtigste Entscheidungssignal („kann ich das bauen?") ist erst im Detail sichtbar. Der Badge (`.krt-bp-craft-badge`) existiert bereits; ihn am rechten Zeilenrand zu zeigen erhöht die Scanbarkeit, ohne neue Fläche.
2. **Kopf entlasten:** Titel + Facts + Typeahead + CTA + Import + Staging stecken alle im Greeting-Block. Auf Tablet wird das dicht. Vorschlag: Such-Typeahead + CTA bleiben oben rechts; **„JSON importieren"** als ruhigerer `.btn-ghost` mit Icon (Import ist die selten genutzte Aktion) — eine gefüllte CTA reicht.
3. **Aktiven Zustand verstärken:** `.master-row.is-active` ist nur 3px-Leiste + Surface. Bei langen Listen hilft zusätzlich ein **Sticky-Filter** (ist da) + eine Trefferzahl am Filter.
4. **Notiz-Stift** in der Zeile ist ein nacktes `✎`-Glyph (orange) — als echtes `.krt-icon` (edit) konsistenter und schärfer.
5. **Leerer Detail-Bereich** nutzt bereits `.empty-state` mit klarer Aufforderung — gut; hier nichts ändern.

**Fazit:** Keine neue Funktion, kein neues Layout nötig. Die Seite wird besser durch **Wegnehmen** (Orange entschärfen, Vollrahmen → Haarlinie, Chips/Badge auf DS-Standard) und **einen** Erkennbarkeits-Gewinn: den Craftbar-Badge in die Liste ziehen.
