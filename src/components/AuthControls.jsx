import { Show, SignInButton, UserButton } from "@clerk/react";

export function AuthControls({ authEnabled }) {
  if (!authEnabled) {
    return <span className="auth-pill">Clerk key missing</span>;
  }

  return (
    <div className="auth-cluster">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="nav-button">Login</button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <div className="user-button-shell">
          <UserButton afterSignOutUrl="/" />
        </div>
      </Show>
    </div>
  );
}
