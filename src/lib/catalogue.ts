import { prisma } from "./db";
import type { PartKind } from "./constants";
import type { ExplainerDTO, QuizQuestionDTO, SearchResult, SourceDTO } from "./types";

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// Matching is done in memory so it behaves the same on SQLite and Postgres.
// Only published companies with a published explainer are ever returned.
export async function searchCompanies(q: string, limit = 20): Promise<SearchResult[]> {
  const rows = await prisma.company.findMany({
    where: { status: "published", explainers: { some: { status: "published" } } },
    select: { slug: true, name: true, type: true, industry: { select: { name: true } } },
    orderBy: { name: "asc" },
  });
  const needle = normalise(q);
  const ranked = rows
    .map((r) => {
      const hay = normalise(r.name);
      const slug = normalise(r.slug);
      let rank = -1;
      if (!needle) rank = 2;
      else if (hay.startsWith(needle) || slug.startsWith(needle)) rank = 0;
      else if (hay.split(" ").some((w) => w.startsWith(needle))) rank = 1;
      else if (hay.includes(needle) || slug.includes(needle)) rank = 2;
      return { r, rank };
    })
    .filter((x) => x.rank >= 0)
    .sort((a, b) => a.rank - b.rank);
  return ranked.slice(0, limit).map(({ r }) => ({
    slug: r.slug,
    name: r.name,
    type: r.type,
    industry: r.industry.name,
    covered: true,
  }));
}

export async function getExplainer(slug: string): Promise<ExplainerDTO | null> {
  const company = await prisma.company.findFirst({
    where: { slug, status: "published" },
    include: {
      industry: { include: { _count: { select: { companies: true } } } },
      explainers: {
        where: { status: "published" },
        orderBy: { version: "desc" },
        take: 1,
        include: {
          parts: { orderBy: { order: "asc" }, include: { figures: { include: { source: true } } } },
        },
      },
    },
  });
  const explainer = company?.explainers[0];
  if (!company || !explainer) return null;

  const sources = new Map<string, SourceDTO>();
  const parts = explainer.parts.map((p) => {
    const f = p.figures[0];
    // Belt and braces: the schema already forbids a figure without a source.
    const sourced = f && f.source && f.source.period && f.period ? f : null;
    const source: SourceDTO | null = sourced
      ? {
          id: sourced.source.id,
          title: sourced.source.title,
          doc_type: sourced.source.docType,
          period: sourced.source.period,
          url: sourced.source.url,
        }
      : null;
    if (source) sources.set(source.id, source);
    return {
      kind: p.kind as PartKind,
      order: p.order,
      body: p.body,
      figure:
        sourced && source
          ? { label: sourced.label, value: sourced.value, unit: sourced.unit, period: sourced.period, source }
          : null,
    };
  });

  return {
    id: explainer.id,
    slug: company.slug,
    name: company.name,
    type: company.type,
    industry: {
      slug: company.industry.slug,
      name: company.industry.name,
      total: company.industry._count.companies,
    },
    parts,
    note_30w: explainer.note30w,
    sources: [...sources.values()],
  };
}

export async function getQuiz(explainerId: string): Promise<QuizQuestionDTO[] | null> {
  const rows = await prisma.quizQuestion.findMany({
    where: { explainerId, explainer: { status: "published" } },
    orderBy: { order: "asc" },
  });
  if (rows.length === 0) return null;
  return rows.map((q) => ({
    id: q.id,
    part_kind: q.partKind as PartKind,
    prompt: q.prompt,
    options: JSON.parse(q.options) as string[],
  }));
}

export async function scoreQuiz(explainerId: string, answers: number[]) {
  const rows = await prisma.quizQuestion.findMany({
    where: { explainerId, explainer: { status: "published" } },
    orderBy: { order: "asc" },
    select: { correctIdx: true },
  });
  if (rows.length === 0) return null;
  const correct = rows.map((r) => r.correctIdx);
  return {
    score: correct.filter((c, i) => answers[i] === c).length,
    total: correct.length,
    correct,
  };
}

export async function getIndustryTotals() {
  const rows = await prisma.industry.findMany({
    select: { slug: true, name: true, _count: { select: { companies: true } } },
    orderBy: { name: "asc" },
  });
  return rows
    .filter((r) => r._count.companies > 0)
    .map((r) => ({ slug: r.slug, name: r.name, total: r._count.companies }));
}
