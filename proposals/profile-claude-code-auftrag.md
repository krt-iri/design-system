# Claude-Code-Auftrag — /profile auf das KRT Design System bringen (Variante A)

Repo: `krt-iri/basetool` · Datei `frontend/src/main/resources/templates/profile.html`.
Ziel: die heutige **eine `kv-list` mit drei eingebetteten Formularen** (Lesedaten +
Eigene Daten + Auszahlung + Blueprint-Freigabe untereinander, drei „Speichern"-Buttons)
ersetzen durch **Variante A**: ein read-only **Identitäts-Block** oben, darunter je eine
**Einstellungs-Karte mit genau einer CTA** — **ohne** Funktions-, Sichtbarkeits- oder
Speicher-Logik-Verlust.

## Quelle der Wahrheit (Skill `.claude/skills/das-kartell-design/`)
- **Mockup (Soll):** `proposals/profile-final.html` (finalisierte Variante A).
- **Exploration/Begründung:** `proposals/profile-varianten.html` (Befund + A/B/C).
- **DS-Bausteine (bestehend):** `.card` (+ `--accent`/`--inset`), `.card-head`/`.card-title`,
  `.squadron-badge`, `.chip` (`--primary`/`--muted`), `.btn--cta`/`.btn-outline`/`.btn-ghost`,
  Form-Defaults (`label`/`.form-label`, Inputs, `select`, `textarea`), `.field-error`,
  `.kv-list`. Icon-Sprite `fragments/icons.html` (`save`, `info`, `success`,
  `external-link`, `arrow-left`).

## Ziel-Aufbau (von oben nach unten)
1. **Greeting** (`#{profile.title}` → „Mein Profil") + eine ruhige Sub-Zeile
   (neuer Key `profile.subtitle`).
2. **Identitäts-Block** — read-only, als `.card .card--accent`:
   - **Initialen-Kachel** (74×74, eckig, Initialen in Orange) aus `${displayName}`
     bzw. Fallback `${username}` ableiten (1–2 Großbuchstaben; server-seitig im
     Controller berechnen oder via kleinem CSP-nonce-Skript — **kein** neues Avatar-/
     Upload-Feature erfinden).
   - **Anzeigename** (`${displayName}` ⁠/ Fallback `${username}`) als Headline,
     darunter `@${username}` (muted).
   - **Chips:** Rang `th:if="${rank}"` als `.chip .chip--primary` (Identität, daher
     Orange erlaubt); aktuelle Staffel als `.squadron-badge` aus dem bereits im
     Header/Sidebar vorhandenen Squadron-Kontext (keine neue Query).
3. **Fakten-Raster** (read-only) direkt unter dem Block: **E-Mail** (`${email}`),
   **Beitrittsdatum** `th:if="${joinDate}"` (`#temporals.format(joinDate,'dd.MM.yyyy')`),
   **Monate bei der Staffel** `th:if="${monthsInSquadron != null}"`. Label neutral,
   Wert hell (`--data-fg`, `tabular-nums`). Nicht vorhandene Felder fallen weg (kein
   leeres Feld rendern). *(Das frühere „Mitglied seit … Mon."-Chip entfällt — es ist
   redundant zu „Monate bei der Staffel".)*
4. **Einstellungs-Karten** — je `<form>` eine eigene `.card` mit `.card-head` +
   genau **einer** `.btn--cta` im Karten-Fuß:
   - **Eigene Daten** (`profile-description-form`): `displayName` + `description`.
   - **Standard-Auszahlung** (`profile-payout-form`): Select `defaultPayoutPreference`
     + Hinweis `#{profile.payout.preference.hint}` als `.form-hint`.
   - **Blueprint-Freigabe** (`profile-blueprint-sharing-form`): Checkbox
     `shareBlueprintsGlobally` + Hinweis als `.form-hint`.
5. **Zugang & Sicherheit** als ruhige `.card .card--inset` (neue Keys
   `profile.security.title` + `profile.security.hint`): Hinweis, dass Passwort/E-Mail/
   2FA in Keycloak liegen, + **`In Keycloak verwalten`** (`.btn-outline`,
   `${keycloakAccountUrl}`, `target="_blank"`, `rel="noopener"`) und **`Zurück`**
   (`.btn-ghost`, `@{/}`). Hier **keine** gefüllte CTA.

## HARTE ANFORDERUNGEN — keine Regressionen
1. **In-Place-Save (epic #571) unverändert.** Die drei Formulare behalten **IDs**
   (`profile-description-form`, `profile-payout-form`, `profile-blueprint-sharing-form`),
   ihre `th:action`/`method="post"` (No-JS-Fallback → Redirect-Handler) und das
   `th:inline="javascript"`-Skript (`nonce=${cspNonce}`) inkl. `bindInPlaceSave` und
   `syncAllVersions`. Feld-IDs/`name`s bleiben: `#displayName`, `#description`,
   `select[name=defaultPayoutPreference]`, `input[name=shareBlueprintsGlobally]`.
2. **Optimistic Locking.** **Jedes** Formular behält sein verstecktes
   `input[name="version"]` (`th:field="*{version}"`). Alle drei teilen die eine
   User-Row-Version — `syncAllVersions(body.version)` muss nach jedem Save weiter
   greifen → alle drei Hidden-Inputs müssen im DOM bleiben.
3. **Validierung/Bindings.** `th:object`/`th:field` je Formular,
   `th:classappend="… ? 'input-error'"` und `th:errors` → `.field-error` (heller Tint
   + Warn-Glyph) beibehalten; Fehlerfeld zusätzlich rot umranden.
4. **i18n vollständig (de + en), kein Hardcoded-Text.** Bestehende Keys nutzen
   (`profile.username` entfällt als Zeile, `${username}` jetzt im Identitäts-Block;
   `profile.email`, `profile.rank`, `member.join_date`, `member.months_in_squadron`,
   `profile.custom_data`, `profile.display_name`, `profile.description`,
   `profile.save_custom_data`, `profile.payout.*`, `profile.blueprintSharing.*`,
   `profile.edit_link`, `profile.back`). **Neue Keys:** `profile.subtitle`,
   `profile.security.title`, `profile.security.hint` (de+en). Deutsche Umlaute in
   `.properties` als `\uXXXX`.
5. **Action-Hierarchie & Farbe.** Genau eine gefüllte `.btn--cta` pro Karte; Account-
   Aktionen outline/ghost. Orange nur für Aktion + Identität (Initialen, Rang, CTA,
   Links) — **nicht** auf Datenwerten (E-Mail/Datum/Monate neutral-hell). Labels neutral.
6. **Inline-Styles raus.** Auf DS-Klassen umstellen; CSP-Nonce nur für echtes
   dynamisches Styling. Eckige Ecken; rund nur Badges/Chips. Touch-Ziele ≥ 44 px.
7. **Responsive.** Eine Spalte, ~760 px gekappt; Identitäts-Block umbricht auf
   Schmal, Fakten-Raster 3→2 Spalten; Tabellen/Tabs n/a.

## Definition of Done
- `/profile` entspricht `proposals/profile-final.html`: Identitäts-Block + Fakten-Raster
  + vier Karten (Eigene Daten, Standard-Auszahlung, Blueprint-Freigabe, Zugang &
  Sicherheit), je eine CTA.
- Alle drei In-Place-Saves funktionieren ohne Reload; Erfolg/Fehler/409-Konflikt-Toasts
  wie bisher; nach Save bleibt jede weitere Speicherung konfliktfrei (Version-Sync).
- Conditionals (`rank`, `joinDate`, `monthsInSquadron`) verhalten sich wie gehabt
  (fehlend = Feld weg).
- de/en vollständig; keine neuen Farben/Fonts; `./gradlew check` grün; keine
  Konsolenfehler.
