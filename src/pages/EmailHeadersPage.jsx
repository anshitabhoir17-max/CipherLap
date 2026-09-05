import { useEffect, useState } from "react";
import { ResultPanel } from "../components/ResultPanel";
import { ToolGate } from "../components/ToolGate";
import { analyzePhishingModel } from "../lib/phishingModel";

const sampleEmail = `Subject: Verify your account immediately

Dear customer,

Your account will be suspended today unless you verify your information immediately.
Please sign in and confirm your password using the link below.`;

export function EmailHeadersPage({ authEnabled }) {
  const [input, setInput] = useState(sampleEmail);
  const [modelResult, setModelResult] = useState(null);
  const [modelError, setModelError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleModelAnalyze = async () => {
    if (!input.trim()) {
      setModelError("Paste email content or headers first.");
      return;
    }

    try {
      const payload = await analyzePhishingModel(input);
      setModelResult(payload);
      setModelError("");
    } catch (modelAnalysisError) {
      setModelResult(null);
      setModelError(modelAnalysisError.message);
    }
  };

  return (
    <ToolGate authEnabled={authEnabled}>
      <div className="page-stack">
        <section className="tool-surface">
          <div className="tool-header">
            <div className="tool-header-copy">
              <p className="eyebrow">AI Email Check</p>
              <h2>AI Phishing Email Detector</h2>
              <p>
                Paste an email, its headers, or just the message body. The AI model
                estimates whether the content looks legitimate or like phishing.
              </p>
            </div>
            <div className="button-row">
              <button className="tool-submit" type="button" onClick={handleModelAnalyze}>Analyze Email with AI</button>
            </div>
          </div>

          <label className="tool-label" htmlFor="email-headers-input">
            Email content or headers
          </label>
          <textarea
            className="tool-textarea"
            id="email-headers-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </section>

        {modelError ? <section className="tool-result error-panel">{modelError}</section> : null}
        {modelResult ? (
          <ResultPanel
            title="AI Phishing Detection"
            badge={modelResult.prediction === "phishing" ? "PHISHING LIKELY" : "LEGITIMATE LIKELY"}
            tone={modelResult.prediction === "phishing" ? "high" : "low"}
            score={modelResult.phishingProbability}
            summary={`The supplied email was classified as ${modelResult.prediction} with a ${modelResult.phishingProbability}% phishing probability.`}
            action="Treat this as a model prediction, not proof. Avoid clicking links or sharing sensitive information until you verify the sender independently."
            findings={[`Model: ${modelResult.model}`, `Phishing probability: ${modelResult.phishingProbability}%`]}
          />
        ) : null}
      </div>
    </ToolGate>
  );
}
