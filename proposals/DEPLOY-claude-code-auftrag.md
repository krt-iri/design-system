# Claude-Code-Auftrag — Design-System-Update einspielen & im Basetool umsetzen

Dieser Auftrag deckt den **kompletten Weg** ab: das neue Design-System-ZIP ins
Design-System-Repo committen, das Submodule im `basetool` aktualisieren und die
Design-System-Änderungen + Audit-Vorschläge im `basetool` umsetzen.

Voraussetzung: Der Nutzer übergibt dir das **ZIP des Design-Systems** (Inhalt des
`das-kartell-design`-Skills: `colors_and_type.css`, `krt-components.css`,
`styles.css`, `fonts/`, `assets/`, `preview/`, `keycloak/`, `proposals/`,
`ui_kits/`, `slides/`, `README.md`, `SKILL.md`).

Repos:
- **Design-System:** `git@github.com:krt-iri/design-system.git` (bzw. HTTPS).
- **Basetool:** `git@github.com:krt-iri/basetool.git`; das Design-System ist dort als
  **Submodule** unter `.claude/skills/das-kartell-design` eingebunden.

---

## TEIL 1 — Neues Design-System ins Design-System-Repo committen

1. `krt-iri/design-system` klonen (oder vorhandenen Klon `git pull`en).
2. Den **gesamten Inhalt** des übergebenen ZIP in den Repo-Wurzelordner entpacken,
   sodass vorhandene Dateien überschrieben werden. Wichtig:
   - Gelöschte/ersetzte Dateien berücksichtigen: **keine** `Audiowide-*`- oder
     `Ethnocentric*`-Schriftdateien dürfen übrig bleiben (`git rm` entfernte Fonts).
   - `_ds_manifest.json`, `_ds_bundle.js`, `_adherence.oxlintrc.json` mit übernehmen,
     falls im ZIP enthalten (Compiler-Artefakte).
3. Diff sichten (`git status` / `git diff`), dann committen:
   ```
   git add -A
   git commit -m "Design system update: Lato-only type, card/chip/tree-table/pagination, action hierarchy, scrollbars, icon set"
   git push origin main
   ```
4. Tag/Release optional: `git tag ds-2026-06 && git push --tags` (für reproduzierbare
   Submodule-Pins).

## TEIL 2 — Submodule im Basetool aktualisieren

Im `basetool`-Repo:
```
git submodule update --remote .claude/skills/das-kartell-design
git add .claude/skills/das-kartell-design
git commit -m "Bump design-system submodule to latest (Lato-only + new components)"
```
- Prüfen, dass der Submodule-Commit-Pointer auf den neuen Design-System-Commit zeigt.
- Falls das Submodule noch nicht existiert: erst gemäß README einrichten
  (`git submodule add … .claude/skills/das-kartell-design`).

## TEIL 3 — Design-System-Änderungen im Basetool umsetzen

Quelle der Wahrheit = das aktualisierte Submodule. **Reihenfolge & Details** stehen
im Master-Auftrag und den themenspezifischen Aufträgen — abarbeiten in dieser Folge:

1. **Fundament** (`.claude/skills/das-kartell-design/proposals/MASTER-claude-code-auftrag.md`,
   Phase 0): `colors_and_type.css` + `krt-components.css` ins Frontend übernehmen
   bzw. `static/css/styles.css` daran angleichen. **Neu in dieser Runde:**
   - **Schrift: nur noch Lato.** Audiowide- **und** Ethnocentric-`@font-face`,
     -Dateien und -Referenzen entfernen; Headlines = `--font-headline` (Lato bold)
     + UPPERCASE + Tracking. Inline `font-family:'Ethnocentric'/'Audiowide'` raus.
   - Neue Komponenten: **`.card` / `.chip`** (+ Varianten), **`.section-title`**,
     **`.kv-list`**, **`.field-error`**, **Pagination** (`.pagination`),
     **Tree-Table** (`.tree-*`), Scrollbar-System, **Icon-Set-Erweiterung**
     (`fragments/icons.html` um die neuen `krt-icon-*` ergänzen).

2. **Globaler Sweep** (Phase 1): repo-weit Inline-Overrides entfernen, die
   System-Defaults aushebeln (orange `label`, `.form-group label`,
   `font-family:'Ethnocentric'/'Audiowide'`, Inline-Orange auf Datenwerten →
   `.data-value`).

3. **Listen-Seiten** (Phase 2): `missions`, `operations-index`, `orders-index`,
   `refinery-orders-index` → Listen-Regel (eine `.btn--cta`, Zeilen-Aktionen
   ghost/quiet, Filter ghost). Mock: `proposals/list-page-button-hierarchy.html`.

4. **Detail-Seiten** (Phase 3 + Audits):
   - `mission-detail` + `operation-detail` (Klon): `.panel-header`, Button-Leiter,
     `.data-value`. Mock: `proposals/mission-detail-button-hierarchy.html`.
   - `orders-detail` + `refinery-orders-details`: Kopf → `.kv-list`; Abschnitts-`h3`
     → `.section-title`; Claim-/Order-Kind-/Quality-Tags → `.chip`; Bearbeiter-/
     Detail-Karten → `.card`; Übergabe/Download-Buttons mit `clipboard-check`/`list`/
     `download`-Icons; Claim-Edit-✎ → Sprite-`edit`. Audit:
     `proposals/orders-detail-audit.md`, Mock: `proposals/orders-detail-readability.html`.

5. **Inventar** (Phase 4): `/inventory/all` + `/inventory/my` → **Tree-Table**
   (ein Spaltenkopf, Einrückung, Qualitäts-Gauge, breite beschriftete Selects,
   bedingte Notiz, Abstand Menge↔Aktion). Auftrag:
   `proposals/inventory-claude-code-auftrag.md`, Mock: `inventory-table-readability.html`.

6. **Konsolidierung** (Phase 5): Toast vereinheitlichen, kanonische Tabellen-Klasse,
   `var(--color-text)` → `--color-gray-1`, Pagination + `.field-error` + `.kv-list`
   ausrollen, Inline-Styles abbauen.

7. **Org-Chart** (separat): A11y + UX nach `proposals/org-chart-claude-code-auftrag.md`
   (Tree-Rollen + Pfeiltasten, Modal-Focus-Trap + Esc, kein Full-Reload,
   Fokus-Ring ≠ Hero-Bloom).

8. **Keycloak-Theme** (Phase 6): `keycloak/claude-code-auftrag.md` — Drop-in
   `keycloak/krt-keycloak-tokens.css` (Lato-only, semantische Tokens, rote Fehler),
   Audiowide/Ethnocentric raus, Primär-Hover vereinheitlichen, CTA-Bloom, Fokus.

9. **Button-Icons** (querschnittlich): `proposals/button-icons-claude-code-auftrag.md`
   — Sprite-Erweiterung, Icon-only für wiederholte Zeilenaktionen (mit `aria-label`
   + `title`), Icon+Text für primäre/seltene Aktionen.

## Arbeitsweise & Definition of Done
- Kleine, thematische Commits; nach jedem Block `./gradlew check` (Tests +
  Checkstyle/SpotBugs). i18n (de/en), CSP-Nonce, Lazy-Load/Expand-State erhalten.
- Keine neuen Farben; nur System-Tokens/-Klassen. Eckig bleiben; eine gefüllte
  CTA pro Kontext; Fehler rot, nie orange; Labels/Datenwerte neutral.
- Optik nach jedem Block gegen `ui_kits/basetool/` und die Mocks unter `proposals/`
  abgleichen.
- **Fertig**, wenn: Design-System-Repo enthält den neuen Stand; basetool-Submodule
  zeigt darauf; App + Keycloak nutzen nur Lato; alle Phasen-Akzeptanzkriterien aus
  `MASTER-claude-code-auftrag.md` erfüllt; `./gradlew check` grün.

> Bei Detailfragen immer in den jeweiligen Auftrag unter
> `.claude/skills/das-kartell-design/proposals/` bzw. `…/keycloak/` schauen — diese
> sind verbindlich und enthalten die genauen Klassen-/Selektor-Mappings.
