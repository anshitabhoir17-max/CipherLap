import { useEffect, useState } from "react";
import { ResultPanel } from "../components/ResultPanel";
import { ToolGate } from "../components/ToolGate";
import { analyzeEmailExposure } from "../lib/analyzers";

export function BreachPage({ authEnabled }) {
  const [email, setEmail] = useState("security-team@gmail.com");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
              <p className="eyebrow">Email Safety</p>
              <h2>Email Safety Check</h2>
              <p>
                Check whether an email looks safer for regular use or needs a little
                more caution before you share it widely.
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
        {result ? <ResultPanel title="Email Safety Check" {...result} /> : null}
      </div>
    </ToolGate>
  );
}
