repo: krt-profit/design-system
branch: main

Quell-Repos (nur lesend, Sync-Quellen für dieses Design-System):
- krt-profit/basetool (main) — Web-App; visuelle Wahrheit: `frontend/src/main/resources/static/css/styles.css` + per-Feature-CSS + `keycloak-theme/krt-theme/`
- krt-profit/basetool-android (main) — `core/designsystem/` (Compose: Color.kt, Type.kt, Shape.kt, KrtSpacing.kt, Theme.kt) + DC-Spec `docs/design/android/`
- krt-profit/basetool-sc-extractor (main) — Desktop-Extractor, KRT-Theme in `src/main/kotlin/com/basetool/bpextractor/ui/Theme.kt`

## Last sync
date: 2026-08-18T05:27:54Z
### Updated in this project
- Token `--color-gray-2-text` #8A8A8A + Text-Tint-Regeln aus App/Android übernommen (Android: KrtPalette.TextMuted)
- krt-components.css synchronisiert: .assoc-pop fixed, Herkunft-Picker (.herkunft-*), .btn.btn-xs/.btn-icon, JobOrder-Status, .krt-confirm-*, .krt-modal--wide, Filterleiste (.search-form*), Footer/Fan-Kit-Band/Admin-Chip
- 4 neue Specimen-Cards (Herkunft, Confirm, Filterleiste, App-Chrome), Asset made-by-the-community.png, thumbnail.html
- README (Sync-Log 2026-08, Plattform-Implementierungen) + SKILL.md aktualisiert

## Screen map
| DS-Datei | Quelle |
| :-- | :-- |
| colors_and_type.css | basetool: static/css/styles.css (`:root`-Tokens, @font-face) |
| krt-components.css | basetool: static/css/styles.css (Komponenten-Layer) |
| keycloak/* | basetool: keycloak-theme/krt-theme/login/resources/css/krt-login-v3.css |
| preview/components-entry-assign.html · components-herkunft.html | basetool: styles.css `.assoc-*` / `.herkunft-*` |
| preview/components-confirm-dialog.html | basetool: styles.css `.krt-confirm-*` (fragments/toast.html) |
| preview/components-filterbar.html | basetool: styles.css `.search-form*` / `.datetime-split-*` / `select.association-select` |
| preview/components-app-chrome.html | basetool: styles.css `.krt-footer*` / `.krt-fankit-*` / `.admin-mode-chip` |
| README "Plattform-Implementierungen" | basetool-android: core/designsystem/theme/*.kt · basetool-sc-extractor: ui/Theme.kt |
