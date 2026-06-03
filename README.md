# CrossingCast — Bahnschranken-Anzeige Alpnach Dorf

Signage-Dashboard für die Feuerwehr Alpnach. Zeigt in Echtzeit den Zustand der SBB-Schranke an der Brüniglinie in Alpnach Dorf an und prognostiziert die nächsten Schliessungen auf Basis des öffentlichen Fahrplans.

**Live:** https://impat83.github.io/sbb-display/
**Repo:** https://github.com/impat83/sbb-display
**Lokal:** [bahnschranke_alpnach.html](bahnschranke_alpnach.html)

---

## Funktionen

| Bereich | Details |
| --- | --- |
| Status | drei Zustände: OFFEN (grün), ACHTUNG (orange, Schranke schliesst), GESPERRT (rot, geschlossen) |
| Countdown | Sekunden bis Schliessung / Öffnung |
| Schranken-Animation | Arme rotieren, Ampeln blinken zustandsabhängig |
| Zug-Anflug-Animation | rotes Symbol gleitet im Warn/Closed über die Gleise, Richtung folgt Destination |
| Richtungsanzeige | leuchtet bei aktivem Zug (↑ Luzern bei Nordfahrer, ↓ Brünig bei Südfahrer) |
| Voraus-Zeitstrahl | nächste 30 Min als Balken — rote Blöcke = Halt, orange = Durchfahrt |
| Doppelschliessung-Banner | warnt wenn die zwei nächsten Züge weniger als 5 Min auseinander liegen |
| Durchfahrer-Erkennung | Schnellzüge ohne Halt in Alpnach Dorf werden via Nachbarstationen Alpnachstad / Sarnen erkannt und mit ⊝ markiert |
| Verbindungs-LED | grün live (< 60 s), orange stale (< 3 Min), rot offline |
| Akustisches Signal | 5 Sek Piep beim Wechsel auf ACHTUNG (Browser-Audio, Auto-Start wo erlaubt) |
| Tages-Statistik | Schliessungszähler pro Tag (localStorage) |
| Nacht-Modus | 22–06 Uhr gedimmt, kein blinkender Ring |
| Closed-Rahmen | rot-weiss gestreifte 30 px Berandung, clockwise rotierend |
| Closed-Overlay-Fix | Body bekommt Padding gleich Streifendicke, kein Content wird verdeckt |

---

## URL-Kalibrierung

Live-Tuning ohne Code-Push, sichtbar im gelben **KALIBRIERT**-Badge oben:

```
https://impat83.github.io/sbb-display/?warn=180&close=120&after=30&passafter=10&travel=180
```

| Parameter | Default | Bedeutung |
| --- | --- | --- |
| `warn` | 180 s | Vorwarnzeit vor Schliessung (state wechselt auf ACHTUNG) |
| `close` | 120 s | Schliesszeit vor planmässiger Abfahrt (state wechselt auf GESPERRT) |
| `after` | 30 s | Reopen-Delay nach Abfahrt bei haltenden Zügen |
| `passafter` | 10 s | Reopen-Delay nach Durchfahrt (kein Dwell) |
| `travel` | 180 s | Geschätzte Reisezeit Nachbarbahnhof → Alpnach Dorf für Durchfahrer |

---

## Daten

Quelle: **transport.opendata.ch v1 stationboard** — alle 30 Sek abgefragt für:

- **Alpnach Dorf** (haltende Züge)
- **Alpnachstad** (Südfahrer → passieren Alpnach Dorf in ca. `travel` Sekunden)
- **Sarnen** (Nordfahrer → passieren Alpnach Dorf in ca. `travel` Sekunden)

Dedupliziert über `train.name` damit haltende Züge nicht doppelt zählen.

---

## Mobile / Smartphone

Eigenes Portrait-Layout via Media Query (`max-aspect-ratio: 1/1` oder `max-width: 820 px`):

- Stack statt zwei Spalten
- Analoge Uhr und QR-Code ausgeblendet
- Schmalere Rahmenstreifen (18 px)
- Skaliertes Schrankenbild

---

## PWA / Installation

Auf iPad / iPhone: Safari → Teilen → „Zum Home-Bildschirm".
Auf Mac Chrome: Adresszeile → Install-Icon.

Manifest und Service Worker liegen im Repo-Root:

- [`manifest.json`](manifest.json)
- [`sw.js`](sw.js) — cached lokale Files, lässt API-Calls (transport.opendata.ch) durch
- [`icon.svg`](icon.svg)

---

## Audio auf Kiosk-Display

Browser blockieren Auto-Audio ohne User-Geste. Workarounds bereits im Code (silentes muted Bootstrap-Element, Resume-Retry). Falls trotzdem stumm:

**Chrome:**
```bash
open -na "Google Chrome" --args \
  --autoplay-policy=no-user-gesture-required \
  --kiosk https://impat83.github.io/sbb-display/
```

**Safari:** Einstellungen → Websites → Auto-Wiedergabe → `impat83.github.io` → „Alle Auto-Wiedergaben erlauben".

---

## Vor-Ort-Kalibrierung

Um die fünf Konstanten (`warn`, `close`, `after`, `passafter`, `travel`) auf die echte Anlage zu tunen, vor Ort eine Stunde lang protokollieren:

```
HH:MM:SS  Schranke zu     IR 2128 → Luzern   (Halt | Durchfahrt)
HH:MM:SS  Schranke auf
```

Daraus lassen sich die Lead-Zeiten und der Reopen-Delay direkt ablesen. Bei Durchfahrern auch die echte Reisezeit ab Sarnen / Alpnachstad.

---

## Lokale Entwicklung

Statischer File-Server reicht — kein Build, kein Framework:

```bash
cd "/Users/patrickimfeld/Claude/SBB Schranke"
python3 -m http.server 8000
# http://localhost:8000/bahnschranke_alpnach.html
```

Bei lokaler Entwicklung läuft `bahnschranke_alpnach.html`, beim Deploy wird die Datei als `index.html` ins Repo `impat83/sbb-display` kopiert.

---

## Deploy

Manuell über Temp-Clone:

```bash
cd /tmp && rm -rf sbb-display && gh repo clone impat83/sbb-display
cp "/Users/patrickimfeld/Claude/SBB Schranke/bahnschranke_alpnach.html" /tmp/sbb-display/index.html
cp "/Users/patrickimfeld/Claude/SBB Schranke/"{manifest.json,sw.js,icon.svg} /tmp/sbb-display/
cd /tmp/sbb-display && git add -A && git commit -m "..." && git push
```

GitHub Pages liefert von `main`-Branch, Aktualisierung dauert 30–60 Sek.

---

## Versionen

- **v1.0** — Initial-Redesign mit grosser Animation und kompakter Zugliste
- **v1.1** — Smartphone-Layout, Doppelschliessung, Richtungspfeil, LED, Piepton, Tagesstatistik, Nacht-Modus, QR-Code
- **v1.2** — Durchfahrer-Erkennung über Alpnachstad / Sarnen, Signage-Anpassungen, kein Aktivierungs-Button mehr
- **v1.2.1** — Audio-Auto-Start aggressiver, stilles Bootstrap-Element
- **v1.2.2** — Analoge Uhr im Mobile-Layout aus
- **v1.3** — Rename CrossingCast, Voraus-Zeitstrahl, URL-Kalibrierung, PWA, neuer rot-weiss rotierender Closed-Rahmen, Bottom-Stripe-Fix
