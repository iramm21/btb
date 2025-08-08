README.md — Beat the Bet (NRL Betting Assistant) — MVP

One‑liner: A web app that helps NRL fans build smarter multis and SGM-style bets using live data, lineups, form, and risk controls. Not a bookmaker; we generate researched bet slips and insights.

Table of contents

Product overview

Branding

MVP scope

User stories

Information architecture

System architecture

Data model

Data ingestion

Tip engine (MVP)

Odds & bookmakers

Legal, compliance & responsible gambling

Analytics & metrics

Security, privacy & access

Performance & reliability

Accessibility & i18n

Environments & configuration

Local setup

Testing

Deployment

Roadmap

MVP To‑Do checklist

Acceptance criteria (MVP)

Product overview

Goal: Help users compose value‑focused bets on NRL matches quickly and safely. Provide data‑driven suggestions, sanity checks (injuries, late mail, weather, lines/total movement), and exportable slips the user can place with their preferred bookmaker.

Non‑goals (MVP): We do not place bets, handle payments, or guarantee outcomes. No arbitrage/odds scraping at scale. No ML model training beyond lightweight heuristics.

Target users: Casual to serious NRL fans in AU (“blokey blokes” audience) who want a smarter, simpler way to build multis.

Branding

Working name: Beat the Bet (can be changed later).

Voice & tone: Confident, friendly, straight‑talking. No hypey guarantees. Clear risk disclosures. Short, punchy copy.

Visual direction: Modern, gamified, energetic. Mobile‑first. Use micro‑animations and subtle motion to reward interactions.

Typography: Inter (UI), Space Grotesk (display) — both free, pair well with Tailwind.

Color system (OKLCH):

Primary: oklch(62% 0.17 260) — electric indigo

Secondary: oklch(70% 0.12 145) — green (success/value)

Accent: oklch(78% 0.13 35) — warm gold (highlight)

Background (light): oklch(98% 0 95); (dark) oklch(19% 0.03 255)

Error: oklch(62% 0.21 25); Warning: oklch(80% 0.18 85)

Components: shadcn/ui. Rounded‑2xl, soft shadows, motion via Framer Motion.

Brand guardrails: Always display responsible gambling messaging. Avoid implying certainty. No under‑18 imagery.

MVP scope

Key screens:

Home / Onboarding — quick explainer, sign in, pick team(s), risk profile (Safe / Balanced / Spicy), favourite markets.

Match Hub — select round + fixture. Shows odds snapshot, line movements, team lists, form, injuries, weather. “Build My Bet” CTA.

Bet Builder — rule‑based suggestions for Anytime tryscorers, line/total, half markets. Risk slider. Exclusions (e.g., don’t include FTS). Export slip text.

My Bets — user’s saved slips, status (won/lost/manual), ROI summary.

Admin — ingest monitor, manual lineup overrides, content edits, feature flags.

Must‑have features:

Supabase Auth, Profiles, Preferences.

Data ingest for: fixtures, teams, players, lineups, injuries/suspensions, basic match stats, weather.

Odds snapshot for core markets (team win, line, total points, anytime tryscorer) — manual CSV upload or single provider.

Rule‑based tip engine with risk bands and validations (lineups confirmed, player form, matchups).

Export slip (copy text), share link, and optional CSV export.

Notifications (email) for lineup confirmations and notable odds movement.

Basic analytics: conversion to “copy slip”, retention, ROI (self‑reported outcomes).

Nice‑to‑have (stretch):

PWA install, offline cache of last seen data.

A/B of suggestion strategies.

Simple ensemble scoring for tryscorers using rolling form.

User stories

As a user, I can pick a fixture and get 6–10 suggested legs tuned to my risk profile.

As a user, I can exclude certain markets (e.g., no first tryscorer) or lock a favourite player.

As a user, I can see why a leg is suggested (short rationale chip).

As a user, I can copy the bet slip and paste it into my bookmaker.

As a user, I can mark a bet result and see my ROI over time.

As an admin, I can re‑run ingestion, fix a lineup, and feature‑flag strategies.

Information architecture

Public: Home, About, Legal.

Auth: Dashboard (Match Hub → Bet Builder), My Bets, Settings.

Admin: Ingestion, Overrides, Flags.

System architecture

Frontend: Next.js (App Router, TS), Tailwind, shadcn/ui, Framer Motion; PWA‑ready.

Backend: Next.js API routes for orchestration. Supabase (Postgres) for DB and Auth. Prisma as ORM. Background jobs via Supabase Scheduler or external cron (e.g., QStash) hitting API routes.

Data providers (MVP):

Fixtures/Teams/Players/Lineups/Stats: Sportradar Rugby League API (trial → paid). Cache + rate‑limit.

Weather: BOM or Open‑Meteo (free) by venue/time.

Odds: Manual CSV upload (admin) or provider with permitted usage. Start manual to avoid legal/API hurdles.

Caching: Supabase table caches with TTL columns; optional in‑memory cache for hot endpoints.

Feature flags: table feature_flags with keyed checks on server.

Data model

Core tables (minimum viable):

users (supabase)

profiles (id FK → users, nickname, fav_team, risk_profile)

teams (id, name, short_name, colors, logo_url)

players (id, team_id, name, position, is_active, stats_json)

fixtures (id, season, round, kickoff_utc, home_team_id, away_team_id, venue, status)

lineups (fixture_id, team_id, confirmed_at, starters_json, bench_json, outs_json)

injuries (player_id, status, note, updated_at)

odds_snapshots (id, fixture_id, captured_at, home_win, away_win, line, total, anytime_tryscorer_json)

tips (id, fixture_id, strategy, risk_band, payload_json, score)

bet_slips (id, user_id, fixture_id, legs_json, risk_band, created_at, note)

bet_outcomes (bet_slip_id, stake, returned, status, settled_at)

ingest_runs (id, type, started_at, finished_at, status, error)

feature_flags (key, enabled, payload_json)

audit_logs (id, actor, action, entity, before, after, at)

Note: JSON columns keep MVP flexible; normalize later once schemas stabilize.

Data ingestion

Jobs:

Fixtures seed — preseason + weekly updates.

Teams/Players refresh — preseason + ad‑hoc.

Lineups — poll higher frequency Tue–Fri; confirm 60–90 min pre‑kick.

Weather — fetch hourly for venues on match day.

Odds snapshot — ingest via admin CSV 2–3x on match day.

Resilience: backoff on 429s, store ingest_runs, partial retries, provider quota monitor.

Tip engine (MVP)

Inputs: lineup status, recent tries (rolling 5), opponent edge/edge matchup, team attack/defense rank, odds baseline, weather, venue, travel, rest days.

Process:

Compute player form score (z‑score vs team role and league position).

Matchup score from opponent defensive weakness by edge/middle.

Market sanity: block legs for benched/inactive players; fade in heavy rain.

Risk band rules:

Safe: 3–5 legs, mostly favs/lines, ≤1 tryscorer at ≤ $2.50.

Balanced: 5–7 legs, mix of lines, totals, 1–2 tryscorers up to ~$3.50.

Spicy: 7–10 legs, includes 2+ tryscorers, alt lines/totals, method of last points optional.

Outputs: Sorted leg candidates with rationale and confidence. Expose a composable API: /api/tips?fixture_id=...&risk=balanced.

Odds & bookmakers

MVP: export a plain‑text slip that mirrors common bookie phrasing. User pastes into their app.

Provider: start with manual CSV upload in Admin for markets we support. Keep provider‑specific integrations as future work due to ToS/legal.

Legal, compliance & responsible gambling

Age 18+. Show helplines and RG messaging on every bet screen.

We provide information only; users place bets themselves. No financial advice or guaranteed outcomes.

Respect data provider ToS (caching, display windows, attribution). Avoid scraping where disallowed.

Log and honor user privacy choices; allow data export/delete (GDPR‑style patterns, though AU‑centric).

Analytics & metrics

Funnel: Match Hub → Bet Builder → Copy Slip rate.

Engagement: sessions/week, saved slips per user.

Quality: user‑reported hit rate, ROI trend.

Reliability: ingestion success %, API latencies.

Security, privacy & access

Supabase Auth (email/password, OAuth optional). RLS policies on per‑user content.

Store provider keys as server env vars only; never client.

Audit admin actions. Rate‑limit all public APIs.

Performance & reliability

Cache recent fixtures and last 24h odds snapshots.

Use ISR/SSR for Match Hub. Stale‑while‑revalidate on data fetches.

Accessibility & i18n

WCAG AA: color contrast, focus rings, keyboard nav.

English only (MVP); copy centralized for future i18n.

Environments & configuration

# .env.local (development)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Database
DATABASE_URL=postgresql://... (Supabase)

# Sportradar (example — confirm product & access level)
SPORTRADAR_API_KEY=...
SPORTRADAR_ACCESS_LEVEL=trial
SPORTRADAR_LOCALE=en
SPORTRADAR_SEASON_ID=sr:season:xxxxx

# Weather (optional)
OPENMETEO_BASE=https://api.open-meteo.com/v1/forecast

# App
JWT_SECRET=...
CRON_INGEST_SECRET=...

Local setup

pnpm i (or yarn/npm) — install deps.

Copy .env.local and fill in keys.

pnpm prisma generate && pnpm prisma migrate dev.

pnpm dev — start Next.js.

Seed: pnpm seed:fixtures (provide a simple script) and optional pnpm seed:teams.

Testing

Unit: Vitest for tip scoring utilities.

API: Supertest against Next API routes.

E2E: Playwright basic flows (Login → Match → Build → Copy).

Data: Contract tests against provider responses (mocked).

Deployment

Vercel for frontend/API routes; set env vars and Cron Jobs (or Supabase Scheduler) for ingestion.

Supabase for DB/Auth; enable RLS policies and Row Level Security.

Backups: daily automated DB backups.

Roadmap

MVP (this doc): rule‑based tips, manual odds input, lineup/weather integration, export slips, ROI tracking.

Phase 2: basic ML ranking for tryscorers (logistic regression over recent form + opponent weakness). A/B testing of strategies.

Phase 3: multi‑bookmaker integrations (if ToS allows), line movement alerts, community picks, custom models per user.

MVP To‑Do checklist

Product & Design



Frontend



Backend & DB



Data & Integrations



Tip Engine



Ops



Compliance



Acceptance criteria (MVP)

Users can sign up, set preferences, and open a Round → Fixture.

Bet Builder returns ≥6 leg suggestions with rationales in under 2s on warm cache.

Lineups & weather appear for the fixture, with “confirmed” badges when available.

User can export and copy a slip, save it, and later mark win/loss; ROI displays.

Admin can upload odds CSV, see latest ingestion runs, and toggle a feature flag.

RG messaging visible on all bet‑related screens.
