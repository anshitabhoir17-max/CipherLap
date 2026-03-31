import { useEffect, useState } from "react";
import { ResultPanel } from "../components/ResultPanel";
import { ToolGate } from "../components/ToolGate";
import { extractQrOrLinks } from "../lib/advancedTools";

export function QrExtractorPage({ authEnabled }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return undefined;
    }

    const nextUrl = URL.createObjectURL(file);
    setPreviewUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  const handleExtract = async () => {
    try {
      setLoading(true);
      setResult(await extractQrOrLinks(file));
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
              <p className="eyebrow">Image Extraction</p>
              <h2>QR / Link Extractor</h2>
              <p>
                Decode QR payloads and safely extract any embedded URL-like content from the
                decoded result.
              </p>
            </div>
            <button className="tool-submit" type="button" onClick={handleExtract} disabled={loading}>
              {loading ? "Extracting..." : "Extract QR"}
            </button>
          </div>

          <label className="tool-label" htmlFor="qr-file-input">
            QR image
          </label>
          <input
            className="tool-file"
            id="qr-file-input"
            type="file"
            accept="image/*"
            onChange={(event) => {
              setFile(event.target.files?.[0] || null);
              setResult(null);
              setError("");
            }}
          />

          <div className="tool-preview">
            {previewUrl ? <img src={previewUrl} alt={file?.name || "QR preview"} /> : <p>QR preview will appear here.</p>}
          </div>
        </section>

        {error ? <section className="tool-result error-panel">{error}</section> : null}
        {result ? <ResultPanel title="QR / Link Extractor" {...result} /> : null}
      </div>
    </ToolGate>
  );
}
