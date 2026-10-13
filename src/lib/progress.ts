"use client";

// On-device user progress for Phase 1. Record shapes mirror ARCHITECTURE.md §4
// so they can be posted to server tables unchanged once accounts exist.
import { useSyncExternalStore } from "react";
import type { ExplainerDTO, SourceDTO } from "./types";

export const LOCAL_USER_ID = "local";
const KEY = "anant.progress.v1";

export type NoteCard = { id: string; user_id: string; explainer_id: string; text_30w: string; created_at: string };
export type QuizAttempt = {
  id: string;
  user_id: string;
  explainer_id: string;
  score: number;
  answers: number[];
  created_at: string;
};
export type Streak = { user_id: string; current_len: number; longest_len: number; last_active_date: string | null };
export type IndustryProgress = {
  id: string;
  user_id: string;
  industry_id: string;
  explainers_done: number;
  total_at_snapshot: number;
};
// What the notebook needs to show a note offline, including its sources.
export type ExplainerRef = {
  explainer_id: string;
  slug: string;
  name: string;
  industry_id: string;
  industry_name: string;
  sources: SourceDTO[];
};

export type ProgressState = {
  noteCards: NoteCard[];
  quizAttempts: QuizAttempt[];
  streak: Streak;
  industryProgress: IndustryProgress[];
  explainers: Record<string, ExplainerRef>;
};

const EMPTY: ProgressState = {
  noteCards: [],
  quizAttempts: [],
  streak: { user_id: LOCAL_USER_ID, current_len: 0, longest_len: 0, last_active_date: null },
  industryProgress: [],
  explainers: {},
};

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

// Calendar date in India, as YYYY-MM-DD.
export const istDate = (d = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);

const dayBefore = (day: string) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};

// A streak only counts as alive if it was extended today or yesterday.
export function liveStreak(s: Streak, today = istDate()) {
  const alive = s.last_active_date === today || s.last_active_date === dayBefore(today);
  return { length: alive ? s.current_len : 0, doneToday: s.last_active_date === today };
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
}
