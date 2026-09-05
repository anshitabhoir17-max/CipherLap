import { Link, NavLink } from "react-router-dom";
import { AuthControls } from "./AuthControls";

export function SiteLayout({ authEnabled, children }) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="app-shell">
      <div className="background-grid" aria-hidden="true"></div>
      <div className="background-glow background-glow-left" aria-hidden="true"></div>
      <div className="background-glow background-glow-right" aria-hidden="true"></div>
      <div className="cyber-scene" aria-hidden="true">
        <div className="cyber-scanline"></div>
        <div className="cyber-orb"><span></span><span></span><span></span><b>THREAT<br />MONITOR</b></div>
        <div className="cyber-node node-one"></div>
        <div className="cyber-node node-two"></div>
        <div className="cyber-node node-three"></div>
        <div className="cyber-beam beam-one"></div>
        <div className="cyber-beam beam-two"></div>
        <div className="cyber-circuit circuit-one"></div>
        <div className="cyber-circuit circuit-two"></div>
        <div className="cyber-circuit circuit-three"></div>
        <div className="cyber-floor"></div>
      </div>

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
          <NavLink to="/career">Careers</NavLink>
        </nav>

        <AuthControls authEnabled={authEnabled} />
      </header>

      <main className="page-shell">{children}</main>

      <footer className="site-footer">
        <div className="footer-top">
          <section className="footer-brand-column">
            <Link className="footer-brand-lockup" to="/">
              <img className="footer-logo" src="/logo.svg" alt="CipherLab logo" />
              <span>CipherLab</span>
            </Link>
            <p className="footer-description">Student-built cybersecurity workspace.</p>
          </section>

          <section className="footer-links-column">
            <p className="footer-column-title">Navigate</p>
            <Link to="/">Home</Link>
            <Link to="/tools">Tools</Link>
            <Link to="/career">Careers</Link>
          </section>

          <section className="footer-contact-column">
            <p className="footer-column-title">Connect</p>
            <a href="mailto:anshitabhoir17@gmail.com">Email</a>
            <a href="https://github.com/anshitabhoir17-max" target="_blank" rel="noreferrer">GitHub</a>
          </section>
        </div>

        <div className="footer-bottom">
          <p><span className="footer-live-dot"></span> CIPHERLAB SYSTEM ONLINE</p>
          <p>© {currentYear} CipherLab</p>
        </div>
      </footer>
    </div>
  );
}
