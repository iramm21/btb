# BACKLOG.md — MVP backlog

## P0

### P0-1 CI pipeline setup
- **Rationale**: Catch lint, type, and test failures before merge.
- **Acceptance Criteria**:
  - GitHub Actions runs `pnpm lint`, `pnpm typecheck`, and `pnpm test` on each PR.
  - Pipeline fails on non-zero exit codes.
- **Estimate**: S
- **Dependencies**: none

### P0-2 Prisma schema & migrations
- **Rationale**: Provide structured storage for users, fixtures, bets, odds, and ingest runs.
- **Acceptance Criteria**:
  - Prisma schema defines tables for users, preferences, fixtures, lineups, bets, odds_snapshots, ingest_runs.
  - `pnpm prisma migrate dev` creates initial migration without errors.
- **Estimate**: M
- **Dependencies**: P0-1

### P0-3 Supabase Auth & user profiles
- **Rationale**: Authenticate users and store personal preferences.
- **Acceptance Criteria**:
  - Users can sign up and log in via email.
  - Profile records team and risk preferences.
  - Protected routes redirect unauthenticated users to login.
- **Estimate**: M
- **Dependencies**: P0-2

### P0-4 Ingestion jobs for fixtures & weather
- **Rationale**: Populate database with fixtures, teams, lineups, and weather data.
- **Acceptance Criteria**:
  - Cron endpoint ingests fixtures, teams, players, lineups, and weather.
  - Ingestion retries on 429/5xx and logs results in `ingest_runs`.
  - Weather records include TTL for cache expiry.
- **Estimate**: L
- **Dependencies**: P0-2

### P0-5 API routes for fixtures, lineups & weather
- **Rationale**: Expose ingested data to the frontend.
- **Acceptance Criteria**:
  - `GET /api/fixtures?round=` returns fixtures for a round.
  - `GET /api/lineups?fixture_id=` returns lineup data with confirmation status.
  - `GET /api/weather?fixture_id=` returns forecast at venue and kickoff.
- **Estimate**: M
- **Dependencies**: P0-4

### P0-6 Tip Engine & `/api/tips`
- **Rationale**: Generate rule-based betting suggestions.
- **Acceptance Criteria**:
  - `GET /api/tips?fixture_id=&risk=` returns ≥6 legs with confidence and rationale.
  - Responses under 2s on warm cache.
- **Estimate**: L
- **Dependencies**: P0-5

### P0-7 Match Hub page
- **Rationale**: Let users browse rounds and fixtures with key info.
- **Acceptance Criteria**:
  - Users select a round and fixture from UI.
  - Page shows odds snapshot, line movement, team lists, injuries, and weather.
  - “Build My Bet” button links to Bet Builder.
- **Estimate**: M
- **Dependencies**: P0-3, P0-5

### P0-8 Bet Builder page
- **Rationale**: Allow users to compose slips from suggested legs.
- **Acceptance Criteria**:
  - Displays legs from `/api/tips` with rationale chips.
  - Risk slider and market exclusions adjust suggestions.
  - Users can copy or export slip text.
- **Estimate**: L
- **Dependencies**: P0-6, P0-7

### P0-9 My Bets storage & ROI
- **Rationale**: Track saved slips and outcomes.
- **Acceptance Criteria**:
  - Users save generated slips.
  - Bets can be marked won or lost.
  - ROI summary visible on My Bets page.
- **Estimate**: M
- **Dependencies**: P0-3, P0-2

### P0-10 Admin odds upload & feature flags
- **Rationale**: Provide manual odds input and configuration controls.
- **Acceptance Criteria**:
  - Admin uploads CSV; system validates and inserts odds snapshots.
  - Admin dashboard shows latest `ingest_runs` and allows feature flag toggles.
- **Estimate**: M
- **Dependencies**: P0-5, P0-4

### P0-11 Responsible gambling & legal pages
- **Rationale**: Meet compliance requirements and inform users.
- **Acceptance Criteria**:
  - RG banner visible on all bet-related pages.
  - Accessible Terms & Conditions and Privacy Policy pages.
- **Estimate**: S
- **Dependencies**: P0-7, P0-8

## P1

### P1-1 Analytics instrumentation
- **Rationale**: Measure conversion and retention.
- **Acceptance Criteria**:
  - Events tracked for “Copy Slip”, bet save, and ROI updates.
  - Metrics available in dashboard or export.
- **Estimate**: M
- **Dependencies**: P0-8, P0-9

### P1-2 Deployment & runbook docs
- **Rationale**: Enable consistent environment setup and recovery.
- **Acceptance Criteria**:
  - Docs cover Vercel, Supabase, env vars, and backup/restore steps.
  - Runbook includes ingestion and odds upload procedures.
- **Estimate**: S
- **Dependencies**: P0-10

### P1-3 Notification emails
- **Rationale**: Alert users to lineup confirmations and notable odds movement.
- **Acceptance Criteria**:
  - Users opt into email notifications.
  - System sends emails on lineup confirmation or significant odds change.
- **Estimate**: M
- **Dependencies**: P0-4, P0-3

### P1-4 Settings page
- **Rationale**: Let users manage preferences and notifications.
- **Acceptance Criteria**:
  - Users update team, risk profile, and email notification preferences.
  - Changes persist to profile table.
- **Estimate**: S
- **Dependencies**: P0-3

## P2

### P2-1 PWA install & offline cache
- **Rationale**: Improve mobile engagement and resilience.
- **Acceptance Criteria**:
  - App offers install prompt and caches last viewed data offline.
  - Offline mode displays cached Match Hub and Bet Builder data.
- **Estimate**: M
- **Dependencies**: P0-7, P0-8

### P2-2 A/B testing for suggestion strategies
- **Rationale**: Evaluate multiple tip strategies for effectiveness.
- **Acceptance Criteria**:
  - Users randomly assigned to strategy variants.
  - Analytics report performance per variant.
- **Estimate**: L
- **Dependencies**: P1-1, P0-6

