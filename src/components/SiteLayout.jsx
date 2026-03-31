import { Link, NavLink } from "react-router-dom";
import { AuthControls } from "./AuthControls";

export function SiteLayout({ authEnabled, children }) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="app-shell">
      <div className="background-grid" aria-hidden="true"></div>
      <div className="background-glow background-glow-left" aria-hidden="true"></div>
      <div className="background-glow background-glow-right" aria-hidden="true"></div>

      <header className="topbar">
        <Link className="brand-block" to="/">
          <img className="brand-logo" src="/logo.svg" alt="CipherLab logo" />
          <div>
            <p className="eyebrow">Cyber Security Toolkit</p>
            <h1>CipherLab</h1>
          </div>
        </Link>

        <nav className="topnav">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/tools">Tools</NavLink>
        </nav>

        <AuthControls authEnabled={authEnabled} />
      </header>

      <main className="page-shell">{children}</main>

      <footer className="site-footer">
        <div className="footer-top">
          <section className="footer-brand-column">
            <div className="footer-pill">CipherLab</div>

            <Link className="footer-brand-lockup" to="/">
              <img className="footer-logo" src="/logo.svg" alt="CipherLab logo" />
              <span>CipherLab</span>
            </Link>

            <p className="footer-description">
              CipherLab is your cyber security project space for checking suspicious
              content, exploring defensive tools, and presenting a cleaner student
              portfolio experience.
            </p>

            <div className="footer-mini-grid">
              <article className="footer-mini-card">
                <p className="footer-heading">Experience</p>
                <p>Open tools faster from one clean dashboard.</p>
              </article>

              <article className="footer-mini-card">
                <p className="footer-heading">Platforms</p>
                <p>React, Clerk, Node API, and secure tool routing.</p>
              </article>
            </div>
          </section>

          <section className="footer-links-column">
            <p className="footer-column-title">Company</p>
            <Link to="/">Home</Link>
            <Link to="/tools">Tools</Link>
            <Link to="/tools/phishing">Phishing Analyzer</Link>
            <Link to="/tools/ai-image">AI Image Detector</Link>
            <Link to="/tools/hidden-message">Hidden Message Decoder</Link>
          </section>

          <section className="footer-contact-column">
            <p className="footer-column-title">Get in touch</p>
            <a href="mailto:anshitabhoir17@gmail.com">anshitabhoir17@gmail.com</a>
            <a href="https://github.com/anshitabhoir17-max" target="_blank" rel="noreferrer">
              github.com/anshitabhoir17-max
            </a>
            <p>Cyber Security Student Project</p>
            <p>Privacy-first learning dashboard</p>
          </section>
        </div>

        <div className="footer-bottom">
          <p>Copyright {currentYear} CipherLab. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
