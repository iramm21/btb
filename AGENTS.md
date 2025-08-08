<!-- agents.md formatted on 2025-08-09 -->

# agents.md — AI Agent Plan for Building the MVP

## Purpose
Define autonomous agent roles, prompts, tools, guardrails, and deliverables to build and maintain the MVP described in the README.

---

## Roles & responsibilities
1. PM Agent — refine scope, maintain backlog, write acceptance criteria, break tasks into atomic PRs.
2. Backend Agent — Prisma schema, API routes, ingestion jobs, RLS policies.
3. Data Ingestion Agent — Sportradar and weather clients, retries, caches, odds CSV pipeline, ingest_runs logging.
4. Tip Engine Agent — rule-based scoring, risk strategies, validators, confidence scoring, tests.
5. Frontend Agent — Next.js pages, shadcn components, state management, “Copy Slip” UX.
6. QA Agent — unit, API, E2E tests; CI gates; accessibility checks.
7. DevOps Agent — envs, CI/CD, Vercel/Supabase config, cron, monitoring, backups.
8. Compliance Agent — RG copy, legal pages, ToS checks, data attribution.
9. Brand/UX Agent — design system, tokens, motion, content style.

Note: One agent may assume multiple roles if resources are limited. All agents produce PRs with tests and docs.

---

## Global guardrails
- Do not place bets or simulate financial transactions.
- Never expose secrets. Read from server env vars only. No client leakage.
- Comply with provider ToS. No unauthorized scraping.
- Always display responsible gambling messaging in bet contexts.
- Idempotent ingestion with backoff for 429/5xx; log ingest_runs.
- PII minimization; respect user deletion/export requests.

---

## Repo and structure (monorepo)
apps/
  web/                # Next.js app (frontend + API routes)
    app/(publicRoutes)
    app/(authRoutes)
    app/(adminRoutes)
    features/
      tips/
      nrl/
      odds/
      weather/
      users/
    components/
    lib/
    providers/
    styles/
    tests/
packages/
  ui/                 # design system wrappers (optional)
  config/             # eslint, tsconfig shared
  clients/            # api clients (sportradar, weather)

---

## Coding standards
- TypeScript strict mode; ESLint, Prettier, Conventional Commits.
- Pure functions tested with unit tests; API routes covered by API tests; flows covered by Playwright.
- Functions ≤200 lines; exported functions documented with docstrings.
- Zod for input validation at API boundaries.
- RLS-safe queries and access patterns.

---

## Tooling
- Node 20+, pnpm.
- Prisma + Supabase (Postgres + Auth).
- Vitest, Supertest, Playwright.
- Vercel for hosting; Supabase for DB.
- Sentry/Logflare for logging/monitoring.

---

## High-level task graph (MVP)
1. Bootstrap: repo, linting, CI, env scaffolding.
2. DB: initial Prisma schema, migrations, RLS policies.
3. Auth: Supabase auth flow, profile setup.
4. Ingestion: fixtures/teams/players → lineups → weather; odds CSV pipeline.
5. APIs: fixtures, lineups, weather, tips, odds upload.
6. Tip Engine: scoring, strategies, validators; confidence and rationales.
7. Frontend: Home, Match Hub, Bet Builder, My Bets, Admin.
8. Testing: unit, API, E2E + accessibility checks.
9. Ops: deploy, cron, monitoring, backups.
10. Compliance: legal pages, RG banners, provider attribution.

---

## Agent prompts (starting points)

PM Agent — Backlog refine prompt:
Read README.md. Create a prioritized backlog of issues for MVP. For each issue include: title, rationale, acceptance criteria, estimate, dependencies.

Backend Agent — Prisma/API prompt:
Implement Prisma schema per README. Generate migrations. Create /api/fixtures, /api/lineups, /api/tips, /api/odds/upload, /api/weather with zod validation and RLS-safe queries. Include unit/API tests.

Data Ingestion Agent — Provider prompt:
Build Sportradar client with retry/backoff and typed DTOs. Implement ingestion jobs and ingest_runs logging. Add admin odds CSV parser (zod) and upsert into odds_snapshots.

Tip Engine Agent — Strategy prompt:
Implement player form, matchup scoring, weather adjustments, and risk-band composition. Return legs with confidence and rationale. Provide deterministic seeds for tests.

Frontend Agent — UI prompt:
Build pages per IA with shadcn/ui. Add risk slider, rationale chips, exclusions, and Copy Slip UX. Respect RG banners. Implement My Bets with ROI summary.

QA Agent — Testing prompt:
Create Vitest unit tests for scoring utilities, Supertest for API routes, and Playwright for Login → Select Fixture → Build → Copy flow. Add a11y checks (axe).

DevOps Agent — Deploy prompt:
Configure Vercel env vars, Supabase policies, cron ingest endpoint with HMAC secret, Sentry logging, daily DB backups, and restore runbook.

Compliance Agent — Legal prompt:
Generate concise T&Cs, Privacy Policy (AU-centric), RG messaging and helplines. Ensure provider attribution and no guarantee language.

Brand/UX Agent — Design prompt:
Define tokens (colors, spacing, radius), typography, and motion guidelines. Deliver component examples for cards, lists, sliders, and banners (RG).

---

## API contracts (reference)

GET /api/fixtures?round=23
→ { fixtures: Array<{ id, kickoff_utc, home_team, away_team, venue, status }> }

GET /api/lineups?fixture_id=...
→ { confirmed: boolean, home: { starters, bench, outs }, away: { starters, bench, outs } }

GET /api/tips?fixture_id=...&risk=balanced&exclude=first_tryscorer
→ { legs: Array<{ market: string, selection: string, price?: number, confidence: number, rationale: string }> }

POST /api/odds/upload  (admin; multipart CSV)
→ { inserted: number }

---

## Odds CSV (admin) — minimal schema
fixture_id, captured_at, home_win, away_win, line, total, anytime_tryscorer_json
sr:match:1234,2025-08-08T09:00:00Z,1.55,2.45,-6.5,41.5,"[{\"player_id\":\"sr:player:1\",\"price\":2.2}]"

---

## CI/CD standards
- PRs must pass lint, typecheck, unit and API tests, and run Playwright smoke flow.
- Minimum review: 1 approval (PM or Tech Lead).
- Preview deployments on Vercel; feature flags off by default.
- Migrations are backward-compatible; include rollback notes.

---

## Done = Shipped checklist (per PR)
- Tests passing (unit/API/E2E).
- Playwright flow updated if UI changed.
- Types and zod validations present at API boundaries.
- RG messaging present where applicable.
- No secrets in client; env keys confined to server.
- Docs updated (README/CHANGELOG).
- Telemetry added if new critical path.

---

## Handover deliverables
- Deployed URLs (Vercel app, Supabase project).
- Env var manifest and rotation procedure.
- Admin credentials handover (out-of-band).
- Runbooks: ingestion, odds upload, feature flags, backup/restore.
- Incident response guide: on-call, dashboards, alert thresholds.

---
