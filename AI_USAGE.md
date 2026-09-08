# AI Usage

This project was built with **Claude Code (Claude Sonnet 5)** as a pair-programming assistant. This note is a short, honest account of how — not a disclaimer.

## How it was used

- I directed the work task by task (scaffold → design system → API layer/query hooks → routing/guards → Docker/README → forgot/reset-password flow). The AI didn't decide scope; I did.
- Architecture and conventions were mine, encoded in `CLAUDE.md` (module layout, the services/queries/schemas split, the query-key strategy, the auth model). The AI followed and extended those conventions rather than inventing its own.
- Every diff was reviewed before I accepted it, and I redirected it when output didn't match intent — e.g. correcting the reset-password email's CTA to point at the change-password screen instead of login, requiring the temp-password email to be built for real email-client compatibility (table layout, inlined styles, MSO fallbacks) rather than a component copy-paste, and asking for comments to be stripped from `src/` once the code was settled.
- Any assumption the AI made about a contract the backend repo owns (e.g. the shape of `POST /auth/forgot-password`, which isn't specified anywhere) is called out explicitly in `README.md`'s "Assumed API contract" table, so it's flagged for me to confirm against the real backend rather than silently trusted.

## What I verified myself

- Typecheck, lint, and the full test suite after every change.
- New screens driven in a real browser (Playwright + screenshots) before being accepted as working, not just "tests pass."
- Read every file the AI touched; nothing was committed unread.

## What it wasn't used for

- No architectural decision, no commit, and no judgment call shipped without my review. Where the assignment was ambiguous, I was asked to choose rather than the AI guessing silently (e.g. whether to wire up the "Forgot your password?" link at all).
