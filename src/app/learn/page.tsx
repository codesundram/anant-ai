import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProLocked } from "@/components/ProLocked";
import { Screen } from "@/components/Screen";
import { getProState } from "@/lib/pro";
import { MODULES } from "@/lib/terms";

export const metadata: Metadata = { title: "Finance 101" };
export const dynamic = "force-dynamic";

export default async function LearnPage() {
  const { isPro } = await getProState();
  return (
    <Screen theme="keep">
      <Header />
      <main className="column pt-14">
        <p className="text-[12px] uppercase tracking-label text-brass">ANANT Pro</p>
        <h1 className="mt-2 font-display text-[34px] font-semibold leading-[1.08] tracking-[-0.02em]">Finance 101</h1>
        {!isPro ? (
          <ProLocked feature="finance" />
        ) : (
          <>
            <p className="mt-3 max-w-[34em] text-[16px] leading-[1.5] text-ash">
              Every term a finance interview throws at you, in plain English. Skim before the interview, or learn a
              module at a time.
            </p>
            <nav aria-label="Modules" className="mt-6 flex flex-wrap gap-x-4 gap-y-1">
              {MODULES.map((m) => (
                <a key={m.slug} href={`#${m.slug}`} className="lk text-[13px] text-ash">
                  {m.name}
                </a>
              ))}
            </nav>

            {MODULES.map((m) => (
              <section key={m.slug} id={m.slug} className="mt-12 scroll-mt-6">
                <h2 className="label border-t border-brass pt-4">{m.name}</h2>
                <p className="mt-1 text-[14px] leading-[1.4] text-ash">{m.blurb}</p>
                <dl className="mt-4">
                  {m.terms.map((t) => (
                    <div key={t.term} className="border-t border-ash py-4 last:border-b">
                      <dt className="font-display text-[17px] font-semibold">{t.term}</dt>
                      <dd className="mt-1 text-[15px] leading-[1.5] text-ash">{t.def}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </>
        )}
      </main>
      <Footer />
    </Screen>
  );
}
