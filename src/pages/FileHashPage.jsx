import { useState } from "react";
import { ResultPanel } from "../components/ResultPanel";
import { ToolGate } from "../components/ToolGate";
import { buildFileHashResult } from "../lib/advancedTools";

export function FileHashPage({ authEnabled }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    try {
      setLoading(true);
      setResult(await buildFileHashResult(file));
      setError("");
    } catch (analysisError) {
      setResult(null);
      setError(analysisError.message);
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
              <p className="eyebrow">Integrity Check</p>
              <h2>File Hash Verifier</h2>
              <p>
                Generate file hashes locally so users can compare downloaded files against
                trusted checksums.
              </p>
            </div>
            <button className="tool-submit" type="button" onClick={handleRun} disabled={loading}>
              {loading ? "Hashing..." : "Hash File"}
            </button>
          </div>

          <label className="tool-label" htmlFor="file-hash-input">
            File
          </label>
          <input
            className="tool-file"
            id="file-hash-input"
            type="file"
            onChange={(event) => {
              setFile(event.target.files?.[0] || null);
              setResult(null);
              setError("");
            }}
          />
        </section>

        {error ? <section className="tool-result error-panel">{error}</section> : null}
        {result ? <ResultPanel title="File Hash Verifier" {...result} /> : null}
      </div>
    </ToolGate>
  );
}
