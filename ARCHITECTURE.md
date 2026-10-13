# ARCHITECTURE.md — ANANT.AI

**Technical design for build · v1.0 · 13 Oct 2026**
Feed this file to Claude Code alongside `PRD.md` and `STORE-KIT.md`. It defines the tech stack, high-level design (HLD) and low-level design (LLD). Product scope, claims and prices are fixed by the store kit — do not add products, claims, prices or features. Design rules ("The Sixty") are fixed by the store kit; this file does not restyle them.

---

## 0. How to use this with Claude Code

1. Put `STORE-KIT.md`, `PRD.md` and this file at the repo root.
2. Generate `CLAUDE.md` from §9 (build guardrails) so every session inherits the non-negotiables.
3. Build in the phase order in §8. Each phase is a working slice, not a layer.
4. The hard rule overrides everything: **no figure renders without a source + period. If a claim has no source row, it does not ship.**

---

## 1. Architecture at a glance

- **Client:** phone-first PWA (installable, offline-capable notebook). One codebase, no app-store dependency for v1.
- **Backend:** API server + Postgres. Content is pre-authored and reviewed, then served — not generated on the fly to the user.
- **Content is data, not code:** every explainer is rows in the DB with sourced figures. The app renders; it never invents numbers.
- **Two planes:** a *reader plane* (fast, cached, public/Free + Pro) and an *authoring plane* (internal CMS + review gate that enforces sourcing).

```
                 ┌─────────────────────────────────────────┐
  Student (phone) │   PWA  (Next.js, installable)            │
  ───────────────▶│   search · 60s explainer · note · quiz   │
                 │   streak · notebook · Pro tracks          │
                 └───────────────┬─────────────────────────┘
                                 │ HTTPS / JSON
                 ┌───────────────▼─────────────────────────┐
                 │  API (Next.js route handlers / tRPC)      │
                 │  auth · explainers · notes · quiz · streak │
                 │  billing · campus admin                   │
                 └───┬───────────┬───────────┬──────────────┘
                     │           │           │
            ┌────────▼──┐  ┌─────▼─────┐ ┌───▼────────┐
            │ Postgres  │  │  Redis    │ │ Razorpay   │
            │ (content, │  │ (cache,   │ │ (Pro ₹149, │
            │  users,   │  │  sessions,│ │  webhooks) │
            │  progress)│  │  rate-lim)│ └────────────┘
            └────┬──────┘  └───────────┘
                 │
      ┌──────────▼───────────┐     ┌──────────────────────┐
      │ Authoring CMS +       │     │ Object store (S3-     │
      │ review gate (internal)│     │ compatible): source   │
      │ enforces source rows  │     │ PDFs, note cards      │
      └───────────────────────┘     └──────────────────────┘
```

## 2. Tech stack (recommended default)

| Layer | Choice | Why | Swap if |
|---|---|---|---|
| **Client** | **Next.js 14 (App Router) as a PWA**, TypeScript, Tailwind | Phone-first, one codebase, installable, SSR for fast first paint and SEO on Free explainers (growth engine). No app-store gate for v1. | You need native camera/push-heavy features → **Expo / React Native** later, sharing the same API. |
| **Styling** | Tailwind + CSS variables for the 5 tokens | Enforces the locked palette as tokens, not ad-hoc hex | — |
| **API** | Next.js route handlers + **tRPC** (or REST if preferred) | Type-safe client↔server; one deploy | Separate service only if Campus admin outgrows it |
| **DB** | **PostgreSQL** (Supabase or Neon managed) | Relational content + progress; row-level security | — |
| **ORM** | **Prisma** | Type-safe schema, migrations | Drizzle if you prefer SQL-first |
| **Cache/session** | **Redis** (Upstash) | Explainer cache, rate limiting, streak locks | — |
| **Auth** | **Auth.js (NextAuth)** — phone OTP + Google | Indian students are phone-first; OTP via MSG91/Twilio | Supabase Auth if DB is Supabase |
| **Payments** | **Razorpay** (Subscriptions API) | India-native, UPI/cards, ₹149 recurring | — |
| **Object store** | **S3-compatible** (Cloudflare R2 / AWS S3) | Source PDFs, generated note-card images | — |
| **Search** | Postgres full-text (v1) → **Typesense/Meilisearch** (later) | Company name search; FTS is enough at launch | Scale of catalogue forces a search engine |
| **Hosting** | **Vercel** (app) + managed Postgres/Redis | Fast path from Claude Code to deployed | Self-host on a VPS if cost-driven |
| **Analytics** | **PostHog** (self-host or cloud) | Funnel, retention, streak metrics (PRD §11) | — |
| **Error/obs** | Sentry + structured logs | — | — |

**One open decision for you:** v1 platform = **PWA** (this doc's default) vs **native app (Expo)**. PWA ships faster and the API is identical either way, so a later native client reuses the backend. I've designed to PWA; say the word to re-cut the client section for Expo.

## 3. HLD — components and responsibilities

| Component | Responsibility | Notes |
|---|---|---|
| **Reader app (PWA)** | Search, play 60s explainer, show note + quiz, streak, notebook, Pro tracks | Offline cache of the user's notebook; service worker |
| **Explainer service** | Serve an explainer (5 parts + figures + sources) by company slug | Read-heavy, cached in Redis + CDN |
| **Learning service** | Save 30-word note, serve/score quiz, advance streak, track progress-by-industry | Writes to progress tables |
| **Catalogue/search** | Resolve company/startup/model → explainer; empty-state when uncovered | No fabricated coverage |
| **Identity/auth** | OTP + Google sign-in, sessions | Free needs light account for notebook/streak |
| **Billing** | Razorpay subscription for Pro; entitlement checks | Webhook-driven state |
| **Campus admin** | Cohort licence, bulk entitlement for a placement cell | Masters' Union pilot |
| **Authoring CMS (internal)** | Author explainers, attach source rows, run review gate | Not user-facing |
| **Review gate** | Block publish if any figure lacks source + period | Enforces the hard rule in code |

**Data flow — the core moment (watch → keep):**
1. Student searches "Zepto" → catalogue resolves slug → explainer service returns 5 parts, each figure carrying `{value, unit, period, source_ref}`.
2. Client renders Black Room screens, Brass 60s line, source line under each figure.
3. On finish → learning service creates the 30-word note in the notebook (Paper screen), serves a quiz drawn from the five parts.
4. Quiz answered → streak advances (idempotent per day), progress-by-industry updates.

## 4. LLD — data model (Postgres / Prisma)

Core entities. Timestamps (`created_at`, `updated_at`) omitted for brevity; all tables have them.

```
User(id, phone, email?, name?, auth_provider, role[student|admin|campus_admin], created_at)
Subscription(id, user_id→User, plan[free|pro], status[active|past_due|canceled],
             razorpay_sub_id?, current_period_end, source[self|campus])
Campus(id, name, status[pilot|active], seats, created_at)         # e.g. Masters' Union
CampusMembership(id, campus_id→Campus, user_id→User, status)      # grants Pro-equivalent

Company(id, slug, name, type[listed|startup|model], industry_id→Industry, status[draft|published])
Industry(id, slug, name)                                         # for progress-by-industry + tracks

Explainer(id, company_id→Company, version, status[draft|in_review|published],
          published_at?, reviewed_by?)
ExplainerPart(id, explainer_id→Explainer, kind[SELLS|EARNS|SIZE|RIVALS|WATCH],
              order, body)                                       # ≤3 lines body, enforced in CMS
Figure(id, part_id→ExplainerPart, label, value, unit, period, source_id→Source)  # NO nullable source
Source(id, title, doc_type[annual_report|filing|...], period, url?, file_ref?)    # object-store ref

NoteCard(id, user_id→User, explainer_id→Explainer, text_30w, created_at)  # the kept note
QuizQuestion(id, explainer_id→Explainer, part_kind, prompt, correct_idx, options[jsonb])
QuizAttempt(id, user_id→User, explainer_id, score, answers jsonb, created_at)

Streak(user_id→User PK, current_len, longest_len, last_active_date)      # one row/user
IndustryProgress(id, user_id→User, industry_id→Industry, explainers_done, total_at_snapshot)

Track(id, slug, name, kind[sector|interview_kit], industry_id?, is_pro)  # Pro sector tracks/kits
TrackItem(id, track_id→Track, company_id→Company, order)
TrackProgress(id, user_id→User, track_id→Track, items_done)
Certificate(id, user_id→User, track_id→Track, issued_at, attests[track_completion])  # §PRD open item
```

**Integrity rules enforced at the DB / service layer:**
- `Figure.source_id` is **NOT NULL** and must reference a `Source` with a non-empty `period`. This is the hard rule as a constraint, not a convention.
- `Explainer` can only move to `published` if every `Figure` under it has a valid source and it has exactly 5 `ExplainerPart` rows (one per kind). Enforced in the review-gate transaction.
- `Streak` advance is idempotent per `last_active_date` (a Redis day-lock prevents double counting).

## 5. LLD — API surface (representative)

Auth required unless marked public. Pro-gated routes check entitlement (self Pro **or** active CampusMembership).

```
POST  /api/auth/otp/start            {phone}                       (public)
POST  /api/auth/otp/verify           {phone, code} → session       (public)

GET   /api/search?q=                 → [{slug,name,type,covered}]  (public, cached)
GET   /api/explainers/:slug          → explainer+parts+figures+sources (public read for Free)
                                        429 on rate limit; Pro content flagged

POST  /api/notes                     {explainer_id} → NoteCard     (creates 30-word note)
GET   /api/notebook?industry=        → grouped NoteCards           (offline-synced)

GET   /api/quiz/:explainer_id        → questions (no correct_idx)
POST  /api/quiz/:explainer_id/submit {answers} → {score} + advances streak

GET   /api/me/streak                 → {current_len,longest_len}
GET   /api/me/progress               → industry progress

GET   /api/tracks                    → tracks (Pro flagged)        (Pro to open items)
GET   /api/tracks/:slug              → track + items + progress    (Pro)
POST  /api/certificates/:track_slug  → Certificate                (Pro, on completion)

POST  /api/billing/subscribe         → Razorpay order/sub          (Pro)
POST  /api/webhooks/razorpay         (public, signature-verified) → updates Subscription

# Internal (admin role)
POST  /api/admin/explainers          create/edit draft
POST  /api/admin/explainers/:id/submit-review
POST  /api/admin/explainers/:id/publish   → runs review gate (fails if unsourced)
POST  /api/admin/campus/:id/members       bulk grant
```

## 6. LLD — key flows

**Review gate (publish transaction):**
```
BEGIN
  assert explainer has exactly 5 parts (SELLS,EARNS,SIZE,RIVALS,WATCH)
  assert every figure.source_id resolves and source.period is non-empty
  assert no body exceeds 3 lines
  if any assert fails → ROLLBACK, return 422 with the offending fields
  set status=published, published_at=now, reviewed_by=admin
COMMIT
invalidate Redis + CDN cache for slug
```

**Streak advance (on quiz submit):**
```
day = user_local_date (Asia/Kolkata)
acquire Redis lock streak:{user}:{day}  (idempotent)
if last_active_date == day: no-op
elif last_active_date == day-1: current_len += 1
else: current_len = 1
longest_len = max(longest_len, current_len); last_active_date = day
```

**Entitlement check (Pro routes):**
```
pro = Subscription.active(plan=pro) OR CampusMembership.active
if not pro → 402 + upgrade prompt (never a hard wall on Free content)
```

## 7. Non-functional requirements

- **Performance:** explainer payload < 50KB; first part interactive < 1s on 4G. Cache published explainers at CDN + Redis.
- **Offline:** the user's notebook and last-viewed explainers are available offline (service worker + IndexedDB).
- **Security:** row-level access (users read only their own notes/progress); Razorpay webhook signature verification; OTP rate limiting via Redis.
- **Privacy/compliance:** no stock data, no advice — educational only; store minimal PII (phone/email); comply with Indian data norms.
- **Observability:** PostHog funnels for the PRD §11 metrics; Sentry for errors.
- **Scale assumption (v1):** pilot-scale (hundreds–low thousands of users). Postgres FTS suffices; revisit search engine and read-replicas when the catalogue and traffic grow.

## 8. Build phasing (for Claude Code)

1. **Phase 0 — scaffold:** Next.js + TS + Tailwind (5 tokens), Prisma schema from §4, Auth.js OTP, Postgres + Redis, `CLAUDE.md`.
2. **Phase 1 — Free core:** search, explainer renderer (The Sixty screens, Brass line, source lines), note creation, quiz, streak. Seed ~20 companies (quick commerce + top listed) with real sourced figures via the CMS.
3. **Phase 2 — Habit + Pro:** progress-by-industry, sector tracks, interview kits, Razorpay ₹149 subscription, entitlements, certificates.
4. **Phase 3 — Campus:** campus admin, cohort licensing, bulk entitlement; wire the Masters' Union pilot and PostHog baselines.

## 9. Build guardrails (seed into CLAUDE.md)

- Never render a figure without `source` + `period`; a `Figure` with no `Source` is a build error, not a warning.
- Exactly five parts per explainer: SELLS · EARNS · SIZE · RIVALS · WATCH.
- Every explainer ends with a 30-word note and a quiz.
- Use only the five palette tokens; Brass is the only accent. Never red or green, no tickers, charts, or price UI.
- Dark screens for watching, Paper for keeping — implement as two theme contexts, not mixed.
- Keep the educational-only disclaimer in the footer and app shell.
- Do not add products, change the names, or change ₹149/month.
- Treat `STORE-KIT.md` and `PRD.md` as the source of truth for scope; this file for structure.

## 10. Open items (block the relevant phase until confirmed)

| Item | Blocks | Default used here |
|---|---|---|
| v1 platform: PWA vs native (Expo) | Phase 0 client | PWA |
| Campus price | Phase 3 billing copy | "On request" |
| Coverage wording ("every listed company") | Phase 1 search empty-state | Covered-only, honest empty-state |
| What the certificate attests | Phase 2 `Certificate.attests` | `track_completion` |
| OTP provider (MSG91 vs Twilio) | Phase 0 auth | MSG91 (India SMS) |
| Content authoring: who writes + review SLA | Phase 1 content | Internal CMS + admin review |

---

*Stack choices are recommendations with named swap paths, not mandates. Every number-bearing screen inherits the sourcing constraint from the data model up, so the credibility promise is enforced in code rather than left to discipline.*
