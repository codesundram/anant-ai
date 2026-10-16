import { BRAND } from "@/lib/constants";

// The wordmark: "ANANT" in the surface's own foreground (Bone on dark, Black
// Room on Paper, via currentColor) and ".AI" in Brass. Presentational only —
// wrap it in a Link where it should navigate.
export function Wordmark({ className = "w-[130px]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 260 48"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={BRAND}
      className={`block h-auto ${className}`}
    >
      <text
        x="0"
        y="36"
        fontFamily="var(--font-display), 'Inter Tight', sans-serif"
        fontWeight="600"
        fontSize="40"
        letterSpacing="1"
        fill="currentColor"
      >
        ANANT<tspan fill="#B8956A">.AI</tspan>
      </text>
    </svg>
  );
}
