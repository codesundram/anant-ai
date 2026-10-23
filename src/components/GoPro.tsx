import Link from "next/link";

// The "Go Pro" call-to-action. Opens the Pro features page, which carries the
// actual Subscribe button — so people see what they get before paying.
export function GoPro({ className, label = "Go Pro · ₹149/mo" }: { className?: string; label?: string }) {
  return (
    <Link href="/pro" className={className ?? "btn-quiet"}>
      {label}
    </Link>
  );
}
