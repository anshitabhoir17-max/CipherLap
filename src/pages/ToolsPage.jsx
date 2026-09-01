import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { tools } from "../data/tools";

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Email", value: "email" },
  { label: "Web", value: "web" },
  { label: "Image", value: "image" },
  { label: "Utility", value: "utility" },
  { label: "Reporting", value: "reporting" },
  { label: "Learning", value: "learning" },
];

export function ToolsPage() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const filteredTools = useMemo(
    () => selectedFilter === "all" ? tools : tools.filter((tool) => tool.group === selectedFilter),
    [selectedFilter],
  );

  return (
    <div className="page-stack">
      <section className="hero-card tools-hero">
        <div>
          <p className="eyebrow">All Tools</p>
          <h2>Choose a tool and get started.</h2>
          <p className="hero-copy">{tools.length} practical tools for security learning and everyday checks.</p>
        </div>
        <div className="filter-bar" aria-label="Filter tools">
          {filterOptions.map((option) => (
            <button key={option.value} type="button" className={`filter-chip ${selectedFilter === option.value ? "active" : ""}`} onClick={() => setSelectedFilter(option.value)}>
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="tool-directory">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{selectedFilter === "all" ? "Browse tools" : selectedFilter}</p>
            <h2>{filteredTools.length} tools ready to use.</h2>
          </div>
          <p className="section-copy">Short descriptions. One clear action.</p>
        </div>

        {filteredTools.length ? (
          <div className="tool-grid">
            {filteredTools.map((tool) => (
              <article className="tool-card" key={tool.path}>
                <p className="tool-tag">{tool.tag}</p>
                <div className="tool-card-head">
                  <span className="tool-symbol" aria-hidden="true">{tool.symbol}</span>
                  <h3>{tool.title}</h3>
                </div>
                <p>{tool.description}</p>
                <Link className="hero-link" to={tool.path}>Open Tool</Link>
              </article>
            ))}
          </div>
        ) : <div className="tool-empty-state"><p>No tools match this category.</p></div>}
      </section>
    </div>
  );
}
