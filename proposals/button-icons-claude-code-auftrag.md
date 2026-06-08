# Claude-Code-Auftrag — Einheitliche Button-Icons im Profit Basetool

Repo: `krt-iri/basetool`. Ziel: das vorhandene Icon-Sprite um ein **vereinheitlichtes
Set** erweitern und Buttons konsistent mit Icons versehen — wiederholte
Zeilenaktionen als **Icon-only** (Platzersparnis in dichten Tabellen), primäre/seltene
Aktionen als **Icon + Text**. Verständlichkeit + A11y haben Vorrang vor Sparsamkeit.

## Quelle der Wahrheit
Das `das-kartell-design`-Skill (`.claude/skills/das-kartell-design/`):
- `assets/krt-icons.svg` — kanonisches Sprite (Core + Erweiterung), exakte Pfade.
- `proposals/button-icons-guidelines.md` — Stil, Regeln, **Icon-Wörterbuch** (Aktion→Icon→Modus).
- `proposals/button-icons-readability.html` — Vorher/Nachher (Icon-only vs. Icon+Text).
- `preview/components-icon-set.html` — Specimen des ganzen Sets.

Betroffene Dateien im Repo:
- `frontend/src/main/resources/templates/fragments/icons.html` (das Sprite).
- `frontend/.../static/css/styles.css` (`.krt-icon`, `.btn-icon`).
- Alle Templates mit Buttons (Schwerpunkt: `mission-detail.html`,
  `operation-detail.html`, `orders-detail.html`, `inventory-my.html`,
  `inventory-admin.html`, `hangar.html`, `members.html`, die `*-index.html`).

## Arbeitsweise
- Kleine, prüfbare Commits, ein Schritt pro Block. Nach jedem Schritt `./gradlew check`.
- **i18n strikt beachten:** Button-Text bleibt `th:text="#{key}"`; bei Icon-only wandert
  derselbe Key in `th:title` **und** `th:aria-label`. Keine hartcodierten Strings.
- Icon-Stil exakt halten (24×24, stroke-2, round, `currentColor`, `fill:none`).
- CSP beachten: **keine** externe Icon-Library; nur das Sprite erweitern.
- Optik gegen `proposals/button-icons-readability.html` abgleichen.

---

## SCHRITT 1 — Sprite erweitern
Die neuen `<symbol>` aus `assets/krt-icons.svg` in `fragments/icons.html` übernehmen
(IDs `krt-icon-*`): `arrow-left`, `arrow-right`, `check`, `login`, `logout`,
`user-plus`, `external-link`, `clock`, `map-pin`, `filter-off`, `eye`, `download`,
`upload`, `clipboard-check`, `list`. (Vorhandene unverändert lassen.)
- Sprite-Header-Konvention (24×24, currentColor) wie dokumentiert beibehalten.

## SCHRITT 2 — CSS prüfen
- Sicherstellen, dass `.krt-icon` 1em groß ist und Textfarbe erbt; `.btn-icon`
  quadratisch (~38–40px), zentriert, ≥44px Touch-Target wo möglich.
- Icon+Text-Buttons: Lücke Icon↔Text über `gap` der `.btn`-Flexbox (kein fester
  margin). Falls `.btn` noch nicht `display:inline-flex; align-items:center; gap`,
  ergänzen — ohne bestehende Buttons ohne Icon zu brechen.

## SCHRITT 3 — Icon-only Zeilenaktionen (größter Platzgewinn)
Nach `button-icons-guidelines.md` (Regel 2). In dichten Tabellen die wiederholten
Aktionen auf Icon-only umstellen, **immer** mit `th:title` + `th:aria-label`:
- Bearbeiten → `edit`, Löschen → `trash` (bereits teils so in `members`,
  `mission-detail`).
- **Check-In → `login`, Check-Out → `logout`** (`mission-detail.html` Teilnehmer) —
  aktuell Text-Buttons; auf Icon-only umstellen.
- Ausbuchen → `bookout` (Lager-Tree, bereits Icon-only — konsistent halten).
- Erhalte die Button-Varianten (`.btn-success` für Check-In grün, `.btn-quiet-danger`
  für Löschen) zusätzlich zur `.btn-icon`-Klasse.

## SCHRITT 4 — Icon + Text für primäre/seltene Aktionen
Nach dem Icon-Wörterbuch ergänzen (Icon **links**, `th:text` bleibt):
- `save` → Speichern (viele bereits ✓ — Lücken schließen).
- `user-plus` → Anmelden; `plus` → Hinzufügen / Neuer Eintrag / Schiff hinzufügen.
- `arrow-left` → Zurück; `external-link` → Öffnen; `clock` → Jetzt.
- `filter` → Filtern; `filter-off` → Filter zurücksetzen; `search` → Suche.
- `map-pin` → Home-Location; `clipboard-check` → Übergabe protokollieren;
  `download` → Protokoll herunterladen; `upload` → Import; `list` → Sammelübersicht;
  `check` → Bestätigen.
- **Abbrechen bleibt ohne Icon** (Ghost-Text) — vermeidet X-Verwechslung mit Schließen.

## SCHRITT 5 — Konsistenz-Pass
- Dieselbe Aktion app-weit = dasselbe Icon (Wörterbuch als Referenz).
- Keine zwei Icons pro Button, kein Icon rechts vom Text.
- Stichprobe Screenreader/Tastatur: Icon-only-Buttons werden mit Klartext angesagt;
  Tooltips erscheinen on hover/focus.

## Definition of Done
1. Sprite enthält das vollständige Set; keine externe Icon-Quelle.
2. Wiederholte Zeilenaktionen (edit/trash/check-in/check-out/bookout/close) sind
   Icon-only **mit** `title`+`aria-label`; Aktion-Spalten deutlich schmaler.
3. Primäre/seltene Aktionen tragen Icon **+** Text (Icon links, currentColor).
4. „Abbrechen" ohne Icon; eine gefüllte CTA pro Kontext unverändert.
5. Gleiche Aktion → gleiches Icon überall; i18n intakt (de/en).
6. `./gradlew check` grün; Optik = `proposals/button-icons-readability.html`.
