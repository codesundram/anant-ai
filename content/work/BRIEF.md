# Research brief: writing ANANT.AI explainers

ANANT.AI teaches Indian MBA students how a company works in 60 seconds: five short parts, a 30-word note and a three-question quiz. It is strictly educational: no stock tips, no prices, no buy/sell language.

You write one batch file of company explainers from a list of targets.

## Inputs and output

- Your target list: `content/work/batch-NNN-input.json` (given in your task). Each target has slug, name, type, a guessed `industry` slug and, for listed companies, NSE symbol and NSE industry.
- Format reference: read `content/batches/batch-001-part1.json` (the first two or three entries) and copy its structure exactly.
- Write your output to `content/batches/batch-NNN.json` with `_meta` and a `companies` array. Write it in chunks if needed, but the final file must be one valid JSON document.
- Check it: `PATH=$HOME/.local/node/bin:$PATH npx tsx scripts/check-batch.ts content/batches/batch-NNN.json` from the repo root `/Users/sundramkhorana/Anant.ai`. Fix every error and re-run until it reports 0 errors. Rewrite text that triggers a warning where you reasonably can.
- Do not edit any other file: not the base seed, not other batches, not code, not constants, not the database. Do not run the seed or git.

## Each entry

```json
{
  "v": 2, "slug": "...", "name": "...", "type": "listed|startup", "industry": "<allowed slug>",
  "profile": { "hq": "City, State", "leader": "Full Name", "leader_role": "MD & CEO", "as_of": "Oct 2026" },
  "parts": { "SELLS": "...", "EARNS": "...", "SIZE": "...", "RIVALS": "...", "WATCH": "..." },
  "figures": [],
  "needs_figures": true,
  "quiz": [ {"prompt":"...","options":["a","b","c","d"],"correct_idx":0,"part_kind":"SELLS"}, ... exactly 3 ... ],
  "note_30w": "...",
  "review": "unreviewed"
}
```

- Keep the target's `slug`. Fix the `name` to the company's common name (e.g. "Hindustan Aeronautics (HAL)"). Set `type` correctly: "listed" if its shares trade on NSE/BSE today, otherwise "startup".
- `industry` must be one of: food-tech-quick-commerce, retail, beauty-ecommerce, fashion-ecommerce, fintech-payments, lending-fintech, insurtech, banking, eyewear-retail, fmcg, automobiles, it-services, pharma, telecom, ed-tech, logistics-delivery, travel-hospitality, energy-utilities, metals-materials, real-estate, saas, consumer-electronics-d2c, aviation, conglomerate, nbfc-lending, capital-markets, consumer-durables, chemicals, cement-building-materials, construction-infrastructure, capital-goods, oil-gas-fuels, healthcare-services, internet-classifieds, textiles-apparel, media-entertainment, consumer-services. The guessed slug is often wrong (e.g. NSE "Services" was mapped to logistics); correct it. Never invent a new slug.
- Always `"figures": []` and `"needs_figures": true`. You are not adding figures.

### The five parts (each 2–4 sentences, 150–400 characters, plain English, second person optional)
- SELLS: what it actually sells, named brands/products, who buys. Mention a recent big change (merger, demerger, listing, rename) if there is one.
- EARNS: how it makes money, and its most profitable or largest segment or geography, stated qualitatively.
- SIZE: how big it is in words: "India's largest X", "one of the top Y". No numbers.
- RIVALS: real named competitors.
- WATCH: announced plans and live issues to follow: expansions, regulation, approvals, leadership change. State plans as announced facts, never as predictions or targets.

### Hard rules (the checker enforces most of these)
1. NO NUMBERS that are amounts, shares or counts in parts or the note: no ₹, $, %, crore, lakh, million, billion, no "40% share", no "500 stores", no "14 countries", no "25-year". Write qualitatively ("hundreds of stores", "most of its revenue", "long-term contracts"). Years as dates ("listed in 2024", "founded in 1995") and product names with digits ("XUV700", "5G") are fine.
2. Never use: buy, sell (as advice), hold, target price, multibagger, rally, crash, returns (as investment returns), invest/investment (as advice), "beat the market", "get rich", guaranteed. "Sells" as in "it sells cement" is fine.
3. No stock prices, market-cap movements, valuations or IPO price talk.
4. `note_30w`: one 20–30 word summary (count it; never over 30), no numbers.
5. Quiz: exactly 3 questions drawn from the parts (mix SELLS/EARNS/RIVALS/WATCH), 4 options each, plausible wrong options (real but wrong companies, brands or models, not jokes), and vary `correct_idx` across 0–3.
6. Accuracy over coverage. If you are not confident of a claim, leave it out.

### Leaders and HQ: check them
- My knowledge and yours go stale. Verify the current CEO/MD (or chairperson) and HQ for every company with web search before writing. Batch your searches (e.g. "MD and CEO of Siemens India, ABB India and Cummins India 2026"). Prefer company sites, exchange filings and reputable business press.
- Name the person who runs the company day to day (MD & CEO, CEO, or Chairman & MD for PSUs). If sources conflict, use the chairperson and their role.
- If you could not verify a leader after trying, still give your best-known leader but set `"as_of": "mid-2026, not re-checked"` so the app shows it honestly.
- If search starts refusing (rate limits), wait briefly and continue with fewer, broader searches.

### Skip, don't duplicate
Skip a target and list it in your report if it is: a brand or subsidiary of a company already in the app (e.g. a Tata brand), a company that no longer exists independently (merged/acquired and delisted), or a duplicate of another target. Companies already covered: see slugs in `companies.seed.100.json`.

## Your final report (keep it short)
- File written and checker result (companies, errors, warnings).
- Targets skipped and why.
- Leaders marked "not re-checked".
- Any industry you could not map well.
