"use client";

import { useEffect, useRef, useState } from "react";
import { InfinityMark } from "./InfinityMark";

// Instagram-style open: a Black Room splash draws the infinity mark, holds,
// then scales and fades away to reveal the landing content beneath. Plays once
// per browser session; skipped on tap or for reduced-motion.
const SEEN_KEY = "anant.intro.seen";
const HOLD_MS = 1500; // draw (1200) + a short beat
const OUT_MS = 520;

export function Intro({ children }: { children: React.ReactNode }) {
  const [splash, setSplash] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [revealed, setRevealed] = useState(true);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      // storage blocked — treat as not seen, play once
    }
    if (reduce || seen) return; // content already shown, no splash

    setRevealed(false);
    setSplash(true);
    timers.current.push(
      setTimeout(() => {
        setLeaving(true);
        setRevealed(true); // content rises in as the splash clears
      }, HOLD_MS),
      setTimeout(() => {
        setSplash(false);
        try {
          sessionStorage.setItem(SEEN_KEY, "1");
        } catch {
          // ignore
        }
      }, HOLD_MS + OUT_MS),
    );
    return () => timers.current.forEach(clearTimeout);
  }, []);

  const skip = () => {
    timers.current.forEach(clearTimeout);
    setLeaving(true);
    setRevealed(true);
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // ignore
    }
    setTimeout(() => setSplash(false), OUT_MS);
  };

  const contentClass =
    "intro-content" + (splash && !revealed ? " intro-content--hidden" : "") + (revealed ? " intro-content--in" : "");

  return (
    <>
      <div className={contentClass}>{children}</div>
      {splash && (
        <div
          className={`splash ${leaving ? "splash--out" : ""}`}
          onClick={skip}
          role="button"
          aria-label="Skip intro"
          tabIndex={-1}
        >
          <InfinityMark className="w-[160px]" draw />
        </div>
      )}
    </>
  );
}
