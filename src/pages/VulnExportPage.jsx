import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export function VulnExportPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [component, setComponent] = useState("");
  const [description, setDescription] = useState("");
  const [findings, setFindings] = useState([]);

  function addFinding() {
    if (!title) return;
    setFindings((s) => [...s, { id: Date.now(), title, severity, component, description }]);
    setTitle("");
    setDescription("");
    setComponent("");
    setSeverity("Medium");
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify({ findings }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vuln-report.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportMarkdown() {
    const md = findings
      .map(
        (f, i) => `## ${i + 1}. ${f.title}\n\n**Severity:** ${f.severity}\n\n**Component:** ${f.component}\n\n**Description:**\n${f.description}\n\n`
      )
      .join("\n");
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vuln-report.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="tool-surface">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Vulnerability Report Builder</h2>
        <div>
          <button className="btn" onClick={() => navigate('/tools')}>Back to Tools</button>
        </div>
      </div>

      <p className="hero-copy">Add findings then export the report as JSON or Markdown.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label>Finding title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%" }} />

          <label style={{ marginTop: 8 }}>Severity</label>
          <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>

          <label style={{ marginTop: 8 }}>Affected component</label>
          <input value={component} onChange={(e) => setComponent(e.target.value)} style={{ width: "100%" }} />

          <label style={{ marginTop: 8 }}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} style={{ width: "100%" }} />

          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button className="btn" onClick={addFinding}>Add finding</button>
            <button className="btn" onClick={() => { setFindings([]); }}>Clear all</button>
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>Current findings</strong>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" onClick={exportJSON} disabled={!findings.length}>Export JSON</button>
              <button className="btn" onClick={exportMarkdown} disabled={!findings.length}>Export Markdown</button>
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            {findings.length === 0 && <div>No findings yet.</div>}
            {findings.map((f) => (
              <div key={f.id} className="tool-card" style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <strong>{f.title}</strong>
                    <div style={{ fontSize: 12 }}>{f.severity} — {f.component}</div>
                  </div>
                </div>
                <p style={{ marginTop: 6 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
