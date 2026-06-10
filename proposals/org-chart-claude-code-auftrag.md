# Claude-Code-Auftrag — Organigramm (`/org-chart`) verbessern

Repo: `krt-iri/basetool`. Ziel: die im Audit gefundenen **A11y- und UX-Feinschliff**-
Punkte am Organigramm umsetzen. Die Optik ist bereits vorbildlich systemkonform —
**nichts am Look/an Farben ändern**, nur Verhalten, Semantik und zwei kleine
Stil-Details.

## Quelle der Wahrheit
- Audit + Soll-Bild: `proposals/org-chart-audit.html` (in diesem Skill).
- DS: `krt-components.css`, `colors_and_type.css` (Fokus-Ring, Tokens).
Betroffene Dateien im Repo:
- `frontend/.../templates/org-chart.html` (Seite + Modal + Inline-JS)
- `frontend/.../templates/fragments/org-chart-node.html` (Personen-Knoten)
- `frontend/.../static/css/org-chart.css`

## Arbeitsweise
- Kleine Commits, ein Schritt pro Block. Nach jedem Schritt `./gradlew check`.
- i18n (de/en) + CSP-Nonce am Inline-Script beibehalten. Keine neuen Farben.
- Mit Tastatur + (wenn möglich) Screenreader gegenprüfen.

---

## SCHRITT 1 🔴 A11y — Baum-Semantik
Die Hierarchie ist aktuell rein visuell (DIV/UL). Für Screenreader die ARIA-Tree-
Rollen ergänzen, ohne das Layout zu ändern:
- Container `.oc-tree` → `role="tree"`, `aria-label="#{orgChart.title}"`.
- Jede `.oc-fan` (Kinderreihe) → `role="group"`.
- Jeder Knoten (`.oc-node` / `ocNode`-Fragment, Unit-Box, Command-Head) →
  `role="treeitem"` mit `aria-label` aus Rang + Name (z. B. „Bereichsleiter,
  cmdr.valk"); `aria-level` passend zur Tiefe (Bereich=1, Stab/Unit=2, Leiter=3,
  Stv./Ensign=4); bei besetzbaren/zusammenklappbaren Einträgen `aria-expanded`
  nur wo zutreffend.
- Roving-Tabindex + **Pfeiltasten-Navigation** (↑/↓ zwischen Geschwistern, ←/→
  zwischen Ebenen, Home/End). Genau ein `tabindex="0"` im Baum, Rest `-1`.
- Vacant-Slots als `treeitem` mit `aria-label` „… nicht besetzt".

## SCHRITT 2 🔴 A11y — Modal: Fokusfalle + Esc
Das Zuweisen/Umbenennen-Modal (`#oc-modal`) braucht vollständige Tastatur-Bedienung:
- **Focus-Trap:** Tab/Shift+Tab zyklisch nur innerhalb `.modal-content`; beim Öffnen
  Fokus auf das erste Feld (ist da), beim Schließen Fokus zurück auf den
  auslösenden Button (Referenz beim Öffnen merken).
- **Esc** schließt das Modal (derzeit nur Klick außerhalb + ✕). `keydown`-Handler auf
  dem Modal.
- `aria-modal="true"` ist gesetzt ✓; zusätzlich Hintergrund inert/`aria-hidden`
  setzen, solange das Modal offen ist.

## SCHRITT 3 🟠 UX — Kein Full-Reload nach Änderung
`send()` macht nach Erfolg `setTimeout(location.reload, 400)` → im breiten Baum geht
die horizontale Scrollposition verloren.
- Minimal-Lösung: vor dem Reload `sessionStorage` mit `oc-chart.scrollLeft` füllen
  und nach Load wiederherstellen.
- Bevorzugt (wenn Aufwand vertretbar): den geänderten Knoten per Fragment-Re-Fetch
  gezielt im DOM ersetzen statt der ganzen Seite; Erfolgs-Toast bleibt.

## SCHRITT 4 🟠 UX — Hero-Bloom vs. Fokus-Ring entkoppeln
Der Bereichsleiter (`.oc-node--hero`) trägt denselben Orange-Bloom wie der
Tastatur-Fokus → bei Fokus nicht unterscheidbar.
- Globalen Fokus-Stil im Baum auf einen **Outline mit Offset** stellen
  (`:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px }`),
  sodass Fokus (scharfe Outline) vom Hero (weicher Bloom) klar abweicht.

## SCHRITT 5 🟡 UX — Edit-Modus-Orientierung
Beim Umschalten auf „Bearbeiten" erscheinen viele gestrichelte „+"-Affordances.
- Kurzen Hinweis/Legende einblenden (z. B. eine `.alert`-Info-Zeile „Bearbeiten
  aktiv — Positionen zuweisen, umbenennen oder entfernen") und den Toggle-Button
  als aktiv kennzeichnen (`aria-pressed`).

## SCHRITT 6 🟡 Konsistenz — Connector-Kontrast (optional)
`--oc-line: var(--color-gray-2)` auf Schwarz ist ~2,8:1 (dezent). Optional die
Linie leicht anheben oder an Knotenpunkten einen `gray-1`-Tick setzen — nur wenn es
ruhig bleibt; nicht orange.

---

## Definition of Done
1. Baum ist mit Screenreader als Hierarchie erfahrbar (tree/treeitem/group,
   aria-level/-label) und **per Pfeiltasten** navigierbar (roving tabindex).
2. Modal: Focus-Trap aktiv, **Esc** schließt, Fokus kehrt zum Auslöser zurück.
3. Änderungen erhalten die Scrollposition (kein „Sprung nach oben/links").
4. Tastatur-Fokus ist überall sichtbar **und** vom Hero-Bloom unterscheidbar.
5. Edit-Modus erklärt sich (Hinweis + `aria-pressed`).
6. Keine Farb-/Form-Regression; `./gradlew check` grün; Optik = `org-chart-audit.html`.
