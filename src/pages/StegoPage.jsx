import { useEffect, useState } from "react";
import { ResultPanel } from "../components/ResultPanel";
import { ToolGate } from "../components/ToolGate";
import { decodeStegoFile } from "../lib/analyzers";

export function StegoPage({ authEnabled }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isDecoding, setIsDecoding] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return undefined;
    }

    const nextUrl = URL.createObjectURL(file);
    setPreviewUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;
    setFile(nextFile);
    setResult(null);
    setError("");
  };

  const handleDecode = async () => {
    if (!file) {
      setError("Choose an image file first.");
      return;
    }

    try {
      setIsDecoding(true);
      const analysis = await decodeStegoFile(file);
      setResult(analysis);
      setError("");
    } catch (analysisError) {
      setResult(null);
      setError(analysisError.message);
    } finally {
      setIsDecoding(false);
    }
  };

  return (
    <ToolGate authEnabled={authEnabled}>
      <div className="page-stack">
        <section className="tool-surface">
          <div className="tool-header">
            <div className="tool-header-copy">
              <p className="eyebrow">CTF / Stego</p>
              <h2>Hidden Message Decoder</h2>
              <p>
                Upload a PNG or JPG to run a browser-side least-significant-bit extraction
                pass and look for hidden text.
              </p>
            </div>
            <button className="tool-submit" type="button" onClick={handleDecode} disabled={isDecoding}>
              {isDecoding ? "Decoding..." : "Decode Image"}
            </button>
          </div>

          <label className="tool-label" htmlFor="stego-input">
            Image file
          </label>
          <input className="tool-file" id="stego-input" type="file" accept="image/*" onChange={handleFileChange} />

          <div className="tool-preview">
            {previewUrl ? <img src={previewUrl} alt={file?.name || "Preview"} /> : <p>Stego image preview will appear here.</p>}
          </div>
        </section>

        {error ? <section className="tool-result error-panel">{error}</section> : null}
        {result ? <ResultPanel title="Hidden Message Decoder" {...result} /> : null}
      </div>
    </ToolGate>
  );
}
