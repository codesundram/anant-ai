"use client";

import { Screen } from "@/components/Screen";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <Screen theme="watch">
      <main className="column flex flex-1 flex-col justify-center py-16">
        <h1 className="font-display text-[28px] font-semibold leading-tight">Something went wrong.</h1>
        <p className="mt-3 text-[16px] leading-[1.5] text-ash">Check your connection and try again.</p>
        <button type="button" className="btn mt-10" onClick={reset}>
          Try again
        </button>
      </main>
    </Screen>
  );
}
