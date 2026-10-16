// Validates one figures-overlay file: merges it on top of the base seed and
// every existing batch, then reports only problems on the overlay's slugs.
// Usage: npx tsx scripts/check-fig.ts content/batches/zfig-NNN.json
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { mergeSeeds, validateSeed } from "../src/lib/seed-validate";

const file = process.argv[2];
if (!file) {
  console.error("usage: npx tsx scripts/check-fig.ts <overlay.json>");
  process.exit(2);
}
const batchDir = "content/batches";
const batches = readdirSync(batchDir)
  .filter((f) => f.endsWith(".json") && join(batchDir, f) !== file)
  .sort()
  .map((f) => join(batchDir, f));
const overlay = JSON.parse(readFileSync(file, "utf8"));
const slugs = new Set<string>((overlay.companies ?? []).map((c: any) => c.slug));

const inputs = [
  { name: "base", data: JSON.parse(readFileSync("companies.seed.100.json", "utf8")) },
  ...batches.map((f) => ({ name: f, data: JSON.parse(readFileSync(f, "utf8")) })),
  { name: file, data: overlay },
];
const merged = mergeSeeds(inputs);
const { errors, warnings } = validateSeed(merged.raw);
const mine = (m: string) => [...slugs].some((s) => m.startsWith(`${s}:`)) || m.includes(file);

// Did the overlay actually attach a sourced figure to each slug it names?
const bySlug = new Map(merged.raw.companies.map((c: any) => [c.slug, c]));
const noFig: string[] = [];
for (const s of slugs) {
  const c = bySlug.get(s);
  if (!c) errors.push(`${file}: ${s} is not an existing company`);
  else if (!Array.isArray(c.figures) || c.figures.length === 0) noFig.push(s);
}

const myErrors = [...merged.errors.filter((e) => e.includes(file)), ...errors.filter(mine)];
const myWarnings = warnings.filter(mine);
for (const w of myWarnings) console.warn(`  - ${w}`);
for (const e of myErrors) console.error(`  ✗ ${e}`);
if (noFig.length) console.warn(`  note: ${noFig.length} slug(s) carry no figure after overlay: ${noFig.join(", ")}`);
console.log(`\n${file}: ${slugs.size} slugs, ${slugs.size - noFig.length} with figures, ${myErrors.length} error(s), ${myWarnings.length} warning(s).`);
process.exit(myErrors.length ? 1 : 0);
