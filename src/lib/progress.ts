"use client";

// On-device user progress. This is the source of truth on the device and works
// fully offline. When the viewer is signed in, each change is also mirrored to
// their account (src/lib/progress-server.ts via /api/progress), and syncFromServer
// pulls anything saved on another device. The server attaches records to the
// signed-in user and silently ignores writes from logged-out visitors.
import { useSyncExternalStore } from "react";
import type { ExplainerDTO } from "./types";
import {
  EMPTY,
  LOCAL_USER_ID,
  dayBefore,
  istDate,
  liveStreak,
} from "./progress-shared";
import type {
  ExplainerRef,
  IndustryProgress,
  NoteCard,
  ProgressState,
  QuizAttempt,
  Streak,
} from "./progress-shared";

export { LOCAL_USER_ID, istDate, liveStreak };
export type { ExplainerRef, IndustryProgress, NoteCard, ProgressState, QuizAttempt, Streak };

const KEY = "anant.progress.v1";

let cache: ProgressState | null = null;
const listeners = new Set<() => void>();

function read(): ProgressState {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? { ...EMPTY, ...(JSON.parse(raw) as ProgressState) } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: ProgressState) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private mode): keep working in memory.
  }
  listeners.forEach((l) => l());
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    read,
    () => EMPTY,
  );
}

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

// Mirror a change to the signed-in account. Fire-and-forget: the server scopes
// it to the caller and ignores it when logged out, so failures never block the UI.
function mirror(path: string, body: unknown) {
  try {
    void fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore
  }
}

const refOf = (e: ExplainerDTO): ExplainerRef => ({
  explainer_id: e.id,
  slug: e.slug,
  name: e.name,
  industry_id: e.industry.slug,
  industry_name: e.industry.name,
  sources: e.sources,
});

// Keeps the explainer's note. Watching again refreshes the text, never duplicates it.
export function keepNote(e: ExplainerDTO) {
  const s = read();
  const existing = s.noteCards.find((n) => n.explainer_id === e.id);
  const noteCards = existing
    ? s.noteCards.map((n) => (n === existing ? { ...n, text_30w: e.note_30w } : n))
    : [
        ...s.noteCards,
        { id: newId(), user_id: LOCAL_USER_ID, explainer_id: e.id, text_30w: e.note_30w, created_at: new Date().toISOString() },
      ];
  write({ ...s, noteCards, explainers: { ...s.explainers, [e.id]: refOf(e) } });
  mirror("/api/progress/note", { explainerId: e.id, slug: e.slug, text30w: e.note_30w });
}

// Records the attempt, advances the streak (once per India day) and counts the
// explainer towards its industry the first time it is completed.
export function recordQuizAttempt(e: ExplainerDTO, answers: number[], score: number) {
  const s = read();
  const firstTime = !s.quizAttempts.some((a) => a.explainer_id === e.id);
  const attempt: QuizAttempt = {
    id: newId(),
    user_id: LOCAL_USER_ID,
    explainer_id: e.id,
    score,
    answers,
    created_at: new Date().toISOString(),
  };

  const today = istDate();
  let streak = s.streak;
  if (streak.last_active_date !== today) {
    const current_len = streak.last_active_date === dayBefore(today) ? streak.current_len + 1 : 1;
    streak = { ...streak, current_len, longest_len: Math.max(streak.longest_len, current_len), last_active_date: today };
  }

  let industryProgress = s.industryProgress;
  if (firstTime) {
    const row = industryProgress.find((p) => p.industry_id === e.industry.slug);
    industryProgress = row
      ? industryProgress.map((p) =>
          p === row ? { ...p, explainers_done: p.explainers_done + 1, total_at_snapshot: e.industry.total } : p,
        )
      : [
          ...industryProgress,
          { id: newId(), user_id: LOCAL_USER_ID, industry_id: e.industry.slug, explainers_done: 1, total_at_snapshot: e.industry.total },
        ];
  }

  write({
    ...s,
    quizAttempts: [...s.quizAttempts, attempt],
    streak,
    industryProgress,
    explainers: { ...s.explainers, [e.id]: refOf(e) },
  });
  mirror("/api/progress/quiz", {
    explainerId: e.id,
    slug: e.slug,
    industrySlug: e.industry.slug,
    industryTotal: e.industry.total,
    score,
    answers,
  });
}

// Pull account progress saved on other devices and merge it into the local
// cache. Runs once per page load; safe when logged out (returns nothing).
let syncing: Promise<void> | null = null;
export function syncFromServer(): Promise<void> {
  if (syncing) return syncing;
  syncing = (async () => {
    try {
      const res = await fetch("/api/progress", { cache: "no-store" });
      if (!res.ok) return;
      const server = (await res.json()) as ProgressState;
      write(merge(read(), server));
    } catch {
      // offline or logged out: keep the local cache
    }
  })();
  return syncing;
}

// Union local and server progress. Notes are one per explainer; quiz attempts
// are deduped by id; the streak and each industry count take the higher value.
function merge(local: ProgressState, server: ProgressState): ProgressState {
  const notesByExplainer = new Map<string, NoteCard>();
  for (const n of [...server.noteCards, ...local.noteCards]) notesByExplainer.set(n.explainer_id, n);

  const attemptsById = new Map<string, QuizAttempt>();
  for (const a of [...server.quizAttempts, ...local.quizAttempts]) attemptsById.set(a.id, a);

  const industryById = new Map<string, IndustryProgress>();
  for (const p of [...server.industryProgress, ...local.industryProgress]) {
    const prev = industryById.get(p.industry_id);
    industryById.set(
      p.industry_id,
      prev ? { ...p, explainers_done: Math.max(prev.explainers_done, p.explainers_done) } : p,
    );
  }

  const streak =
    (server.streak.last_active_date ?? "") >= (local.streak.last_active_date ?? "") ? server.streak : local.streak;
  const longest = Math.max(server.streak.longest_len, local.streak.longest_len);

  return {
    noteCards: [...notesByExplainer.values()],
    quizAttempts: [...attemptsById.values()],
    streak: { ...streak, longest_len: longest },
    industryProgress: [...industryById.values()],
    explainers: { ...local.explainers, ...server.explainers },
  };
}
