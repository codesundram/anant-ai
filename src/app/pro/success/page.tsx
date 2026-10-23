import type { Metadata } from "next";
import Link from "next/link";
import { ProActivating } from "@/components/ProActivating";
import { Screen } from "@/components/Screen";
import { getProState } from "@/lib/pro";

export const metadata: Metadata = { title: "Pro" };
export const dynamic = "force-dynamic";

export default async function ProSuccess() {
  const { isPro } = await getProState();
  return (
    <Screen theme="keep">
      <main className="column flex flex-1 flex-col justify-center py-20 text-center">
        {isPro ? (
          <>
            <p className="text-[12px] uppercase tracking-label text-brass">Welcome to Pro</p>
            <h1 className="mt-4 font-display text-[30px] font-semibold leading-tight">You’re a Pro member.</h1>
            <p className="mt-3 text-[16px] leading-[1.5] text-ash">Thanks for supporting ANANT.</p>
            <Link href="/search" className="btn mx-auto mt-10 max-w-[320px]">
              Back to ANANT
            </Link>
          </>
        ) : (
          <>
            <h1 className="font-display text-[26px] font-semibold leading-tight">Payment received.</h1>
            <p className="mt-3 text-[16px] leading-[1.5] text-ash">
              Activating your Pro access — this takes a few seconds. This page refreshes itself.
            </p>
            <Link href="/search" className="btn-quiet mx-auto mt-10 max-w-[320px]">
              Continue to ANANT
            </Link>
            <ProActivating />
          </>
        )}
      </main>
    </Screen>
  );
}
