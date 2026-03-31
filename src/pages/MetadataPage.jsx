import { useState } from "react";
import { ResultPanel } from "../components/ResultPanel";
import { ToolGate } from "../components/ToolGate";
import { inspectMetadataFile } from "../lib/advancedTools";

export function MetadataPage({ authEnabled }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInspect = async () => {
    try {
      setLoading(true);
      setResult(await inspectMetadataFile(file));
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
              <p className="eyebrow">Metadata Review</p>
              <h2>Metadata Inspector</h2>
              <p>
                Inspect EXIF, XMP, timestamps, software tags, and other embedded file metadata
                without uploading the file anywhere.
              </p>
            </div>
            <button className="tool-submit" type="button" onClick={handleInspect} disabled={loading}>
              {loading ? "Inspecting..." : "Inspect File"}
            </button>
          </div>

          <label className="tool-label" htmlFor="metadata-file-input">
            File
          </label>
          <input
            className="tool-file"
            id="metadata-file-input"
            type="file"
            onChange={(event) => {
              setFile(event.target.files?.[0] || null);
              setResult(null);
              setError("");
            }}
          />
        </section>

        {error ? <section className="tool-result error-panel">{error}</section> : null}
        {result ? <ResultPanel title="Metadata Inspector" {...result} /> : null}
      </div>
    </ToolGate>
  );
}
