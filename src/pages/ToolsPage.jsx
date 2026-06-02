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

const categorySections = [
  {
    title: "Core tools",
    description: "Key inspection and verification workflows.",
    paths: [
      "/tools/email-headers",
      "/tools/domain-intelligence",
      "/tools/hash-lab",
      "/tools/ai-image",
    ],
  },
  {
    title: "Advanced tools",
    description: "Forensics and deeper analysis utilities.",
    paths: [
      "/tools/hidden-message",
      "/tools/metadata-inspector",
      "/tools/qr-extractor",
    ],
  },
  {
    title: "Learning labs",
    description: "Training, reporting, and student workflow tools.",
    paths: [
      "/tools/password-safety",
      "/tools/incident-report",
      "/tools/case-notes",
      "/tools/awareness-quiz",
      "/tools/pwned-email",
    ],
  },
];

const featuredPaths = ["/tools/owasp-top10", "/tools/payload-tester", "/tools/network-scanner"];

export function ToolsPage() {
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filteredTools = useMemo(() => {
    if (selectedFilter === "all") {
      return tools;
    }
    return tools.filter((tool) => tool.group === selectedFilter);
  }, [selectedFilter]);

  const featuredTools = tools.filter((tool) => featuredPaths.includes(tool.path));

  return (
    <div className="page-stack">
      <section className="hero-card tools-hero">
        <div>
          <p className="eyebrow">All Tools</p>
          <h2>Open the tool you want to use and refine by category.</h2>
          <p className="hero-copy">
            Actual security tools live here. Use the category chips to focus on email, web, image, utility, or reporting workflows.
          </p>
        </div>
        <div className="filter-bar">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`filter-chip ${selectedFilter === option.value ? "active" : ""}`}
              onClick={() => setSelectedFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="featured-tools">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Most used tools</p>
            <h2>Open the core CipherLab tools first.</h2>
          </div>
          <p className="section-copy">Click any card below to launch the tool page directly.</p>
        </div>

        <div className="feature-grid">
          {featuredTools.map((tool) => (
            <article className="feature-card" key={tool.path}>
              <p className="tool-tag">{tool.tag}</p>
              <h3>{tool.title}</h3>
              <p>{tool.description}</p>
              <Link className="hero-link" to={tool.path}>Open Tool</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="tool-directory">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Tool categories</p>
            <h2>Browse by workflow and purpose.</h2>
          </div>
          <p className="section-copy">Filtered tools are shown below in their category groups.</p>
        </div>

        {categorySections.map((section) => {
          const sectionTools = section.paths
            .map((path) => tools.find((tool) => tool.path === path))
            .filter(Boolean)
            .filter((tool) => selectedFilter === "all" || tool.group === selectedFilter);

          if (!sectionTools.length) {
            return null;
          }

          return (
            <div className="tool-section" key={section.title}>
              <div className="tool-section-header">
                <div>
                  <p className="eyebrow">{section.title}</p>
                  <h3>{section.description}</h3>
                </div>
                <p className="tool-count">{sectionTools.length} tools</p>
              </div>

              <div className="tool-grid">
                {sectionTools.map((tool) => (
                  <article className="tool-card" key={tool.path}>
                    <p className="tool-tag">{tool.tag}</p>
                    <div className="tool-card-head">
                      <span className="tool-symbol" aria-hidden="true">
                        {tool.symbol}
                      </span>
                      <h3>{tool.title}</h3>
                    </div>
                    <p>{tool.description}</p>
                    <Link className="hero-link" to={tool.path}>
                      Open Tool
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          );
        })}

          {/* Other tools not explicitly listed in categorySections */}
          {(() => {
            const displayedPaths = categorySections.flatMap((s) => s.paths);
            const otherTools = filteredTools.filter((tool) => !displayedPaths.includes(tool.path));

            if (!otherTools.length) return null;

            return (
              <div className="tool-section">
                <div className="tool-section-header">
                  <div>
                    <p className="eyebrow">Other tools</p>
                    <h3>Additional utilities and experimental pages</h3>
                  </div>
                  <p className="tool-count">{otherTools.length} tools</p>
                </div>

                <div className="tool-grid">
                  {otherTools.map((tool) => (
                    <article className="tool-card" key={tool.path}>
                      <p className="tool-tag">{tool.tag}</p>
                      <div className="tool-card-head">
                        <span className="tool-symbol" aria-hidden="true">
                          {tool.symbol}
                        </span>
                        <h3>{tool.title}</h3>
                      </div>
                      <p>{tool.description}</p>
                      <Link className="hero-link" to={tool.path}>
                        Open Tool
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            );
          })()}

        {filteredTools.length === 0 ? (
          <div className="tool-empty-state">
            <p>No tools match the selected category yet.</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
