"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { liveStreak, recordQuizAttempt, useProgress } from "@/lib/progress";
import type { ExplainerDTO, QuizQuestionDTO, QuizResult } from "@/lib/types";
import { StreakMark } from "./StreakMark";

// Each question keeps its options, shown in a shuffled order. `order[i]` is the
// original option index displayed at position i.
type Shuffled = QuizQuestionDTO & { order: number[] };

const shuffle = (n: number) => {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export function Quiz({ explainer }: { explainer: ExplainerDTO }) {
  const [questions, setQuestions] = useState<Shuffled[] | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState(false);
  const [sending, setSending] = useState(false);
  const progress = useProgress();

  useEffect(() => {
    let live = true;
    fetch(`/api/quiz/${encodeURIComponent(explainer.id)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((qs: QuizQuestionDTO[]) => {
        if (!live) return;
        setQuestions(qs.map((q) => ({ ...q, order: shuffle(q.options.length) })));
        setAnswers(qs.map(() => null));
      })
      .catch(() => live && setError(true));
    return () => {
      live = false;
    };
  }, [explainer.id]);

  const submit = async () => {
    const picked = answers as number[];
    setSending(true);
    setError(false);
    try {
      const res = await fetch(`/api/quiz/${encodeURIComponent(explainer.id)}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers: picked }),
      });
      if (!res.ok) throw new Error();
      const r: QuizResult = await res.json();
      recordQuizAttempt(explainer, picked, r.score);
      setResult(r);
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };

  const streak = liveStreak(progress.streak);
  const industry = progress.industryProgress.find((p) => p.industry_id === explainer.industry.slug);
  const ready = answers.length > 0 && answers.every((a) => a !== null);

  return (
    <main className="column flex flex-1 flex-col pb-8 pt-16">
      <p className="label">Quick quiz</p>
      <h1 className="mt-2 font-display text-[28px] font-semibold leading-[1.1] tracking-[-0.01em]">{explainer.name}</h1>

      {!questions && !error && <p className="mt-8 text-ash">Loading the quiz.</p>}

      {questions?.map((q, qi) => (
        <fieldset key={q.id} className="mt-10" disabled={!!result}>
          <legend className="text-[18px] leading-[1.4]">
            <span className="label mb-2 block">
              {qi + 1} of {questions.length} · {q.part_kind}
            </span>
            {q.prompt}
          </legend>
          <div className="mt-4 flex flex-col gap-2">
            {q.order.map((original) => {
              const chosen = answers[qi] === original;
              const isCorrect = result?.correct[qi] === original;
              const tone = result
                ? isCorrect
                  ? "border-brass"
                  : chosen
                    ? "border-ash text-ash"
                    : "border-ash text-ash"
                : chosen
                  ? "border-fg bg-fg text-bg"
                  : "border-ash";
              return (
                <label
                  key={original}
                  className={`flex min-h-[52px] cursor-pointer items-center justify-between gap-3 rounded-[4px] border px-4 py-3 text-[16px] leading-[1.35] ${tone}`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    className="sr-only"
                    checked={chosen}
                    onChange={() => setAnswers((a) => a.map((v, i) => (i === qi ? original : v)))}
                  />
                  <span>{q.options[original]}</span>
                  {result && isCorrect && (
                    <span className="shrink-0 text-[12px] uppercase tracking-label text-brass">
                      {chosen ? "✓ Correct" : "✓ Answer"}
                    </span>
                  )}
                  {result && chosen && !isCorrect && (
                    <span className="shrink-0 text-[12px] uppercase tracking-label">Your pick</span>
                  )}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      {error && (
        <p className="mt-6 text-[16px]" role="alert">
          That didn’t go through. Check your connection and try again.
        </p>
      )}

      {questions && !result && (
        <div className="mt-auto pt-12">
          <button type="button" className="btn disabled:opacity-40" disabled={!ready || sending} onClick={submit}>
            {sending ? "Checking" : "Check answers"}
          </button>
        </div>
      )}

      {result && (
        <section className="mt-12" aria-live="polite">
          <hr className="hairline mb-6" />
          <p className="text-[18px]">
            {result.score} of {result.total} right.
          </p>
          <p className="mt-5 flex items-center gap-3 font-display text-[22px] font-semibold">
            <StreakMark filled={streak.doneToday} />
            {streak.length}-day streak
          </p>
          {industry && (
            <p className="mt-3 text-[14px] text-ash">
              {explainer.industry.name}: {industry.explainers_done} of {industry.total_at_snapshot} done
            </p>
          )}
          <div className="mt-10 flex flex-col gap-3">
            <Link href="/" className="btn">
              Next company
            </Link>
            <Link href="/notebook" className="btn-quiet">
              Open notebook
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
