export function TrackBar({ done, total }: { done: number; total: number }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="mt-3">
      <div className="h-[2px] w-full bg-ash" aria-hidden="true">
        <div className="h-[2px] bg-brass" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-[12px] text-ash tabular-nums">
        {done} of {total} done{done === total && total > 0 ? " · complete" : ""}
      </p>
    </div>
  );
}
