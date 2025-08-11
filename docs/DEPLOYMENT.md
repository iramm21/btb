# DEPLOYMENT.md

## Overview
The MVP runs on **Vercel** using the Next.js App Router for both web pages and API routes. **Supabase** provides Postgres and Auth. The app is mostly server rendered and relies on environment variables for provider keys and secrets. Production builds should avoid outgoing HTTP calls during build.

## Vercel setup
1. Create a new Vercel project and link this Git repository.
2. Framework preset: **Next.js**. Build command: `pnpm build`.
3. Under *Environment Variables* add the values from [`.env.example`](../.env.example). Do **not** prefix secrets with `NEXT_PUBLIC_` unless they are safe for the client.
4. (Optional) After the cron ingestion task exists, add Vercel Cron Jobs hitting `/api/ingest/*` endpoints with an `Authorization: Bearer <CRON_INGEST_SECRET>` header.
5. On the first deploy, run `pnpm prisma migrate deploy` (as a Vercel build step or manual CLI) to apply migrations.

## Supabase setup
1. Create a Supabase project. Collect:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. In Vercel, set `DATABASE_URL` to the Supabase Postgres URI.
3. Apply schema changes with `pnpm prisma migrate deploy` when deploying new migrations.
4. **Row Level Security**:
   - Enable RLS on user-scoped tables: `profiles`, `bet_slips`, `bet_outcomes`, `events`.
   - Policies (outline):
     - *Select*: `auth.uid() = user_id`.
     - *Insert*: `auth.uid() = user_id`.
     - *Update/Delete*: `auth.uid() = user_id`.
   - Adjust as models evolve; keep admins in mind.

## Secrets & rotation
- Generate strong random values for `JWT_SECRET` and `CRON_INGEST_SECRET` (e.g. `openssl rand -base64 32`).
- Rotate secrets by updating them in Vercel/Supabase and redeploying. Remove old values.
- Never expose private keys via `NEXT_PUBLIC_*` variables.

## Monitoring & logs
Sentry or Logflare can be added for runtime monitoring and log aggregation. Configure provider keys as additional environment variables.

## Rollbacks
- **Vercel:** use the *Deployments* tab to promote a previous build if an issue arises.
- **Supabase:** restore the database from automated backups or point-in-time recovery.

