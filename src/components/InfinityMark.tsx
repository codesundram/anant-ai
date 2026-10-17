// A single continuous line tracing an infinity (∞) — the brand mark for
// "Anant" (endless). Brass stroke on no fill. `draw` enables the self-drawing
// animation (handled in globals.css via the .infinity-draw wrapper class).
export function InfinityMark({ className = "w-[150px]", draw = false }: { className?: string; draw?: boolean }) {
  return (
    <svg
      viewBox="0 0 100 50"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="ANANT"
      className={`block h-auto ${draw ? "infinity-draw" : ""} ${className}`}
    >
      <path
        d="M50 25 C 62 6, 96 6, 96 25 C 96 44, 62 44, 50 25 C 38 6, 4 6, 4 25 C 4 44, 38 44, 50 25 Z"
        fill="none"
        stroke="var(--brass)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
      />
    </svg>
  );
}
