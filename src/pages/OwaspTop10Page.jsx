import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ToolGate } from "../components/ToolGate";
import { OWASP_TOP10 } from "../data/owaspTop10";

export function OwaspTop10Page({ authEnabled }) {
  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState({});

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const completedKeys = useMemo(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem("owaspCompleted") || "[]");
    } catch {
      return [];
    }
  }, []);

  const filtered = OWASP_TOP10.filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  });

  function toggleCheck(id) {
    setChecked((s) => ({ ...s, [id]: !s[id] }));
  }

  function exportCheckedAsMarkdown() {
    const items = OWASP_TOP10.filter((i) => checked[i.id]);
    if (!items.length) return;
    const md = items
      .map(
        (it) => `### ${it.title}\n\n**Summary:** ${it.summary}\n\n**Why it matters:** ${it.description}\n\n`
      )
      .join("\n");
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "owasp-top10-study.md";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <ToolGate authEnabled={authEnabled}>
      <section className="tool-surface">
        <div className="tool-page-header">
          <div>
            <p className="eyebrow">OWASP Top 10</p>
            <h2>Study the most critical web vulnerabilities with step-by-step detail pages.</h2>
            <p className="hero-copy">Click a vulnerability to open the full learning page, watch the video, and mark it complete.</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn" onClick={() => window.open("https://owasp.org/www-project-top-ten/", "_blank")}>Open official OWASP</button>
          </div>
        </div>

        <div className="tool-stats-row">
          <div className="stat-card">
            <span className="stat-value">{filtered.length}</span>
            <p className="stat-label">Topics shown</p>
          </div>
          <div className="stat-card">
            <span className="stat-value">{completedKeys.length}</span>
            <p className="stat-label">Completed</p>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <input
            aria-label="Search OWASP"
            placeholder="Search vulnerability, summary, description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="tool-input"
          />
        </div>

        <div className="tool-grid" style={{ marginTop: 24 }}>
          {filtered.map((item) => {
            const isDone = completedKeys.includes(item.id);
            return (
              <article className="tool-card" key={item.id}>
                <div className="tool-card-head">
                  <span className="tool-symbol" aria-hidden="true">{item.id.toUpperCase()}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                  </div>
                </div>
                <p>{item.description}</p>
                <div className="tool-card-footer">
                  <span className={`status-chip ${isDone ? "safe" : "warning"}`}>{isDone ? "Completed" : "Not completed"}</span>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Link className="hero-link" to={`/tools/owasp-top10/${item.id}`}>
                      View details
                    </Link>
                    <button className="btn small" onClick={() => toggleCheck(item.id)}>
                      {checked[item.id] ? "Uncheck" : "Select"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn" onClick={exportCheckedAsMarkdown}>Export selected notes</button>
          <button className="btn" onClick={() => setChecked({})}>Clear selection</button>
        </div>
      </section>
    </ToolGate>
  );
}
