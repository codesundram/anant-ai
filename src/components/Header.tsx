import Link from "next/link";
import { getProState } from "@/lib/pro";
import { GoPro } from "./GoPro";
import { ProBadge } from "./ProBadge";
import { SignOutButton } from "./SignOutButton";
import { Wordmark } from "./Wordmark";

export async function Header() {
  const { isPro } = await getProState();
  return (
    <header className="column pt-6">
      {/* Row 1: wordmark left; Pro status pinned top-right, then sign out */}
      <div className="flex items-center justify-between gap-3">
        <Link href="/search" aria-label="ANANT home">
          <Wordmark className="w-[100px]" />
        </Link>
        <div className="flex items-center gap-4">
          {isPro ? <ProBadge /> : <GoPro className="lk text-[13px]" label="Go Pro" />}
          <SignOutButton className="text-[13px]" />
        </div>
      </div>
      {/* Row 2: nav */}
      <nav aria-label="Main" className="mt-4 flex items-center gap-5 text-[14px]">
        <Link href="/tracks" className="lk">
          Tracks
        </Link>
        <Link href="/learn" className="lk">
          Learn
        </Link>
        <Link href="/notebook" className="lk">
          Notebook
        </Link>
        <Link href="/progress" className="lk">
          Progress
        </Link>
      </nav>
    </header>
  );
}
