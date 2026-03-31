import { useState } from "react";
import { ResultPanel } from "../components/ResultPanel";
import { ToolGate } from "../components/ToolGate";
import { inspectUrl } from "../lib/analyzers";

export function UrlPage({ authEnabled }) {
  const [url, setUrl] = useState("http://secure-banking-update.top/login");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleAnalyze = () => {
    try {
      setResult(inspectUrl(url));
      setError("");
    } catch (analysisError) {
      setResult(null);
      setError(analysisError.message);
    }
  };

  return (
    <ToolGate authEnabled={authEnabled}>
      <div className="page-stack">
        <section className="tool-surface">
          <div className="tool-header">
            <div className="tool-header-copy">
              <p className="eyebrow">Link Intelligence</p>
              <h2>URL Risk Scanner</h2>
              <p>
                Inspect a link for spoofing signals, suspicious lure words, shorteners, and
                risky transport patterns.
              </p>
            </div>
            <button className="tool-submit" type="button" onClick={handleAnalyze}>
              Scan URL
            </button>
          </div>

          <label className="tool-label" htmlFor="url-input">
            URL
          </label>
          <input
            className="tool-input"
            id="url-input"
            type="text"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
        </section>

        {error ? <section className="tool-result error-panel">{error}</section> : null}
        {result ? <ResultPanel title="URL Risk Scanner" {...result} /> : null}
      </div>
    </ToolGate>
  );
}
