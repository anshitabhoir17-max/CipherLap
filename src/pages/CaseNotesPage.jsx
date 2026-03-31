import { useEffect, useState } from "react";
import { ToolGate } from "../components/ToolGate";
import { clearCaseNotes, deleteCaseNote, loadCaseNotes, saveCaseNote } from "../lib/advancedTools";

export function CaseNotesPage({ authEnabled }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("New Note");
  const [category, setCategory] = useState("General");
  const [severity, setSeverity] = useState("Medium");
  const [body, setBody] = useState("Capture findings, URLs, domains, next actions, or incident notes here.");

  useEffect(() => {
    setNotes(loadCaseNotes());
  }, []);

  const handleSave = () => {
    setNotes(saveCaseNote({ title, category, severity, body }));
  };

  const handleExport = async () => {
    const payload = JSON.stringify(notes, null, 2);
    await navigator.clipboard.writeText(payload);
  };

  return (
    <ToolGate authEnabled={authEnabled}>
      <div className="page-stack">
        <section className="tool-surface">
          <div className="tool-header">
            <div className="tool-header-copy">
              <p className="eyebrow">Case Tracking</p>
              <h2>Case Notes Dashboard</h2>
              <p>
                Save notes locally in browser storage so you can keep quick investigation
                context while demoing the project.
              </p>
            </div>
            <div className="button-row">
              <button className="tool-submit" type="button" onClick={handleSave}>
                Save Note
              </button>
              <button className="nav-button ghost" type="button" onClick={() => setNotes(clearCaseNotes())}>
                Clear All
              </button>
              <button className="nav-button ghost" type="button" onClick={handleExport}>
                Copy JSON
              </button>
            </div>
          </div>

          <div className="form-grid-two">
            <div>
              <label className="tool-label" htmlFor="case-title">Title</label>
              <input className="tool-input" id="case-title" value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div>
              <label className="tool-label" htmlFor="case-category">Category</label>
              <input className="tool-input" id="case-category" value={category} onChange={(event) => setCategory(event.target.value)} />
            </div>
          </div>

          <div className="form-grid-two">
            <div>
              <label className="tool-label" htmlFor="case-severity">Severity</label>
              <select className="tool-input" id="case-severity" value={severity} onChange={(event) => setSeverity(event.target.value)}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
          </div>

          <label className="tool-label" htmlFor="case-body">Note body</label>
          <textarea className="tool-textarea" id="case-body" value={body} onChange={(event) => setBody(event.target.value)} />
        </section>

        <section className="tool-surface">
          <div className="tool-header">
            <div className="tool-header-copy">
              <p className="eyebrow">Saved Notes</p>
              <h2>Local Investigation Notes</h2>
            </div>
          </div>

          {notes.length ? (
            <div className="notes-grid">
              {notes.map((note) => (
                <article className="note-card" key={note.id}>
                  <p className="tool-tag">{note.category}</p>
                  <h3>{note.title}</h3>
                  <p className="note-meta">{note.severity} · {new Date(note.createdAt).toLocaleString()}</p>
                  <pre className="note-body">{note.body}</pre>
                  <button className="nav-button ghost" type="button" onClick={() => setNotes(deleteCaseNote(note.id))}>
                    Delete
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="helper-note">No saved notes yet.</p>
          )}
        </section>
      </div>
    </ToolGate>
  );
}
