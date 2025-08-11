# Upgrade Notes — 2025-08-11

## Audit
- **CI baseline**: `pnpm run ci` passes after configuring flat ESLint and converting Tailwind config to ESM imports.
- **Deprecated/Risky deps**:
  - `@supabase/auth-helpers-nextjs` – to be removed in favor of SSR `@supabase/supabase-js`.
  - `tw-animate-css` – superseded by `tailwindcss-animate`.
- **Major versions in use**:
  - Next.js 15, React 19, TypeScript 5.9, Prisma 6.13, ESLint 9, Tailwind CSS 4.1.
- **Custom build/postinstall steps**:
  - `postinstall`: runs `cross-env PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 prisma generate`.
  - `pnpm-workspace.yaml` uses `onlyBuiltDependencies` for `@prisma/*`, `esbuild`, and `sharp`.
- **Windows considerations**:
  - `cross-env` already used in scripts; no `rm -rf` or bashisms detected.
- **Lint configuration**:
  - Tests ignored via flat-config `ignores`; `@typescript-eslint/no-explicit-any` disabled.
  - Remaining warning: unused `eslint-disable` in `types/prisma.d.ts`.

