import { Show, SignInButton } from "@clerk/react";
import { Link, useLocation } from "react-router-dom";
import { getSuggestedTools, getToolByPath } from "../data/tools";

export function ToolGate({ authEnabled, children }) {
  const location = useLocation();
  const currentTool = getToolByPath(location.pathname);
  const suggestedTools = currentTool ? getSuggestedTools(location.pathname, 3) : [];
  const relatedToolsSection =
    currentTool && suggestedTools.length ? (
      <section className="tool-result related-tools">
        <div className="related-tools-head">
          <div>
            <p className="eyebrow">Next Tools</p>
            <h3>Try another tool without going back</h3>
          </div>
          <Link className="hero-link ghost" to="/tools">
            View All Tools
          </Link>
        </div>

        <div className="related-tools-grid">
          {suggestedTools.map((tool) => (
            <Link className="related-tool-card" key={tool.path} to={tool.path}>
              <span className="tool-symbol small" aria-hidden="true">
                {tool.symbol}
              </span>
              <div>
                <p className="tool-tag">{tool.tag}</p>
                <h4>{tool.title}</h4>
                <p>{tool.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    ) : null;

  if (!authEnabled) {
    return (
      <>
        {children}
        {relatedToolsSection}
      </>
    );
  }

  return (
    <>
      <Show when="signed-in">
        {children}
        {relatedToolsSection}
      </Show>
      <Show when="signed-out">
        <section className="locked-card">
          <p className="eyebrow">Authentication</p>
          <h2>Sign in to use this tool</h2>
          <p>
            Clerk is enabled for this app, so tool pages are protected until the user
            logs in.
          </p>
          <SignInButton mode="modal">
            <button className="nav-button">Open Login</button>
          </SignInButton>
        </section>
        {relatedToolsSection}
      </Show>
    </>
  );
}
