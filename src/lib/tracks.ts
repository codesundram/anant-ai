import { prisma } from "./db";

async function doneSet(email: string | null): Promise<Set<string>> {
  if (!email) return new Set();
  const rows = await prisma.completion.findMany({
    where: { email: email.toLowerCase() },
    select: { companySlug: true },
  });
  return new Set(rows.map((r) => r.companySlug));
}

export type TrackSummary = {
  slug: string;
  name: string;
  blurb: string | null;
  kind: string;
  total: number;
  done: number;
};

export async function listTracks(email: string | null): Promise<{ sectors: TrackSummary[]; kits: TrackSummary[] }> {
  const tracks = await prisma.track.findMany({ include: { items: true }, orderBy: [{ order: "asc" }] });
  const done = await doneSet(email);
  const map = (t: (typeof tracks)[number]): TrackSummary => ({
    slug: t.slug,
    name: t.name,
    blurb: t.blurb,
    kind: t.kind,
    total: t.items.length,
    done: t.items.filter((i) => done.has(i.companySlug)).length,
  });
  return {
    kits: tracks.filter((t) => t.kind === "interview_kit").map(map),
    sectors: tracks.filter((t) => t.kind === "sector").map(map),
  };
}

export type TrackDetail = {
  slug: string;
  name: string;
  blurb: string | null;
  kind: string;
  items: { slug: string; name: string; industry: string; done: boolean }[];
  total: number;
  done: number;
  complete: boolean;
  certificateIssued: boolean;
};

export async function getTrack(slug: string, email: string | null): Promise<TrackDetail | null> {
  const t = await prisma.track.findUnique({ where: { slug }, include: { items: { orderBy: { order: "asc" } } } });
  if (!t) return null;
  const done = await doneSet(email);
  const companies = await prisma.company.findMany({
    where: { slug: { in: t.items.map((i) => i.companySlug) } },
    select: { slug: true, name: true, industry: { select: { name: true } } },
  });
  const by = new Map(companies.map((c) => [c.slug, c]));
  const items = t.items.map((i) => ({
    slug: i.companySlug,
    name: by.get(i.companySlug)?.name ?? i.companySlug,
    industry: by.get(i.companySlug)?.industry.name ?? "",
    done: done.has(i.companySlug),
  }));
  const doneCount = items.filter((i) => i.done).length;
  const complete = items.length > 0 && doneCount === items.length;
  const cert = email
    ? await prisma.certificate.findUnique({ where: { email_trackSlug: { email: email.toLowerCase(), trackSlug: slug } } })
    : null;
  return { slug: t.slug, name: t.name, blurb: t.blurb, kind: t.kind, items, total: items.length, done: doneCount, complete, certificateIssued: !!cert };
}

// Issues the certificate only if the signed-in email has completed every item.
export async function issueCertificate(slug: string, email: string): Promise<boolean> {
  const t = await getTrack(slug, email);
  if (!t || !t.complete) return false;
  await prisma.certificate.upsert({
    where: { email_trackSlug: { email: email.toLowerCase(), trackSlug: slug } },
    create: { email: email.toLowerCase(), trackSlug: slug, name: email },
    update: {},
  });
  return true;
}

export async function getCertificate(slug: string, email: string | null) {
  if (!email) return null;
  const cert = await prisma.certificate.findUnique({
    where: { email_trackSlug: { email: email.toLowerCase(), trackSlug: slug } },
  });
  if (!cert) return null;
  const track = await prisma.track.findUnique({ where: { slug } });
  return { ...cert, trackName: track?.name ?? slug };
}
