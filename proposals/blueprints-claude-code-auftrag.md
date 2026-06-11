# Claude-Code-Auftrag — „Meine Blueprints" auf Master-Detail (V3) umbauen

Repo: `krt-iri/basetool` · Seite `/personal-inventory/blueprints`
(`frontend/.../templates/personal-inventory-blueprints.html`). Ziel: **exakte**
Umsetzung des abgenommenen V3-Entwurfs — ohne Verlust von Funktionen,
Sichtbarkeiten oder Berechtigungen, ohne Regressionen.

## Quelle der Wahrheit (Skill `.claude/skills/das-kartell-design/`)
- **Mockup (Soll, Variante V3 inkl. per-Zutat-Qualität):**
  `proposals/blueprints-page-varianten.html` — maßgeblich sind der V3-Block
  (Master-Detail) und der gemeinsame Kopf (Add-Leiste); V1/V2 sind verworfen.
- **DS-Komponenten:** `.master-detail`/`.master-list`/`.master-row(.is-active)`/
  `.detail-pane`, `.quality-block`/`.quality-row`/`.quality-affects` (neu),
  `.tab-nav`, `.krt-modal*`, `.empty-state`, `.chip*`, `.section-title`,
  `.btn--cta/-outline/-ghost/-quiet-danger`, `.btn-danger`.
  Specimen: `preview/components-master-detail.html`.

## Ziel-Struktur
1. **Kopf:** Greeting bleibt; daneben kompakte **Add-Leiste**: Typeahead-Suche
   („Blueprint suchen & hinzufügen …") + `.btn--cta` „Hinzufügen" +
   `.btn-outline` „JSON importieren". Fakten-Untertitel: „42 Blueprints ·
   6 mit Notiz". Die heutige große Add-Box (Staging-Chips) wird zur Leiste:
   Typeahead-Auswahl fügt direkt hinzu (Mehrfachauswahl: Staging-Chips erscheinen
   kompakt unter der Leiste, CTA bleibt bis Bestätigung).
2. **PI-Tabs** (Items | Blueprints) → `.tab-nav` mit `.tab-count`.
3. **Master-Detail** (`.master-detail`):
   - Links `.master-list`: Filter-Input oben (clientseitig sofort + heutiger
     `?q=`-Server-Filter), pro Blueprint eine `.master-row` (Produktname; ✎-Marker
     wenn Notiz vorhanden). Aktive Zeile `.is-active`; ↑/↓ wechselt, URL-Param
     (`?bp={id}`) für Deeplink.
   - Rechts `.detail-pane`: Produktname + „Erhalten am" + Aktionen (Notiz ✎,
     Entfernen 🗑 als Icon-Buttons mit `title`+`aria-label`);
     **„Zutaten & Stat-Beitrag nach Zutat-Qualität"** als `.quality-block` je
     Zutat: Quelle (z. B. Armored Carapace), Material + Menge (SCU) +
     **min. Qualität**, Qualitäts-Slider 0–1000, darunter die **nur dieser Zutat
     zugeordneten Stats** als Chips mit **Live-Faktor** (×1.12 …) und Hinweisen
     („höher ist besser", „1000 → ×1.15"); Notiz-Abschnitt (nur wenn vorhanden).
4. **Leerzustände:** Sammlung leer → `.empty-state` mit Hinweis + Add-Aktion;
   kein Blueprint gewählt → `.empty-state` im Detail-Pane.
5. **Mobile (≤900px):** Liste → Detail-Navigation (Zurück-Button im Pane).

## Daten & Berechnung (kein Erfinden!)
- Detail-Pane nutzt den **bestehenden Lazy-Rezept-Endpoint** (heutige
  Recipe-Panel-Daten: Zutaten mit Quelle/Material/Menge/min. Qualität und je
  Zutat die beeinflussten Stats mit Faktor bei 1000).
- Slider-Berechnung exakt wie heute auf der Live-Seite (Faktor-Interpolation der
  bestehenden Logik übernehmen — die Mockup-Formel `1 + (max−1)·q/1000` ist
  Platzhalter; maßgeblich ist die vorhandene Implementierung).
- Slider-Zustand ist reine Ansicht (keine Persistenz), wie heute.

## HARTE ANFORDERUNGEN — keine Regressionen
1. **Funktions-Inventar vorher erstellen, nachher abhaken:** Typeahead-Suche +
   Staging + „Auswahl hinzufügen" · **JSON-Import** (Datei wählen, Vorschau-Modal
   mit Alle/Keine/Anwenden) · Server-Filter `?q=` · Notiz bearbeiten (Modal,
   `version`-Feld/optimistic locking, `acquiredAt` hidden, maxlength 2000) ·
   Entfernen (Bestätigungs-Modal) · Rezept-Daten je Blueprint · Leerzustand ·
   UTC→Lokalzeit-Anzeige („Erhalten am").
2. **Modals → `.krt-modal*`** (eine gefüllte CTA, Ghost-Abbrechen, Fokus-Falle +
   Esc); Lösch-Modal als `--danger` mit benannter Konsequenz; Alt-Klasse
   `krt-danger` → **`.btn-danger`**.
3. **A11y:** `.master-list` als Listbox (role, `aria-selected`, ↑/↓);
   Slider mit `aria-label` („Qualität Ouratite") + `aria-valuetext`;
   Icon-Buttons mit `title`+`aria-label`; `:focus-visible` sichtbar.
4. **i18n (de/en)** für alle neuen Strings; CSP-Nonce; keine neuen Farben,
   nur System-Tokens/-Klassen; CSRF-Hidden-Inputs beibehalten.
5. Bestehende Endpoints/Formulare unverändert weiterverwenden.

## Vorgehen
1. Inventar + heutige Bedingungen aus dem Template extrahieren (Checkliste).
2. DS-Dateien (inkl. `.master-detail`/`.quality-*`) ins Frontend übernehmen.
3. Kopf + Add-Leiste + `.tab-nav` (funktionsgleich, Tabelle bleibt vorerst).
4. Master-Detail-Umbau (Liste + Detail-Pane am Lazy-Endpoint, `?bp=`-Deeplink).
5. Qualitäts-Slider mit echter Berechnungslogik; Modals auf `.krt-modal*`.
6. Leerzustände, Mobile-Fallback, A11y-Pass.
7. Regressionstest: Inventar abhaken, de/en sichten, `./gradlew check` grün.

## Definition of Done
- Optik = V3-Block des Mockups (Liste links, Detail mit Zutaten-Blöcken +
  Live-Faktoren rechts, Add-Leiste oben, `.tab-nav`).
- Alle heutigen Funktionen nachweislich erhalten (Checkliste); Faktor-Berechnung
  identisch zur bisherigen Live-Logik; keine Konsolenfehler;
  `?bp=`-Deeplink + Mobile-Fallback funktionieren; `./gradlew check` grün.
