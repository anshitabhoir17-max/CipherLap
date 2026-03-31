import { useState } from "react";
import { ResultPanel } from "../components/ResultPanel";
import { ToolGate } from "../components/ToolGate";
import { decodeJwtToken } from "../lib/advancedTools";

const jwtSample = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkNpcGhlckxhYiIsImlhdCI6MTcxMTk5OTk5OSwiZXhwIjo0MTAyNDQ0ODAwfQ.signature`;

export function JwtPage({ authEnabled }) {
  const [token, setToken] = useState(jwtSample);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleDecode = () => {
    try {
      setResult(decodeJwtToken(token));
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
              <p className="eyebrow">Token Review</p>
              <h2>JWT Decoder</h2>
              <p>
                Decode JWT header and payload claims locally without pretending to verify the
                signature.
              </p>
            </div>
            <button className="tool-submit" type="button" onClick={handleDecode}>
              Decode JWT
            </button>
          </div>

          <label className="tool-label" htmlFor="jwt-input">
            JWT
          </label>
          <textarea
            className="tool-textarea"
            id="jwt-input"
            value={token}
            onChange={(event) => setToken(event.target.value)}
          />
        </section>

        {error ? <section className="tool-result error-panel">{error}</section> : null}
        {result ? <ResultPanel title="JWT Decoder" {...result} /> : null}
      </div>
    </ToolGate>
  );
}
