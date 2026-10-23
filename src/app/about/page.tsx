import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { GoPro } from "@/components/GoPro";
import { getProState } from "@/lib/pro";
import { DISCLAIMER } from "@/lib/constants";

export const metadata: Metadata = { title: "About" };

// Copy on this page is the approved copy from STORE-KIT.md §4 and §7, unchanged.
const STEPS = [
  ["Search.", "Type a company, a startup or a business model."],
  ["Watch.", "Five parts in sixty seconds."],
  ["Keep.", "A 30-word note in your notebook, and a quick quiz."],
] as const;

export default async function AboutPage() {
  const { isPro } = await getProState();
  return (
    <Screen theme="keep">
      <Header />
      <main className="column pt-14">
        <h1 className="font-display text-[34px] font-semibold leading-[1.08] tracking-[-0.02em]">
          Understand any company in 60 seconds —{" "}
          <span className="font-serif font-normal italic tracking-normal">and keep what you learn.</span>
        </h1>

        <section className="mt-14">
          <h2 className="label">How it works</h2>
          <ol className="mt-3">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="flex gap-4 border-t border-ash py-4 last:border-b">
                <span className="font-display font-semibold text-ash">{i + 1}</span>
                <p className="text-[16px] leading-[1.5]">
                  <strong className="font-display font-semibold">{title}</strong> {text}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-[16px] leading-[1.5]">
            Numbers come from filings, with the source shown on screen.
          </p>
        </section>

        <section id="free" className="mt-14 scroll-mt-8">
          <h2 className="label">ANANT Free · ₹0</h2>
          <p className="mt-3 text-[16px] leading-[1.5]">
            60-second explainers on listed companies worldwide, notable startups and business models. Each explainer has
            the same five parts: what it sells, how it earns, how big it is, who it competes with, and what to watch.
            It ends with a 30-word note saved to your notebook and a quick quiz.
          </p>
          <Link href="/search" className="btn mt-6">
            Start your first sixty
          </Link>
        </section>

        <section id="pro" className="mt-14 scroll-mt-8 border-t border-brass pt-6">
          <h2 className="label">ANANT Pro · ₹149 / month</h2>
          <p className="mt-3 text-[16px] leading-[1.5]">
            <em className="font-serif text-[20px]">Interview ready.</em> Prep kits, sector tracks and certificates. ₹149
            a month.
          </p>
          {isPro ? (
            <p className="mt-5 text-[14px] uppercase tracking-label text-brass">✓ You’re a Pro member</p>
          ) : (
            <div className="mt-6">
              <GoPro />
            </div>
          )}
        </section>

        <section id="campus" className="mt-14 scroll-mt-8">
          <h2 className="label">ANANT Campus · On request</h2>
          <p className="mt-3 text-[16px] leading-[1.5]">
            <em className="font-serif text-[20px]">For placement cells.</em> Give your whole cohort a head start,
            starting with a pilot at Masters’ Union.
          </p>
          <p className="mt-3 text-[14px] text-ash">Not open yet.</p>
        </section>

        <section id="disclaimer" className="mt-14 scroll-mt-8">
          <h2 className="label">Disclaimer</h2>
          <p className="mt-3 text-[16px] leading-[1.5]">{DISCLAIMER}</p>
        </section>
      </main>
      <Footer />
    </Screen>
  );
}
