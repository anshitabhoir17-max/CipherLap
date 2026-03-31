import { useState } from "react";
import { ResultPanel } from "../components/ResultPanel";
import { ToolGate } from "../components/ToolGate";
import { buildHashEncoderResult } from "../lib/advancedTools";

export function HashLabPage({ authEnabled }) {
  const [input, setInput] = useState("cipherlab");
  const [mode, setMode] = useState("encode");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    try {
      setLoading(true);
      setResult(await buildHashEncoderResult(input, mode));
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
              <p className="eyebrow">Hashing + Encoding</p>
              <h2>Hash / Encoder Lab</h2>
              <p>
                Encode or decode text with MD5, SHA-256, Base64, URL encode/decode, Hex, and
                ROT13 transformations.
              </p>
            </div>
            <button className="tool-submit" type="button" onClick={handleRun} disabled={loading}>
              {loading ? "Running..." : "Run Lab"}
            </button>
          </div>

          <label className="tool-label" htmlFor="hash-mode-input">
            Mode
          </label>
          <select
            className="tool-input"
            id="hash-mode-input"
            value={mode}
            onChange={(event) => setMode(event.target.value)}
          >
            <option value="encode">Encode / Hash</option>
            <option value="decode">Decode</option>
          </select>

          <label className="tool-label" htmlFor="hash-lab-input">
            Input text
          </label>
          <textarea
            className="tool-textarea"
            id="hash-lab-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </section>

        {error ? <section className="tool-result error-panel">{error}</section> : null}
        {result ? <ResultPanel title="Hash / Encoder Lab" {...result} /> : null}
      </div>
    </ToolGate>
  );
}
