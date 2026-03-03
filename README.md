# Latency Lab

Visualizzatore realtime di latenza Internet con:

- ping verso più nodi globali
- jitter e packet loss
- grafico live con Chart.js
- mappa interattiva con selezione target
- modalità stress test
- confronto WiFi vs hotspot (stima)

## Stack

- Next.js + React
- Chart.js (`react-chartjs-2`)
- WebSocket server Node (`ws`)

## Avvio locale

Installazione dipendenze:

```bash
npm install
```

Avvio frontend + backend WebSocket:

```bash
npm run dev:all
```

Apri http://localhost:3000.

## Script disponibili

- `npm run dev` → solo frontend Next.js
- `npm run dev:ws` → solo backend WebSocket (porta `8081`)
- `npm run dev:all` → frontend + backend insieme

## Note tecniche

- Il backend usa il comando di sistema `ping` per misurare la latenza.
- Lo stress test introduce spike artificiali per simulare carico/rete instabile.
- I target sono configurati in [data/targets.json](data/targets.json).
