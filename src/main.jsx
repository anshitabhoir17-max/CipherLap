import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const app = (
  <BrowserRouter>
    <App authEnabled={Boolean(clerkKey)} />
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {clerkKey ? (
      <ClerkProvider
        publishableKey={clerkKey}
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
      >
        {app}
      </ClerkProvider>
    ) : (
      app
    )}
  </React.StrictMode>,
);
