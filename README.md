# CipherLab

CipherLab is a React-based cyber security student project with a dashboard home page, separate routes for each tool, optional Clerk authentication, and a backend-ready AI image detection flow.

## Included pages

- Home dashboard
- Phishing Mail Analyzer
- Pwned Email Prep
- URL Risk Scanner
- AI Image Detector
- Hidden Message Decoder
- Morse Code Lab

## Stack

- React + Vite frontend
- React Router for separate tool pages
- Clerk for login and logout
- Node API server for the image detection proxy

## Local setup

1. Install dependencies.

```powershell
npm install
```

2. Add your environment variables.

```powershell
Copy-Item .env.example .env
```

3. Start the backend API server.

```powershell
npm run api
```

4. In a second terminal, start the React frontend.

```powershell
npm run dev
```

5. Open the Vite URL shown in the terminal. By default this is `http://localhost:5173`.

## Environment variables

```powershell
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
SIGHTENGINE_API_USER=your_sightengine_api_user
SIGHTENGINE_API_SECRET=your_sightengine_api_secret
PORT=3000
```

## Clerk auth

- If `VITE_CLERK_PUBLISHABLE_KEY` is present, the app shows Clerk login and logout controls.
- Tool pages are gated behind sign-in when Clerk is enabled.
- If the key is missing, the app stays usable in local no-auth mode.

## AI image detection

- The frontend tries the backend API route first.
- If the Sightengine keys are missing or the API is unavailable, the detector falls back to the browser-side heuristic.
- For production, run `npm run build`. The Node server will serve `dist/` automatically.
- If port `3000` is already in use on your machine, set `PORT` to another value before running `npm run api`.

## Notes

- The pwned email page is still an offline readiness checker. A real breach lookup should be done through a secure backend integration.
- The hidden-message tool is a basic browser-side LSB decoder intended for learning, demos, and CTF-style exploration.
