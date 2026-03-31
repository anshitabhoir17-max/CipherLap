import { useEffect, useState } from "react";
import { ResultPanel } from "../components/ResultPanel";
import { ToolGate } from "../components/ToolGate";
import { analyzeImageFile } from "../lib/analyzers";

export function ImagePage({ authEnabled }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

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

  const handleAnalyze = async () => {
    if (!file) {
      setError("Choose an image file first.");
      return;
    }

    try {
      setIsChecking(true);
      const analysis = await analyzeImageFile(file);
      setResult(analysis);
      setError("");
    } catch (analysisError) {
      setResult(null);
      setError(analysisError.message);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <ToolGate authEnabled={authEnabled}>
      <div className="page-stack">
        <section className="tool-surface">
          <div className="tool-header">
            <div className="tool-header-copy">
              <p className="eyebrow">Visual Forensics</p>
              <h2>AI Image Detector</h2>
              <p>
                Upload an image to classify it as likely AI-generated, edited/composite, or
                a more natural-looking photo.
              </p>
            </div>
            <button className="tool-submit" type="button" onClick={handleAnalyze} disabled={isChecking}>
              {isChecking ? "Checking..." : "Check Image"}
            </button>
          </div>

          <label className="tool-label" htmlFor="image-input">
            Image file
          </label>
          <input className="tool-file" id="image-input" type="file" accept="image/*" onChange={handleFileChange} />

          <div className="tool-preview">
            {previewUrl ? <img src={previewUrl} alt={file?.name || "Preview"} /> : <p>Image preview will appear here.</p>}
          </div>
        </section>

        {error ? <section className="tool-result error-panel">{error}</section> : null}
        {result ? <ResultPanel title="AI Image Detector" {...result} /> : null}
      </div>
    </ToolGate>
  );
}
