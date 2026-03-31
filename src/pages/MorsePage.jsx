import { useState } from "react";
import { ResultPanel } from "../components/ResultPanel";
import { ToolGate } from "../components/ToolGate";
import { decodeMorse, encodeMorse } from "../lib/analyzers";

export function MorsePage({ authEnabled }) {
  const [input, setInput] = useState("SOS NEED HELP");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleEncode = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Enter text first.");
      setResult(null);
      return;
    }

    setResult({
      badge: "Encoded Morse",
      tone: "low",
      summary: "Plain text was converted into Morse code.",
      findings: ["Spaces between words are shown with / characters."],
      blocks: [{ title: "Output", content: [encodeMorse(trimmed)] }],
    });
    setError("");
  };

  const handleDecode = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Enter Morse code first.");
      setResult(null);
      return;
    }

    setResult({
      badge: "Decoded Text",
      tone: "low",
      summary: "Morse code was decoded into readable text.",
      findings: ["Unknown symbols are shown as ? characters."],
      blocks: [{ title: "Output", content: [decodeMorse(trimmed)] }],
    });
    setError("");
  };

  return (
    <ToolGate authEnabled={authEnabled}>
      <div className="page-stack">
        <section className="tool-surface">
          <div className="tool-header">
            <div className="tool-header-copy">
              <p className="eyebrow">Classic Signals</p>
              <h2>Morse Code Lab</h2>
              <p>Encode text into Morse or decode Morse back into readable text.</p>
            </div>
            <div className="button-row">
              <button className="tool-submit" type="button" onClick={handleEncode}>
                Encode
              </button>
              <button className="nav-button ghost" type="button" onClick={handleDecode}>
                Decode
              </button>
            </div>
          </div>

          <label className="tool-label" htmlFor="morse-input">
            Text or Morse code
          </label>
          <textarea
            className="tool-textarea"
            id="morse-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </section>

        {error ? <section className="tool-result error-panel">{error}</section> : null}
        {result ? <ResultPanel title="Morse Code Lab" {...result} /> : null}
      </div>
    </ToolGate>
  );
}
