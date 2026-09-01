import { useEffect, useState } from "react";
import { ResultPanel } from "../components/ResultPanel";
import { analyzeEmailSafety } from "../lib/analyzers";

export function BreachPage() {
  const [mode, setMode] = useState("address");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  function handleAnalyze() {
    try {
      setResult(analyzeEmailSafety({ email, message, mode }));
      setError("");
    } catch (analysisError) {
      setResult(null);
      setError(analysisError.message);
    }
  }

  return (
    <div className="page-stack">
      <section className="tool-surface">
        <div className="tool-header-copy">
          <p className="eyebrow">Email Safety</p>
          <h2>Email Safety Check</h2>
          <p>Check reputation signals and suspicious email behavior. A valid address alone is never proof that a sender is safe.</p>
        </div>

        <div className="filter-bar" role="tablist" aria-label="Email analysis mode">
          <button className={`filter-chip ${mode === "address" ? "active" : ""}`} type="button" onClick={() => { setMode("address"); setResult(null); }}>Email Address Check</button>
          <button className={`filter-chip ${mode === "full" ? "active" : ""}`} type="button" onClick={() => { setMode("full"); setResult(null); }}>Full Email Analyzer</button>
        </div>

        <label className="tool-label" htmlFor="breach-input">Sender email address {mode === "full" ? "(optional)" : ""}</label>
        <input className="tool-input" id="breach-input" type="email" placeholder={mode === "full" ? "Leave blank if From is pasted below" : "someone@example.com"} value={email} onChange={(event) => setEmail(event.target.value)} />

        {mode === "full" ? <>
          <label className="tool-label" htmlFor="email-message">Paste full email, headers, and body</label>
          <textarea className="tool-textarea" id="email-message" rows="12" placeholder={'From: Security Team <alerts@example.com>\nReply-To: support@other-domain.example\nSubject: Urgent account verification\n\nPlease verify your password immediately...'} value={message} onChange={(event) => setMessage(event.target.value)} />
        </> : <p className="helper-note">This mode checks the address only. For phishing signals, switch to Full Email Analyzer and paste the complete message. Unknown means there is not enough evidence—not that the email is malicious.</p>}

        <button className="tool-submit" type="button" onClick={handleAnalyze}>Analyze Email</button>
      </section>

      {error ? <section className="tool-result error-panel">{error}</section> : null}
      {result ? <ResultPanel title="Email Risk Assessment" {...result} /> : null}
    </div>
  );
}
