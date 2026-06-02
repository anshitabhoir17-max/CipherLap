import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToolGate } from "../components/ToolGate";

function timeoutFetch(url, ms = 3000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
}

export function NetworkScannerPage({ authEnabled }) {
  const navigate = useNavigate();
  const [host, setHost] = useState("");
  const [ports, setPorts] = useState("80,443,8080");
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  async function runScan() {
    setResults([]);
    setRunning(true);
    const portList = ports
      .split(/[,\s]+/)
      .map((p) => p.trim())
      .filter(Boolean)
      .flatMap((p) => (p.includes("-") ? (() => { const [a,b]=p.split('-').map(Number); const r=[]; for(let i=a;i<=b;i++)r.push(String(i)); return r; })() : [p]));

    const out = [];
    for (const p of portList) {
      const url = `http://${host}:${p}/`;
      try {
        // Attempt a simple fetch; note: many targets will block CORS so success is rare.
        const res = await timeoutFetch(url, 2500);
        out.push({ port: p, open: true, status: res.status });
      } catch (e) {
        out.push({ port: p, open: false, status: null });
      }
      setResults([...out]);
    }

    setRunning(false);
  }

  function simulateScan() {
    const sample = ports.split(/[,\s]+/).filter(Boolean).map((p, i) => ({ port: p, open: i % 2 === 0 }));
    setResults(sample);
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify({ host, results }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${host || 'scan'}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <ToolGate authEnabled={authEnabled}>
      <section className="tool-surface">
        <div className="tool-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Network Scanner (browser-limited)</h2>
          <div>
            <button className="btn" onClick={() => navigate('/tools')}>Back to Tools</button>
          </div>
        </div>

      <p className="hero-copy">Browser-enforced restrictions limit active scanning. Use the fetch probe for HTTP services or the simulator for example results.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 12 }}>
        <div>
          <label>Target host (IP or hostname)</label>
          <input value={host} onChange={(e) => setHost(e.target.value)} placeholder="example.local or 192.168.1.10" style={{ width: "100%" }} />

          <label style={{ marginTop: 8 }}>Ports (comma, space or range e.g. 20-25)</label>
          <input value={ports} onChange={(e) => setPorts(e.target.value)} style={{ width: "100%" }} />

          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button className="btn" onClick={runScan} disabled={!host || running}>Run scan (HTTP probe)</button>
            <button className="btn" onClick={simulateScan} disabled={running}>Simulate</button>
            <button className="btn" onClick={() => { setResults([]); }}>Clear</button>
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>Results</strong>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" onClick={exportJSON} disabled={!results.length}>Export JSON</button>
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Port</th>
                  <th style={{ textAlign: "left" }}>Open</th>
                  <th style={{ textAlign: "left" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td>{r.port}</td>
                    <td>{r.open ? 'yes' : 'no'}</td>
                    <td>{r.status || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  </ToolGate>
  );
}
