# BUILD_NOTES.md

## Phase 0 notes
- Established MVP backlog and acceptance criteria to guide upcoming implementation work.
- Added baseline CI scripts, TypeScript and ESLint configs, Vitest setup, and a smoke test.

## Phase 1 notes
- Added initial Prisma schema using SQLite for development.
- Defined models for users, profiles, teams, players, fixtures, lineups, injuries, odds snapshots, tips, bet slips, bet outcomes, ingest runs, feature flags, and audit logs.
- Included JSON columns and basic indexes to support early queries.

## Phase 2 notes
- Added tiny seed scripts for NRL teams and fixtures with idempotent upserts.
- Introduced a Prisma client singleton and repository helpers for fixtures, lineups, odds, and ingest runs.
- Created a basic repository test seeding an in-memory SQLite db.

## Phase 3 notes
- Implemented fixtures, lineups, and weather API routes with Zod validation and mocked weather data.
- Added shared API schemas and Supertest-based API tests covering success and validation errors.

## Phase 4 notes
- Added admin odds CSV upload endpoint with header auth, CSV parsing, zod validation, and upsert logic.
- Covered upload behavior with Supertest-based API tests for auth, validation errors, and idempotent re-uploads.

## Phase 5 notes
- Implemented deterministic rule-based tip engine with seeded RNG, risk bands, and weather adjustments.
- Exposed `/api/tips` with zod query validation returning composed legs and confidence scores.
- Added unit and API tests for tip engine determinism, weather effects, exclusions, and confidence bounds.

## Phase 6 notes
- Added Next.js App Router layout with header, footer, and light/dark theme toggle.
- Defined CSS design tokens using OKLCH variables for light and dark themes.
- Introduced reusable Responsible Gambling banner that shows on bet-building routes.

## Phase 7 notes
- Added Match Hub with /dashboard round selector and fixture grid.
- Introduced match detail pages showing odds, lineups, weather, quick insights, and Build My Bet CTA.
- Odds snapshots sourced from local DB via latest snapshot helper; may be empty until CSV upload.
- Weather is mocked via internal API; insights derived from weather and odds.
- TODO: visualise odds movement and add richer insights.
## Phase 8 notes
- Wired Supabase Auth with a mock mode for tests and CI. When `NODE_ENV=test` or `AUTH_MODE=mock`, the session helper returns a fixed test user and middleware injects it without network calls.
- Login and logout routes use Supabase in real envs and are bypassed in mock mode. Protected routes now include `/dashboard`, `/match/:id`, `/builder/:id`, `/my-bets`, and `/admin`.
- Added a Settings page letting users set an optional nickname, favourite team, and risk profile.
- Real auth requires `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `AUTH_MODE` env vars.
## Phase 9 notes
- Introduced Bet Builder page with risk slider, market exclusions, and suggestion list backed by `/api/tips`.
- Users can copy a bookie-style slip using a new formatter utility.
- Bet slips can now be saved and reviewed under My Bets.

## Phase 10 notes
- Added My Bets page with ROI summary and inline outcome editing.
- Slips are saved via a server action from the Builder, stored against the signed-in user.
- ROI formula: `(returnSum - stakeSum) / stakeSum` (pending slips ignored).
- In CI, `getSession()` returns a mock user ensuring auth-dependent tests run offline.

## Admin Console
- Admin rights are checked via `assertAdmin()`. In tests or when `ADMIN_MODE=mock`, the `test-user` is treated as admin; otherwise a simple `ADMIN_USER_IDS` allowlist is used.
- Odds CSVs are uploaded through a server action that validates a small file and parses rows with zod before upserting into `odds_snapshots`.
- Feature flags live in the `FeatureFlag` table and can be toggled or given JSON payloads from the admin console.
