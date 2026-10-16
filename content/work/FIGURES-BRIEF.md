# Research brief: adding sourced figures to ANANT.AI companies

Every number in ANANT.AI must show its source and period, or it does not ship. A wrong figure is the worst possible outcome. Accuracy beats coverage: it is better to leave a company without a figure than to guess.

You add revenue and profit/loss figures to companies that already exist in the app. You do NOT write parts, quizzes or notes — those are already written.

## Inputs and output

- Your list: `content/work/fig-NNN-input.json` (given in your task). Each row has slug, name, type.
- Format reference: the first company in `companies.seed.100.json` (e.g. "eternal") shows the exact figure shape.
- Write to `content/batches/zfig-NNN.json` (note the `zfig-` prefix so it loads last). Shape:
  ```json
  { "_meta": { "group": "fig-NNN", "generated": "2026-10-15" },
    "companies": [
      { "slug": "<existing slug, unchanged>", "needs_figures": false,
        "figures": [
          { "label": "Revenue from operations", "value": "15226.75", "unit": "₹ crore", "period": "FY25",
            "source": { "title": "Swiggy FY25 results (via Indian Retailer)", "doc_type": "annual_report", "period": "FY25",
                        "url": "https://..." } },
          { "label": "Net loss", "value": "3116.79", "unit": "₹ crore", "period": "FY25",
            "source": { "title": "...", "doc_type": "annual_report", "period": "FY25", "url": "https://..." } }
        ] }
    ] }
  ```
- Only include `slug`, `needs_figures: false` and `figures`. Do NOT repeat parts/quiz/note; the overlay merges onto the existing entry.
- Check it: from `/Users/sundramkhorana/Anant.ai`, run `PATH=$HOME/.local/node/bin:$PATH npx tsx scripts/check-fig.ts content/batches/zfig-NNN.json`. Fix every error and re-run until 0 errors.
- Edit no other file. Keep helper scripts in your own scratchpad subfolder (e.g. `scratchpad/figNNN/`), since the scratchpad is shared.

## The two figures

1. **Revenue** → goes on SIZE (first figure). Use the company's headline top line: "Revenue from operations", "Revenue", "Net sales", "Total income" (banks/NBFCs), "Gross revenue", "Turnover", "Gross premium" (insurers). Label it as the source labels it.
2. **Profit or loss** → goes on EARNS (second figure). "Net profit" / "Profit after tax" if profitable, "Net loss" if loss-making. For banks you may use "Net profit"; for life insurers "Profit after tax".
- One figure per part: at most these two. Place is automatic (1st→SIZE, 2nd→EARNS); do not set part_kind.
- If you can source revenue but not profit, include just revenue. One sourced figure is fine.

## Hard rules
1. **Every figure needs a real source with a period.** `source.title`, `source.period` and `source.doc_type` are required; include `url`. doc_type is one of: `annual_report`, `filing`, `results`.
2. **Unit is `₹ crore`.** Enter `value` as a plain number string in crore, no commas, no symbol (e.g. "20243", "527", "11110.5"). 1 lakh crore = 100000. If a source gives ₹ billion, × 100 to get crore (₹1 bn = ₹100 cr). If USD only, SKIP — do not convert currencies.
3. **Copy the figure as reported.** No rounding beyond the source, no estimates, no "approximately", no projections or targets.
4. **Period:** prefer FY25 (year ended 31 March 2025); FY26 if the full year is reported; FY24 acceptable if that is the latest filed. Put the same period in `figure.period` and `source.period`. FY = financial year ended 31 March.
5. **Match the figure to the company.** Use consolidated group numbers for the parent; do not mix a subsidiary's figure into the parent. Watch for same-name companies.
6. **Sources:** reputable business media reporting the company's filing/results is fine (Moneycontrol, Business Standard, Mint/LiveMint, BusinessLine, Economic Times, Entrackr, Inc42, company investor pages, screener.in, BSE/NSE). Avoid forums, unknown blogs, aggregator pages with no date.
7. **Startups (type "startup"):** add figures ONLY where a reputable outlet (Entrackr, Inc42, The Arc, Moneycontrol) has reported the startup's RoC/MCA annual accounts with a stated FY. Otherwise leave the company out.
8. **If you cannot source a figure, leave the company out of your overlay entirely.** Do not force it. It keeps `needs_figures: true`.

## Method
- Batch searches: "Company FY25 revenue profit results" for several companies per query. For listed names, screener.in and results coverage are quick. Verify the number appears in a dated, reputable source before writing it.
- Save your overlay file early and often (chunks of ~10), so progress survives an interruption.
- If web search starts refusing (rate limit), wait briefly and continue with fewer, broader searches.

## Final report (short)
- File written and checker result (slugs, how many got figures, errors).
- Companies you left without figures and why (no reliable source / USD only / unlisted with no reported accounts).
- Any figure you are unsure about (same-name risk, standalone vs consolidated, old period).
