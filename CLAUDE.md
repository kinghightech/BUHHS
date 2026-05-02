# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (http://localhost:5173)
npm run build     # Production build to dist/
npm run preview   # Serve the production build locally
```

No test runner or linter is configured.

## Environment

Requires a `.env` file with:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Vite only exposes env variables prefixed with `VITE_` to the browser bundle.

## Architecture

This is a vanilla JS SPA (no framework) bundled with Vite. There are three source files:

- **`supabase.js`** — Creates and exports a singleton Supabase client from env vars.
- **`main.js`** — All application logic: session check on load, login/signup form handlers, sign-out, and UI state transitions between the auth card and success screen.
- **`style.css`** — Glassmorphism design with CSS variables, animated background blobs, and responsive layout.

**`index.html`** contains both UI states (auth card + success screen) in markup; `main.js` toggles their visibility rather than rendering them dynamically.

**Auth flow:** Form submit → Supabase `signInWithPassword` / `signUp` → on success, hide auth card and show success screen. On page load, `supabase.auth.getSession()` determines which screen to render. Email confirmation is disabled on the Supabase project (sign-up immediately creates an active session).
