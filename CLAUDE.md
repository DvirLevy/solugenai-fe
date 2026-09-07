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

- `components/ui/` — shadcn/ui primitives (Button, Input, Label, Card, Checkbox, Alert), hand-written (not pulled via the shadcn CLI) to match `components.json`'s aliases and the token set above. `Button` carries two extra variants beyond shadcn defaults: `brand` (the gradient CTA) and `dark` (the navbar "Log out" button).
- `components/auth/` / `components/common/` — composed, reusable pieces built on `components/ui/`. Current inventory: `Logo`, `GradientBorder` (the 3px teal→mint frame — inner radius is `calc(var(--radius-shell) - 3px)` via inline style so it nests without corner gaps), `AuthCard` (`GradientBorder` + padding, used by every auth screen), `PageHeader`, `FormField` and `PasswordField` (forwardRef wrappers around `Input` that own the label/error/helper-text/aria wiring — pass RHF's `{...register(name)}` straight through), `LoadingButton` (disables + spinner when `isLoading`), `FormError` (renders `null` when there's no message), `AppNavbar` + `UserBadge` (dashboard header; `getInitials()` in `lib/utils.ts` derives avatar initials and returns `''` gracefully for a missing/single-word name). Pages assemble these; they must not duplicate markup/styling across Login/Register.
- `layouts/` — page shells (`AuthLayout`: centered column, `max-w-card`, mobile-first padding).
- `pages/` — route-level screens. **Pages compose only** — no `fetch`/`fetch`-adjacent calls or business logic here.
- `services/` — plain API functions (e.g. `auth.service.ts`: `login`, `register`, `logout`, `getCurrentUser`). Zero React/TanStack imports — pure `fetch` wrappers.
- `queries/` — TanStack Query hooks (e.g. `auth.queries.ts`: `useCurrentUser`, `useLogin`, `useRegister`, `useLogout`) that call into `services/`. This is the only place server state is allowed to live — no mirroring auth/user state into `useState`, Context, or another store.
- `schemas/` — Zod schemas + inferred types, shared by `pages/` (via `react-hook-form` + `@hookform/resolvers/zod`) and reused by `services/` request typing where relevant.
- `types/` — TypeScript contracts (`User`, `*Request`, `*Response`, `ApiError`).
- `routes/` — React Router setup, including route guards (`ProtectedRoute`, `GuestRoute`).
- `hooks/` — non-query React hooks.
- `lib/` — cross-cutting utilities (`cn()` in `utils.ts`; the API client fetch wrapper belongs here).

### Auth model (drives API-layer and query-hook design)

The backend issues a **JWT inside an HttpOnly cookie**. This repo must never attempt to read, store, or inspect that token — no `localStorage`/`sessionStorage`/React-state token handling. Every request to the backend must be made with `credentials: "include"` (`lib/api-client.ts` does this unconditionally — never call `fetch` directly elsewhere). Authentication state is derived purely by calling `GET /api/auth/me` through TanStack Query.

`VITE_API_URL` is the backend base URL and is **inlined at build time** by Vite — when containerizing, it must be passed as a Docker build arg, not a runtime env var.

#### API contract (`services/auth.service.ts`)

| Endpoint | Request body | Success |
|---|---|---|
| `POST /auth/register` | `RegisterRequest` (`fullName`, `email`, `password`) | `201` → `User` |
| `POST /auth/login` | `LoginRequest` (`email`, `password`, `rememberMe`) | `200` → `User`, sets the HttpOnly cookie |
| `POST /auth/logout` | — | `204` |
| `GET /auth/me` | — | `200` → `User`, or `401` when unauthenticated |

Error bodies are `ApiErrorBody` (`{ message, errors? }`, in `types/auth.ts`). `lib/api-client.ts` normalizes every failure — HTTP error status, unparsable body, or a thrown `fetch` (network down) — into a single `ApiError` class (`status`, user-safe `message`, optional `fieldErrors`). Rules baked into that normalization: a `>=500` status always becomes a generic "something went wrong" message (the real backend message is never shown to the user); a network failure gets `status: 0`; anything else keeps the backend's `message`/`errors` as-is. **Add new endpoints through this same `apiClient.get`/`apiClient.post` path** rather than calling `fetch` directly, so this normalization isn't bypassed.

#### Query-key and invalidation convention (`queries/auth.queries.ts`)

- `authKeys.currentUser` (`["auth", "currentUser"]`) is the single source of truth for "who is logged in." `useCurrentUser()` catches a `401` `ApiError` specifically and resolves to `null` — it never lets that 401 surface as `isError`. Any other status still throws.
- `useLogin` calls `queryClient.invalidateQueries({ queryKey: authKeys.currentUser })` on success rather than writing the response into the cache directly. **This only refetches if something has an active `useCurrentUser()` observer mounted** (e.g. `GuestRoute`/`ProtectedRoute` in `routes/`, added in Task 4) — that's intentional and mirrors how `GuestRoute` will reactively redirect once the query resolves, but it means a login mutation used somewhere with no `useCurrentUser()` mounted anywhere in the tree won't visibly update the cache until something observes it.
- `useLogout` calls `queryClient.setQueryData(authKeys.currentUser, null)` directly (no round trip) since the outcome is already certain.
- `useRegister` intentionally does **not** touch the `currentUser` cache — whether registration also authenticates the user is a backend decision this repo can't assume, so the calling page must check `useCurrentUser` (or its own response) to decide where to send the user next.

### Testing conventions

All tests live under `tests/`, mirroring `src/`'s structure (`tests/components/`, `tests/schemas/`, `tests/queries/`, `tests/pages/`, etc.) — **never co-locate a test next to the source file it covers.** This is enforced by `vitest.config`'s `test.include: ["tests/**/*.test.{ts,tsx}"]`.

- `tests/utils.tsx` exports `renderWithProviders`, which wraps a component in a fresh `QueryClient` (retries off) and `MemoryRouter`. Use it instead of RTL's bare `render` for anything touching routing or TanStack Query.
- `tests/mocks/{server,handlers}.ts` hold the MSW setup. `handlers.ts` defines the default "happy path + signed out" behavior for all four `/auth/*` endpoints (`GET /auth/me` defaults to `401`) and exports `mockUser`; a test needing a different response (error, authenticated `/me`, etc.) overrides it locally with `server.use(...)` rather than editing the shared defaults. MSW `onUnhandledRequest` is set to `"error"`, so every network call a test triggers needs a matching handler.
- The Vitest `test.env` block in `vite.config.ts` supplies `VITE_API_URL` for the test environment — do not add a `.env.test` or any other env file for this; env files are not to be added to this repo without explicit sign-off.
