import { useState } from "react";
import { ResultPanel } from "../components/ResultPanel";
import { ToolGate } from "../components/ToolGate";
import { analyzeIocs } from "../lib/advancedTools";

const iocSample = `https://login-secure-bank.top
198.51.100.10
44d88612fea8a8f36de82e1278abb02f
phishing-domain-example.com`;

export function IocPage({ authEnabled }) {
  const [input, setInput] = useState(iocSample);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleAnalyze = () => {
    try {
      setResult(analyzeIocs(input));
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
              <p className="eyebrow">Threat Triage</p>
              <h2>IOC Checker</h2>
              <p>
                Paste URLs, domains, hashes, IPs, or emails to classify each indicator and
                pivot into the right investigation path.
              </p>
            </div>
            <button className="tool-submit" type="button" onClick={handleAnalyze}>
              Classify IOCs
            </button>
          </div>

          <label className="tool-label" htmlFor="ioc-input">
            Indicators
          </label>
          <textarea
            className="tool-textarea"
            id="ioc-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </section>

        {error ? <section className="tool-result error-panel">{error}</section> : null}
        {result ? <ResultPanel title="IOC Checker" {...result} /> : null}
      </div>
    </ToolGate>
  );
}
