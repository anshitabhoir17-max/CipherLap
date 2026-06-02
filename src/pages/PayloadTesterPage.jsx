import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToolGate } from "../components/ToolGate";

function htmlEscape(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}

function sqlBasicEscape(s) {
  return s.replace(/'/g, "''");
}

export function PayloadTesterPage({ authEnabled }) {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("url-encode");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const examples = {
    xss: [
      "<script>alert('xss')</script>",
      '"><img src=x onerror=alert(1)>',
    ],
    sqli: [
      "' OR '1'='1",
      "' UNION SELECT username,password FROM users --",
    ],
  };

  function transform() {
    let res = input;
    if (mode === "url-encode") res = encodeURIComponent(input);
    if (mode === "url-decode") res = decodeURIComponent(input || "");
    if (mode === "html-escape") res = htmlEscape(input);
    if (mode === "html-unescape") res = input.replace(/&lt;|&gt;|&amp;|&quot;|&#x27;/g, (m) => {
      if (m === '&lt;') return '<';
      if (m === '&gt;') return '>';
      if (m === '&amp;') return '&';
      if (m === '&quot;') return '"';
      if (m === '&#x27;') return "'";
      return m;
    });
    if (mode === "base64-encode") res = btoa(unescape(encodeURIComponent(input)));
    if (mode === "base64-decode") {
      try {
        res = decodeURIComponent(escape(atob(input)));
      } catch (e) {
        res = "<invalid base64>";
      }
    }
    if (mode === "sql-escape") res = sqlBasicEscape(input);
    setOutput(res);
  }

  function copyOutput() {
    if (navigator.clipboard) navigator.clipboard.writeText(output || "");
  }

  function insertExample(text) {
    setInput(text);
    setOutput("");
  }

  return (
    <ToolGate authEnabled={authEnabled}>
      <section className="tool-surface">
        <div className="tool-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Payload Tester — XSS / SQLi Helpers</h2>
          <div>
            <button className="btn" onClick={() => navigate('/tools')}>Back to Tools</button>
          </div>
        </div>

      <p className="hero-copy">Encode, decode and safely transform payloads for lab testing. All transformations are client-side only.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label>Input payload</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={8} style={{ width: "100%" }} />

          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="url-encode">URL Encode</option>
              <option value="url-decode">URL Decode</option>
              <option value="html-escape">HTML Escape</option>
              <option value="html-unescape">HTML Unescape</option>
              <option value="base64-encode">Base64 Encode</option>
              <option value="base64-decode">Base64 Decode</option>
              <option value="sql-escape">SQL Basic Escape (single-quote)</option>
            </select>
            <button className="btn" onClick={transform}>Apply</button>
            <button className="btn" onClick={() => { setInput(''); setOutput(''); }}>Clear</button>
          </div>

          <div style={{ marginTop: 12 }}>
            <strong>Examples</strong>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <div>
                <div style={{ fontWeight: 600 }}>XSS</div>
                {examples.xss.map((ex, i) => (
                  <div key={i} style={{ marginTop: 6 }}>
                    <button className="btn small" onClick={() => insertExample(ex)}>{ex.length > 28 ? `${ex.slice(0, 28)}...` : ex}</button>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>SQLi</div>
                {examples.sqli.map((ex, i) => (
                  <div key={i} style={{ marginTop: 6 }}>
                    <button className="btn small" onClick={() => insertExample(ex)}>{ex.length > 28 ? `${ex.slice(0, 28)}...` : ex}</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label>Output</label>
          <textarea value={output} readOnly rows={14} style={{ width: "100%" }} />
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button className="btn" onClick={copyOutput}>Copy Output</button>
            <button className="btn" onClick={() => { setOutput(''); }}>Clear Output</button>
          </div>
        </div>
      </div>
    </section>
  </ToolGate>
  );
}
