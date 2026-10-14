# ANANT.AI

60-second, five-part, sourced explainers on Indian companies, with a kept note and a quiz.
Source of truth, in order: `STORE-KIT.md` (locked scope, claims, prices, design), `PRD.md`, `ARCHITECTURE.md`.

## Hard rules

1. No figure renders without its source and period on the same screen. `Figure.source_id` is required; a figure with no source is a build error.
2. Every explainer has exactly five parts, in order: SELLS, EARNS, SIZE, RIVALS, WATCH. Since Oct 2026 parts may run longer than three lines (up to 420 characters) at the founder's request.
3. Every explainer ends with a 30-word note saved to the notebook and a short quiz.
4. Only the five palette tokens: Black Room `#0E0D0C`, Bone `#E8DFCF`, Paper `#F1EADC`, Ash `#7A746A`, Brass `#B8956A`. Brass is the only accent. Never red or green. No stock prices, charts, tickers, or buy/sell/target language.
5. Dark is for watching, Paper is for keeping. Two theme contexts (`data-theme="watch" | "keep"`), never mixed.
6. The disclaimer stays in the footer and app shell, verbatim (`DISCLAIMER` in `src/lib/constants.ts`).
7. Three products, fixed names, Pro at ₹149/month. Do not add products, claims, prices or features.
8. Never invent, estimate or round a figure. A company with `needs_figures: true` renders without numbers.
9. No logo. The wordmark is "ANANT.AI" in Inter Tight Semibold.

## Content

- Company data is never hardcoded. It lives in the database, loaded by `prisma/seed.ts` from `companies.seed.100.json` plus every file in `content/batches/` (name order; later entries replace earlier ones by slug, and inherit figures if they leave `figures` out).
- v2 entries (`"v": 2`) carry `profile` (hq, leader, leader_role, as_of), `review` (unreviewed | approved) and exactly three quiz questions. Unreviewed entries show "Draft · not yet reviewed" in the player.
- Numbers in part bodies and notes need a source; write qualitative claims instead. Check leaders on the web before writing them; my knowledge goes stale.
- `content/targets.json` is the list towards 1000 companies (Nifty 500 from `content/sources/ind_nifty500list.csv`, startups from `scripts/startups.txt`). Mark rows `done` when a batch covers them.
- The seed validates the whole file first and writes nothing if anything fails (`src/lib/seed-validate.ts`).
- Figures are placed by position (1st on SIZE, 2nd on EARNS) unless a figure sets `part_kind`. One figure per part.
- Industries are a controlled list in `src/lib/constants.ts`, along with all fixed copy.

## Phase 1 architecture

- Next.js 14 App Router, TypeScript, Tailwind (palette replaced with the five tokens).
- Content: Prisma, SQLite locally (`prisma/schema.prisma`). For Postgres, change `provider` and `DATABASE_URL`.
- User progress (NoteCard, QuizAttempt, Streak, IndustryProgress) is on the device in `src/lib/progress.ts`, in the shapes of ARCHITECTURE.md §4. No login yet.
- Auth, Razorpay, Pro features and Campus are not built.

## Commands

Node lives in `~/.local/node/bin`; add it to `PATH` first.

- `npm run dev` — dev server on :3000
- `npm run db:push` — create or update the database schema
- `npm run db:check` — validate the seed file, write nothing
- `npm run db:seed` — validate, then replace all content (`SEED_FILE=path` to use another file)
- `npm run typecheck`
