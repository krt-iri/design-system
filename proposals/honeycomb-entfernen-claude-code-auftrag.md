# Auftrag an Claude Code — Wabenmuster (Honeycomb) entfernen

**Ziel:** Den Honeycomb-/Wabenmuster-Hintergrund aus dem Produkt (basetool-App
**und** Keycloak-Theme) entfernen. Hintergrund wird überall flaches Schwarz;
der dezente orange Top-Bloom bleibt, wo er heute existiert. Diese Änderung ist
im Design-System bereits vollzogen — hier wird sie 1:1 in den Code übernommen.

**Reihenfolge strikt einhalten. Bei Unklarheiten Fragen unten stellen, bevor
entschieden wird.**

---

## SCHRITT 0 — Design-System-Submodul synchronisieren
- Submodul aus `krt-profit/design-system` auf den aktuellen Stand ziehen.
- Referenzdateien für diesen Auftrag:
  - `ui_kits/basetool/app.css` (App-`body`, `.login-stage`)
  - `keycloak/krt-keycloak-tokens.css` (`body`-Hintergrund)
  - `slides/slides.css`, `preview/_card.css` (nur zur Referenz, kein Prod-Code)

---

## SCHRITT 1 🔴 — App-Hintergrund (basetool)
- `body`: `background-image` mit `honeycomb-bg.svg` **entfernen**. Es bleibt nur
  `background-color: var(--color-bg-black)`. Ebenso `background-repeat`,
  `background-size` und `background-attachment` für das Muster entfernen.
- `.login-stage`: aus der Mehrschicht-`background` **nur** die Waben-Ebene
  (`url(honeycomb-bg.svg)`) streichen. Der radiale Top-Bloom
  (`radial-gradient(circle at 50% 0%, rgba(231,126,35,0.10), transparent 55%)`)
  **bleibt** über `var(--color-bg-black)`. `background-repeat`/`-size` passend
  auf zwei Ebenen reduzieren.

## SCHRITT 2 🔴 — Keycloak-Theme
- In `krt-keycloak-tokens.css` beim `body`:
  - Waben-Ebene (`url('../img/honeycomb-bg.svg')`) aus `background-image`
    entfernen; nur der `radial-gradient`-Top-Bloom bleibt.
  - `background-repeat`/`-size` entsprechend auf eine Ebene reduzieren;
    `background-attachment: fixed` beibehalten.
- Den bestehenden **Hard-Reset** des PatternFly-Grids/-Bilds unbedingt
  **beibehalten** — nur der `<body>` ändert sich.
- Datei-Kopf-Kommentar von „honeycomb page background" auf „flat black page
  background + top bloom" korrigieren.

## SCHRITT 3 🔴 — Assets löschen
- `honeycomb-bg.svg` **und** `honeycomb.svg` aus allen Ressourcen entfernen:
  - App-Assets (`assets/`)
  - Keycloak `login/resources/img/` **und** `account/resources/img/`
- Sicherstellen, dass kein CSS/HTML/JS mehr darauf verweist
  (`grep -ri "honeycomb"` → 0 Treffer im Prod-Code).

## SCHRITT 4 🟡 — Texte/Doku angleichen
- Referenzen auf „Wabenmuster"/„Honigwaben"/„honeycomb" in projekteigenen
  READMEs/Kommentaren auf „flaches Schwarz + Top-Bloom" umstellen.
- Falls Slide-Template oder sonstige interne Vorlagen das Muster nutzen: analog
  auf flaches Schwarz umstellen.

---

## Abnahme-Checkliste
1. App-`body` und Keycloak-`body` zeigen flaches Schwarz, **kein** Wabenmuster.
2. Top-Bloom auf Login/`.login-stage` weiterhin sichtbar (dezent, oben).
3. Keycloak: PF-Grid/-Bild bleibt entfernt (Hard-Reset intakt).
4. `grep -ri "honeycomb"` im Prod-Repo → keine Treffer; SVGs gelöscht.
5. Keine 404s für `honeycomb-bg.svg`/`honeycomb.svg` in den Netzwerk-Logs.

## Vorab zu klärende Fragen
- **Q1 (Bloom):** Top-Bloom überall beibehalten, oder soll auch der Bloom weg
  (komplett flaches Schwarz)?
- **Q2 (Andere Flächen):** Gibt es außerhalb von `body`/`.login-stage` weitere
  Stellen, die das Muster als Deko nutzen (Karten, Panels, E-Mail-Templates)?
- **Q3 (Migration):** Sollen die SVG-Dateien sofort gelöscht oder erst nach
  einer Deprecation-Phase entfernt werden?
- **Q4 (Caching):** Müssen CDN-/Browser-Caches für die alten Asset-URLs aktiv
  invalidiert werden?
