// Validates one batch file on top of the base seed, without touching the
// database or other batches. Usage: npx tsx scripts/check-batch.ts <file>
import { readFileSync } from "node:fs";
import { mergeSeeds, validateSeed } from "../src/lib/seed-validate";

const file = process.argv[2];
if (!file) {
  console.error("usage: npx tsx scripts/check-batch.ts <batch.json>");
  process.exit(2);
}
const base = JSON.parse(readFileSync("companies.seed.100.json", "utf8"));
const batch = JSON.parse(readFileSync(file, "utf8"));
const merged = mergeSeeds([
  { name: "base", data: base },
  { name: file, data: batch },
]);
const slugs = new Set((batch.companies ?? []).map((c: any) => c.slug));
const { errors, warnings } = validateSeed(merged.raw);
const mine = (m: string) => [...slugs].some((s) => m.startsWith(`${s}:`)) || m.includes(file);
const myErrors = [...merged.errors, ...errors.filter(mine)];
const myWarnings = warnings.filter(mine);
for (const w of myWarnings) console.warn(`  - ${w}`);
for (const e of myErrors) console.error(`  ✗ ${e}`);
console.log(`\n${file}: ${slugs.size} companies, ${myErrors.length} error(s), ${myWarnings.length} warning(s).`);
process.exit(myErrors.length ? 1 : 0);
