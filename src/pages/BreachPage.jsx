import { useState } from "react";
import { ResultPanel } from "../components/ResultPanel";
import { ToolGate } from "../components/ToolGate";
import { analyzeEmailExposure } from "../lib/analyzers";

export function BreachPage({ authEnabled }) {
  const [email, setEmail] = useState("security-team@gmail.com");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleAnalyze = () => {
    try {
      setResult(analyzeEmailExposure(email));
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
              <p className="eyebrow">Exposure Readiness</p>
              <h2>Pwned Email Prep</h2>
              <p>
                Review how exposed an email address may be before you connect a real
                breach-checking backend.
              </p>
            </div>
            <button className="tool-submit" type="button" onClick={handleAnalyze}>
              Review Email
            </button>
          </div>

          <label className="tool-label" htmlFor="breach-input">
            Email address
          </label>
          <input
            className="tool-input"
            id="breach-input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </section>

        {error ? <section className="tool-result error-panel">{error}</section> : null}
        {result ? <ResultPanel title="Pwned Email Prep" {...result} /> : null}
      </div>
    </ToolGate>
  );
}
