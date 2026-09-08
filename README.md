# SoluGenAI — Authentication Frontend

A React + TypeScript frontend for a full-stack authentication system, built to a supplied set of mockups (Login, Registration, and a protected Dashboard). This is the **frontend-only** half of the assignment — the backend and PostgreSQL live in a separate repository. This repo assumes a backend exists somewhere and talks to it over a documented REST contract (see below); it does not run or orchestrate it.

## Tech stack

- **React 19** + **Vite 8** + **TypeScript** (`strict`)
- **Tailwind CSS v4** — CSS-first configuration (no `tailwind.config.js`), design tokens as CSS variables
- **shadcn/ui** — primitives hand-written to match the token set (not pulled via the shadcn CLI)
- **React Router v7**
- **TanStack Query v5** — all server state (current user, login/register/logout)
- **React Hook Form** + **Zod** — form state and validation
- **Vitest** + **React Testing Library** + **MSW** — testing
- **Docker** — containerized via `vite preview` (no extra web server to install)

## Repository structure

```
src/
  components/
    ui/        shadcn primitives (Button, Input, Label, Card, Checkbox, Alert)
    auth/      auth-specific composition (AuthCard)
    common/    shared composed pieces (FormField, PasswordField, LoadingButton, AppNavbar, ...)
  layouts/     page shells (AuthLayout)
  pages/       route-level screens (LoginPage, RegisterPage, DashboardPage) — compose only
  routes/      React Router setup + guards (ProtectedRoute, GuestRoute)
  services/    plain fetch-based API functions, zero React
  queries/     TanStack Query hooks built on services/
  schemas/     Zod schemas + inferred types
  types/       TypeScript contracts (User, requests, ApiError)
  lib/         cross-cutting utilities (cn, api-client, get-error-message)
  styles/      theme.css — every design token
tests/         mirrors src/ — see "Testing" below
```

See [`CLAUDE.md`](./CLAUDE.md) for a more detailed architectural walkthrough aimed at future contributors/AI coding agents.

## Installation

```bash
npm install
```

## Environment variables

`.env` is committed with a working default and holds no secrets — edit it directly if your backend runs somewhere other than `http://localhost:4000/api`.

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the backend REST API, e.g. `http://localhost:4000/api`. **Inlined at build time by Vite** — for a Docker image this must be passed as a build arg, not a runtime env var. |

No other environment-specific values are hardcoded anywhere in the application code.

## Running the frontend

In every mode below, `VITE_API_URL` must point at a backend that's already running (a separate repo — this one doesn't start or orchestrate it). If nothing's listening there yet, the app still loads and the UI itself (routing, validation, guard redirects) works; only the actual login/register/dashboard requests will fail.

### Without Docker

```bash
npm install
npm run dev
```

Runs the Vite dev server at `http://localhost:5173`, reading `VITE_API_URL` from `.env`.

### With Docker

Two ways to build and run the image — pick one:

**`docker build` / `docker run`**

```bash
docker build -t solugen-frontend --build-arg VITE_API_URL=http://localhost:4000/api .
docker run -p 8080:4173 solugen-frontend
```

**`docker compose`** (this repo's `docker-compose.yml` defines only the `frontend` service — no `db`/`backend`, since those live in the separate backend repo)

```bash
VITE_API_URL=http://localhost:4000/api docker compose up --build
```

Both serve the production build via Vite's own preview server at `http://localhost:8080`, with an SPA fallback so a direct link or refresh on `/dashboard` still resolves. `VITE_API_URL` is a **build arg** either way (Vite inlines it at build time), not a runtime variable — pass it to whichever command does the building.

## Auth flow

The backend issues a **JWT inside an HttpOnly cookie**. This frontend never reads, stores, or inspects that token — no `localStorage`, `sessionStorage`, or React state token handling of any kind. Every request goes out with `credentials: "include"` (enforced centrally in `lib/api-client.ts`), and authentication state is derived purely by asking the backend: `GET /auth/me`. A `401` from that endpoint means "not signed in" — it's treated as a normal result, not a thrown error.

### Assumed API contract

| Endpoint | Request body | Success | Notes |
|---|---|---|---|
| `POST /auth/register` | `{ fullName, email, password }` | `201` → user object | Whether this also authenticates (sets the cookie) is a backend decision — the Register page re-checks `/auth/me` afterward rather than assuming either way. |
| `POST /auth/login` | `{ email, password, rememberMe }` | `200` → user object, sets the HttpOnly cookie | |
| `POST /auth/logout` | — | `204` | |
| `GET /auth/me` | — | `200` → user object, or `401` if unauthenticated | |
| `POST /auth/forgot-password` | `{ email }` | `204` | Triggers the backend (e.g. a Lambda) to generate a temp password and email it, using `email-templates/temp-password.html`. Assumed to respond identically whether or not the email is registered, so the frontend can show one generic confirmation without leaking which emails have accounts. |
| `POST /auth/reset-password` | `{ email, tempPassword, newPassword }` | `204` | Reached via the emailed link, not a form field for `email` — it comes off the link's query string (`?email=`). Does not authenticate the user; the Reset Password page sends them to `/login` to sign in with the new password. |

Error responses are assumed to be `{ message: string, errors?: Record<string, string> }`. `lib/api-client.ts` normalizes every failure mode — HTTP error, unparsable body, or the network being down entirely — into one `ApiError` (`status`, a user-safe `message`, optional `fieldErrors`). A `5xx` is always shown as a generic "something went wrong" message; the real backend error text is never surfaced to the user.

## TanStack Query usage

All server state lives in TanStack Query under a single query key, `["auth", "currentUser"]` (`queries/auth.queries.ts`):

- `useCurrentUser()` — the source of truth for "who is logged in." A `401` resolves to `null` rather than an error state.
- `useLogin()` — on success, invalidates `currentUser`, causing any mounted `useCurrentUser()` observer (i.e. the route guards) to refetch and reactively redirect.
- `useLogout()` — on success, writes `null` into the cache directly (no round trip needed).
- `useRegister()` — deliberately does **not** touch the cache; see the API contract note above.
- `useResetPassword()` — same reasoning as `useRegister()`: does not touch the cache. The page navigates to `/login` on success rather than assuming the reset also signs the user in.
- `useForgotPassword()` — same reasoning again: does not touch the cache. The page swaps to a confirmation panel on success rather than navigating away.

## Protected route behavior

`routes/AppRoutes.tsx` wires up `/login`, `/register`, `/forgot-password`, `/reset-password` (all behind `GuestRoute`) and `/dashboard` (behind `ProtectedRoute`), with a catch-all redirecting to `/dashboard`. Both guards call `useCurrentUser()` and render a full-page loader while it's pending — the guarded page is **never** rendered before the auth check resolves, so protected content can't flash for an unauthenticated visitor, and an already-authenticated visitor never sees the login/register/forgot-password/reset-password form.

## Design system

Every color, radius, shadow, and control size is a CSS variable defined once in `src/styles/theme.css` (Tailwind v4's `@theme` block) and consumed via generated utilities — no component hardcodes a hex value. The visual language (a white card framed by a 3px teal→mint gradient border, a matching gradient primary button, dark-navy text, a dark "Log out" button) is read directly off the supplied mockups.

Two assumptions worth flagging:
- The SoluGenAI wordmark is recreated as a small typographic component (`components/common/logo.tsx`) since no logo asset was supplied — trivially swappable for a real SVG.
- "Forgot your password?" on the login form links to `/forgot-password` (`pages/ForgotPasswordPage.tsx`): the user enters their email, the backend (e.g. a Lambda) generates and emails a temp password using `email-templates/temp-password.html`, and that email's link lands on `/reset-password` (`pages/ResetPasswordPage.tsx`) with `?email=` already in the URL so the account is identified without asking again.

## Responsive design

Built mobile-first and checked at 375px, 768px, and 1440px: no horizontal scroll, no overflow, ≥44px touch targets on inputs/buttons, and the dashboard navbar collapses the email text on narrow screens (the avatar-initials badge stays visible).

## Testing

```bash
npm test              # single run
npm run test:watch    # watch mode
npm run test:coverage # with coverage
```

All tests live under `tests/`, mirroring `src/`'s structure (`tests/components/`, `tests/schemas/`, `tests/queries/`, `tests/pages/`, `tests/routes/`) — never co-located next to the source file they cover, enforced by Vitest's `test.include`. MSW (`tests/mocks/`) mocks the backend so the full stack — schemas, the API client's error normalization, the query hooks, the route guards, and the pages — is tested without a live server. `tests/utils.tsx` provides `renderWithProviders`, wrapping a component in a fresh `QueryClient` and a `MemoryRouter`.

## Key architectural decisions

- **Separate repos, not a monorepo.** This repo owns only the frontend; there's no root-level `docker-compose.yml` orchestrating a backend/db that don't live here.
- **Strict separation of API calls from React.** `services/` are plain `fetch` wrappers with no React/TanStack imports; `queries/` is the only place that turns them into hooks; `pages/` only compose — no direct `fetch` calls or business logic in a page component.
- **Server state lives only in TanStack Query.** No `useState`/Context/Redux mirroring of `currentUser` or auth status anywhere.
- **One query observer per page for a given key.** Mounting a second `useCurrentUser()` observer inside a page that's already behind `GuestRoute`/`ProtectedRoute` caused a genuine infinite-refetch bug during development (two observers of an erroring, non-401, `retry: false` query that never navigates away). `RegisterPage` reads the guard's already-mounted query via `queryClient.refetchQueries` + `getQueryData` instead of calling the hook a second time — see the note in `CLAUDE.md` for the full story.
