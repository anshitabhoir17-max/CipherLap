import { Link } from "react-router-dom";
import { tools } from "../data/tools";

export function ToolsPage() {
  return (
    <div className="page-stack">
      <section className="hero-card tools-hero">
        <div>
          <p className="eyebrow">All Tools</p>
          <h2>Pick the tool you want to open.</h2>
          <p className="hero-copy">
            Every tool now opens on its own dedicated page so the workflow feels cleaner and
            easier to use.
          </p>
        </div>
      </section>

      <section className="tool-directory">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Workspace List</p>
            <h2>Security tool pages</h2>
          </div>
          <p className="section-copy">
            Open any card below to jump into that tool.
          </p>
        </div>

        <div className="tool-grid">
          {tools.map((tool) => (
            <article className="tool-card" key={tool.path}>
              <p className="tool-tag">{tool.tag}</p>
              <h3>{tool.title}</h3>
              <p>{tool.description}</p>
              <Link className="hero-link" to={tool.path}>
                Open Tool
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
