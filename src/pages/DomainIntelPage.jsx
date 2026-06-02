import { useEffect, useState } from "react";
import { ResultPanel } from "../components/ResultPanel";
import { ToolGate } from "../components/ToolGate";
import { lookupDomainIntelligence } from "../lib/advancedTools";

export function DomainIntelPage({ authEnabled }) {
  const [domain, setDomain] = useState("example.com");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLookup = async () => {
    try {
      setLoading(true);
      setResult(await lookupDomainIntelligence(domain));
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
              <p className="eyebrow">Domain Intelligence</p>
              <h2>Domain Intelligence</h2>
              <p>
                Look up registration age, registrar, DNS records, and TLS certificate
                details for a domain.
              </p>
            </div>
            <button className="tool-submit" type="button" onClick={handleLookup} disabled={loading}>
              {loading ? "Looking up..." : "Lookup Domain"}
            </button>
          </div>

          <label className="tool-label" htmlFor="domain-intel-input">
            Domain or URL
          </label>
          <input
            className="tool-input"
            id="domain-intel-input"
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
          />
        </section>

        {error ? <section className="tool-result error-panel">{error}</section> : null}
        {result ? <ResultPanel title="Domain Intelligence" {...result} /> : null}
      </div>
    </ToolGate>
  );
}
