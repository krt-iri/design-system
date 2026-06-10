# Audit — `/orders/{id}` Auftrags-Details (JobOrder) gegen das KRT-Design-System

Geprüft im Repo `krt-iri/basetool`: `frontend/.../templates/orders-detail.html`
(123 KB) gegen das `das-kartell-design`-Skill. Vorher/Nachher: `orders-detail-readability.html`.

## Gesamturteil
**Stark systemkonform.** Die Seite wendet die Action-Hierarchie mit Icons bereits an,
nutzt HUD-Box, Greeting, Badges, `data-table`, klickbare Material-Zeilen und —
vorbildlich — **barrierefreie Icon-only-Aktionen** (edit/trash/close mit
`title`+`aria-label`) in der Bearbeiter-Liste. Die Befunde sind Feinschliff/DRY.

## Konform — ✅
- **Header:** `.btn-outline`+edit (Bearbeiten), `.btn-quiet-danger`+trash (Löschen),
  `.btn-ghost` (Zurück) — Action-Hierarchie + Icons korrekt.
- **Bearbeiter-Liste:** Icon-only edit/trash/close, je `title`+`aria-label`, 36px+.
- hud-box, greeting, squadron-/status-/quality-/order-kind-Badges, `data-table`.
- Status-`<select>` nur für Logistiker; AJAX-Fragment-Refresh statt Reload; eine CTA
  pro Modal; Material-/Aggregat-Zeilen klickbar (Inventory-Drilldown).

## Verbesserungen
Priorität: 🟠 mittel · 🟡 niedrig.

### 🟠 1 — Kopf-Metadaten → `.kv-list`
Der Metadatenblock nutzt `<strong>Label</strong><br><span>Wert</span>` in einem
Auto-fit-Grid. Labels sind dadurch orange (`<strong>` erbt nichts Neutrales) und die
Wertespalte ist nicht ausgerichtet.
→ **Fix:** als `<dl class="kv-list kv-ruled">` (Label neutral, Wert hell `--data-fg`,
saubere Ausrichtung). Specimen: `preview/components-detail-list.html`.

### 🟠 2 — Abschnitts-Titel → `.section-title`
Jedes `<h3>` trägt denselben Inline-Style
`style="color: var(--color-gray-1); font-family: 'Lato'; font-weight:700; …"`
(8× im Template). DRY-Verstoß, CSP-relevant.
→ **Fix:** Klasse **`.section-title`** (neu im DS, `krt-components.css`) — Lato bold,
neutral, Hairline-Unterstrich. Inline-Styles entfernen.

### 🟠 3 — Claim-Bearbeiten nutzt Unicode-Stift
Der Claim-Edit-Button rendert `&#9998;` (✎) per Inline-Style statt des Icon-Sprites.
→ **Fix:** `<svg class="krt-icon"><use href="#krt-icon-edit"/></svg>` in einem
`.btn btn-ghost btn-icon` mit `aria-label` — konsistent mit allen anderen Aktionen.

### 🟡 4 — Übergabe-Toolbar & Download → Icons
„Übergabe protokollieren", „Materialsammelübersicht" und „Übergabeprotokoll
herunterladen" sind reine Text-Buttons.
→ **Fix:** Icon+Text — `clipboard-check` (protokollieren), `list`
(Sammelübersicht), `download` (herunterladen). In den Übergabe-**Tabellenzeilen**
kann „Herunterladen" zusätzlich **Icon-only** (download) werden — spart Platz in der
dichten Tabelle; `title`+`aria-label` setzen.

### 🟡 5 — Massive Inline-Styles allgemein
Über das Template verteilt viele `style="…"` (Grid-Definitionen, Abstände, Badge-
Container, Modal-Heading `font-family: var(--font-headline)` etc.).
→ **Fix:** in System-/Utility-Klassen ziehen (`.kv-list`, `.section-title`,
`.data-value`, Spacing-Utilities). Reduziert CSP-Nonce-Bedarf und Drift.

### 🟡 6 — Status-Select-Styling
Der Status-`<select>` für Logistiker ist inline gefärbt
(`background-color: var(--color-surface-input); …`). Die globale Select-Regel deckt
das bereits ab → Inline-Style entfernen.

## Nicht ändern (bewusst gut) ✅
- Bearbeiter-Icon-Aktionen (A11y-Vorbild), AJAX-Fragment-Refresh, Modal-CTA,
  klickbare Drilldown-Zeilen, Blueprint-Coverage-Section (person-zentrierte Liste +
  Abdeckungstabelle), Warnbanner für Items ohne ableitbare Materialien.

## Reihenfolge
1. 🟠 **1 + 2 + 3** zusammen (kv-list, section-title, Claim-Icon) — meiste Wirkung,
   ein Pass über den oberen Seitenteil.
2. 🟡 **4** (Toolbar/Download-Icons) — schnelles Scannen.
3. 🟡 **5 + 6** (Inline-Styles/Select) — Cleanup-PR.

Deckt sich mit dem Gesamt-Audit (`template-audit-full.md`) und Master-Auftrag
(Phase 4/5). Neuer DS-Baustein dieser Runde: **`.section-title`**.
