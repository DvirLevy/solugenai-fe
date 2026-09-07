# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev             # Vite dev server
npm run build           # tsc -b && vite build (typecheck is part of the build)
npm run typecheck       # tsc -b --noEmit only
npm run lint            # oxlint
npm test                # vitest run (single pass, CI mode)
npm run test:watch      # vitest (watch mode)
npm run test:coverage   # vitest run --coverage
npx vitest run tests/path/to/file.test.tsx   # single test file
npx vitest run -t "test name substring"      # single test by name
```

There is no `tailwind.config.js` — Tailwind v4 is configured CSS-first via `@theme` in `src/styles/theme.css`, loaded through `@tailwindcss/vite`.

## Architecture

This is the **frontend-only** repo for a full-stack authentication system (React + Vite + TypeScript + Tailwind + shadcn/ui + TanStack Query + React Hook Form + Zod). The backend and database live in a **separate repository** — do not add backend/db code, a root-level `docker-compose.yml` covering more than the frontend service, or assume a monorepo layout above this directory.

### Design tokens are the only source of visual truth

Every color, radius, shadow, and control size is a CSS variable defined once in `src/styles/theme.css` (Tailwind v4 `@theme` block) and consumed via generated utility classes (`bg-background`, `text-muted-foreground`, `rounded-control`, etc.) or the two hand-written gradient utilities (`bg-brand-gradient`, `bg-brand-border-gradient`). **Never hardcode a hex value or shadow in a component** — add a token to `theme.css` instead. The visual language (gradient-bordered white cards, teal→mint brand gradient, dark-navy ink) comes from supplied mockups; when a value isn't derivable from them, prefer consistency with existing tokens over inventing a new one.

### Module layout and intended responsibilities

`src/` is organized by architectural role, not by feature:

- `components/ui/` — shadcn/ui primitives (Button, Input, Label, Card, Checkbox, Alert), customized to the token set above.
- `components/auth/` / `components/common/` — composed, reusable pieces (e.g. `AuthCard`, `FormField`, `PasswordField`, `LoadingButton`). Pages assemble these; they must not duplicate markup/styling across Login/Register.
- `layouts/` — page shells (e.g. `AuthLayout`).
- `pages/` — route-level screens. **Pages compose only** — no `fetch`/`fetch`-adjacent calls or business logic here.
- `services/` — plain API functions (e.g. `auth.service.ts`: `login`, `register`, `logout`, `getCurrentUser`). Zero React/TanStack imports — pure `fetch` wrappers.
- `queries/` — TanStack Query hooks (e.g. `auth.queries.ts`: `useCurrentUser`, `useLogin`, `useRegister`, `useLogout`) that call into `services/`. This is the only place server state is allowed to live — no mirroring auth/user state into `useState`, Context, or another store.
- `schemas/` — Zod schemas + inferred types, shared by `pages/` (via `react-hook-form` + `@hookform/resolvers/zod`) and reused by `services/` request typing where relevant.
- `types/` — TypeScript contracts (`User`, `*Request`, `*Response`, `ApiError`).
- `routes/` — React Router setup, including route guards (`ProtectedRoute`, `GuestRoute`).
- `hooks/` — non-query React hooks.
- `lib/` — cross-cutting utilities (`cn()` in `utils.ts`; the API client fetch wrapper belongs here).

### Auth model (drives API-layer and query-hook design)

The backend issues a **JWT inside an HttpOnly cookie**. This repo must never attempt to read, store, or inspect that token — no `localStorage`/`sessionStorage`/React-state token handling. Every request to the backend must be made with `credentials: "include"`. Authentication state is derived purely by calling `GET /api/auth/me` through TanStack Query (`queryKey: ["auth", "currentUser"]`); a `401` from that endpoint is a normal "unauthenticated" result, not an error to throw/log. Login/register/logout mutations invalidate or set that query key rather than tracking auth in any parallel state.

`VITE_API_URL` is the backend base URL and is **inlined at build time** by Vite — when containerizing, it must be passed as a Docker build arg, not a runtime env var.

### Testing conventions

All tests live under `tests/`, mirroring `src/`'s structure (`tests/components/`, `tests/schemas/`, `tests/queries/`, `tests/pages/`, etc.) — **never co-locate a test next to the source file it covers.** This is enforced by `vitest.config`'s `test.include: ["tests/**/*.test.{ts,tsx}"]`.

- `tests/utils.tsx` exports `renderWithProviders`, which wraps a component in a fresh `QueryClient` (retries off) and `MemoryRouter`. Use it instead of RTL's bare `render` for anything touching routing or TanStack Query.
- `tests/mocks/{server,handlers}.ts` hold the MSW setup; add new endpoint handlers there rather than mocking `fetch` per-test. MSW `onUnhandledRequest` is set to `"error"`, so every network call a test triggers needs a matching handler.
- The Vitest `test.env` block in `vite.config.ts` supplies `VITE_API_URL` for the test environment — do not add a `.env.test` or any other env file for this; env files are not to be added to this repo without explicit sign-off.
