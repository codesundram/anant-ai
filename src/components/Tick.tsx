export function Tick({ done }: { done: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center border ${done ? "border-brass bg-brass text-black-room" : "border-ash"}`}
    >
      {done ? "✓" : ""}
    </span>
  );
}
