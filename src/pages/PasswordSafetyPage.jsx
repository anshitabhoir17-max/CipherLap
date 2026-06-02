import { useEffect, useState } from "react";
import { ResultPanel } from "../components/ResultPanel";
import { ToolGate } from "../components/ToolGate";
import { analyzePasswordSafety } from "../lib/advancedTools";

export function PasswordSafetyPage({ authEnabled }) {
  const [password, setPassword] = useState("Welcome123!");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCheck = () => {
    try {
      setResult(analyzePasswordSafety(password));
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
              <p className="eyebrow">Identity Safety</p>
              <h2>Password Safety Check</h2>
              <p>
                Run a privacy-first local check for length, common weak patterns, entropy, and
                easy-to-guess password issues.
              </p>
            </div>
            <button className="tool-submit" type="button" onClick={handleCheck}>
              Check Password
            </button>
          </div>

          <label className="tool-label" htmlFor="password-safety-input">
            Password or passphrase
          </label>
          <input
            className="tool-input"
            id="password-safety-input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </section>

        {error ? <section className="tool-result error-panel">{error}</section> : null}
        {result ? <ResultPanel title="Password Safety Check" {...result} /> : null}
      </div>
    </ToolGate>
  );
}
