"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import targets from "@/data/targets.json";
import { Footer } from "@/components/Footer";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

type Mode = "normal" | "stress";

type TargetSnapshot = {
  id: string;
  name: string;
  country: string;
  host: string;
  lat: number;
  lng: number;
  latency: number | null;
  jitter: number;
  packetLoss: number;
  healthy: boolean;
};

type SnapshotMessage = {
  type: "snapshot";
  ts: number;
  mode: Mode;
  targets: TargetSnapshot[];
  aggregate: {
    averageLatency: number;
    averageJitter: number;
    averageLoss: number;
  };
};

function toFixed(value: number | null, digits = 1) {
  if (value === null || Number.isNaN(value)) return "--";
  return value.toFixed(digits);
}

function projectToMap(lat: number, lng: number) {
  const x = ((lng + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return { x, y };
}

export default function Home() {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [mode, setMode] = useState<Mode>("normal");
  const [selectedTarget, setSelectedTarget] = useState(targets[0]?.id ?? "");
  const [snapshots, setSnapshots] = useState<SnapshotMessage[]>([]);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(`${protocol}://localhost:8081`);
    wsRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
    };

    socket.onclose = () => {
      setConnected(false);
    };

    socket.onerror = () => {
      setConnected(false);
    };

    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data) as
        | SnapshotMessage
        | { type: "status"; mode: Mode };
      if (payload.type === "status") {
        setMode(payload.mode);
        return;
      }
      setMode(payload.mode);
      setSnapshots((prev) => {
        const updated = [...prev, payload];
        if (updated.length > 40) {
          updated.shift();
        }
        return updated;
      });
    };

    return () => {
      wsRef.current = null;
      socket.close();
    };
  }, []);

  const latest = snapshots[snapshots.length - 1];

  const selectedSeries = useMemo(() => {
    return snapshots.map((snapshot) => {
      const target = snapshot.targets.find((t) => t.id === selectedTarget);
      return target?.latency ?? null;
    });
  }, [selectedTarget, snapshots]);

  const labels = useMemo(() => {
    return snapshots.map((s) => new Date(s.ts).toLocaleTimeString());
  }, [snapshots]);

  const selectedCurrent = latest?.targets.find((t) => t.id === selectedTarget);
  const wifiLatency = selectedCurrent?.latency ?? null;
  const hotspotLatency = wifiLatency === null ? null : wifiLatency * 1.23 + 4;

  return (
    <main className="lab-shell">
      <header className="lab-header">
        <div>
          <span className="brand-mark">khr0me</span>
          <h1>Latency Lab</h1>
          <p>Realtime internet latency monitor with jitter & packet loss</p>
        </div>
        <div className="header-actions">
          <span className={connected ? "status-pill ok" : "status-pill down"}>
            {connected ? "WebSocket online" : "WebSocket offline"}
          </span>
          <button
            type="button"
            className="mode-btn"
            onClick={() => {
              const nextMode: Mode = mode === "normal" ? "stress" : "normal";
              setMode(nextMode);
              if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(
                  JSON.stringify({ type: "config", mode: nextMode }),
                );
              }
            }}
          >
            {mode === "stress" ? "Disable stress test" : "Enable stress test"}
          </button>
        </div>
      </header>

      <section className="kpi-grid">
        <article>
          <h3>Average Latency</h3>
          <strong>
            {toFixed(latest?.aggregate.averageLatency ?? null)} ms
          </strong>
        </article>
        <article>
          <h3>Average Jitter</h3>
          <strong>{toFixed(latest?.aggregate.averageJitter ?? null)} ms</strong>
        </article>
        <article>
          <h3>Average Packet Loss</h3>
          <strong>{toFixed(latest?.aggregate.averageLoss ?? null)}%</strong>
        </article>
      </section>

      <section className="panel-grid">
        <article className="panel">
          <div className="panel-head">
            <h2>Realtime Chart</h2>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
            >
              {targets.map((target) => (
                <option key={target.id} value={target.id}>
                  {target.name} ({target.country})
                </option>
              ))}
            </select>
          </div>
          <Line
            data={{
              labels,
              datasets: [
                {
                  label: "Latency (ms)",
                  data: selectedSeries,
                  borderColor: "#57b9ff",
                  backgroundColor: "rgba(87,185,255,0.25)",
                  tension: 0.35,
                  spanGaps: true,
                },
              ],
            }}
            options={{
              responsive: true,
              animation: false,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: {
                  title: {
                    display: true,
                    text: "ms",
                  },
                },
              },
            }}
          />
        </article>

        <article className="panel">
          <h2>Interactive Map</h2>
          <div className="world-map">
            {latest?.targets.map((target) => {
              const pos = projectToMap(target.lat, target.lng);
              return (
                <button
                  key={target.id}
                  type="button"
                  title={`${target.name}: ${toFixed(target.latency)} ms`}
                  className={`map-point ${selectedTarget === target.id ? "active" : ""} ${target.healthy ? "healthy" : "critical"}`}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  onClick={() => setSelectedTarget(target.id)}
                >
                  <span>{target.name}</span>
                </button>
              );
            })}
          </div>
        </article>
      </section>

      <section className="targets-grid">
        {(latest?.targets ?? []).map((target) => (
          <article key={target.id} className="target-card">
            <h3>
              {target.name} <small>{target.country}</small>
            </h3>
            <ul>
              <li>Latency: {toFixed(target.latency)} ms</li>
              <li>Jitter: {toFixed(target.jitter)} ms</li>
              <li>Packet loss: {toFixed(target.packetLoss)}%</li>
            </ul>
          </article>
        ))}
      </section>

      <section className="compare-panel">
        <h2>WiFi vs Hotspot (estimated)</h2>
        <div>
          <p>WiFi: {toFixed(wifiLatency)} ms</p>
          <p>Hotspot: {toFixed(hotspotLatency)} ms</p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
