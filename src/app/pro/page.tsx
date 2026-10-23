import type { Metadata } from "next";
import Link from "next/link";
import { InfinityMark } from "@/components/InfinityMark";
import { Screen } from "@/components/Screen";
import { SubscribeButton } from "@/components/SubscribeButton";
import { DISCLAIMER } from "@/lib/constants";
import { getProState } from "@/lib/pro";

export const metadata: Metadata = { title: "ANANT Pro" };
export const dynamic = "force-dynamic";

const FEATURES: [string, string][] = [
  ["Sector tracks", "Follow a path through any industry — every company ticks in Brass as you finish it."],
  ["Interview kits", "17 curated sets: Quick-commerce war, Magnificent Seven, Indian banks, the AI wave and more."],
  ["Finance 101", "56 finance-interview terms — valuation, returns, banking, unit economics — in plain English."],
  ["Certificates", "Earn a certificate of completion when you finish a track."],
  ["Progress by industry", "See how much of each sector you’ve covered, across your account."],
  ["The Pro badge", "A PRO mark on your account, everywhere you go in ANANT."],
];

export default async function ProPage() {
  const { isPro } = await getProState();
  return (
    <Screen theme="keep">
      <div className="column flex items-center justify-between pt-6">
        <Link href="/search" aria-label="ANANT home" className="flex items-center gap-2">
          <InfinityMark className="w-[32px]" />
          <span className="font-display text-[18px] font-semibold">ANANT</span>
        </Link>
        <Link href="/search" aria-label="Close" className="px-2 py-1 text-[22px] leading-none text-ash">
          ×
        </Link>
      </div>

      <main className="column pt-10">
        <p className="text-[12px] uppercase tracking-label text-brass">ANANT Pro</p>
        <h1 className="mt-3 font-display text-[32px] font-semibold leading-[1.08] tracking-[-0.02em]">
          Everything in Free,{" "}
          <span className="font-serif font-normal italic tracking-normal">plus the prep.</span>
        </h1>
        <p className="mt-3 max-w-[34em] text-[16px] leading-[1.5] text-ash">
          Built for the days before placements, when you need a whole sector — not one company.
        </p>

        <ul className="mt-10">
          {FEATURES.map(([name, desc]) => (
            <li key={name} className="flex gap-4 border-t border-ash py-5 last:border-b">
              <span className="mt-[6px] inline-block h-[10px] w-[10px] shrink-0 bg-brass" aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-display text-[18px] font-semibold">{name}</p>
                <p className="mt-1 text-[15px] leading-[1.5] text-ash">{desc}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <p className="font-display text-[24px] font-semibold">
            ₹149 <span className="text-[16px] font-normal text-ash">/ month</span>
          </p>
          {isPro ? (
            <div className="mt-5">
              <p className="text-[14px] uppercase tracking-label text-brass">✓ You’re a Pro member</p>
              <Link href="/tracks" className="btn mt-5 max-w-[360px]">
                Go to your tracks
              </Link>
            </div>
          ) : (
            <div className="mt-5 max-w-[360px]">
              <SubscribeButton className="btn w-full" />
              <p className="mt-3 text-center text-[13px] text-ash">Cancel anytime. Secure checkout by Dodo Payments.</p>
            </div>
          )}
        </div>

        <p className="mx-auto mt-16 max-w-[34em] pb-10 text-center text-[12px] leading-[1.5] text-ash">{DISCLAIMER}</p>
      </main>
    </Screen>
  );
}
