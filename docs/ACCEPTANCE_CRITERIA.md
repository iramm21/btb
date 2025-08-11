# ACCEPTANCE_CRITERIA.md — MVP acceptance criteria

## Auth
- **AC-01**: Users can sign up and log in via Supabase; team and risk preferences persist to profile. → P0-3
- **AC-02**: Unauthenticated users attempting to access protected routes are redirected to the login page. → P0-3

## Match Hub
- **AC-03**: Selecting a round displays its fixtures with odds snapshot, line movement, team lists, injuries, and weather. → P0-4, P0-5, P0-7
- **AC-04**: Lineup and weather widgets show a “confirmed” badge when data indicates confirmation. → P0-4, P0-5, P0-7

## Bet Builder
- **AC-05**: `/api/tips` returns at least six suggested legs for a fixture and risk profile within two seconds on warm cache. → P0-6
- **AC-06**: Users can adjust risk level, exclude markets, and copy/export the generated slip text. → P0-8
- **AC-07**: Each suggested leg includes a short rationale chip and confidence score. → P0-6, P0-8

## My Bets
- **AC-08**: Users can save a generated slip, mark it won or lost, and see ROI summary on My Bets. → P0-9

## Admin
- **AC-09**: Admin can upload a validated odds CSV and see number of records inserted. → P0-10
- **AC-10**: Admin dashboard lists recent ingestion runs and allows feature flag toggles. → P0-10

## Ingestion
- **AC-11**: Cron endpoint ingests fixtures, lineups, and weather data with retry/backoff and logs each run. → P0-4

## RG / Legal
- **AC-12**: Responsible gambling banner is visible on all bet-related pages, and Terms & Conditions and Privacy Policy are accessible. → P0-11

