# Audit — Inventar-Tabelle `/inventory/all` + `/inventory/my` lesbarer machen

Geprüft: `templates/inventory-admin.html` (`/inventory/all`, mit Staffel-Spalte) und
analog `inventory-my.html` (`/inventory/my`, ohne). Beide rendern eine verschachtelte
`krt-table` über drei Ebenen. Referenz: das `das-kartell-design`-Skill
(`krt-components.css` Tabellen + Scrollbalken, „Action hierarchy"). Vorher/Nachher:
`proposals/inventory-table-readability.html`.

## Ist-Struktur (aus dem Template)
- **Ebene 1 — `tr.group-header` (Material):** `▶` | Material | Ø Qualität | Max. Qualität | Gesamtmenge.
- **Ebene 2 — verschachtelte `<table>` mit eigenem `<thead>` (Stack/Nutzer):**
  `▶` | Nutzer | Staffel* | Standort | Qualität | Gesamtmenge | Einträge.
- **Ebene 3 — lazy geladene Einträge mit eigenem `<thead>`:**
  Menge | Auftrag (Select) | Einsatz zuordnen (Select) | Aktionen.
  *(\* Staffel nur im All-Modus.)*

Positiv vorab: Action-Bar nutzt bereits `.btn--cta/.btn-ghost/.btn-quiet-danger`,
Expand-Zustand wird in `localStorage` gemerkt, Einträge werden lazy nachgeladen — gute
Basis. Es geht rein um **Lesbarkeit der Tabelle**.

---

## Befunde

Priorität: 🔴 hoch · 🟠 mittel · 🟡 niedrig.

### 🔴 1 — Drei wiederholte Kopfzeilen-Sätze
Jede Ebene bringt einen eigenen Großbuchstaben-`<thead>`; der **Einträge-Kopf
wiederholt sich pro aufgeklapptem Stack**. Bei mehreren offenen Stacks stapeln sich
„MENGE / AUFTRAG / EINSATZ … / AKTIONEN" mehrfach → Orientierungsverlust.
→ **Fix:** auf **einen** (sticky) Spaltenkopf konsolidieren. Ebenen über Einrückung +
Schienen statt über wiederholte Köpfe unterscheiden. Eintrags-Selects tragen ihre
Bedeutung bereits im Placeholder („Kein Auftrag"/„Kein Einsatz") → kein eigener Kopf nötig.

### 🔴 2 — Keine Tiefen-Einrückung
Material, Nutzer und Eintrag starten am gleichen linken Rand (nur 40px-Toggle-Spalte).
Hierarchie ist nicht ablesbar.
→ **Fix:** pro Ebene einrücken + dünne vertikale **Schiene** (`box-shadow: inset`).
Material = Orange-Akzentbalken links (`.panel-header`-Idiom), Nutzer = 1 Stufe,
Eintrag = 2 Stufen + abgesenkter Hintergrund.

### 🟠 3 — Zahlen linksbündig, nicht tabellarisch
Ø Qualität/Max/Mengen sind linksbündig ohne `tabular-nums` → Werte schlecht vergleichbar.
→ **Fix:** numerische Spalten **rechtsbündig** + `font-variant-numeric: tabular-nums`.
Kleine **Qualitäts-Gauge** (0–1000) unter der Zahl macht Qualität auf einen Blick
vergleichbar. Einheit (`SCU`/`Stück`) gedämpft (`gray-2`) hinter den Wert.

### 🟠 4 — Köpfe komplett orange
Alle drei `<thead>` sind orange — entspricht nicht mehr der System-Regel (Köpfe
`--color-gray-1`, Orange nur für Identität/Akzent; vgl. die bereits umgestellte
`th`-Regel).
→ **Fix:** Kopftext `--color-gray-1`, 2px-Orange-Unterrule behalten. Orange bleibt für
Material-Name (Identität), Chevrons und den Akzentbalken.

### 🟠 5 — Sehr geringe Dichte
1rem-Zellpadding + große Zeilen → wenig Materialien pro Bildschirm, viel Scrollen.
→ **Fix:** Padding auf ~0,5rem, Zeilenhöhe straffen; Zebra-/Hover-Feedback auf
Datenzeilen. Outer-Header **sticky**, damit Spaltenbedeutung beim Scrollen bleibt.

### 🟠 6 — Aktionen als orange Textlinks
„AUSBUCHEN" / „NOTIZ HINZUFÜGEN" wirken wie zwei gleichrangige orange Labels.
→ **Fix:** „Ausbuchen" = `.btn-outline` (die eigentliche Aktion), „Notiz" = `.btn-ghost`
(oder Notiz-Icon). Entspricht der Action-Hierarchie; eine betonte Aktion pro Zeile.

### 🟠 6b — Notiz nur bei vorhandener Notiz anzeigen
Die Notiz-Zeile wird **ausschließlich gerendert, wenn eine Notiz hinterlegt ist**
(`th:if="${entry.note != null and !entry.note.isBlank()}"`). Dann erscheint sie als
eigene, eingerückte Annotations-Box (Orange-Label „Notiz" + Text, bis 80ch, Umbruch
erlaubt) direkt unter dem Eintrag — der „Notiz"-Button wird in diesem Fall `.btn-outline`
(„bearbeiten"). Ohne Notiz: **keine** Zeile, Button bleibt `.btn-ghost` („hinzufügen").
Beispieltext: „Event vom 05.05. Gehört weedyhimself. Zurückgelegt."

### 🟡 7 — Lange Standort-Namen umbrechen
„CRU-L1 Ambitious Dream Station" bricht zweizeilig und treibt die Zeilenhöhe hoch.
→ **Fix:** Standort einzeilig mit Ellipsis + `title`-Tooltip (Vollname).

### 🟡 8 — Uneinheitliche Einheiten/Format
Mischung „10,049 SCU" vs. „40 Stück"; deutsche Dezimaltrennung uneinheitlich.
→ **Fix:** Mengenformat vereinheitlichen (Tausender-/Dezimaltrenner via
`#numbers.formatDecimal`), Einheit konsistent gedämpft anhängen.

### 🟡 9 — Material-Zeile ohne Kontext-Mehrwert
Die Gruppenzeile zeigt nur Aggregat-Zahlen.
→ **Optional:** kurze Kontextzeile („3 Nutzer · 5 Stacks") in `gray-2`, damit man vor
dem Aufklappen den Umfang sieht.

---

## Nicht ändern (gut gelöst) ✅
- Lazy-Load der Einträge (`/inventory/all/stack/entries`), `localStorage`-Expand-State.
- Action-Bar-Buttons (bereits `.btn--cta/.btn-ghost/.btn-quiet-danger`).
- Filter-Leiste (Multi-Select Material/Auftrag/Einsatz, Mindestqualität).
- Staffel-Pills, Bookout-Modal.

## Umsetzungsweg
Die drei verschachtelten `<table>` lassen sich entweder beibehalten (dann: Köpfe der
inneren Tabellen ausblenden bis auf den ersten, Einrückung per `padding-left`/Schiene,
Zahlen rechtsbündig, Dichte runter) **oder** — sauberer — auf einen **Tree-Table mit
CSS-Grid-Zeilen** umstellen (eine Kopfzeile; Ebene über `data-level` + Einrückung).
Das Mock zeigt die Grid-Variante: Spalten **Bestand | Kontext/Zuordnung | Qualität |
Menge | Aktion**, über alle Ebenen gemeinsam ausgerichtet.

Priorität: **1 + 2** (größter Lesbarkeitsgewinn) → **3 + 4** → **5 + 6** → Politur 7–9.
Beide Seiten (`all` mit Staffel-Spalte, `my` ohne) identisch umsetzen.
