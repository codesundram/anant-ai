import Link from "next/link";
import { BRAND } from "@/lib/constants";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label={`${BRAND} home`} className={`font-display font-semibold tracking-[-0.01em] ${className}`}>
      {BRAND}
    </Link>
  );
}
