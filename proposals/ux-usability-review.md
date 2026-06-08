# UX/Usability-Review — KRT Design System

Vollständiger Durchgang durch Tokens, Komponenten, Specimen, UI-Kit und Slides mit
Fokus auf Accessibility, Lesbarkeit und Interaktions-Usability. Ergebnis: das System
ist gestalterisch stark und konsistent; gefunden wurden **A11y-Lücken** und ein paar
**Kontrast-Probleme**, die jetzt behoben sind. Restpunkte sind dokumentiert.

## Behoben in diesem Durchgang ✅

### 1. Globaler Tastatur-Fokus (war: nur Inputs)
Vorher hatten nur `input/select/textarea` (Border+Glow) und `.panel-header` einen
Fokus-Zustand; Buttons, Links, Badges, `.btn-icon`, Checkboxen zeigten Tastatur-
Nutzern **nichts**. → Globaler `:focus-visible`-Ring (2px Orange, 2px Offset) für
alle interaktiven Elemente in `colors_and_type.css`; auf gefüllten CTAs weißer Ring
(Orange-auf-Orange wäre unsichtbar). `:focus-visible` stört Maus-Nutzer nicht.

### 2. `prefers-reduced-motion`
Es gab keine Reduced-Motion-Behandlung (Drawer-Slide, Toast-Bewegung, Transitions).
→ `@media (prefers-reduced-motion: reduce)` neutralisiert Animationen/Transitions
global (vestibuläre Sicherheit).

### 3. Semantische Farben als Text auf Schwarz (Kontrast)
Die kanonischen Status-Hues sind **als Text** auf dem schwarzen Canvas zu dunkel:
Danger `#A3000A` ≈ 2,3:1, Info `#355DDC` ≈ 3,6:1 (WCAG AA verlangt 4,5:1 für
Fließtext). Betraf `.text-danger`, `.status-cancelled`, `.status-planned`,
`price-buy` (rote Mengen im Preis-Matrix) u. a.
→ Neue **Text-Tints** (nur für Text, Flächen/Borders bleiben kanonisch):
`--color-danger-text #F2564B` (≈5,3:1), `--color-info-text #6C93EF` (≈6,1:1),
`--color-success-text #2EBC3D` (≈5,6:1). Angewandt auf `.text-*`, `.status-*`,
`.price-buy/-sell`, `.btn-outline-danger`, `.btn-quiet-danger:hover`,
Error-Toast-Titel, `.icon-btn.danger:hover`. `.status-completed` von Grau-2 auf
Grau-1 angehoben (war ebenfalls grenzwertig).

> Prinzip: **kanonische Bereichs-/Statusfarbe für Flächen & Rahmen** (mit weißem
> Text darauf — gut lesbar), **hellerer Text-Tint, wenn die Farbe selbst der Text
> ist**. Die Marken-`dept-tag`s (Identität) bleiben bewusst im kanonischen Hue.

## Bereits gut gelöst (bestätigt) ✅
- 44px Touch-Targets als Token + auf `.btn`/Inputs; Icon-only-Buttons mit
  `aria-label`+`title` (Icon-System).
- Eine gefüllte CTA pro Kontext (Action-Hierarchie); neutrale Labels; Datenwerte
  als `.data-value`.
- Tabellen mit stickigem Kopf, tabellarischen Zahlen; Tree-Table für verschachtelte
  Daten; Scrollbar-System.
- Disabled-State (`opacity:.45; cursor:not-allowed`); Reduced-Motion jetzt ergänzt.
- Fokus-Glow auf Inputs; Pill-Ringe gleichmäßig (Inset-Shadow statt Border).

## Empfehlungen / bewusste Restpunkte (nicht geändert)
- **Body-Default `font-weight: 300` (Light).** Auf Dunkel wirken dünne Striche
  kontrastärmer. Für **dichte Daten-Tabellen** wäre 400 lesbarer. Bewusst belassen
  (Marken-Look, entspricht dem Produkt) — Empfehlung: in Tabellen `400` nutzen.
- **`--color-gray-2 #646464` als bedeutungstragender Text** (~3,5:1) nur für
  *muted/placeholder/disabled* verwenden — nicht für Inhalte, die gelesen werden
  müssen. Token-Kommentar weist darauf hin.
- **`--measure: 80ch`** ist großzügig; für reinen Fließtext sind 60–75ch angenehmer.
  Für die daten-/formularlastige App unkritisch.
- **`dept-tag` Sub-Radar** (kanonisches `#A3000A` als Text) bleibt dunkel — als
  *Identitäts*-Tag akzeptiert; wenn Lesbarkeit wichtiger als exakte Markenfarbe
  wird, optional auf gefüllte Chips mit weißem Text wechseln.

## Status
`check_design_system`: keine Issues. Änderungen betreffen `colors_and_type.css`
(Tokens, Fokus, Reduced-Motion), `krt-components.css` (Text-Tints) und
`ui_kits/basetool/app.css` (Preis-Farben). Keine visuelle Regression in den
Specimen-Karten; Status-/Preis-Texte sind jetzt klar lesbar.
