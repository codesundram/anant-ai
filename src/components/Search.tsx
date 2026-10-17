"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { SearchResult } from "@/lib/types";

export function Search({ initial, total }: { initial: SearchResult[]; total: number }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState(initial);
  const [settledQuery, setSettledQuery] = useState("");
  const latest = useRef(0);

  useEffect(() => {
    const query = q.trim();
    if (!query) {
      setResults(initial);
      setSettledQuery("");
      return;
    }
    const id = ++latest.current;
    const t = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok || id !== latest.current) return;
      setResults(await res.json());
      setSettledQuery(query);
    }, 120);
    return () => clearTimeout(t);
  }, [q, initial]);

  const searching = settledQuery.length > 0;

  return (
    <section>
      <label htmlFor="q" className="label">
        Search
      </label>
      <input
        id="q"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Type a company or startup"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="search"
        className="mt-2 h-[52px] w-full rounded-[4px] border border-ash bg-transparent px-4 font-display text-[18px] font-semibold text-fg transition-colors placeholder:font-sans placeholder:font-normal placeholder:text-ash focus:border-fg focus:outline-none"
      />

      {results.length === 0 && searching ? (
        <div className="mt-10" role="status">
          <p className="font-display text-[22px] font-semibold leading-tight">
            “{settledQuery}” isn’t covered yet.
          </p>
          <p className="mt-3 text-[16px] leading-[1.5] text-ash">
            We only show companies we have written and checked. Try another name.
          </p>
        </div>
      ) : (
        <>
          <p className="label mt-10" role="status">
            {searching ? `${results.length} found` : `${total} companies · type to search`}
          </p>
          <ul className="mt-2">
            {results.map((r) => (
              <li key={r.slug} className="border-t border-ash last:border-b">
                <Link
                  href={`/c/${r.slug}`}
                  prefetch={false}
                  className="row-link -mx-3 flex items-baseline justify-between gap-4 px-3 py-4"
                >
                  <span className="row-name font-display text-[18px] font-semibold">{r.name}</span>
                  <span className="shrink-0 text-right text-[12px] text-ash">{r.industry}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
