// Shared progress types and pure helpers, used by both the on-device store
// (src/lib/progress.ts, client) and the server mirror (src/lib/progress-server.ts).
// No "use client" and no browser APIs, so it is safe to import on the server.
import type { SourceDTO } from "./types";

export const LOCAL_USER_ID = "local";

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

export const EMPTY: ProgressState = {
  noteCards: [],
  quizAttempts: [],
  streak: { user_id: LOCAL_USER_ID, current_len: 0, longest_len: 0, last_active_date: null },
  industryProgress: [],
  explainers: {},
};

// Calendar date in India, as YYYY-MM-DD.
export const istDate = (d = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);

export const dayBefore = (day: string) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};

// A streak only counts as alive if it was extended today or yesterday.
export function liveStreak(s: Streak, today = istDate()) {
  const alive = s.last_active_date === today || s.last_active_date === dayBefore(today);
  return { length: alive ? s.current_len : 0, doneToday: s.last_active_date === today };
}
