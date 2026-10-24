"use client";

import Link from "next/link";
import { useEffect } from "react";
import { sourceLine } from "@/lib/format";
import { syncFromServer, useProgress } from "@/lib/progress";

export function Notebook() {
  const { noteCards, explainers } = useProgress();
  // Pull notes saved on other devices once on mount (no-op when logged out).
  useEffect(() => {
    void syncFromServer();
  }, []);

  if (noteCards.length === 0) {
    return (
      <div className="mt-6">
        <p className="text-[16px] leading-[1.5] text-ash">No notes yet. Watch one explainer and its note lands here.</p>
        <Link href="/search" className="btn mt-8">
          Start your first sixty
        </Link>
      </div>
    );
  }

  const groups = new Map<string, typeof noteCards>();
  for (const note of [...noteCards].reverse()) {
    const industry = explainers[note.explainer_id]?.industry_name ?? "Other";
    groups.set(industry, [...(groups.get(industry) ?? []), note]);
  }

  return (
    <>
      <p className="mt-3 text-[16px] text-ash">
        {noteCards.length} {noteCards.length === 1 ? "note" : "notes"} kept, by industry.
      </p>
      {[...groups.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([industry, notes]) => (
          <section key={industry} className="mt-12">
            <h2 className="label">
              {industry} · {notes.length}
            </h2>
            {notes.map((note) => {
              const ref = explainers[note.explainer_id];
              return (
                <article key={note.id} className="mt-3 border-t border-ash pt-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-[20px] font-semibold">{ref?.name ?? note.explainer_id}</h3>
                    {ref && (
                      <Link href={`/c/${ref.slug}`} className="shrink-0 text-[12px] text-ash underline underline-offset-4">
                        Watch again
                      </Link>
                    )}
                  </div>
                  <p className="mt-3 text-[17px] leading-[1.5]">{note.text_30w}</p>
                  {ref?.sources.map((s) => (
                    <p key={s.id} className="source-line mt-2">
                      {sourceLine(s)}
                    </p>
                  ))}
                </article>
              );
            })}
          </section>
        ))}
    </>
  );
}
