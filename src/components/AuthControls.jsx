import {
  ClerkFailed,
  ClerkLoaded,
  ClerkLoading,
  Show,
  SignInButton,
  UserButton,
} from "@clerk/react";

export function AuthControls({ authEnabled }) {
  if (!authEnabled) {
    return <span className="auth-pill">Clerk key missing</span>;
  }

  return (
    <div className="auth-cluster">
      <ClerkLoading>
        <span className="auth-pill subtle">Loading auth...</span>
      </ClerkLoading>
      <ClerkFailed>
        <span className="auth-pill error">Clerk config issue</span>
      </ClerkFailed>
      <ClerkLoaded>
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
      </ClerkLoaded>
    </div>
  );
}
