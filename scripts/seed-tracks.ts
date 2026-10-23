import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { INDUSTRIES } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  const companies = await prisma.company.findMany({ select: { slug: true, name: true, industryId: true } });
  const withFigures = new Set(
    (await prisma.figure.findMany({ select: { part: { select: { explainer: { select: { companyId: true } } } } } })).map(
      (f) => f.part.explainer.companyId,
    ),
  );
  const existing = new Set(companies.map((c) => c.slug));

  const trackRows: { id: string; slug: string; name: string; blurb: string | null; kind: string; industrySlug: string | null; isPro: boolean; order: number }[] = [];
  const itemRows: { id: string; trackId: string; companySlug: string; order: number }[] = [];

  const byIndustry = new Map<string, typeof companies>();
  for (const c of companies) (byIndustry.get(c.industryId) ?? byIndustry.set(c.industryId, []).get(c.industryId)!).push(c);
  let sOrder = 0;
  for (const [ind, cs] of byIndustry) {
    if (cs.length < 3) continue;
    const label = (INDUSTRIES as Record<string, string>)[ind] ?? ind;
    const sorted = [...cs].sort((a, b) => (withFigures.has(b.slug) ? 1 : 0) - (withFigures.has(a.slug) ? 1 : 0) || a.name.localeCompare(b.name));
    const id = `sector-${ind}`;
    trackRows.push({ id, slug: id, name: label, blurb: `Every ${label.toLowerCase()} company we cover.`, kind: "sector", industrySlug: ind, isPro: true, order: sOrder++ });
    sorted.forEach((c, i) => itemRows.push({ id: `${id}:${c.slug}`, trackId: id, companySlug: c.slug, order: i }));
  }
  const kits = JSON.parse(readFileSync("content/tracks.json", "utf8")).kits as { slug: string; name: string; blurb?: string; companies: string[] }[];
  let kOrder = 0;
  for (const k of kits) {
    const members = k.companies.filter((x) => existing.has(x));
    if (members.length < 2) continue;
    const id = `kit-${k.slug}`;
    trackRows.push({ id, slug: id, name: k.name, blurb: k.blurb ?? null, kind: "interview_kit", industrySlug: null, isPro: true, order: kOrder++ });
    members.forEach((x, i) => itemRows.push({ id: `${id}:${x}`, trackId: id, companySlug: x, order: i }));
  }

  await prisma.trackItem.deleteMany();
  await prisma.track.deleteMany();
  await prisma.track.createMany({ data: trackRows });
  for (let i = 0; i < itemRows.length; i += 1000) await prisma.trackItem.createMany({ data: itemRows.slice(i, i + 1000) });
  console.log(`Seeded ${trackRows.length} tracks (${itemRows.length} items), ${kits.length} kits defined.`);
  await prisma.$disconnect();
}
main();
