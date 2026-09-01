import { Link } from "react-router-dom";

export function HomePage({ authEnabled }) {
  return (
    <div className="home-stack">
      <section className="hero-card home-hero">
        <div className="landing-copy">
          <p className="eyebrow">Student VAPT Lab</p>
          <h2>CipherLab VAPT lab for security practice.</h2>
          <p className="hero-copy">
            Simple tools for learning, checking, and understanding cybersecurity.
          </p>

          <div className="hero-links">
            <Link className="hero-link" to="/tools">
              Open Tools
            </Link>
            <a
              className="hero-link ghost"
              href="https://owasp.org/www-project-top-ten/"
              target="_blank"
              rel="noreferrer"
            >
              Open OWASP Top 10
            </a>
            <Link className="hero-link" to="/career">
              View Career Roadmaps
            </Link>
          </div>

          <div className="stats-grid">
            <article className="stat-card">
              <span className="stat-value">17</span>
              <p className="stat-label">Tools</p>
            </article>
            <article className="stat-card">
              <span className="stat-value">4</span>
              <p className="stat-label">VAPT stages</p>
            </article>
            <article className="stat-card">
              <span className="stat-value">24</span>
              <p className="stat-label">Learning checkpoints</p>
            </article>
          </div>
        </div>

        <div className="landing-panel hero-panel">
          <p className="landing-panel-tag">Direct resource</p>
          <p className="panel-copy">
            Open the OWASP Top 10 main page directly from CipherLab. This link launches the official resource without extra browser navigation.
          </p>
          <div className="alert-row">
            <span className="status-chip safe">Safe</span>
            <span className="status-chip suspicious">Suspicious</span>
            <span className="status-chip warning">Warning</span>
            <span className="status-chip vulnerable">Vulnerable</span>
          </div>
        </div>
      </section>

      <section className="mission-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Learn by doing</p>
            <h2>Understand what you see. Know what to do next.</h2>
          </div>
        </div>

        <div className="mission-grid">
          <article className="mission-card">
            <h3>Inspect suspicious domains</h3>
            <p>Check domains, DNS, TLS, and website details.</p>
          </article>
          <article className="mission-card">
            <h3>Analyze email headers</h3>
            <p>Spot spoofing and phishing clues in email headers.</p>
          </article>
          <article className="mission-card">
            <h3>Verify hashes and integrity</h3>
            <p>Verify files, hashes, passwords, and encoded data.</p>
          </article>
          <article className="mission-card">
            <h3>Decode tokens and hidden data</h3>
            <p>Translate output and follow guided troubleshooting steps.</p>
          </article>
        </div>
      </section>

      <section className="featured-tools">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Most used tools</p>
            <h2>Start with a popular tool.</h2>
          </div>
          <p className="section-copy">Pick a tool and begin.</p>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <p className="tool-tag">VAPT</p>
            <h3>OWASP Top 10 mini-checker</h3>
            <p>Review the top web security risks with examples and remediation guidance.</p>
            <Link className="hero-link" to="/tools/owasp-top10">Open Tool</Link>
          </article>
          <article className="feature-card">
            <p className="tool-tag">Guided Learning</p>
            <h3>Command Guide</h3>
            <p>Understand the next safe lab step instead of guessing which command comes next.</p>
            <Link className="hero-link" to="/tools/command-guide">Open Tool</Link>
          </article>
          <article className="feature-card">
            <p className="tool-tag">Recon</p>
            <h3>Network scanner concept</h3>
            <p>Explore safe network reconnaissance concepts.</p>
            <Link className="hero-link" to="/tools/network-scanner">Open Tool</Link>
          </article>
        </div>
      </section>
    </div>
  );
}
