# ANANT.AI

A 60-second, sourced, five-part explainer for every Indian company, with a notebook and quiz that make it stick. Built for Indian MBA students preparing for placements and interviews.

> **Educational only.** ANANT.AI is for education only. It does not provide stock tips, investment advice or recommendations.

## What it is

Each explainer has the same five parts — **SELLS · EARNS · SIZE · RIVALS · WATCH** — plays in about 60 seconds, and ends with a 30-word note kept to your notebook and a short quiz. Every figure on screen shows its source and period; a figure with no source is never shown.

This repository is the Phase 1 MVP (the free core): landing + auth, search, the explainer player, the kept note, the quiz, the notebook, and progress by industry.

## Stack

- **Next.js 14** (App Router) + TypeScript, Tailwind with the five locked palette tokens
- **Prisma + SQLite** for content locally (swappable to Postgres by changing `provider` + `DATABASE_URL`)
- **Supabase** auth (email/password) gating entry; user progress is kept on-device for now
- Installable PWA, offline-capable for opened explainers and the notebook

## Getting started

```bash
npm install
cp .env.example .env.local      # then fill in the values below
npm run db:push                 # create the SQLite schema
npm run db:seed                 # load the company content
npm run dev                     # http://localhost:3000
```

`.env.local` (never commit it — it is gitignored):

```
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon public key>
```

## Scripts

| command | does |
|---|---|
| `npm run dev` | dev server on :3000 |
| `npm run build` / `npm run start` | production build and serve |
| `npm run db:seed` | validate and load all content (base + `content/batches/*.json`) |
| `npm run db:check` | validate the content without writing |
| `npm run typecheck` | TypeScript, no emit |

## Content

Company content is data, never hardcoded. It lives in the database, loaded from `companies.seed.100.json` plus every file in `content/batches/`. The seed validates the whole set and writes nothing if anything fails — no figure ships without a source and period.

**Status:** the seeded companies are drafts marked "not yet reviewed"; figures are cited to business-media reports of each company's filing and should be swapped for the primary filing before production.

## Design

Direction "The Sixty": five colours only — Black Room `#0E0D0C`, Bone `#E8DFCF`, Paper `#F1EADC`, Ash `#7A746A`, Brass `#B8956A` (the only accent) — Inter Tight + Instrument Serif, wordmark only, dark for watching and Paper for keeping.
