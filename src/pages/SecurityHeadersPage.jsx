import { useState } from "react";
import { ResultPanel } from "../components/ResultPanel";
import { ToolGate } from "../components/ToolGate";
import { checkSecurityHeaders } from "../lib/advancedTools";

export function SecurityHeadersPage({ authEnabled }) {
  const [url, setUrl] = useState("https://example.com");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    try {
      setLoading(true);
      setResult(await checkSecurityHeaders(url));
      setError("");
    } catch (lookupError) {
      setResult(null);
      setError(lookupError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolGate authEnabled={authEnabled}>
      <div className="page-stack">
        <section className="tool-surface">
          <div className="tool-header">
            <div className="tool-header-copy">
              <p className="eyebrow">Web Hardening</p>
              <h2>Security Headers Checker</h2>
              <p>
                Inspect a live website for common browser security headers such as CSP, HSTS,
                X-Frame-Options, and Referrer-Policy.
              </p>
            </div>
            <button className="tool-submit" type="button" onClick={handleCheck} disabled={loading}>
              {loading ? "Checking..." : "Check Headers"}
            </button>
          </div>

          <label className="tool-label" htmlFor="headers-url-input">
            Website URL
          </label>
          <input
            className="tool-input"
            id="headers-url-input"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
        </section>

        {error ? <section className="tool-result error-panel">{error}</section> : null}
        {result ? <ResultPanel title="Security Headers Checker" {...result} /> : null}
      </div>
    </ToolGate>
  );
}
