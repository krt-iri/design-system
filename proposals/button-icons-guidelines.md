# Button-Icons — KRT-Vorgaben

Wie Icons in Buttons des Profit Basetool eingesetzt werden: **ein** handkuratiertes
Set, klare Regeln für Icon-only vs. Icon+Text. Ziele: einheitliche Oberfläche,
schnellere Wiedererkennung, **Platzersparnis in dichten Tabellen** — ohne
Verständlichkeit zu opfern.

Quelle der Wahrheit: `assets/krt-icons.svg` (kanonisches Sprite), Specimen
`preview/components-icon-set.html`, Vorher/Nachher `proposals/button-icons-readability.html`.
Im Repo lebt das Sprite als `frontend/.../templates/fragments/icons.html`.

## Icon-Stil (verbindlich)
- **24×24 viewBox**, **stroke-only**, `stroke-width: 2`, `stroke-linecap/linejoin: round`,
  `fill: none`, `stroke="currentColor"` → erbt die Button-Textfarbe.
- Optische Größe im Button: **1em** (`.krt-icon` skaliert mit der Schrift).
  Icon-only-Buttons dürfen 1.15em nutzen.
- Kein Icon-Font, kein CDN (CSP). Neues Icon = neues `<symbol>` im Sprite.
- Verwendung: `<svg class="krt-icon"><use href="#krt-icon-NAME"/></svg>`.

## Regel 1 — Icon + Text (Standard)
Für **primäre, seltene oder potenziell mehrdeutige** Aktionen. Icon **links** vom
Text, gleiche Größe, gleiche Farbe. Der Text bleibt die Wahrheit; das Icon ist
Anker für schnelles Scannen.
- Beispiele: Speichern, Anmelden, Schiff hinzufügen, Neuer Eintrag, Übergabe
  protokollieren, Öffnen, Zurück, Filtern, Herunterladen.
- Eine gefüllte CTA pro Kontext bleibt bestehen (Action-Hierarchie) — das Icon
  ändert daran nichts.

## Regel 2 — Icon-only (Platz sparen)
Nur für **wiederholte Zeilenaktionen**, die in jeder Zeile identisch sind und deren
Bedeutung **universell** ist. Spart in dichten Tabellen ~50–60 % Spaltenbreite.
- Erlaubt: Bearbeiten (edit), Löschen (trash), Check-In (login), Check-Out (logout),
  Ausbuchen (bookout), Schließen (close).
- **Pflicht:** `class="btn btn-icon"`, dazu **`aria-label`** UND **`title`** mit dem
  Klartext-Label (Tooltip + Screenreader). Ohne Label kein Icon-only.
- Destruktive Icon-only-Aktionen (Löschen) zusätzlich über die Button-Variante
  kenntlich (`.btn-quiet-danger`) und mit Bestätigungsdialog.
- **Nicht** Icon-only: primäre CTAs, einmalige/seltene Aktionen, alles, dessen Icon
  nicht eindeutig ist (z. B. „Übergabe protokollieren", „Materialsammelübersicht").

## Faustregel
> Wiederholt + universell + beschriftet → **Icon-only**.
> Primär / selten / mehrdeutig → **Icon + Text**.
> Im Zweifel: Text behalten.

## Icon-Wörterbuch (Aktion → Icon)
| Aktion (i18n-Beispiel) | Icon | Button-Modus |
| :-- | :-- | :-- |
| Speichern (`general.save`) | `save` | Icon + Text |
| Löschen (`info.delete`) | `trash` | Icon-only (Zeile) / Icon+Text (Footer) |
| Bearbeiten (`members.edit`) | `edit` | Icon-only (Zeile) |
| Anmelden (`mission.participant.add`) | `user-plus` | Icon + Text |
| Check-In (`mission.participant.checkin`) | `login` | Icon-only (Zeile) |
| Check-Out (`mission.participant.checkout`) | `logout` | Icon-only (Zeile) |
| Ausbuchen (`inventory.bookout`) | `bookout` | Icon-only (Zeile) |
| Hinzufügen (`general.add`, `mission.unit.add`) | `plus` | Icon + Text |
| Neuer Eintrag (`mission.finance.add`) | `plus` | Icon + Text |
| Schiff hinzufügen (`hangar.ship.add`) | `plus` | Icon + Text |
| Zurück (`general.back`, `profile.back`) | `arrow-left` | Icon + Text |
| Details (`general.details`) | `eye` | Icon + Text (oder Icon-only in Zeile) |
| Öffnen (`mission.calendar_link_open`) | `external-link` | Icon + Text |
| Jetzt (`general.now`) | `clock` | Icon + Text (klein) |
| Bestätigen (`*.confirm`) | `check` | Icon + Text |
| Abbrechen (`general.cancel`) | — (kein Icon) | Text (Ghost) |
| Filtern (`*.filter.apply`) | `filter` | Icon + Text |
| Filter zurücksetzen (`inventory.filter.reset`) | `filter-off` | Icon + Text |
| Suche (`general.search`) | `search` | Icon + Text |
| Home-Location setzen (`hangar.home_location.btn`) | `map-pin` | Icon + Text |
| Übergabe protokollieren (`orders.detail.handover`) | `clipboard-check` | Icon + Text |
| Protokoll herunterladen (`orders.handover.report.download`) | `download` | Icon + Text |
| Import (`hangar.import.*`) | `upload` | Icon + Text |
| Sammelübersicht (`orders.detail.materialCollection`) | `list` | Icon + Text |
| Entfernen/Clear (`mission.party_lead.clear`) | `minus` | Icon + Text |
| Schließen (Modal-X) | `close` | Icon-only |

## Do / Don't
- ✅ Icon erbt Textfarbe (currentColor) → passt in jede Button-Variante.
- ✅ Icon-only immer mit `aria-label` + `title`.
- ✅ Konsistenz: dieselbe Aktion = überall dasselbe Icon.
- ❌ Kein Icon auf „Abbrechen" (Ghost-Text genügt; vermeidet X-Verwechslung mit Schließen).
- ❌ Keine zwei Icons in einem Button; kein Icon rechts vom Text.
- ❌ Icon-only nie für mehrdeutige/seltene Aktionen ohne Tooltip.
- ❌ Keine fremde Icon-Library laden (CSP) — nur das Sprite erweitern.
