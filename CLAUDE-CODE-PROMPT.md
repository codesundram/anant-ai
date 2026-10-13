# Claude Code — build prompt for ANANT.AI (seed loaded)

Copy everything in the box below into Claude Code, in a repo that has these four files at root:
`STORE-KIT.md`, `PRD.md`, `ARCHITECTURE.md`, `companies.seed.json`.

---

```
You are building ANANT.AI. Read these files at the repo root before writing any code, and treat them as the source of truth in this order: STORE-KIT.md (scope, claims, prices, design — locked, do not change), PRD.md (requirements), ARCHITECTURE.md (tech stack, data model, APIs). Content comes from companies.seed.json — 8 real companies with sourced figures. This is NOT a sample app; build against the real seed.

HARD RULES (never break these):
1. No figure may render anywhere without its source AND period shown on the same screen. In the data model, Figure.source_id is NOT NULL and the source must have a non-empty period. If a figure has no source, it is a build error, not a warning.
2. Every explainer has exactly five parts in this order: SELLS, EARNS, SIZE, RIVALS, WATCH.
3. Every explainer ends with a 30-word note saved to the notebook and a short quiz.
4. Use only the five palette tokens as CSS variables — Black Room #0E0D0C, Bone #E8DFCF, Paper #F1EADC, Ash #7A746A, Brass #B8956A. Brass is the only accent. Never red or green. No stock prices, charts, tickers, or buy/sell/price-target language anywhere.
5. Dark screens are for watching the explainer; Paper (light) screens are for the kept note, quiz, notebook and progress. Implement these as two theme contexts, not mixed.
6. Keep the educational-only disclaimer in the footer and app shell: "ANANT.AI is for education only. It does not provide stock tips, investment advice or recommendations."
7. Do not add products, rename them, or change the ₹149/month Pro price. The three products are fixed in STORE-KIT.md.

STACK (from ARCHITECTURE.md §2 — PWA default):
- Next.js 14 (App Router) + TypeScript, Tailwind with the 5 tokens as CSS variables, built as an installable PWA (phone-first).
- PostgreSQL via Prisma; Redis for cache/rate-limit/streak lock. (Use Docker Compose for local Postgres + Redis.)
- Auth, payments (Razorpay) and Campus are later phases — stub them for now.

WHAT TO BUILD NOW — Phase 1 (Free core) only:
1. Scaffold the Next.js + TS + Tailwind PWA with the 5 color tokens and the two theme contexts (dark "watch", Paper "keep").
2. Create the Prisma schema from ARCHITECTURE.md §4 (Company, Industry, Explainer, ExplainerPart, Figure, Source, NoteCard, QuizQuestion, QuizAttempt, Streak, IndustryProgress). Enforce in the schema and a seed-validation step: 5 parts per explainer; every Figure has a Source with a period.
3. Write a seed script that loads companies.seed.json into the DB. Fail the seed loudly if any figure is missing a source or period, or any company lacks exactly 5 parts.
4. Build these screens, matching "The Sixty" (one part per full screen, vertical, a Brass progress line across the top counting ~60s, each figure showing its source line beneath it in Ash):
   - Search (search the 8 seeded companies by name; show an honest "not yet covered" empty state for anything else — never fabricate coverage).
   - Explainer player: 5 dark screens (SELLS, EARNS, SIZE, RIVALS, WATCH), kinetic type, Brass countdown line, source + period under every figure.
   - Reward: 600ms fade from dark to Paper, the 30-word note slides up and is saved to the notebook.
   - Quiz: short multiple-choice from the five parts; on submit, advance the streak (idempotent per day, Asia/Kolkata) and update progress-by-industry.
   - Notebook: the user's saved notes grouped by industry.
   - Streak: a single Brass mark that fills — no confetti, coins, levels or leaderboards.
5. Keep the API shape from ARCHITECTURE.md §5 (search, explainers/:slug, notes, quiz, streak, progress). Auth can be a stubbed local user for now.

TYPOGRAPHY: Inter Tight Semibold for part titles, company names and key figures (figures 64–88px on mobile); Instrument Serif Italic for at most one phrase per screen; Inter for body, max 3 lines per part; uppercase letter-spaced Ash labels for SELLS · EARNS · SIZE · RIVALS · WATCH. No photography, no company logos, no gradients, glows or badges; matte flat surfaces, hairline dividers, square-cornered full-width buttons.

Also generate a CLAUDE.md at repo root containing the HARD RULES above, so future sessions inherit them.

Start by reading the four files and proposing a short build plan and the Prisma schema. Then scaffold and seed, and show me the Search + Explainer flow working against companies.seed.json before moving on.
```

---

## Note on the figures in the seed

The numbers in `companies.seed.json` are real and sourced, but they're currently cited to **business-media reports of each company's filing / RoC accounts**, not the filing PDF itself. That's fine to build and demo against. Before you publish to real users, swap each `source.url` for the actual annual-report or RoC PDF and the exact page/line — that's the final form of your "numbers from filings" promise. The seed is structured so that's a data edit, not a code change.
