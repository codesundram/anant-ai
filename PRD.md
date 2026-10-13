# PRD — ANANT.AI

**Product Requirements Document · v1.0**
Owner: Sundram Khorana · Date: 13 Oct 2026 · Status: Draft for build
Source of truth for scope and claims: `STORE-KIT.md` (direction "The Sixty", locked)

---

## 1. Summary

ANANT.AI helps Indian MBA students and aspirants understand any Indian company in 60 seconds and remember what they learn. Each explainer covers five parts — what it sells, how it earns, how big it is, who it competes with, and what to watch — built from verified filings, strictly educational, with no stock tips. Every explainer leaves a 30-word note and a quick quiz, and streaks plus progress-by-industry turn one-off watching into a daily habit.

The wedge is the days before placements: a student with a list of company names and no time, who today pieces understanding together from 300-page annual reports and forgets it within a week.

**One-line definition:** A 60-second, sourced, five-part explainer for every Indian company, with a notebook and quiz that make it stick.

## 2. Problem

- Placement season or an interview is days away. Students have the company names but not the time.
- Current path is annual reports, news and YouTube — slow, dense, and forgotten within a week.
- The failure moment is the interview itself: "How does Zepto make money?" or "What's happening in quick commerce?" and they are unprepared.
- Credibility is fragile. One wrong figure repeated in an interview destroys trust in the source.

## 3. Goals and non-goals

**Goals**
- Let a user understand one company in ~60 seconds, from a sourced, five-part explainer.
- Make learning retained: a kept note and a quiz after every explainer.
- Build a daily habit via streaks and progress by industry.
- Convert interview-urgency into Pro; bring placement cells on board via Campus.

**Non-goals (v1)**
- No stock prices, charts, tickers, price targets, or buy/sell language — ever (also keeps it within SEBI's rules).
- Not a research terminal, a news feed, or a social/community product.
- No "every listed company" claim until coverage is actually complete.
- No certification accreditation, placement guarantees, or outcome claims.

## 4. Users and primary use case

| | |
|---|---|
| **Primary** | Indian MBA students and aspirants preparing for placements, interviews and group discussions |
| **Secondary** | Graduate students and early-career professionals moving into finance, consulting or strategy |
| **Context** | Busy, phone-first, need to know many companies quickly |

**Core journey (the moment):** Search a company → watch the 60-second explainer → keep a 30-word note → revise the notebook before the interview.

## 5. Scope — the three products

Prices in INR (₹). These are fixed per the store kit; do not add products, claims, prices or features.

### ANANT Free — ₹0
60-second explainers on Indian listed companies, notable startups and business models. Same five parts every time. Ends with a 30-word note saved to the notebook and a quick quiz. This is the audience-growth engine.

### ANANT Pro — ₹149 / month
Everything in Free, plus goal-specific material: interview prep kits, sector tracks, and certificates. Progress by industry. Built for the days before placements, when you need a whole sector, not one company.

### ANANT Campus — on request (per cohort)
A licence for placement cells to give a whole cohort access before placement season. Starting with a pilot at Masters' Union. *(Price pending founder confirmation.)*

## 6. Functional requirements

### 6.1 Explainer (the core unit)
- Five parts, fixed order: **SELLS · EARNS · SIZE · RIVALS · WATCH**. One idea per part.
- Full-screen vertical, one part per screen; five screens plus one note screen.
- A Brass progress line across the top counts down 60 seconds; each part holds ~10s.
- **Every figure shows its source and period on the same screen. If there is no source, the figure is not shown.** (Hard rule.)
- Dark screens for watching; the note/quiz/notebook switch to Paper (light) — "dark is for watching, Paper is for keeping."

### 6.2 Search
- Search a company, a notable startup, or a business model by name.
- Clear empty-state when a company isn't yet covered (no fabricated coverage).

### 6.3 Note (kept)
- A 30-word note is generated/saved to the user's notebook at the end of each explainer.
- Notebook is organised by industry for pre-interview revision.

### 6.4 Quiz
- A short quiz after each explainer, drawn from the five parts.
- Lightweight — reinforcement, not gamified scoring theatre.

### 6.5 Habit layer
- Streaks (a single Brass mark fills in — no confetti, coins, levels or leaderboards).
- Progress by industry, visible and simple.

### 6.6 Pro-only
- Interview prep kits, sector tracks (stacked company rows with a Brass tick when completed), certificates. A Brass hairline marks Pro content.

### 6.7 Campus
- Cohort-wide access administered through a placement cell; single-column, editorial offer with one CTA.

## 7. Content and data requirements

- Source of record is verified filings (e.g. annual reports). Each quantitative claim carries source + period.
- Strictly educational; no advice, recommendation, or forward-looking "target" language.
- A review step before publish: no unsourced number ships.
- Only approved factual claims per product (see store kit) appear in UI and marketing.

## 8. Design requirements (from locked direction "The Sixty")

**Palette (five, exactly):** Black Room `#0E0D0C` · Bone `#E8DFCF` · Paper `#F1EADC` · Ash `#7A746A` · Brass `#B8956A` (the only accent). Never red or green.

**Type:** Inter Tight Semibold for titles/figures (key figures 64–88px mobile); Instrument Serif Italic for at most one phrase per screen; Inter body ≤3 lines per part; uppercase letter-spaced labels in Ash.

**Feel:** Fast and calm — a smart friend briefing you before an interview. Low-key spotlight on dark; flat even light on Paper. No photography, no stock imagery, no company logos. Matte flat surfaces, hairline dividers, square-cornered full-width buttons. No glassmorphism, gradients, glows or badges.

**Motion:** Kinetic type cuts in ~150ms; 600ms fade from Black Room to Paper for the reward; note slides up and settles.

## 9. Non-negotiables

1. Every figure shows its source and period on the same screen, or it isn't shown.
2. Exactly five parts: sells, earns, size, rivals, watch.
3. Every explainer ends with something kept — a 30-word note and a quiz.
4. Five colours only; Brass is the only accent.
5. Dark is for watching, Paper is for keeping — no exceptions.
6. The educational-only disclaimer appears on the site and inside the app.
7. The three products, their names, and the ₹149/month Pro price are fixed.

## 10. Explicitly out (avoid list)

Stock prices, charts, candlesticks, tickers, market-cap movement indicators · red/green coding or up/down arrows · buy/sell/hold/target/"multibagger"/return or wealth language · "get rich"/"beat the market"/"guaranteed"/clickbait · dense tables or long reports · game-style gamification (coins, levels, loot boxes, leaderboards) · company logos, trader/office stock photos, glowing fintech dashboards · unsourced numbers · "every company" coverage claims until coverage is complete · claims of SEBI registration, certification accreditation, placement/job outcomes, or user counts.

## 11. Success metrics (proposed — confirm targets)

| Layer | Metric |
|---|---|
| Value | Explainer completion rate (watched to note screen) |
| Retention | % of explainers with note kept; quiz attempt rate; 7-day return |
| Habit | Active streak rate; explainers per active user per week |
| Monetisation | Free→Pro conversion; Pro monthly retention |
| Campus | Pilot cohort activation (Masters' Union); % of cohort active in placement window |

*Assumption: targets to be set after the Masters' Union pilot gives a baseline. Flagged rather than guessed.*

## 12. Open items (founder to confirm before build/publish)

1. **ANANT Campus price** — per-cohort figure, or keep "on request".
2. **Coverage wording** — brief said "every listed company"; kit uses "Indian listed companies, notable startups and business models" until coverage is complete. Confirm which claim ships.
3. **Certificates** — define what the certificate attests (e.g. track completion) so copy doesn't imply accreditation.
4. **Content pipeline** — who authors explainers, and the filings-to-publish review gate that enforces "no unsourced number ships".
5. **Platform for v1** — phone-first implies mobile web or app; confirm the build target.

## 13. Phasing (proposed)

- **Phase 1 — Free core:** search, five-part explainer with sourced figures, note, quiz, streak. Seed a starter set of high-demand companies (quick commerce, major listed names).
- **Phase 2 — Habit + Pro:** progress by industry, sector tracks, interview prep kits, ₹149 subscription, certificates.
- **Phase 3 — Campus:** admin for placement cells, cohort licensing; run the Masters' Union pilot and read the baseline metrics.

---

*Assumptions are stated, not guessed; uncertainties are flagged in §11–12. Nothing in this PRD adds products, claims, prices or features beyond the locked store kit.*
