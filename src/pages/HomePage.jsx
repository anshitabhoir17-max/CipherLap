import { Link } from "react-router-dom";

export function HomePage({ authEnabled }) {
  return (
    <div className="home-stack">
      <section className="hero-card home-hero">
        <div className="landing-copy">
          <p className="eyebrow">Student VAPT Lab</p>
          <h2>CipherLab VAPT lab for security practice.</h2>
          <p className="hero-copy">
            Explore the lab purpose, open the tool workspace, and reach key cybersecurity resources quickly.
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
              <span className="stat-value">14</span>
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
            <article className="stat-card">
              <span className="stat-value">1</span>
              <p className="stat-label">Hands-on lab</p>
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
            <p className="eyebrow">What you can do here</p>
            <h2>Inspect, analyze, verify, and decode security content.</h2>
          </div>
        </div>

        <div className="mission-grid">
          <article className="mission-card">
            <h3>Inspect suspicious domains</h3>
            <p>Probe DNS, TLS, and registrar details to evaluate unknown websites.</p>
          </article>
          <article className="mission-card">
            <h3>Analyze email headers</h3>
            <p>Review SPF, DKIM, DMARC, and phishing signals in message metadata.</p>
          </article>
          <article className="mission-card">
            <h3>Verify hashes and integrity</h3>
            <p>Use hashing and file verification tools to validate downloads and assets.</p>
          </article>
          <article className="mission-card">
            <h3>Decode tokens and hidden data</h3>
            <p>Inspect JWTs, QR payloads, and steganography-friendly images.</p>
          </article>
        </div>
      </section>

      <section className="featured-tools">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Most used tools</p>
            <h2>Jump directly into the CipherLab workflow.</h2>
          </div>
          <p className="section-copy">These tools are ready to use now. Click any card to open it instantly.</p>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <p className="tool-tag">VAPT</p>
            <h3>OWASP Top 10 mini-checker</h3>
            <p>Review the top web security risks with examples and remediation guidance.</p>
            <Link className="hero-link" to="/tools/owasp-top10">Open Tool</Link>
          </article>
          <article className="feature-card">
            <p className="tool-tag">Exploitation</p>
            <h3>XSS / SQLi payload tester</h3>
            <p>Encode, decode, and transform payloads locally to learn exploitation techniques.</p>
            <Link className="hero-link" to="/tools/payload-tester">Open Tool</Link>
          </article>
          <article className="feature-card">
            <p className="tool-tag">Recon</p>
            <h3>Network scanner concept</h3>
            <p>Run safe browser probes and simulated scans for lab-based network reconnaissance.</p>
            <Link className="hero-link" to="/tools/network-scanner">Open Tool</Link>
          </article>
        </div>
      </section>
    </div>
  );
}
