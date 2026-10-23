"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { EXPLAINER_SECONDS, PART_SECONDS, PART_TITLES } from "@/lib/constants";
import { formatFigure, sourceLine } from "@/lib/format";
import { keepNote } from "@/lib/progress";
import type { ExplainerDTO, FigureDTO } from "@/lib/types";
import { ProBadge } from "./ProBadge";
import { Quiz } from "./Quiz";

const TOTAL_MS = EXPLAINER_SECONDS * 1000;
const PART_MS = PART_SECONDS * 1000;
const HOLD_MS = 220;

type Phase = "watch" | "note" | "quiz";

// Rough width of the figure in ems, so long numbers scale down to fit the column.
const emWidth = (s: string) =>
  [...s].reduce((w, ch) => w + (/\d/.test(ch) ? 0.58 : /[.,]/.test(ch) ? 0.27 : 0.62), 0);

function Figure({ figure }: { figure: FigureDTO }) {
  const { number, unit } = formatFigure(figure);
  return (
    <div>
      <p
        className="whitespace-nowrap font-display font-semibold leading-none tracking-[-0.03em]"
        style={{ fontSize: `clamp(40px, calc((min(100vw, 480px) - 48px) / ${emWidth(number).toFixed(2)}), 88px)` }}
      >
        {number}
      </p>
      <p className="mt-3 text-[15px] leading-[1.4]">
        {[unit, figure.label, figure.period].filter(Boolean).join(" · ")}
      </p>
      {/* The source sits directly under the figure, on the same screen. */}
      <p className="source-line mt-1">{sourceLine(figure.source)}</p>
    </div>
  );
}

function Profile({ profile }: { profile: NonNullable<ExplainerDTO["profile"]> }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-t border-ash pt-4 text-[14px] leading-[1.4]">
      <dt className="label self-center">HQ</dt>
      <dd>{profile.hq}</dd>
      <dt className="label self-center">Leads</dt>
      <dd>
        {profile.leader}, {profile.leader_role}
        <span className="text-ash"> · as of {profile.as_of}</span>
      </dd>
    </dl>
  );
}

export function Player({ explainer, isPro = false }: { explainer: ExplainerDTO; isPro?: boolean }) {
  const [phase, setPhase] = useState<Phase>("watch");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const elapsed = useRef(0);
  const pausedRef = useRef(false);
  const line = useRef<HTMLDivElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const hold = useRef<{ timer: ReturnType<typeof setTimeout> | null; held: boolean }>({ timer: null, held: false });

  const paint = useCallback(() => {
    const left = Math.max(0, TOTAL_MS - elapsed.current);
    if (line.current) line.current.style.transform = `scaleX(${left / TOTAL_MS})`;
    const secs = Math.ceil(left / 1000);
    if (clock.current) clock.current.textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
  }, []);

  const seek = useCallback(
    (ms: number) => {
      elapsed.current = Math.max(0, ms);
      if (elapsed.current >= TOTAL_MS) {
        setPhase("note");
        return;
      }
      setIndex(Math.floor(elapsed.current / PART_MS));
      paint();
    },
    [paint],
  );

  const setPause = useCallback((v: boolean) => {
    pausedRef.current = v;
    setPaused(v);
  }, []);

  // The clock: one continuous sixty seconds across the five parts.
  useEffect(() => {
    if (phase !== "watch") return;
    let raf = 0;
    let last = performance.now();
    // The line and clock remount when returning from the note screen.
    paint();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      // A long gap means the tab was hidden; don't count it.
      if (!pausedRef.current && dt < 500) seek(elapsed.current + dt);
      if (elapsed.current < TOTAL_MS) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, seek, paint]);

  const step = useCallback(
    (dir: 1 | -1) => seek((Math.floor(elapsed.current / PART_MS) + dir) * PART_MS),
    [seek],
  );

  useEffect(() => {
    if (phase !== "watch") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === " ") {
        e.preventDefault();
        setPause(!pausedRef.current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, step, setPause]);

  // The note is kept the moment the explainer ends.
  useEffect(() => {
    if (phase === "note") keepNote(explainer);
  }, [phase, explainer]);

  const onPointerDown = () => {
    hold.current.held = false;
    hold.current.timer = setTimeout(() => {
      hold.current.held = true;
      setPause(true);
    }, HOLD_MS);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (hold.current.timer) clearTimeout(hold.current.timer);
    if (hold.current.held) {
      setPause(false);
      return;
    }
    if (pausedRef.current) {
      setPause(false);
      return;
    }
    const { left, width } = e.currentTarget.getBoundingClientRect();
    step(e.clientX - left < width / 3 ? -1 : 1);
  };
  const onPointerLeave = () => {
    if (hold.current.timer) clearTimeout(hold.current.timer);
    if (hold.current.held) setPause(false);
    hold.current.held = false;
  };

  // From the note screen, reopen the slides at the last part, paused, to reread it.
  const backToSlides = () => {
    elapsed.current = (explainer.parts.length - 1) * PART_MS;
    setIndex(explainer.parts.length - 1);
    setPause(true);
    setPhase("watch");
  };

  const part = explainer.parts[index];
  const watching = phase === "watch";
  const last = explainer.parts.length - 1;

  return (
    <div data-theme={watching ? "watch" : "keep"} className="screen reward flex flex-col">
      {watching ? (
        <>
          <div className="h-[2px] w-full" aria-hidden="true">
            <div ref={line} className="h-full w-full origin-left bg-brass" />
          </div>
          <header className="column flex items-center justify-between gap-4 pt-5">
            <div className="min-w-0">
              <p className="font-serif text-[22px] italic leading-none">{explainer.name}</p>
              {explainer.review === "unreviewed" && <p className="label mt-2">Draft · not yet reviewed</p>}
            </div>
            <div className="flex items-center gap-4">
              {isPro && <ProBadge />}
              <span ref={clock} className="label tabular-nums" aria-hidden="true">
                1:00
              </span>
              <Link href="/search" aria-label="Close explainer" className="-mr-2 px-2 py-1 text-[22px] leading-none text-ash">
                ×
              </Link>
            </div>
          </header>

          <div
            role="group"
            aria-roledescription="explainer"
            aria-label={`${explainer.name}: part ${index + 1} of ${explainer.parts.length}`}
            className="column flex flex-1 cursor-pointer select-none flex-col justify-center pb-10 pt-10"
            style={{ touchAction: "manipulation", WebkitTouchCallout: "none" }}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerLeave}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div key={part.kind} className="cut flex flex-col gap-6" aria-live="polite">
              <p className="label">
                {part.kind} · {index + 1}/{explainer.parts.length}
              </p>
              <h1 className="font-display text-[28px] font-semibold leading-[1.1] tracking-[-0.01em]">
                {PART_TITLES[part.kind]}
              </h1>
              {part.figure && <Figure figure={part.figure} />}
              <p className="text-[16px] leading-[1.5]">{part.body}</p>
              {part.kind === "SELLS" && explainer.profile && <Profile profile={explainer.profile} />}
            </div>
          </div>

          <nav aria-label="Slide controls" className="column grid grid-cols-3 gap-2 pb-6">
            <button
              type="button"
              className="btn-quiet disabled:opacity-40"
              onClick={() => step(-1)}
              disabled={index === 0}
            >
              ‹ Back
            </button>
            <button type="button" className="btn-quiet" onClick={() => setPause(!paused)} aria-pressed={paused}>
              {paused ? "Play" : "Pause"}
            </button>
            <button type="button" className="btn-quiet" onClick={() => step(1)}>
              {index === last ? "Finish ›" : "Next ›"}
            </button>
          </nav>
        </>
      ) : phase === "note" ? (
        <main className="column flex flex-1 flex-col pb-8 pt-16">
          <div className="settle flex flex-1 flex-col">
            <p className="flex items-center gap-2 text-[12px] uppercase tracking-label text-brass">
              <span className="inline-block h-[10px] w-[10px] bg-brass" aria-hidden="true" />
              Note saved
            </p>
            <h1 className="mt-6 font-display text-[28px] font-semibold leading-[1.1] tracking-[-0.01em]">
              {explainer.name}
            </h1>
            <p className="label mt-2">{explainer.industry.name}</p>
            <hr className="hairline my-6" />
            <p className="text-[18px] leading-[1.5]">{explainer.note_30w}</p>
            {explainer.sources.map((s) => (
              <p key={s.id} className="source-line mt-3">
                {sourceLine(s)}
              </p>
            ))}
            <div className="mt-auto flex flex-col gap-3 pt-12">
              <button type="button" className="btn" onClick={() => setPhase("quiz")}>
                Take the quick quiz
              </button>
              <button type="button" className="btn-quiet" onClick={backToSlides}>
                ‹ Back to the slides
              </button>
            </div>
          </div>
        </main>
      ) : (
        <Quiz explainer={explainer} />
      )}
    </div>
  );
}
