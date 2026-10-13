"use client";

import { liveStreak, useProgress } from "@/lib/progress";
import { StreakMark } from "./StreakMark";

type IndustryTotal = { slug: string; name: string; total: number };

export function Progress({ industries }: { industries: IndustryTotal[] }) {
  const { streak, industryProgress } = useProgress();
  const live = liveStreak(streak);
  const done = (slug: string) => industryProgress.find((p) => p.industry_id === slug)?.explainers_done ?? 0;
  const rows = [...industries].sort((a, b) => done(b.slug) - done(a.slug) || a.name.localeCompare(b.name));

  return (
    <>
      <section className="mt-8">
        <p className="flex items-center gap-3 font-display text-[28px] font-semibold leading-none">
          <StreakMark filled={live.doneToday} size={24} />
          {live.length}-day streak
        </p>
        <p className="mt-3 text-[14px] leading-[1.5] text-ash">
          {live.doneToday
            ? "Today is done."
            : "Watch one explainer and take its quiz to count today."}{" "}
          Longest: {streak.longest_len} {streak.longest_len === 1 ? "day" : "days"}.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="label">Explainers completed, by industry</h2>
        <ul className="mt-3">
          {rows.map((r) => {
            const n = Math.min(done(r.slug), r.total);
            return (
              <li key={r.slug} className="border-t border-ash py-4 last:border-b">
                <div className="flex items-baseline justify-between gap-4">
                  <span className={`text-[16px] ${n ? "" : "text-ash"}`}>{r.name}</span>
                  <span className={`shrink-0 font-display text-[16px] font-semibold tabular-nums ${n ? "" : "text-ash"}`}>
                    {n} / {r.total}
                  </span>
                </div>
                {n > 0 && (
                  <div className="mt-3 h-[2px] bg-fg" style={{ width: `${(n / r.total) * 100}%` }} aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
