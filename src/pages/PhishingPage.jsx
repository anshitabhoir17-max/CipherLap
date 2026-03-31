import { useState } from "react";
import { ResultPanel } from "../components/ResultPanel";
import { ToolGate } from "../components/ToolGate";
import { analyzePhishingMessage } from "../lib/analyzers";

const phishingSample = `To restore access, please confirm your details:
http://bank-verification-update.net

Enter your account number and password to continue.

Regards,
Bank Support`;

export function PhishingPage({ authEnabled }) {
  const [message, setMessage] = useState(phishingSample);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleAnalyze = () => {
    try {
      setResult(analyzePhishingMessage(message));
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
              <p className="eyebrow">Email Defense</p>
              <h2>Phishing Mail Analyzer</h2>
              <p>
                Paste the suspicious email body or raw headers to detect whether the message
                looks suspicious or likely safe.
              </p>
            </div>
            <button className="tool-submit" type="button" onClick={handleAnalyze}>
              Analyze Email
            </button>
          </div>

          <label className="tool-label" htmlFor="phishing-input">
            Email content or raw headers
          </label>
          <textarea
            className="tool-textarea"
            id="phishing-input"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </section>

        {error ? <section className="tool-result error-panel">{error}</section> : null}
        {result ? <ResultPanel title="Phishing Mail Analyzer" {...result} /> : null}
      </div>
    </ToolGate>
  );
}
