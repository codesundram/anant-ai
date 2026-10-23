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
      {/* Row 1: wordmark left, Pro status pinned top-right */}
      <div className="flex items-center justify-between gap-3">
        <Link href="/search" aria-label="ANANT home">
          <Wordmark className="w-[100px]" />
        </Link>
        {isPro ? <ProBadge /> : <GoPro className="lk text-[13px]" label="Go Pro" />}
      </div>
      {/* Row 2: nav */}
      <nav aria-label="Main" className="mt-4 flex items-center gap-5 text-[14px]">
        <Link href="/tracks" className="lk">
          Tracks
        </Link>
        <Link href="/notebook" className="lk">
          Notebook
        </Link>
        <Link href="/progress" className="lk">
          Progress
        </Link>
        <SignOutButton className="ml-auto" />
      </nav>
    </header>
  );
}
