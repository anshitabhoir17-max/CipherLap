import { useEffect, useState } from "react";
import { ResultPanel } from "../components/ResultPanel";
import { ToolGate } from "../components/ToolGate";
import { analyzeEmailHeaders } from "../lib/advancedTools";

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
  const [error, setError] = useState("");

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
            <button className="tool-submit" type="button" onClick={handleAnalyze}>
              Analyze Headers
            </button>
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
        {result ? <ResultPanel title="Email Header Analyzer" {...result} /> : null}
      </div>
    </ToolGate>
  );
}
