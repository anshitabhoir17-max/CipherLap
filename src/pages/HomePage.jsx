import { Link } from "react-router-dom";

export function HomePage({ authEnabled }) {
  return (
    <div className="home-stack">
      <section className="hero-card home-hero">
        <div className="landing-copy">
          <p className="eyebrow">CipherLab // Student Security Workspace</p>
          <h2>Learn cybersecurity by doing.</h2>
          <p className="hero-copy">
            Analyze. Investigate. Understand.
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
              <span className="stat-value">18</span>
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

        <div className="landing-panel hero-panel system-console">
          <div className="console-topline"><span>● SYSTEM STATUS</span><span className="console-online">ONLINE</span></div>
          <div className="console-status"><span className="status-dot"></span><strong>PROTECTED</strong></div>
          <div className="console-rule"></div>
          <p className="console-label">ANALYSIS ENGINE</p>
          <div className="console-checks">
            <span>✓ HASH ANALYSIS</span>
            <span>✓ PHISHING AI</span>
            <span>✓ STATIC REVIEW</span>
            <span>✓ GUIDED LABS</span>
          </div>
        </div>
      </section>

      <section className="lab-strip">
        <div className="lab-strip-heading">
          <p className="eyebrow">CipherLab analysis platform</p>
          <h2>Tools for every security checkpoint.</h2>
          <p>Built for students who want to understand the signal behind the result.</p>
        </div>
        <div className="lab-metrics">
          <div><span className="metric-number">18</span><span>available tools</span></div>
          <div><span className="metric-number">04</span><span>VAPT stages</span></div>
          <div><span className="metric-number">24</span><span>learning checkpoints</span></div>
        </div>
      </section>

      <section className="mission-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Core modules</p>
            <h2>Choose your next move.</h2>
          </div>
        </div>

        <div className="mission-grid">
          <article className="mission-card">
            <span className="mission-index">01</span>
            <h3>Domain Recon</h3>
            <p>DNS · TLS · Web details</p>
          </article>
          <article className="mission-card">
            <span className="mission-index">02</span>
            <h3>Email Signals</h3>
            <p>AI phishing detection</p>
          </article>
          <article className="mission-card">
            <span className="mission-index">03</span>
            <h3>File Integrity</h3>
            <p>Hashes · Passwords · Encoding</p>
          </article>
          <article className="mission-card">
            <span className="mission-index">04</span>
            <h3>Guided Labs</h3>
            <p>Output · Commands · Troubleshooting</p>
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
            <span className="feature-signal">● LIVE MODULE</span>
            <p className="tool-tag">MALWARE DEFENSE</p>
            <h3>Malware File Scanner</h3>
            <p>Local hash and risk review.</p>
            <Link className="hero-link" to="/tools/malware-scanner">Open Scanner</Link>
          </article>
          <article className="feature-card">
            <p className="tool-tag">VAPT</p>
            <h3>OWASP Top 10 mini-checker</h3>
            <p>Web risk checklist.</p>
            <Link className="hero-link" to="/tools/owasp-top10">Open Tool</Link>
          </article>
          <article className="feature-card">
            <p className="tool-tag">Guided Learning</p>
            <h3>Command Guide</h3>
            <p>One safe lab step at a time.</p>
            <Link className="hero-link" to="/tools/command-guide">Open Tool</Link>
          </article>
          <article className="feature-card">
            <p className="tool-tag">Recon</p>
            <h3>Network scanner concept</h3>
            <p>Safe recon concepts.</p>
            <Link className="hero-link" to="/tools/network-scanner">Open Tool</Link>
          </article>
        </div>
      </section>
    </div>
  );
}
