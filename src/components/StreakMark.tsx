// The streak: a single Brass mark that fills in. Nothing else.
export function StreakMark({ filled, size = 20 }: { filled: boolean; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 border border-brass"
      style={{ width: size, height: size }}
    >
      {filled && <span className="streak-fill block h-full w-full bg-brass" />}
    </span>
  );
}
