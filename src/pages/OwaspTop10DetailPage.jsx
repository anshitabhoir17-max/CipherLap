import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ToolGate } from "../components/ToolGate";
import { getOwaspItem, OWASP_TOP10 } from "../data/owaspTop10";

function getCompletedIds() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("owaspCompleted") || "[]";
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveCompletedIds(ids) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("owaspCompleted", JSON.stringify(ids));
}

export function OwaspTop10DetailPage({ authEnabled }) {
  const { vulnId } = useParams();
  const navigate = useNavigate();
  const item = useMemo(() => getOwaspItem(vulnId), [vulnId]);
  const [completedIds, setCompletedIds] = useState(() => getCompletedIds());
  const isCompleted = item ? completedIds.includes(item.id) : false;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [vulnId]);

  useEffect(() => {
    if (!item) return;
    setCompletedIds(getCompletedIds());
  }, [item]);

  function markComplete() {
    if (!item) return;
    const next = Array.from(new Set([...completedIds, item.id]));
    saveCompletedIds(next);
    setCompletedIds(next);
  }

  if (!item) {
    return (
      <ToolGate authEnabled={authEnabled}>
        <section className="tool-surface">
          <h2>Vulnerability not found</h2>
          <p className="hero-copy">That OWASP item could not be loaded. Return to the checklist and pick another topic.</p>
          <button className="btn" onClick={() => navigate("/tools/owasp-top10")}>Back to OWASP checklist</button>
        </section>
      </ToolGate>
    );
  }

  return (
    <ToolGate authEnabled={authEnabled}>
      <section className="tool-surface">
        <div className="tool-page-header">
          <div>
            <p className="eyebrow">OWASP Top 10 detail</p>
            <h2>{item.title}</h2>
            <p className="hero-copy">Learn the full explanation, watch a short walkthrough, and mark this vulnerability complete when you finish.</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn" onClick={() => navigate("/tools/owasp-top10")}>Back to checklist</button>
            <a className="btn" href={item.officialLink} target="_blank" rel="noreferrer">Open official OWASP</a>
          </div>
        </div>

        <div className="detail-grid">
          <article className="detail-panel">
            <p>{item.description}</p>
            <h3>Key learning points</h3>
            <ul>
              {item.details.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
              <button className="btn" onClick={markComplete} disabled={isCompleted}>
                {isCompleted ? "Completed" : "Mark as complete"}
              </button>
              <span className={`status-chip ${isCompleted ? "safe" : "warning"}`}>
                {isCompleted ? "Already completed" : "Complete after study"}
              </span>
            </div>
          </article>

          <article className="detail-panel">
            <p className="eyebrow">Video walkthrough</p>
            <div className="video-frame">
              <iframe
                title={item.title}
                src={item.videoUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p style={{ marginTop: 12 }}>
              Watch this short explanation to understand the vulnerability and remediation quickly.
            </p>
          </article>
        </div>

        <section className="related-tools">
          <div className="related-tools-head">
            <div>
              <p className="eyebrow">Next OWASP topic</p>
              <h3>Continue learning through the rest of the Top 10.</h3>
            </div>
            <Link className="hero-link ghost" to="/tools/owasp-top10">
              Back to checklist
            </Link>
          </div>
          <div className="related-tools-grid">
            {OWASP_TOP10.filter((entry) => entry.id !== item.id).slice(0, 3).map((entry) => (
              <Link className="related-tool-card" key={entry.id} to={`/tools/owasp-top10/${entry.id}`}>
                <span className="tool-symbol small" aria-hidden="true">{entry.id.toUpperCase()}</span>
                <div>
                  <p className="tool-tag">Top 10 study</p>
                  <h4>{entry.title}</h4>
                  <p>{entry.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </ToolGate>
  );
}
