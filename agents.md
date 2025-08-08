agents.md — AI Agent Plan for Building the MVP

Purpose

Define autonomous agent roles, prompts, tools, and guardrails to build and maintain the MVP described in the README.

Roles & responsibilities

PM Agent — refine scope, maintain backlog, write acceptance criteria, break tasks into atomic PRs.

Backend Agent — Prisma schema, API routes, ingestion jobs, RLS policies.

Data Ingestion Agent — Sportradar & weather clients, retries, caches, odds CSV pipeline, ingest_runs.

Tip Engine Agent — implement rule‑based scoring, risk strategies, validators, tests.

Frontend Agent — Next.js pages, shadcn components, state management, export slip UX.

QA Agent — unit/API/E2E tests; CI gates; accessibility checks.

DevOps Agent — envs, CI/CD, Vercel/Supabase config, cron, monitoring, backups.

Compliance Agent — RG copy, legal pages, ToS checks, data attribution.

Brand/UX Agent — design system, tokens, motion, content style.

One agent may assume multiple roles if resources are limited. All agents produce PRs with tests and docs.

Global guardrails

Do not place bets or simulate financial transactions.

Never expose secrets. Only read from server env vars. No client leakage.

Comply with provider ToS. No unauthorized scraping.

Always display RG messaging in bet contexts.

Write idempotent ingestion code with backoff for 429/5xx.

Repositories & structure

Monorepo (apps/web, packages/

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

Coding standards

TypeScript strict mode. ESLint + Prettier. Conventional Commits.

Unit tests for pure logic; API tests for routes; Playwright for flows.

Keep functions ≤200 lines; add docstrings for exported funcs.

Tooling

Node 20+, pnpm.

Prisma + Supabase.

Vitest, Supertest, Playwright.

Vercel + Supabase CLI; Sentry/Logflare for logging.

High‑level task graph (MVP)

Bootstrap: repo, linting, CI, env scaffolding.

DB: initial Prisma schema, migrations, RLS policies.

Auth: Supabase auth flow, profile setup.

Ingestion: fixtures/teams/players → lineups → weather; odds CSV pipeline.

APIs: fixtures, lineups, weather, tips, odds upload.

Tip Engine: scoring, strategies, validators; confidence.

Frontend: Home, Match Hub, Bet Builder, My Bets, Admin.

Testing: unit/API/E2E + accessibility.

Ops: deploy, cron, monitoring, backups.

Compliance: legal pages, RG banners, attribution.

Prompts (starting points)

PM Agent — Backlog refine prompt:

Read README.md. Create a prioritized backlog of issues for MVP. For each issue: title, rationale, acceptance criteria, estimate, dependencies.

Backend Agent — Prisma/API prompt:

Implement Prisma schema per README. Generate migrations. Create /api/fixtures, /api/lineups, /api/tips, /api/odds/upload, /api/weather with input validation (zod) and RLS-safe queries. Include tests.

Data Ingestion Agent — Provider prompt:

Build Sportradar client with retry/backoff and typed DTOs. Implement ingestion jobs and ingest_runs logging. Add admin odds CSV parser (zod) and upsert into odds_snapshots.

Tip Engine Agent — Strategy prompt:

Implement player form, matchup scoring, weather adjustments, and risk-band composition. Return rationales. Provide deterministic seeds for tests.

Frontend Agent — UI prompt:

Build pages per IA with shadcn/ui. Add risk slider, rationale chips, exclusions, and Copy Slip. Respect RG banners. Implement My Bets with ROI.

QA Agent — Testing prompt:

Create Vitest unit tests for scoring, Supertest for API routes, Playwright for Login → Select Fixture → Build → Copy flow. Add a11y checks.

DevOps Agent — Deploy prompt:

Configure Vercel env vars, Supabase policies, cron ingest endpoint with HMAC secret, Sentry logging, daily DB backups.

Compliance Agent — Legal prompt:

Generate concise T&Cs, Privacy Policy (AU‑centric), RG messaging and helplines. Ensure provider attribution and no guarantee language.

Example API contracts

// GET /api/fixtures?round=23
// → { fixtures: Array<{id, kickoff_utc, home_team, away_team, venue, status}> }

// GET /api/lineups?fixture_id=...
// → { confirmed: boolean, home: {...}, away: {...} }

// GET /api/tips?fixture_id=...&risk=balanced&exclude=first_tryscorer
// → { legs: Array<{market: string, selection: string, price?: number, confidence: number, rationale: string}> }

// POST /api/odds/upload (admin, multipart CSV)
// → { inserted: number }

Odds CSV (admin) — minimal schema

fixture_id, captured_at, home_win, away_win, line, total, anytime_tryscorer_json
sr:match:1234,2025-08-08T09:00:00Z,1.55,2.45,-6.5,41.5,"[{\"player_id\":\"sr:player:1\",\"price\":2.2}]"

Done = Shipped checklist (per PR)



Handover deliverables

Deployed URLs (Vercel, Supabase project)

Env var manifest

Admin credentials delivery procedure

Runbooks: ingestion, odds upload, feature flags

Backup & restore instructions

