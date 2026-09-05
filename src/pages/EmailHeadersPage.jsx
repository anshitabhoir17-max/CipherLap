import { useEffect, useState } from "react";
import { ResultPanel } from "../components/ResultPanel";
import { ToolGate } from "../components/ToolGate";
import { analyzeEmailHeaders } from "../lib/advancedTools";
import { analyzePhishingModel } from "../lib/phishingModel";

const sampleHeaders = `From: "Bank Alerts" <alerts@secure-bank-mail.com>
Reply-To: support@bank-helpdesk-alerts.net
Return-Path: bounce@mailer.bank-helpdesk-alerts.net
Subject: Verify your account immediately
Date: Tue, 01 Apr 2026 18:41:12 +0000
Message-ID: <abc123@example.com>
Authentication-Results: mx.example.com; spf=fail smtp.mailfrom=secure-bank-mail.com; dkim=fail header.d=secure-bank-mail.com; dmarc=fail action=quarantine header.from=secure-bank-mail.com
Received-SPF: fail (example.com: domain of secure-bank-mail.com does not designate 203.0.113.10 as permitted sender)
Received: from host1.example.net (203.0.113.10)
Received: from host2.example.net (198.51.100.12)`;

export function EmailHeadersPage({ authEnabled }) {
  const [input, setInput] = useState(sampleHeaders);
  const [result, setResult] = useState(null);
  const [modelResult, setModelResult] = useState(null);
  const [error, setError] = useState("");
  const [modelError, setModelError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAnalyze = () => {
    try {
      setResult(analyzeEmailHeaders(input));
      setError("");
    } catch (analysisError) {
      setResult(null);
      setError(analysisError.message);
    }
  };

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
              <p className="eyebrow">Mail Routing</p>
              <h2>Email Header Analyzer</h2>
              <p>
                Paste raw email headers to inspect SPF, DKIM, DMARC, reply-to mismatch,
                return-path clues, and route consistency.
              </p>
            </div>
            <div className="button-row">
              <button className="tool-submit" type="button" onClick={handleAnalyze}>Analyze Headers</button>
              <button className="nav-button ghost" type="button" onClick={handleModelAnalyze}>Analyze Email Content with AI</button>
            </div>
          </div>

          <label className="tool-label" htmlFor="email-headers-input">
            Raw email headers
          </label>
          <textarea
            className="tool-textarea"
            id="email-headers-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </section>

        {error ? <section className="tool-result error-panel">{error}</section> : null}
        {modelError ? <section className="tool-result error-panel">{modelError}</section> : null}
        {result ? <ResultPanel title="Email Header Analyzer" {...result} /> : null}
        {modelResult ? (
          <ResultPanel
            title="AI Phishing Detection"
            badge={modelResult.prediction === "phishing" ? "PHISHING LIKELY" : "LEGITIMATE LIKELY"}
            tone={modelResult.prediction === "phishing" ? "high" : "low"}
            score={modelResult.phishingProbability}
            summary={`The supplied email was classified as ${modelResult.prediction} with a ${modelResult.phishingProbability}% phishing probability.`}
            action="Treat this as a model prediction, not proof. Combine it with header authentication, sender context, and URL review."
            findings={[`Model: ${modelResult.model}`, `Phishing probability: ${modelResult.phishingProbability}%`]}
          />
        ) : null}
      </div>
    </ToolGate>
  );
}
