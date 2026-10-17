# Research brief: global (US / Europe) company explainers for ANANT

ANANT teaches how a company works in 60 seconds: five short parts, a 30-word note, a three-question quiz, plus up to two sourced figures. Education only — no stock tips, no buy/sell language.

You write ONE batch file of company explainers for a list of US/European/global targets, WITH figures in native currency where you can source them.

## Inputs / output
- Your list: `content/work/gfig-NNN-input.json` (given in your task). Each target: slug, name, type, market (us/eu/global-startup), industry slug, and (for US) `symbol` + `cik`.
- Format reference: read the first two entries of `content/batches/batch-001-part1.json` for the full v2 shape (parts, profile, quiz, note), and `companies.seed.100.json` (company "eternal") for the figure shape.
- Write to `content/batches/gbatch-NNN.json` → `{ "_meta": {...}, "companies": [ <v2 entries> ] }`.
- Check: from repo root `/Users/sundramkhorana/Anant.ai`, run `PATH=$HOME/.local/node/bin:$PATH npx tsx scripts/check-batch.ts content/batches/gbatch-NNN.json` until 0 errors. Keep scripts in your own scratchpad subfolder.
- Edit no other file. Save every ~8 companies so progress survives interruptions.

## Each entry (v2, WITH figures)
```json
{
  "v": 2, "slug": "<keep from input>", "name": "Apple", "type": "listed", "industry": "<allowed slug>",
  "profile": { "hq": "Cupertino, California, USA", "leader": "Tim Cook", "leader_role": "CEO", "as_of": "Oct 2026" },
  "parts": { "SELLS": "...", "EARNS": "...", "SIZE": "...", "RIVALS": "...", "WATCH": "..." },
  "figures": [
    { "label": "Revenue", "value": "391035", "unit": "$ million", "period": "FY24",
      "source": { "title": "Apple FY24 Form 10-K (SEC)", "doc_type": "annual_report", "period": "FY24", "url": "https://www.sec.gov/..." } },
    { "label": "Net income", "value": "93736", "unit": "$ million", "period": "FY24",
      "source": { "title": "Apple FY24 Form 10-K (SEC)", "doc_type": "annual_report", "period": "FY24", "url": "https://www.sec.gov/..." } }
  ],
  "quiz": [ 3 questions, 4 options each, correct_idx varied, part_kind from the parts ],
  "note_30w": "<=30 words, no unsourced amounts",
  "review": "unreviewed"
}
```

## Figures — native currency
- Up to two: Revenue (→ shows on SIZE) and net income/profit or net loss (→ EARNS). One figure per part; place by position, do not set part_kind.
- **Native currency, in millions**, value a plain number (no commas, no symbol): US `"$ million"`, UK `"£ million"`, euro-area `"€ million"`, Swiss `"CHF million"`. e.g. Apple revenue 391035 "$ million".
- Convert as-reported to millions if the filing is in thousands/billions; never convert BETWEEN currencies.
- **Period:** latest reported fiscal year, label it as the company reports (`FY24`, `FY2024`, or the calendar year `2024`). Same value in figure.period and source.period.
- **Sources:** US → SEC filings (10-K) via sec.gov/EDGAR (doc_type `annual_report`); the CIK is in your input. Also acceptable: the company's investor-relations results release, or stockanalysis.com / macrotrends with a clear period. Europe → the company's annual report / regulatory filing / IR page.
- Startups: figures ONLY where a reputable outlet reports them with a period; otherwise `"figures": []` and `"needs_figures": true`.
- If you cannot source a figure for a listed company either, set `"figures": []` and `"needs_figures": true` — never invent one.

## Parts / quiz / note (same rules as Indian batches)
- Each part 2–4 sentences (150–400 chars), plain English. SELLS=what it sells+recent change; EARNS=how it makes money + biggest segment/geography (qualitative); SIZE=how big in words (no numbers); RIVALS=real named competitors; WATCH=announced plans / live issues.
- NO amounts/percentages/counts in part bodies or the note (write qualitatively). No market language: buy, sell(as advice), hold, target price, rally, crash, returns(as investment), invest(as advice), multibagger, "beat the market", guaranteed.
- Verify the **current CEO and HQ on the web** before writing (leaders change). If unsure after trying, give your best and set `"as_of": "mid-2026, not re-checked"`.
- `industry` must be one of the allowed slugs; the input's guess is often coarse — correct it. Allowed: food-tech-quick-commerce, retail, beauty-ecommerce, fashion-ecommerce, fintech-payments, lending-fintech, insurtech, banking, eyewear-retail, fmcg, automobiles, it-services, pharma, telecom, ed-tech, logistics-delivery, travel-hospitality, energy-utilities, metals-materials, real-estate, saas, consumer-electronics-d2c, aviation, conglomerate, nbfc-lending, capital-markets, consumer-durables, chemicals, cement-building-materials, construction-infrastructure, capital-goods, oil-gas-fuels, healthcare-services, internet-classifieds, textiles-apparel, media-entertainment, consumer-services, semiconductors, biotech, aerospace-defense, internet-software, restaurants, luxury-goods.
- Quiz: exactly 3, plausible wrong options (real but wrong companies/products), vary correct_idx 0–3.

## Report (short)
File + checker result; companies given figures vs left needs_figures; leaders marked not re-checked; any figure you're unsure about (fiscal-year basis, segment vs consolidated).
