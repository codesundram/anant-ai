// Loads the seed file into the content tables.
//   npm run db:seed            validate, then replace all content
//   npm run db:check           validate only, write nothing
//   SEED_FILE=path npm run db:seed
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { INDUSTRIES, PART_KINDS } from "../src/lib/constants";
import { validateSeed } from "../src/lib/seed-validate";

const file = resolve(process.env.SEED_FILE ?? "companies.seed.100.json");
const checkOnly = process.argv.includes("--check");
const prisma = new PrismaClient();

async function main() {
  const { companies, errors, warnings } = validateSeed(JSON.parse(readFileSync(file, "utf8")));

  if (warnings.length) {
    console.warn(`\n${warnings.length} warning(s):`);
    for (const w of warnings) console.warn(`  - ${w}`);
  }
  if (errors.length) {
    console.error(`\nSEED FAILED — ${errors.length} error(s) in ${file}. Nothing was written.\n`);
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
  const sources = new Map<string, { id: string; title: string; docType: string; period: string; url: string | null }>();
  for (const c of companies) {
    for (const f of c.figures) {
      const id = sourceId(f.source);
      sources.set(id, { id, title: f.source.title, docType: f.source.doc_type, period: f.source.period, url: f.source.url ?? null });
    }
  }

  const now = new Date();
  await prisma.$transaction(
    async (tx) => {
      await tx.figure.deleteMany();
      await tx.quizQuestion.deleteMany();
      await tx.explainerPart.deleteMany();
      await tx.explainer.deleteMany();
      await tx.company.deleteMany();
      await tx.source.deleteMany();
      await tx.industry.deleteMany();

      for (const [slug, name] of Object.entries(INDUSTRIES)) {
        await tx.industry.create({ data: { id: slug, slug, name } });
      }
      for (const s of sources.values()) await tx.source.create({ data: s });

      for (const c of companies) {
        const explainerId = `${c.slug}-v1`;
        await tx.company.create({
          data: {
            id: c.slug,
            slug: c.slug,
            name: c.name,
            type: c.type,
            status: "published",
            industryId: c.industry,
            explainers: {
              create: {
                id: explainerId,
                version: 1,
                status: "published",
                publishedAt: now,
                note30w: c.note_30w.trim(),
                parts: {
                  create: PART_KINDS.map((kind, order) => ({
                    id: `${explainerId}:${kind}`,
                    kind,
                    order,
                    body: c.parts[kind].trim(),
                    figures: {
                      create: c.figures
                        .filter((f) => f.part_kind === kind)
                        .map((f) => ({
                          id: `${explainerId}:${kind}:figure`,
                          label: f.label,
                          value: f.value,
                          unit: f.unit,
                          period: f.period,
                          sourceId: sourceId(f.source),
                        })),
                    },
                  })),
                },
                questions: {
                  create: c.quiz.map((q, order) => ({
                    id: `${explainerId}:q${order}`,
                    order,
                    partKind: q.part_kind,
                    prompt: q.prompt,
                    correctIdx: q.correct_idx,
                    options: JSON.stringify(q.options),
                  })),
                },
              },
            },
          },
        });
      }
    },
    { timeout: 120_000 },
  );

  console.log(`\nSeeded ${summary} from ${file}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
