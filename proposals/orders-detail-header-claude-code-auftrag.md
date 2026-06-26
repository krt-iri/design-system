# Claude-Code-Auftrag — Auftragsdetails-Kopf entschlacken (Variante A)

Repo: `krt-iri/basetool` · Datei `frontend/src/main/resources/templates/orders-detail.html`
(der `th:fragment="orderHeader"` in `#order-header-results`). Ziel: den hohen,
einspaltigen kv-list-Kopf durch **Variante A** ersetzen — Titelzeile + Facts-Bar +
gruppierte Meta-Karte — **ohne** Funktions-, Sichtbarkeits- oder Berechtigungsverlust.

## Quelle der Wahrheit (Skill `.claude/skills/das-kartell-design/`)
- **Mockup (Soll, Variante A):** `proposals/orders-detail-header-redesign.html`
  (maßgeblich ist der Block „Vorschlag A"; IST/B sind nur Vergleich).
- **DS-Bausteine (neu/bestehend):** `.facts-bar`, **`.meta-grid` › `.meta-group` ›
  `.meta-group-title`**, **`.kv-compact`** (`.kv-key`/`.kv-val`), **`.annotation`**
  (`.annotation-label`). Specimen: `preview/components-detail-header.html`.
- Status-Pill = bestehendes `.status-*`-Idiom (Punkt + Headline-Font).

## Ziel-Aufbau des Kopffragments
1. **Titelzeile:** `Auftrag #<displayId>` (h3) + Auftragsart-Badge (ITEM blau /
   Material) + **Status als Anzeige-Pill** (für alle sichtbar).
2. **Facts-Bar** (`.facts-bar`) mit den Schlüsselwerten: Erstellt, Vergangene Tage
   (Warnfarbe wie heute), Priorität, Auftraggeber-Badge, bearbeitende Einheit-Badge,
   Status. UTC→Lokalzeit-Spans (`#created-date-span`, `#elapsed-days-span`) **mit
   ihren IDs + `data-utc`** übernehmen (die Re-Localize-Logik auf `krt:swapped`
   hängt daran).
3. **Meta-Karte** (`.meta-grid`, 3 Gruppen):
   - *Auftrag*: ID (`#order-display-id` + `data-order-number` behalten), Art, Priorität.
   - *Zeit*: Erstellt, Vergangene Tage.
   - *Beteiligte*: Auftraggeber, bearbeitende Einheit, Handle.
   (Badges = `.squadron-badge`, `—`/muted wie heute bei null.)
4. **Kommentar** (nur wenn vorhanden) als **`.annotation`** mit Label, nicht als
   weitere kv-Zeile. `white-space: pre-wrap` beibehalten.
5. **Status-Select** (Logistiker) als eigene Zeile unter der Karte
   (`sec:authorize="hasRole('LOGISTICIAN')"`); Nicht-Logistiker sehen nur die
   Anzeige-Pill oben (`sec:authorize="!hasRole('LOGISTICIAN')"`). `id="status-select"`,
   `data-trigger="od-update-status"`, `data-order-id`, **`data-version`** unverändert
   übernehmen (optimistic locking).

## HARTE ANFORDERUNGEN — keine Regressionen
1. **Nur das Kopffragment** (`th:fragment="orderHeader"` Inhalt) ändern — Material-/
   Items-/Aggregat-/Bearbeiter-/Übergabe-Sektionen unangetastet.
2. **AJAX-Header-Swap muss weiter funktionieren:** Der Edit-Modal rendert dieses
   Fragment via `GET /orders/{id}?fragment=header` neu. Container `#order-header-results`
   + alle o.g. IDs/`data-*` erhalten; der Status-Handler ist document-delegated → keine
   Inline-Handler einführen.
3. **Rollen-Sichtbarkeit identisch:** Status-Anzeige vs. -Select via `sec:authorize`
   exakt wie heute; Buttons (Bearbeiten/Items bearbeiten/Löschen) in der Greeting-Leiste
   bleiben unverändert.
4. **i18n:** alle Labels über bestehende `#{…}`-Keys (neue Gruppen-Titel „Auftrag/Zeit/
   Beteiligte" als neue Keys de+en). CSP-Nonce, keine neuen Farben, nur DS-Tokens/-Klassen,
   kein zusätzliches Orange auf Datenwerten.
5. **Eckig** bleiben; Badges rund wie gehabt.

## Definition of Done
- Kopf entspricht „Vorschlag A" (Titelzeile + Facts-Bar + 3 Meta-Gruppen + Annotation),
  Kopfhöhe ~halbiert, „Bestellte Items/Benötigte Materialien" deutlich früher sichtbar.
- Edit-Modal-Swap aktualisiert Kopf in-place ohne Reload; Status-Update + optimistic
  locking funktionieren; UTC→Lokalzeit korrekt nach Swap.
- de/en vollständig; `./gradlew check` grün; keine Konsolenfehler.
