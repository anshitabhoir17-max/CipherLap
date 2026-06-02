import { useEffect, useState } from "react";
import { ToolGate } from "../components/ToolGate";
import { generateIncidentReport, saveCaseNote } from "../lib/advancedTools";

export function IncidentReportPage({ authEnabled }) {
  const [title, setTitle] = useState("Suspicious Domain Investigation");
  const [tool, setTool] = useState("Domain Intelligence");
  const [severity, setSeverity] = useState("High");
  const [summary, setSummary] = useState("A recently registered domain with mismatched branding was observed in a phishing workflow.");
  const [findings, setFindings] = useState("Domain age under 30 days\nHTTPS certificate was reachable\nReply-To domain did not match From domain");
  const [impact, setImpact] = useState("The domain may be used to impersonate a trusted brand and capture credentials.");
  const [recommendations, setRecommendations] = useState("Block the domain\nWarn users\nSearch for related infrastructure");
  const [evidence, setEvidence] = useState("Screenshot of email\nExtracted headers\nDomain lookup output");
  const [report, setReport] = useState("");
  const [status, setStatus] = useState("");

  const handleGenerate = () => {
    const nextReport = generateIncidentReport({
      title,
      tool,
      severity,
      summary,
      findings,
      impact,
      recommendations,
      evidence,
    });
    setReport(nextReport);
    setStatus("Report generated.");
  };

  const handleSave = () => {
    if (!report) {
      setStatus("Generate the report first.");
      return;
    }

    saveCaseNote({
      title,
      category: "Incident Report",
      severity,
      body: report,
    });
    setStatus("Report saved to Case Notes Dashboard.");
  };

  const handleCopy = async () => {
    if (!report) {
      setStatus("Generate the report first.");
      return;
    }

    await navigator.clipboard.writeText(report);
    setStatus("Report copied to clipboard.");
  };

  return (
    <ToolGate authEnabled={authEnabled}>
      <div className="page-stack">
        <section className="tool-surface">
          <div className="tool-header">
            <div className="tool-header-copy">
              <p className="eyebrow">Reporting</p>
              <h2>Incident Report Generator</h2>
              <p>
                Turn findings into a neat incident report that you can copy or save into local
                case notes.
              </p>
            </div>
            <div className="button-row">
              <button className="tool-submit" type="button" onClick={handleGenerate}>
                Generate
              </button>
              <button className="nav-button ghost" type="button" onClick={handleCopy}>
                Copy
              </button>
              <button className="nav-button ghost" type="button" onClick={handleSave}>
                Save Note
              </button>
            </div>
          </div>

          <div className="form-grid-two">
            <div>
              <label className="tool-label" htmlFor="report-title">Case title</label>
              <input className="tool-input" id="report-title" value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div>
              <label className="tool-label" htmlFor="report-tool">Tool used</label>
              <input className="tool-input" id="report-tool" value={tool} onChange={(event) => setTool(event.target.value)} />
            </div>
          </div>

          <div>
            <label className="tool-label" htmlFor="report-severity">Severity</label>
            <select className="tool-input" id="report-severity" value={severity} onChange={(event) => setSeverity(event.target.value)}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>

          <label className="tool-label" htmlFor="report-summary">Executive summary</label>
          <textarea className="tool-textarea compact" id="report-summary" value={summary} onChange={(event) => setSummary(event.target.value)} />

          <label className="tool-label" htmlFor="report-findings">Findings</label>
          <textarea className="tool-textarea compact" id="report-findings" value={findings} onChange={(event) => setFindings(event.target.value)} />

          <label className="tool-label" htmlFor="report-impact">Impact</label>
          <textarea className="tool-textarea compact" id="report-impact" value={impact} onChange={(event) => setImpact(event.target.value)} />

          <label className="tool-label" htmlFor="report-recommendations">Recommendations</label>
          <textarea className="tool-textarea compact" id="report-recommendations" value={recommendations} onChange={(event) => setRecommendations(event.target.value)} />

          <label className="tool-label" htmlFor="report-evidence">Evidence</label>
          <textarea className="tool-textarea compact" id="report-evidence" value={evidence} onChange={(event) => setEvidence(event.target.value)} />

          {status ? <p className="helper-note">{status}</p> : null}
        </section>

        {report ? (
          <section className="tool-result">
            <h3>Generated Report</h3>
            <pre className="code-panel">{report}</pre>
          </section>
        ) : null}
      </div>
    </ToolGate>
  );
}
