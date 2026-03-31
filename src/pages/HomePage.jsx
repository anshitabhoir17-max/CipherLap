import { Link } from "react-router-dom";

export function HomePage({ authEnabled }) {
  return (
    <div className="home-stack">
      <section className="hero-card landing-hero">
        <div className="landing-copy">
          <p className="eyebrow">Cyber Security Toolkit</p>
          <h2>One clean front page. Separate pages for every tool.</h2>
          <p className="hero-copy">
            CipherLab is now structured as a clean student project website with a proper
            home page, dedicated tool pages, Clerk login, and a sharper dashboard feel.
          </p>
          <div className="hero-links">
            <Link className="hero-link" to="/tools">
              Explore Tools
            </Link>
            {!authEnabled ? <span className="hero-note">Clerk login is now configured in local env.</span> : null}
          </div>
        </div>

        <div className="landing-panel">
          <p className="landing-panel-tag">Current Modules</p>
          <div className="landing-list">
            <span>Phishing Mail Analyzer</span>
            <span>Pwned Email Prep</span>
            <span>URL Risk Scanner</span>
            <span>AI Image Detector</span>
            <span>Hidden Message Decoder</span>
            <span>Morse Code Lab</span>
          </div>
        </div>
      </section>
    </div>
  );
}
