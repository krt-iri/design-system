# Template-Audit (gesamt) — UI/UX/Usability-Verbesserungen

Durchgang durch **alle** Basetool-Templates (`frontend/.../templates/`, 73 Dateien)
mit Blick auf Usability, A11y, Konsistenz und Daten-Lesbarkeit. Bezug: das aktuelle
KRT-Design-System (`krt-components.css`, `colors_and_type.css`). Wo eine Lücke ein
neues System-Element brauchte, ist sie **bereits ergänzt** (siehe „DS-Ergänzungen").

Frühere Detail-Audits gelten weiter: `template-audit.md` (Action-Hierarchie),
`inventory-table-audit.md` (Tree-Table), `button-icons-*` (Icons). Dieses Dokument
ist der Gesamtüberblick + die neuen Befunde.

---

## DS-Ergänzungen in diesem Durchgang ✅
Neu in `krt-components.css`, damit Templates darauf umstellen können:
- **`.pagination`** — eckige Seiten-Navigation mit Chevron-Icons (statt `« ‹ › »`-
  Glyphen), echtem Disabled-Zustand (`pointer-events:none`, nicht nur optisch),
  `aria-current="page"` für die aktive Seite, tabellarische Ziffern.
- **`.kv-list`** — Key-Value-Detailliste (Label : Wert) als 2-Spalten-Grid; Label
  neutral/uppercase, **Wert** hell (`--data-fg`). Ersetzt Ad-hoc-Flex-Zeilen mit
  fixer Label-Breite (profile, Detail-Panels, Org/Finanz-Zusammenfassungen).
- **`.field-error`** — Inline-Validierungstext im barrierefreien Danger-**Text**-Tint
  (`--color-danger-text`) + Warn-Glyph-Slot, statt rohem `#A3000A` auf Schwarz.
- (Bereits zuvor: `.tree-table`, Button-Leiter, `.data-value`, `.panel-header`,
  Scrollbars, Icon-Set, barrierefreie Status-Text-Tints, globaler Fokus-Ring,
  reduced-motion.)

---

## Querschnitt-Befunde (betreffen viele/alle Templates)

### A11y & Bedienung
1. **Pagination-Glyphen + Schein-Disabled** (`fragments/pagination.html`):
   `<a class="disabled">` bleibt klickbar (Anchors kennen kein `disabled`).
   → auf neue `.pagination`-Komponente umstellen (Chevron-Icons, echtes Disabled).
2. **Inline-Fehlertext in rohem `--color-danger`** (profile, mission-detail,
   orders, refinery, admin-*): auf Schwarz ~2,3:1, schwer lesbar.
   → Klasse `.field-error` (heller Tint) verwenden; Fehlerfeld zusätzlich rot umranden.
3. **Tastatur-Fokus** war nur auf Inputs sichtbar → jetzt global im DS gelöst;
   Templates erben es automatisch (keine `outline:none`-Overrides setzen).
4. **Reduced-Motion** jetzt global; Templates mit eigenen Animationen (Sidebar,
   Toast) müssen nichts tun, dürfen es aber nicht per Inline-Style aushebeln.

### Konsistenz / Wartbarkeit
5. **Massive Inline-`style="…"`** in fast jedem Template (profile, hangar, orders-
   detail, mission-detail, admin/*). Erschwert Konsistenz + CSP-Hygiene.
   → in System-Klassen ziehen (`.kv-list`, `.data-value`, Utility-Klassen,
   `.field-error`); CSP-Nonce nur noch für echte dynamische Styles.
6. **Detail-„Label : Wert"-Blöcke** überall handgebaut (profile `.profile-row`,
   mission-detail Organisation, orders-detail Kopf, hangar-Detail). → `.kv-list`.
7. **Datenwerte teils orange** (Frequenzen, Namen, Beträge) → `.data-value`
   (siehe Action-Hierarchie-Audit). Orange nur für Aktion/Identität.

---

## Template-für-Template

### Einstieg & Navigation
- **`index.html`** (Dashboard): „Einsatz öffnen" nutzt totes `btn-primary` → `.btn--cta`;
  Key-Labels der „Nächsten Mission" orange → `.kv-list`. Sonst gut.
- **`fragments/sidebar.html`**: Drawer ok; sicherstellen, dass aktive Route per
  `aria-current="page"` markiert ist und Fokus im offenen Drawer gefangen wird
  (Focus-Trap) + Esc schließt. Nav-Items ≥44px.
- **`fragments/footer.html` / `head.html`**: unkritisch; Footer-Links Fokus-sichtbar (DS).
- **`fragments/pagination.html`**: → `.pagination` (Befund 1).
- **`fragments/toast.html`**: auf eine Toast-Komponente konsolidieren
  (`.notification-toast`); aria-live="polite" für Ankündigung.

### Missionen & Operationen
- **`missions.html` / `operations-index.html`**: Listen-Regel (eine CTA, Zeilen-
  Aktionen Ghost/Icon-only). Mock: `list-page-button-hierarchy.html`.
- **`mission-detail.html` / `operation-detail.html`** (Klon): `.col-header` →
  `.panel-header`; Button-Leiter; Datenwerte `.data-value`; Label-Override raus;
  Zeilenaktionen Icon-only (edit/trash/login/logout). Mock: `mission-detail-…`.

### Aufträge & Raffinerie
- **`orders-index.html` / `refinery-orders-index.html`**: Listen-Regel.
- **`orders-detail.html` (107 KB) / `refinery-orders-details.html`**: sehr button-
  dicht → eine CTA pro Abschnitt; `.kv-list` für Kopf-Daten; Übergabe-Tabelle:
  „Protokoll herunterladen" mit `download`-Icon; Label-/Titel-Overrides raus.
  Mock: `refinery-order-button-hierarchy.html`.
- **`orders-create.html` / `refinery-orders-create.html`**: lange Formulare →
  `.form-group`/`label`-Defaults nutzen; Inline-Fehler `.field-error`; eine CTA
  (Erstellen), Abbrechen Ghost.

### Inventar & Material
- **`inventory-my.html` / `inventory-admin.html` (je ~72 KB)** + Fragment
  **`inventory-stack-entries.html`**: → **Tree-Table** (ein Kopf, Einrückung,
  Qualitäts-Gauge, breite Selects, bedingte Notiz, Icon-Aktionen). Detailauftrag:
  `inventory-claude-code-auftrag.md`, Mock: `inventory-table-readability.html`.
- **`inventory-index.html`**: zwei gleichwertige Lager-Links → beide `.btn-outline`.
- **`inventory-input.html`**: Erfassungsformular → eine CTA, `.field-error`.
- **`material-collection.html`**: eigenes `.krt-toast` inline → auf `.notification-
  toast` konsolidieren; redundante Inline-Fonts entfernen.
- **`materials*.html` / `materials-profit-calculation.html`**: Preis-/Profit-Matrix
  → rechtsbündige `tabular-nums`, Preis-Text in barrierefreien Tints
  (`price-buy/-sell` nutzen jetzt die hellen Tints); horizontale Scrollregion mit
  `.hud-scroll.scroll-x` + Sticky-Erste-Spalte.

### Hangar
- **`hangar.html` (40 KB) / `hangar-squadron.html`**: „Add Ship" → `.btn--cta` (+plus-
  Icon, bereits teils); Zeilen-Edit/Delete Icon-only (vorhanden); Filter-Such-Feld
  mit `search`-Icon (vorhanden). Import-Dialog: `upload`-Icon. Gut aufgestellt.

### Mitglieder, Profil, Promotion, Org
- **`members.html` / `member-edit.html`**: Suche mit `search`-Icon; Zeilen-Edit/
  Delete Icon-only (vorhanden). Status „in Keycloak" als ruhiger Text.
- **`profile.html`**: `.profile-row`-Blöcke → `.kv-list`; Inline-Fehler
  `.field-error`; zwei „Speichern"-Formulare ok (getrennte Kontexte, je eigene CTA).
  Viele Inline-Styles entfernen.
- **`promotion-overview.html` / `promotion-manage.html` (65 KB) /
  `promotion-admin-*` / `promotion-my-evaluations.html`**: sehr dichte Bewertungs-
  Tabellen → `tabular-nums`, `.kv-list` für Kandidaten-Kopf, Status-Pills,
  eine CTA pro Aktion; Fortschritt/Score als ruhige Datenwerte, nicht orange.
- **`org-chart.html` (31 KB) + `fragments/org-chart-node.html`**: Knoten-Karten
  quadratisch + Hairline; aktive/Hover-Zustände aus dem DS; ausreichende
  Klickflächen; horizontale Scrollregion mit HUD-Scrollbar.

### Admin
- **`admin-settings.html`, `admin/locations.html`, `admin/materials.html` (30 KB),
  `admin/uex.html` (36 KB), `admin/mission-data.html` (35 KB), `admin/blueprints.html`,
  `admin/special-commands*.html`, `admin/sync-reports.html`, `admin/p4k-import.html`,
  `admin/personal-*`**: Admin-Chrome (`accent-dark`-Header) behalten. Häufig:
  Label-Overrides (orange / Ethnocentric / Audiowide → Lato) entfernen; CRUD-Tabellen mit
  Icon-Aktionen + Pagination-Komponente; Import/Sync-Aktionen mit `upload`/
  `clipboard-check`/`download`-Icons; lange Formulare → `.field-error`.
- **`admin/locations.html`**: Labels in Display-Schrift bei 0,8rem → Lato (Befund B
  aus template-audit). 

### Statisch & Fehler
- **`error/403|404|500|error.html`**: vorbildlich (eine CTA, Sci-Fi-Copy) — nur
  optional `.btn`-Klassen statt eigener `.btn-return`. **Beibehalten.**
- **`impressum.html` / `privacy.html`**: reine Textseiten; `--measure` für
  Lesbarkeit, Überschriften-Hierarchie. Unkritisch.

---

## Priorisierung (über alle Templates)
1. **Inline-Override-Sweep** (Labels/Datenwerte/Fonts) — größter Effekt, kleinstes
   Risiko, app-weit (siehe `claude-code-auftrag.md` Schritt 2).
2. **Pagination-Komponente** + **`.field-error`** ausrollen — schnelle A11y-Gewinne.
3. **Listen-Seiten** → Listen-Regel; **Detail-Seiten** → `.panel-header` + Button-
   Leiter + `.kv-list` + `.data-value`.
4. **Inventar-Tabellen** → Tree-Table (eigener, größerer Umbau).
5. **Admin-CRUD** vereinheitlichen (Icons, Pagination, Fehler).
6. **Konsolidierung** (ein Toast, kanonische Tabellen, Token-Namen).

Alle Punkte sind im Master-Auftrag (`MASTER-claude-code-auftrag.md`) und den
themenspezifischen Aufträgen abgedeckt; dieses Audit ergänzt Pagination, `.kv-list`
und `.field-error` als neue, sofort nutzbare Bausteine.
