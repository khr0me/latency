# Latency Lab

## What is it?

Latency Lab is a realtime internet latency monitor I built to visualize network performance across multiple global nodes. It gives you a clear picture of how your connection is performing—measuring latency, jitter, and packet loss as they happen. The dashboard displays everything on an interactive world map and live updating charts, so you can see exactly where your connection is struggling.

Built with React and Next.js on the frontend, paired with a Node.js WebSocket server that runs ping measurements in the background. It's meant to be useful for anyone who cares about network performance, whether you're testing your setup or just curious about how your internet actually behaves.

## Features

The app monitors latency to five global endpoints simultaneously and streams the results to your browser in realtime. You get aggregate stats showing your average latency and packet loss, plus individual readings for each server location. There's a chart that updates every two seconds, giving you a visual history of how your latency is trending. The interactive map lets you click on different regions to see their detailed stats, and there's a WiFi vs hotspot comparison mode if you want to see how different connections stack up against each other.

If you're feeling adventurous, there's a stress test mode that simulates network instability—useful for seeing how your connection behaves under pressure.

## Running it

First, install dependencies:

```bash
npm install
```

Then start both the frontend and WebSocket backend together:

```bash
npm run dev:all
```

Open http://localhost:3000 and you should see the dashboard come to life with realtime data.

If you want to run them separately, use `npm run dev` for just the Next.js app or `npm run dev:ws` for the backend server on port 8081.

---

# Latency Lab

## Che cos'è?

Latency Lab è un monitor realtime di latenza internet che ho costruito per visualizzare le prestazioni di rete su molteplici nodi globali. Ti dà un'immagine chiara di come sta performando la tua connessione, misurando latenza, jitter e packet loss mentre accadono. Il dashboard mostra tutto su una mappa mondiale interattiva e grafici aggiornati in tempo reale, così puoi vedere esattamente dove la tua connessione sta soffrendo.

Realizzato con React e Next.js sul frontend, abbinato a un server WebSocket in Node.js che esegue misurazioni di ping sullo sfondo. È pensato per essere utile a chiunque sia interessato alle prestazioni della rete, che tu stia testando il tuo setup o semplicemente curioso di come il tuo internet si comporta davvero.

## Caratteristiche

L'app monitora la latenza verso cinque endpoint globali simultaneamente e trasmette i risultati al tuo browser in tempo reale. Ottieni statistiche aggregate che mostrano la tua latenza media e packet loss, più letture individuali per ogni ubicazione di server. C'è un grafico che si aggiorna ogni due secondi, dandoti una cronologia visiva di come la tua latenza sta tendendo. La mappa interattiva ti permette di cliccare su diverse regioni per vedere i loro stat dettagliati, e c'è una modalità di confronto WiFi vs hotspot se vuoi vedere come le diverse connessioni si confrontano tra loro.

Se ti senti avventuroso, c'è una modalità stress test che simula l'instabilità della rete—utile per vedere come la tua connessione si comporta sotto pressione.

## Come avviarlo

Per prima cosa, installa le dipendenze:

```bash
npm install
```

Poi avvia sia il frontend che il backend WebSocket insieme:

```bash
npm run dev:all
```

Apri http://localhost:3000 e dovresti vedere il dashboard prendere vita con dati in tempo reale.

Se vuoi avviarli separatamente, usa `npm run dev` solo per l'app Next.js o `npm run dev:ws` solo per il server backend sulla porta 8081.
