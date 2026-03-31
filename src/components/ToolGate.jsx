import { Show, SignInButton } from "@clerk/react";

export function ToolGate({ authEnabled, children }) {
  if (!authEnabled) {
    return children;
  }

  return (
    <>
      <Show when="signed-in">{children}</Show>
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
      </Show>
    </>
  );
}
