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
