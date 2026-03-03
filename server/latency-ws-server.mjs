import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { exec } from "node:child_process";
import { WebSocketServer } from "ws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const targetsPath = resolve(__dirname, "../data/targets.json");
const targets = JSON.parse(readFileSync(targetsPath, "utf-8"));

const HISTORY_SIZE = 40;
const PORT = process.env.PORT || 8081;

const state = {
  mode: "normal",
  historyByTarget: new Map(
    targets.map((t) => [
      t.id,
      {
        latencies: [],
        samples: [],
      },
    ]),
  ),
};

const wss = new WebSocketServer({ port: PORT });

function runPing(host) {
  return new Promise((resolvePing) => {
    exec(`ping -n -c 1 -W 1 ${host}`, (error, stdout) => {
      const lossMatch = stdout.match(/(\d+(?:\.\d+)?)%\s+packet\s+loss/i);
      const packetLoss = lossMatch
        ? Number.parseFloat(lossMatch[1])
        : error
          ? 100
          : 0;

      const latencyMatch = stdout.match(/time[=<]([\d.]+)\s*ms/i);
      const latency = latencyMatch ? Number.parseFloat(latencyMatch[1]) : null;

      resolvePing({
        latency,
        packetLoss,
        ok: latency !== null && packetLoss < 100,
      });
    });
  });
}

function average(values) {
  if (values.length === 0) return 0;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

function jitterFrom(latencies) {
  if (latencies.length < 2) return 0;
  const diffs = [];
  for (let i = 1; i < latencies.length; i += 1) {
    diffs.push(Math.abs(latencies[i] - latencies[i - 1]));
  }
  return average(diffs);
}

function pushCapped(array, value) {
  array.push(value);
  if (array.length > HISTORY_SIZE) {
    array.shift();
  }
}

function applyStress(value) {
  if (state.mode !== "stress") return value;
  const spike = Math.random() * 80;
  return value + 20 + spike;
}

function asPercentLoss(samples) {
  if (samples.length === 0) return 0;
  const failed = samples.filter((s) => !s.ok).length;
  return (failed / samples.length) * 100;
}

async function measureOnce() {
  const measured = await Promise.all(
    targets.map(async (target) => {
      const result = await runPing(target.host);
      const snapshot = state.historyByTarget.get(target.id);

      pushCapped(snapshot.samples, { ok: result.ok });

      if (result.latency !== null) {
        const stressedLatency = applyStress(result.latency);
        pushCapped(snapshot.latencies, stressedLatency);
      }

      const packetLoss = asPercentLoss(snapshot.samples);
      const currentLatency =
        snapshot.latencies.length > 0
          ? snapshot.latencies[snapshot.latencies.length - 1]
          : null;

      return {
        ...target,
        latency: currentLatency,
        jitter: jitterFrom(snapshot.latencies),
        packetLoss,
        healthy: packetLoss < 10,
      };
    }),
  );

  const allLatencies = measured.flatMap((m) =>
    m.latency === null ? [] : [m.latency],
  );
  const averageLatency = average(allLatencies);

  const payload = {
    type: "snapshot",
    ts: Date.now(),
    mode: state.mode,
    targets: measured,
    aggregate: {
      averageLatency,
      averageJitter: average(measured.map((m) => m.jitter)),
      averageLoss: average(measured.map((m) => m.packetLoss)),
    },
  };

  const message = JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(message);
    }
  }
}

wss.on("connection", (socket) => {
  socket.send(
    JSON.stringify({
      type: "status",
      message: "Latency WebSocket connected",
      mode: state.mode,
      targets,
    }),
  );

  socket.on("message", (raw) => {
    try {
      const message = JSON.parse(raw.toString());
      if (
        message.type === "config" &&
        (message.mode === "normal" || message.mode === "stress")
      ) {
        state.mode = message.mode;
      }
    } catch {
      // Ignore malformed client messages.
    }
  });
});

setInterval(measureOnce, 2000);
void measureOnce();

console.log(`Latency WS server running on ws://localhost:${PORT}`);
