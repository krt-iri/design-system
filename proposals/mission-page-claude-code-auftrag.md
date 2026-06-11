# Claude-Code-Auftrag — Einsatz-Seite (/missions/{id}) auf Tab-Layout umbauen

Repo: `krt-iri/basetool`. Ziel: Die Einsatz-Detailseite **strikt nach den
abgenommenen Mockups** auf das Tab-Layout (Variante B) umbauen — **ohne Verlust
von Funktionen, Sichtbarkeiten oder Berechtigungen und ohne Regressionen.**

## Quelle der Wahrheit (verbindlich, im Skill `.claude/skills/das-kartell-design/`)
- **Mockups (Soll-Optik, strikt umsetzen):**
  - `proposals/mission-page-tabs-gesamt.html` — klickbares Gesamt-Mockup (4 Tabs)
  - `proposals/mission-tab-crew-board.html` — Crew-Board (Drag & Drop, interaktiv)
  - `proposals/mission-tab-finanzen.html` — Finanzen/Auszahlung/Wirtschaft
  - `proposals/mission-tab-uebersicht-verwaltung.html` — Übersicht + Verwaltung
  - `proposals/mission-modals.html` — alle 5 Modals
- **DS-Komponenten (neu kanonisiert in `krt-components.css`):** `.tab-nav`/`.tab`/
  `.tab-count`, `.facts-bar`, `.krt-modal*` (+ `--danger`), `.person-row`,
  `.status-dot(--on)`, `.drop-zone`/`.drop-hint`, `.chip-select`; dazu bestehend:
  `.btn--cta/-ghost/-outline/-quiet-danger`, `.chip*`, `.kv-list`, `.section-title`,
  `.data-value`. Specimens: `preview/components-tabs.html`, `components-modal.html`,
  `components-assign-board.html`.
- Betroffen: `frontend/.../templates/mission-detail.html` (+ Fragmente/JS),
  Controller nur wo für Board-Zuweisung/Tab-Deeplink nötig.

## Ziel-Struktur (aus den Mockups)
**Sticky Kopf** (Titel + Squadron-Badge + Status-Pill + „Anmelden"-CTA) +
**`.facts-bar`** (Server-Join, TS, Teilnehmer x/y, Eingecheckt, Gesamtsumme) +
**`.tab-nav`** mit 4 Tabs (Deeplink `?tab=` oder `#tab=`, Browser-Back funktioniert):
1. **Übersicht** (read-only, Lande-Tab): Auftrag/Beschreibung, Termine/Funk/Leitung
   als `.kv-list` (+ Kalender „Öffnen"), persönlicher Status, Zusammenfassungs-
   Karten (springen in die Tabs).
2. **Teilnehmer & Einheiten = Crew-Board:** Pool „Ohne Einheit" + Einheiten als
   offene `.drop-zone`s. **Einheiten haben keine feste Größe; Bordfunktion ist
   flexibel** (`.chip-select` je Person, Job-Typen-Liste, Mehrfach erlaubt).
   Zuweisung per Drag & Drop **und** Klick-Fallback (Person → Ziel) **und**
   tastaturbedienbar. Je Person erhalten: Name (+Gast), Org-Badges (inkl. SK),
   Aufgabenwunsch, Bemerkung (✎-Tooltip), Funktion, Einheit (=Position),
   Check-in-Punkt + Check-In/-Out (nur bei laufendem Einsatz), Bearbeiten, Abmelden.
   Einheiten-Kopf: Name, Typ, Verantwortlicher, **HVU-Chip** (`.chip--warning`),
   Zähler „x an Bord", Edit/Löschen.
3. **Finanzen & Auszahlung:** Summen-Leiste (Gesamtsumme/Einnahmen/Ausgaben/
   je Anteil), Finanz-Tabelle (Typ-Chips, Beträge rechts/tabular, Edit/Löschen,
   Raffinerie-Ausgaben als „auto"-Zeile mit Link), Auszahlungs-Tabelle
   (Teilnahme-%, Auszahlungsart-Select), Wirtschaft als `<details>`
   (Raffinerieaufträge mit Material-Subtabelle, Lagereinträge).
4. **Verwaltung** (rollenbasiert, sonst Tab ausblenden): Details-Formular (alle
   Felder inkl. „Jetzt"-Buttons, Kalender-Link), Organisation (Einsatzleiter
   setzen/entfernen, Funk), Owner übertragen, Manager-Chips, „Einsatz löschen"
   quiet + Bestätigungs-Modal; **eine** Speichern-CTA.

**Modals** nach `mission-modals.html` mit `.krt-modal*`: Anmelden (Selbst/Fremd/
Gast), Teilnehmer bearbeiten (Wunsch+Funktion, Org-Einheiten, Check-Zeiten+Jetzt,
Auszahlungsart, Bemerkung, Abmelden), **Einheit** (Schiffstyp und Hangar-Schiff
**getrennt**, Hangar nach Typ gefiltert, „— keines · nur Typ —", **HVU-Checkbox**),
Finanzeintrag (Einnahme/Ausgabe-Segment, roter Inline-Feldfehler), Lösch-
Bestätigung (`--danger`, Konsequenz benennen). Fokus-Falle + Esc.

## HARTE ANFORDERUNGEN — keine Regressionen
1. **Berechtigungen 1:1 erhalten.** Jede heutige `sec:authorize`-/`th:if`-Bedingung
   wandert unverändert mit, u. a.: Finanzen-Panel nur
   `ADMIN/OFFICER/SQUADRON_MEMBER/MEMBER/LOGISTICIAN/MISSION_MANAGER`;
   Teilnahme-% nur `isAuthenticated()`; Auszahlungsart-Select-Disable-Logik
   (Manager / eigene Person / `mission.canEdit`); Teilnehmer-Aktionen nur
   `mission.canEdit` oder eigene Person oder Gast; Check-In/-Out nur bei
   `actualStartTime != null && actualEndTime == null` und passendem
   Teilnehmer-Zeitstatus; Wirtschaft nur `isAuthenticated()` + vorhandene Daten;
   Verwaltung nach heutiger Edit-Berechtigung. **Vor dem Umbau:** alle
   Bedingungen aus `mission-detail.html` extrahieren und als Checkliste in den
   PR-Beschreib übernehmen.
2. **Funktions-Inventar vorher erstellen:** jede heutige Interaktion (Buttons,
   Selects, Formulare, Modals, Lazy-Loads) auflisten → nach Umbau jede Position
   abhaken. Nichts entfällt; „Crew zuweisen"-Modal wird durch das Board ersetzt
   (gleiches Backend), alles andere bleibt.
3. **Backend-Verträge unangetastet:** bestehende Endpoints/Formulare
   (check-in/out, participants update/delete, payout-preference, finance CRUD,
   panel-Fragmente) weiterverwenden; Board-Zuweisung nutzt den bestehenden
   Unit-Zuweisungs-Endpoint (Drop = gleiche Aktion wie heutige Auswahl).
   Optimistic locking (`version`) und AJAX-Fragment-Refresh beibehalten.
4. **Zustand:** heutige Panel-Collapse-States in `localStorage` werden durch
   den aktiven Tab ersetzt (`?tab=` hat Vorrang, letzter Tab als Fallback);
   ungespeicherte Formulareingaben beim Tab-Wechsel abfangen (Warnung).
5. **A11y:** `role="tablist/tab/tabpanel"`, `aria-selected`, Pfeiltasten;
   Board mit Klick-/Tastatur-Fallback; Icon-only-Buttons mit `title`+`aria-label`;
   `:focus-visible` überall sichtbar.
6. **i18n (de/en) vollständig** — alle neuen Strings über `messages_*.properties`;
   CSP-Nonce-Regeln einhalten; keine neuen Farben, nur System-Tokens/-Klassen.
7. **Neue Felder:** Einheit braucht `hvu`-Flag (Boolean) und die getrennte
   Schiffstyp/Schiff-Wahl, Person↔Einheit-Zuweisung mit **freier Funktion**
   (Job-Typ-Referenz statt Slot). Migration ohne Datenverlust.

## Vorgehen
1. Inventar + Berechtigungs-Checkliste aus dem Ist-Template extrahieren (s. o.).
2. DS-Dateien (`krt-components.css` inkl. neuer Komponenten) ins Frontend
   übernehmen.
3. Tab-Gerüst + sticky Kopf + facts-bar bauen; bestehende Panel-Inhalte den Tabs
   zuordnen (noch ohne Board) — funktionsgleich. `./gradlew check` + manueller
   Durchklick aller Rollen (Gast, Member, Logistiker, Mission-Manager, Admin).
4. Crew-Board (inkl. HVU, Chip-Select, DnD+Fallbacks) gegen bestehende Endpoints.
5. Modals auf `.krt-modal*` umstellen (Felder gemäß Mockup, inkl. Einheit-Modal
   Schiffstyp/Schiff getrennt + HVU).
6. Finanzen-Tab-Feinschliff (Summen-Leiste, Chips, „auto"-Zeile).
7. Regressionstest: Funktions-Inventar abhaken, Rollen-Matrix durchspielen,
   i18n de/en sichten, `./gradlew check` grün.

## Definition of Done
- Optik deckt sich mit den Mockups (Tab je Tab, Modals, Board).
- Funktions-Inventar zu 100 % abgehakt; Berechtigungs-Checkliste unverändert
  erfüllt; keine Konsolenfehler; Lazy-Load/Locking/i18n/CSP intakt.
- Tab-Deeplink + Browser-Back funktionieren; A11y-Kriterien erfüllt.
- `./gradlew check` grün.
