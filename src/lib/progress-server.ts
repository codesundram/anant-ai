// Server-side mirror of the on-device progress in src/lib/progress.ts, kept in
// Prisma and keyed by the signed-in user's email (same convention as the Pro
// Completion table). The device stays the source of truth offline; these let a
// member's notes, quizzes and streak follow them across devices. Access is
// always scoped to the caller's own email — never trusted from the client.
import { prisma } from "./db";
import { getExplainer } from "./catalogue";
import type { ProgressState, NoteCard, QuizAttempt, Streak, IndustryProgress, ExplainerRef } from "./progress-shared";

// Calendar date in India, as YYYY-MM-DD (matches the client).
const istDate = (d = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);
const dayBefore = (day: string) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};

export async function getServerProgress(email: string): Promise<ProgressState> {
  const [notes, quizzes, streakRow, industries] = await Promise.all([
    prisma.progressNote.findMany({ where: { email }, orderBy: { createdAt: "asc" } }),
    prisma.progressQuiz.findMany({ where: { email }, orderBy: { createdAt: "asc" } }),
    prisma.progressStreak.findUnique({ where: { email } }),
    prisma.progressIndustry.findMany({ where: { email } }),
  ]);

  const noteCards: NoteCard[] = notes.map((n) => ({
    id: n.id,
    user_id: email,
    explainer_id: n.explainerId,
    text_30w: n.text30w,
    created_at: n.createdAt.toISOString(),
  }));
  const quizAttempts: QuizAttempt[] = quizzes.map((q) => ({
    id: q.id,
    user_id: email,
    explainer_id: q.explainerId,
    score: q.score,
    answers: q.answers,
    created_at: q.createdAt.toISOString(),
  }));
  const streak: Streak = streakRow
    ? {
        user_id: email,
        current_len: streakRow.currentLen,
        longest_len: streakRow.longestLen,
        last_active_date: streakRow.lastActiveDate,
      }
    : { user_id: email, current_len: 0, longest_len: 0, last_active_date: null };
  const industryProgress: IndustryProgress[] = industries.map((p) => ({
    id: p.id,
    user_id: email,
    industry_id: p.industrySlug,
    explainers_done: p.explainersDone,
    total_at_snapshot: p.totalAtSnapshot,
  }));

  // Rebuild the explainer refs (with live sources) for every slug we hold, so
  // the notebook can render notes and their sources exactly as it does offline.
  const slugs = Array.from(new Set([...notes, ...quizzes].map((r) => r.slug)));
  const explainers: Record<string, ExplainerRef> = {};
  const loaded = await Promise.all(slugs.map((s) => getExplainer(s)));
  for (const e of loaded) {
    if (!e) continue;
    explainers[e.id] = {
      explainer_id: e.id,
      slug: e.slug,
      name: e.name,
      industry_id: e.industry.slug,
      industry_name: e.industry.name,
      sources: e.sources,
    };
  }

  return { noteCards, quizAttempts, streak, industryProgress, explainers };
}

export async function saveServerNote(email: string, explainerId: string, slug: string, text30w: string) {
  await prisma.progressNote.upsert({
    where: { email_explainerId: { email, explainerId } },
    create: { email, explainerId, slug, text30w },
    update: { text30w },
  });
}

export async function saveServerQuiz(
  email: string,
  input: { explainerId: string; slug: string; industrySlug: string; industryTotal: number; score: number; answers: number[] },
) {
  const { explainerId, slug, industrySlug, industryTotal, score, answers } = input;
  const firstTime = (await prisma.progressQuiz.count({ where: { email, explainerId } })) === 0;

  await prisma.progressQuiz.create({ data: { email, explainerId, slug, score, answers } });

  // Advance the streak at most once per India day, same rule as the client.
  const today = istDate();
  const s = await prisma.progressStreak.findUnique({ where: { email } });
  if (!s || s.lastActiveDate !== today) {
    const currentLen = s && s.lastActiveDate === dayBefore(today) ? s.currentLen + 1 : 1;
    await prisma.progressStreak.upsert({
      where: { email },
      create: { email, currentLen, longestLen: currentLen, lastActiveDate: today },
      update: { currentLen, longestLen: Math.max(s?.longestLen ?? 0, currentLen), lastActiveDate: today },
    });
  }

  // Count the explainer towards its industry the first time it is completed.
  if (firstTime) {
    const row = await prisma.progressIndustry.findUnique({
      where: { email_industrySlug: { email, industrySlug } },
    });
    await prisma.progressIndustry.upsert({
      where: { email_industrySlug: { email, industrySlug } },
      create: { email, industrySlug, explainersDone: 1, totalAtSnapshot: industryTotal },
      update: { explainersDone: (row?.explainersDone ?? 0) + 1, totalAtSnapshot: industryTotal },
    });
  }
}
