# Claude-Code-Auftrag — /org-unit-bank auf das KRT Design System bringen (Variante B)

Repo: `krt-iri/basetool` · Dateien
`frontend/src/main/resources/templates/org-unit-bank.html` (Übersicht) und
`frontend/src/main/resources/templates/org-unit-bank-account-detail.html` (Konto-Detail).
Ziel: die mitglieder-seitige Bank-Ansicht entschlacken — **Tabs**, **eine** seitenweite
CTA (Konto-Auswahl im Modal), **kompakte Konten-Liste** statt CTA-überladener Karten, und
ruhige Detail-Einstellungen — **ohne** Funktions-, Sichtbarkeits-, AJAX- oder
Berechtigungsverlust.

## Quelle der Wahrheit (Skill `.claude/skills/das-kartell-design/`)
- **Mockups (Soll):** `proposals/org-unit-bank-final.html` (Übersicht, Variante B) +
  `proposals/org-unit-bank-account-detail-final.html` (Detail).
- **Exploration/Begründung:** `proposals/org-unit-bank-varianten.html` (Befund + A/B/C + Detail + Modale).
- **DS-Bausteine (bestehend):** `.tab-nav`/`.tab`/`.tab-count`, `.kpi-total`/`.kpi-label`/
  `.kpi-value`, `.kpi-delta--pos/--neg`, `.chip` (+ `--success/--warning/--muted/--danger`),
  `.data-table`, `.empty-state`, `.btn--cta`/`.btn-outline`/`.btn-ghost`/`.btn-xs`,
  `.krt-modal*`, `.squadron-badge`, Sparkline = server-gerendertes Inline-SVG
  (`BankSparkline`, REQ-BANK-016). Specimens: `preview/components-tabs.html`,
  `preview/components-kpi-sparkline.html`, `preview/components-bank-patterns.html`.

## Übersicht — Ziel-Aufbau (`org-unit-bank.html`)
1. **Seitenkopf:** Titel `#{bank.orgUnit.title}` + Subtitle. Rechts **eine** gefüllte
   `.btn--cta` „Ein-/Auszahlung beantragen" (`data-trigger="open-modal-display"
   data-modal-id="org-unit-request-modal"`). **Nur einblenden, wenn mindestens ein
   Konto `canRequest` ist** (sonst entfällt sie).
2. **Tabs** (`.tab-nav`, `role="tablist"`, Pfeiltasten, `#tab=`-Deeplink):
   „Konten" (Anzahl `balances`) · „Meine Anträge" (Anzahl `ownRequests`). Neue Keys
   `bank.orgUnit.tab.accounts` / `bank.orgUnit.tab.requests`.
3. **Tab „Konten" — kompakte Liste** (statt Karten-Raster): eine Zeile je `balances`-
   Eintrag mit Spalten **Konto** (`accountName` + Sub `accountNo · orgUnitShorthand|Name`
   bzw. `#{'bank.account.type.'+type}` für Sonderkonten), **Trend 30 T** (`.kpi-delta`
   vorzeichen-gefärbt + Sparkline aus `sparks`), **Kontostand** (rechtsbündig,
   `tabular-nums`, Headline-Font), **Ziel** (Mini-Bar + `%`, nur wenn `balanceTarget>0`,
   sonst „— kein Ziel"), **Aktion** (`.btn-ghost.btn-xs` „Details" → `…/accounts/{id}`,
   Label `#{bank.orgUnit.detail.manage}` falls `canManageSettings`, sonst `…detail.open`).
   Konto-Name ebenfalls verlinkt; Zeile als Hover-Highlight. **Kein Status-Chip „Aktiv"**
   (Seite zeigt nur aktive Konten) und **keine Karten-CTA** mehr.
4. **Leerer Zustand** (keine `balances`): `.empty-state` mit `#{bank.orgUnit.empty}`.
5. **Tab „Meine Anträge"** — `.data-table`: Typ, **Betrag** (rechtsbündig `tabular-nums`),
   **Status** als Ton-Chip (PENDING `chip--warning`, APPROVED/COMPLETED `chip--success`,
   REJECTED/CANCELLED `chip--muted` + Grund), Halter, Erstellt (`.utc-time`), Aktion
   (`.btn-ghost.btn-xs` „Zurückziehen" nur bei `PENDING`). Leer → `.empty-state`.
6. **Antrags-Modal** `#org-unit-request-modal`: jetzt mit **`<select name="orgUnitId">`**,
   befüllt nur mit Konten, für die `canRequest` gilt (Label `accountName (accountNo)`).
   Ersetzt das frühere per-Karte-Priming (`data-field-orgunitid/orglabel`). Felder
   `type` (DEPOSIT/WITHDRAWAL), `amount`, `note` + `.bank-field-error[data-error-for]`
   unverändert.

## Detail — Ziel-Aufbau (`org-unit-bank-account-detail.html`)
- **Kopf:** Back-Link, `acct.name()` (h1), **Typ-Chip** + `accountNo`. Den immer „Aktiv"
  zeigenden `.status-pill` weglassen. Kopf-Aktion „Kontoauszug" (`.btn-ghost`, nur
  `canExportStatement`).
- **Fakten** (`.kpi-total`-Reihe, Fragment `orgUnitBankSettings`): Kontosaldo,
  Zielkontostand (+ Fortschritts-Bar, wenn gesetzt), ±30 Tage (gefärbt), Buchungen.
- **Verantwortung & Sichtbarkeit** (nur `settings != null`):
  - *Kontostandsziel* — Formular wie heute (eine `.btn--cta` „Ziel speichern").
  - *Sichtbarkeit* — **Toggles statt CTA-Wand:** je Eintrag (Rolle / „Alle Mitglieder" /
    Nutzer) bei erteiltem Recht ein `.chip chip--success` „Freigegeben" + `.btn-ghost.btn-xs`
    „Entfernen", sonst `.btn-outline.btn-xs` „Freigeben". Endpoints/Methoden
    (`POST`/`DELETE` je `…/visibility/role/{role}` · `…/all-members/{bool}` · `…/user/{id}`),
    `_id`, `data-refresh="orgUnitBankSettings"` **unverändert** übernehmen.
- **Buchungshistorie** (`.data-table`, Fragment `orgUnitBankBookings`): Datum (`.utc-time`),
  Typ als Ton-Chip (DEPOSIT `--success`, WITHDRAWAL `--warning`, TRANSFER neutral mit
  →/← `counterAccountNo`, REVERSAL/WIPE_RESET `--danger`), Notiz, **Betrag** rechtsbündig
  vorzeichen-gefärbt (+ Gebühr/Netto-Zeile). Pagination-Fragment + krtFetch-Swap behalten.
- **Kontoauszug-Modal** (Zeitraum Von/Bis, Halter-redigiertes PDF) unverändert.

## HARTE ANFORDERUNGEN — keine Regressionen
1. **AJAX-Seam unangetastet.** Übersicht: `#org-unit-bank-results` + `th:fragment="orgUnitBank"`
   bleibt der Swap-Container (beide Tabs liegen **innerhalb** des Fragments, damit ein
   Write Karten **und** Antragszähler aktualisiert). `.bank-ajax-form`
   (`data-endpoint`/`data-method`/`data-refresh`), `_id`/`version`, `.bank-field-error`,
   `data-trigger="open-modal-display|close-modal-display"`/`data-modal-id`, alle
   `data-testid` und `.utc-time` 1:1 erhalten. Detail: Fragmente `orgUnitBankSettings`
   und `orgUnitBankBookings` + die krtFetch-Pager-Bindung (`bindOrgUnitBankBookingsPager`,
   `krt:swapped`) erhalten.
2. **Tabs überleben Swap.** Nach `orgUnitBank`-Swap Tab-Zustand aus `#tab=` neu anwenden
   und Tab-JS auf `krt:swapped` neu binden (sonst zeigt der frisch gerenderte Fragment-
   Inhalt beide Panels). Kein Inline-Handler — document-delegiert oder Re-Bind.
3. **Berechtigungen identisch.** `@PreAuthorize(MEMBER_OR_ABOVE)` und die per-Konto-Flags
   (`canRequest`, `canManageSettings`, `canExportStatement`, `canSetTarget`,
   `canConfigureVisibility`, `visibilityConfigurable`, `allMembersSupported`) steuern
   Sichtbarkeit wie bisher; der Backend-Seam entscheidet die Daten je Konto. Die neue
   Konto-Auswahl im Modal listet **ausschließlich** `canRequest`-Konten.
4. **Action-Hierarchie & Farbe.** Genau eine gefüllte `.btn--cta` je Kontext (Antrag oben;
   Modal-Submit; „Ziel speichern"; „PDF herunterladen"). Sichtbarkeits-Freigaben =
   `.btn-outline`/`.btn-ghost` + `chip--success`. Salden/Beträge neutral-hell &
   `tabular-nums`; Orange nie auf Datenwerten.
5. **i18n vollständig (de + en).** Bestehende `bank.*`-Keys nutzen; **neue Keys** nur:
   `bank.orgUnit.tab.accounts`, `bank.orgUnit.tab.requests` (+ ggf. ein
   Status-Chip-/„kein Ziel"-Label). Umlaute `\uXXXX`.
6. **Form & Stil.** `bank.css` erweitern, **nicht** forken; CSP-Nonce beibehalten. Eckige
   Ecken; rund nur Chips/Badges. Responsive: Liste bricht ≤ 820 px in gestapelte Zeilen um;
   Touch-Ziele ≥ 44 px; horizontale Tabellen scrollbar (`.hud-scroll.scroll-x`).

## Definition of Done
- Übersicht = `proposals/org-unit-bank-final.html`: Tabs (Konten/Meine Anträge), eine CTA
  mit Konto-Auswahl, kompakte Liste ohne Status-Chip/Karten-CTA, Empty-States; Antrag
  stellen + Zurückziehen swappen `orgUnitBank` in place; Tabs deeplink-fähig & swap-fest.
- Detail = `proposals/org-unit-bank-account-detail-final.html`: Fakten, ruhige
  Verantwortungs-/Sichtbarkeits-Toggles, Verlauf mit Pager-Swap, Kontoauszug-Export;
  Ziel/Sichtbarkeit swappen `orgUnitBankSettings`, Pager swappt `orgUnitBankBookings`.
- de/en vollständig; keine neuen Farben/Fonts; `./gradlew check` grün; keine Konsolenfehler.
