# AGENTS.md

## Cursor Cloud specific instructions

This is a single, 100% client-side **Next.js 15 / React 19 / TypeScript** app (the
"Colinet Trotta — Decisiones que Importan" educational business simulator). There is
**no backend, database, API route, or external service**. Game state persists to the
browser's `localStorage`. No environment variables or secrets are required.

- Package manager is **pnpm** (`pnpm-lock.yaml` is authoritative).
- Standard commands live in `package.json` scripts:
  - `pnpm dev` — start dev server on `http://localhost:3000` (the only service).
  - `pnpm test` — Vitest unit/integration tests (Node environment, fast, no browser).
  - `pnpm typecheck` — `tsc --noEmit`.
  - `pnpm build` / `pnpm start` — production build/serve.
- **`pnpm lint` is not usable non-interactively.** ESLint is not configured in the repo,
  so `next lint` launches an interactive setup prompt and hangs. Use `pnpm typecheck`
  (and `pnpm test`) for verification instead.
- The three root planning docs (`01_quick_mvp.md`, `02_gameplay_balance.md`,
  `03_data_tech.md`) describe an abandoned FastAPI/satellite-data concept that was
  never built. Ignore them as a description of the current system; the shipped product
  is purely the Next.js simulator.
