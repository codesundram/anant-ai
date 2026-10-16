// Loads the seed file into the content tables.
//   npm run db:seed            validate, then replace all content
//   npm run db:check           validate only, write nothing
//   SEED_FILE=path npm run db:seed
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { INDUSTRIES, PART_KINDS } from "../src/lib/constants";
import { mergeSeeds, validateSeed } from "../src/lib/seed-validate";

// The base file, then every batch in content/batches in name order. Later
// entries replace earlier ones with the same slug.
const file = resolve(process.env.SEED_FILE ?? "companies.seed.100.json");
const batchDir = resolve(process.env.BATCH_DIR ?? "content/batches");
const checkOnly = process.argv.includes("--check");
const prisma = new PrismaClient();

async function main() {
  const batches = existsSync(batchDir)
    ? readdirSync(batchDir).filter((f) => f.endsWith(".json")).sort().map((f) => join(batchDir, f))
    : [];
  const sources = [file, ...batches];
  const merged = mergeSeeds(sources.map((f) => ({ name: f, data: JSON.parse(readFileSync(f, "utf8")) })));
  const checked = validateSeed(merged.raw);
  const errors = [...merged.errors, ...checked.errors];
  const { companies, warnings } = checked;
  console.log(`Reading ${sources.length} file(s): ${sources.map((f) => f.replace(process.cwd() + "/", "")).join(", ")}`);

  if (warnings.length) {
    console.warn(`\n${warnings.length} warning(s):`);
    for (const w of warnings) console.warn(`  - ${w}`);
  }
  if (errors.length) {
    console.error(`\nSEED FAILED — ${errors.length} error(s). Nothing was written.\n`);
    for (const e of errors) console.error(`  ✗ ${e}`);
    console.error("");
    process.exit(1);
  }

  const withFigures = companies.filter((c) => c.figures.length > 0).length;
  const summary = `${companies.length} companies (${withFigures} with figures, ${companies.length - withFigures} awaiting figures)`;
  if (checkOnly) {
    console.log(`\nSeed file is valid: ${summary}.`);
    return;
  }

  const sourceId = (s: { title: string; period: string; url?: string }) =>
    `src:${s.title}|${s.period}|${s.url ?? ""}`;
  const sourceRows = new Map<string, { id: string; title: string; docType: string; period: string; url: string | null }>();
  for (const c of companies) {
    for (const f of c.figures) {
      const id = sourceId(f.source);
      sourceRows.set(id, { id, title: f.source.title, docType: f.source.doc_type, period: f.source.period, url: f.source.url ?? null });
    }
  }

  const now = new Date();

  // Flatten into one array per table so each table loads with a bulk createMany.
  // A single nested-write-per-company transaction times out over a remote
  // Postgres (too many round-trips); bulk inserts are a handful of statements.
  const industries: any[] = Object.entries(INDUSTRIES).map(([slug, name]) => ({ id: slug, slug, name }));
  const sourceData: any[] = [...sourceRows.values()];
  const companyRows: any[] = [];
  const explainerRows: any[] = [];
  const partRows: any[] = [];
  const figureRows: any[] = [];
  const questionRows: any[] = [];

  for (const c of companies) {
    const explainerId = `${c.slug}-v1`;
    companyRows.push({
      id: c.slug,
      slug: c.slug,
      name: c.name,
      type: c.type,
      status: "published",
      review: c.review ?? "supplied",
      hq: c.profile?.hq ?? null,
      leader: c.profile?.leader ?? null,
      leaderRole: c.profile?.leader_role ?? null,
      profileAsOf: c.profile?.as_of ?? null,
      industryId: c.industry,
    });
    explainerRows.push({
      id: explainerId,
      companyId: c.slug,
      version: 1,
      status: "published",
      publishedAt: now,
      note30w: c.note_30w.trim(),
    });
    PART_KINDS.forEach((kind, order) => {
      const partId = `${explainerId}:${kind}`;
      partRows.push({ id: partId, explainerId, kind, order, body: c.parts[kind].trim() });
      for (const f of c.figures.filter((f) => f.part_kind === kind)) {
        figureRows.push({
          id: `${partId}:figure`,
          partId,
          label: f.label,
          value: f.value,
          unit: f.unit,
          period: f.period,
          sourceId: sourceId(f.source),
        });
      }
    });
    c.quiz.forEach((q, order) => {
      questionRows.push({
        id: `${explainerId}:q${order}`,
        explainerId,
        order,
        partKind: q.part_kind,
        prompt: q.prompt,
        correctIdx: q.correct_idx,
        options: JSON.stringify(q.options),
      });
    });
  }

  const chunk = <T,>(arr: T[], n: number): T[][] => {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
    return out;
  };

  // Clear existing content, FK-safe order.
  await prisma.figure.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.explainerPart.deleteMany();
  await prisma.explainer.deleteMany();
  await prisma.company.deleteMany();
  await prisma.source.deleteMany();
  await prisma.industry.deleteMany();

  // Insert in FK-safe order, chunked so each statement stays reasonable.
  await prisma.industry.createMany({ data: industries });
  await prisma.source.createMany({ data: sourceData });
  for (const part of chunk(companyRows, 500)) await prisma.company.createMany({ data: part });
  for (const part of chunk(explainerRows, 500)) await prisma.explainer.createMany({ data: part });
  for (const part of chunk(partRows, 1000)) await prisma.explainerPart.createMany({ data: part });
  for (const part of chunk(questionRows, 1000)) await prisma.quizQuestion.createMany({ data: part });
  for (const part of chunk(figureRows, 1000)) await prisma.figure.createMany({ data: part });

  console.log(`\nSeeded ${summary}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
