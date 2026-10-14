import {
  COMPANY_TYPES,
  DEFAULT_FIGURE_PARTS,
  INDUSTRIES,
  MIN_QUIZ_QUESTIONS,
  NOTE_WORDS,
  PART_KINDS,
  PART_MAX_CHARS,
  REVIEW_STATES,
  V2_QUIZ_QUESTIONS,
  type PartKind,
} from "./constants";

// A money amount or percentage: the kind of number that must carry a source.
const AMOUNT =
  /[₹$€£]\s?\d|\d[\d,.]*\s?(?:%|per ?cent\b|crore\b|cr\b|lakh\b|billion\b|million\b|trillion\b|bn\b|mn\b)/i;

// Market language the store kit bans outright. "invest" and "returns" only warn,
// since they have ordinary meanings ("invests in plants").
const BANNED = /\b(multibagger|target price|buy rating|sell rating|rally|rallied|crash(?:ed)?|beat the market|get rich|guaranteed returns)\b/i;
const CAUTION = /\b(invest(?:ing|ment|ments|or|ors)?|returns)\b/i;

export type SeedProfile = { hq: string; leader: string; leader_role: string; as_of: string };

export type SeedSource = { title: string; doc_type: string; period: string; url?: string };
export type SeedFigure = {
  label: string;
  value: string;
  unit: string;
  period: string;
  part_kind?: PartKind;
  source: SeedSource;
};
export type SeedQuestion = {
  prompt: string;
  options: string[];
  correct_idx: number;
  part_kind: PartKind;
};
export type SeedCompany = {
  slug: string;
  name: string;
  type: string;
  industry: string;
  parts: Record<PartKind, string>;
  figures: (SeedFigure & { part_kind: PartKind })[];
  quiz: SeedQuestion[];
  note_30w: string;
  needs_figures?: boolean;
  v?: number;
  profile?: SeedProfile;
  review?: (typeof REVIEW_STATES)[number];
};

const filled = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const isKind = (v: unknown): v is PartKind => PART_KINDS.includes(v as PartKind);

// Returns the companies with every figure assigned to a part, plus every
// problem found. Any error means nothing may be written.
export function validateSeed(raw: unknown): {
  companies: SeedCompany[];
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const list = (raw as { companies?: unknown })?.companies;
  if (!Array.isArray(list) || list.length === 0) {
    return { companies: [], errors: ["seed file has no `companies` array"], warnings };
  }

  const seen = new Set<string>();
  const companies: SeedCompany[] = [];

  list.forEach((c: any, i: number) => {
    const id = filled(c?.slug) ? c.slug : `companies[${i}]`;
    const err = (msg: string) => errors.push(`${id}: ${msg}`);

    if (!filled(c?.slug)) err("missing slug");
    else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(c.slug)) err("slug must be kebab-case");
    else if (seen.has(c.slug)) err("duplicate slug");
    else seen.add(c.slug);

    if (!filled(c?.name)) err("missing name");
    if (!COMPANY_TYPES.includes(c?.type)) err(`type "${c?.type}" is not one of ${COMPANY_TYPES.join(", ")}`);
    if (!(c?.industry in INDUSTRIES)) err(`industry "${c?.industry}" is not in the controlled list (src/lib/constants.ts)`);

    // Exactly five parts, one per kind.
    const partKeys = Object.keys(c?.parts ?? {});
    const missing = PART_KINDS.filter((k) => !partKeys.includes(k));
    const extra = partKeys.filter((k) => !isKind(k));
    if (partKeys.length !== PART_KINDS.length || missing.length || extra.length) {
      err(
        `needs exactly 5 parts (${PART_KINDS.join(", ")}); found ${partKeys.length}` +
          (missing.length ? `, missing ${missing.join(", ")}` : "") +
          (extra.length ? `, unknown ${extra.join(", ")}` : ""),
      );
    }
    for (const kind of PART_KINDS) {
      const body = c?.parts?.[kind];
      if (body === undefined) continue;
      if (!filled(body)) err(`part ${kind} is empty`);
      else {
        if (AMOUNT.test(body)) err(`part ${kind} states an amount with no source: "${body}"`);
        if (BANNED.test(body)) err(`part ${kind} uses banned market language: "${body.match(BANNED)?.[0]}"`);
        if (CAUTION.test(body)) warnings.push(`${id}: part ${kind} says "${body.match(CAUTION)?.[0]}"; check it isn't market language`);
        if (body.length > PART_MAX_CHARS) warnings.push(`${id}: part ${kind} is ${body.length} characters (limit ${PART_MAX_CHARS})`);
      }
    }

    // v2 entries carry a profile, a review state and exactly three questions.
    const v2 = c?.v === 2;
    if (v2) {
      const p = c.profile;
      if (!p || !filled(p.hq) || !filled(p.leader) || !filled(p.leader_role) || !filled(p.as_of)) {
        err("v2 entry needs profile.hq, profile.leader, profile.leader_role and profile.as_of");
      }
      if (!REVIEW_STATES.includes(c.review)) err(`review must be one of ${REVIEW_STATES.join(", ")}`);
    }

    // Figures: present ones must be fully sourced; absence must be declared.
    const figures = Array.isArray(c?.figures) ? c.figures : null;
    if (!figures) err("`figures` must be an array");
    const placed: (SeedFigure & { part_kind: PartKind })[] = [];
    if (figures) {
      if (figures.length === 0 && c.needs_figures !== true) {
        err("has no figures; set needs_figures: true to seed it without numbers");
      }
      if (figures.length > 0 && c.needs_figures === true) {
        err("has figures but is still marked needs_figures: true");
      }
      const used = new Set<PartKind>();
      figures.forEach((f: any, j: number) => {
        const where = `figure[${j}]${filled(f?.label) ? ` "${f.label}"` : ""}`;
        if (!filled(f?.label)) err(`${where} missing label`);
        if (!filled(f?.value) || !Number.isFinite(Number(f.value))) err(`${where} value must be a numeric string`);
        if (!filled(f?.unit)) err(`${where} missing unit`);
        if (!filled(f?.period)) err(`${where} missing period`);
        if (!f?.source || typeof f.source !== "object") err(`${where} missing source`);
        else {
          if (!filled(f.source.title)) err(`${where} source missing title`);
          if (!filled(f.source.period)) err(`${where} source missing period`);
          if (!filled(f.source.doc_type)) err(`${where} source missing doc_type`);
        }
        const kind: unknown = f?.part_kind ?? DEFAULT_FIGURE_PARTS[j];
        if (!isKind(kind)) {
          err(`${where} needs an explicit part_kind (only the first ${DEFAULT_FIGURE_PARTS.length} are placed by position)`);
          return;
        }
        if (used.has(kind)) err(`${where} is a second figure on ${kind}; one figure per screen`);
        used.add(kind);
        placed.push({ ...f, part_kind: kind });
      });
    }

    // Quiz.
    const quiz = Array.isArray(c?.quiz) ? c.quiz : [];
    if (v2 && quiz.length !== V2_QUIZ_QUESTIONS) err(`v2 entry needs exactly ${V2_QUIZ_QUESTIONS} quiz questions; found ${quiz.length}`);
    else if (quiz.length < MIN_QUIZ_QUESTIONS) err(`needs at least ${MIN_QUIZ_QUESTIONS} quiz questions; found ${quiz.length}`);
    quiz.forEach((q: any, j: number) => {
      const where = `quiz[${j}]`;
      if (!filled(q?.prompt)) err(`${where} missing prompt`);
      if (!isKind(q?.part_kind)) err(`${where} part_kind "${q?.part_kind}" is not a part`);
      if (!Array.isArray(q?.options) || q.options.length < 2 || !q.options.every(filled)) {
        err(`${where} needs at least 2 non-empty options`);
      } else {
        if (!Number.isInteger(q.correct_idx) || q.correct_idx < 0 || q.correct_idx >= q.options.length) {
          err(`${where} correct_idx is out of range`);
        }
        if (new Set(q.options).size !== q.options.length) err(`${where} has duplicate options`);
      }
    });

    // Note.
    if (!filled(c?.note_30w)) err("missing note_30w");
    else {
      const words = c.note_30w.trim().split(/\s+/).length;
      if (words > NOTE_WORDS) warnings.push(`${id}: note is ${words} words (limit ${NOTE_WORDS})`);
      if (AMOUNT.test(c.note_30w) && placed.length === 0) {
        err("note states an amount but the company has no sourced figure");
      }
      if (BANNED.test(c.note_30w)) err(`note uses banned market language: "${c.note_30w.match(BANNED)?.[0]}"`);
    }

    companies.push({ ...c, figures: placed });
  });

  return { companies, errors, warnings };
}

// Later batches overlay the base file by slug. An overlay that leaves out
// `figures` keeps the base entry's figures, so sourcing lives in one place.
export function mergeSeeds(files: { name: string; data: any }[]): { raw: { companies: any[] }; errors: string[] } {
  const errors: string[] = [];
  const bySlug = new Map<string, any>();
  for (const { name, data } of files) {
    const list = data?.companies;
    if (!Array.isArray(list)) {
      errors.push(`${name}: no \`companies\` array`);
      continue;
    }
    const seenHere = new Set<string>();
    for (const c of list) {
      const slug = c?.slug;
      if (typeof slug === "string") {
        if (seenHere.has(slug)) errors.push(`${name}: ${slug} appears twice in this file`);
        seenHere.add(slug);
      }
      const base = typeof slug === "string" ? bySlug.get(slug) : undefined;
      const merged = { ...c };
      if (base && !("figures" in c)) {
        merged.figures = base.figures;
        if (base.needs_figures !== undefined) merged.needs_figures = base.needs_figures;
      }
      bySlug.set(slug ?? `${name}#${bySlug.size}`, merged);
    }
  }
  return { raw: { companies: [...bySlug.values()] }, errors };
}
