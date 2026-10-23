import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProLocked } from "@/components/ProLocked";
import { Screen } from "@/components/Screen";
import { TrackBar } from "@/components/TrackBar";
import { getProState } from "@/lib/pro";
import { listTracks, type TrackSummary } from "@/lib/tracks";

export const metadata: Metadata = { title: "Tracks" };
export const dynamic = "force-dynamic";

function TrackCard({ t }: { t: TrackSummary }) {
  const complete = t.total > 0 && t.done === t.total;
  return (
    <li className="border-t border-ash last:border-b">
      <Link href={`/tracks/${t.slug}`} className="row-link -mx-3 block px-3 py-5">
        <div className="flex items-baseline justify-between gap-4">
          <span className="row-name font-display text-[19px] font-semibold">{t.name}</span>
          <span className="shrink-0 text-[12px] tabular-nums">
            {complete ? (
              <span className="uppercase tracking-label text-brass">✓ Complete</span>
            ) : (
              <span className="text-ash">
                {t.done}/{t.total}
              </span>
            )}
          </span>
        </div>
        {t.blurb && <p className="mt-1 text-[14px] leading-[1.4] text-ash">{t.blurb}</p>}
        <TrackBar done={t.done} total={t.total} />
      </Link>
    </li>
  );
}

export default async function TracksPage() {
  const { email, isPro } = await getProState();
  const { sectors, kits } = isPro ? await listTracks(email) : { sectors: [], kits: [] };
  return (
    <Screen theme="keep">
      <Header />
      <main className="column pt-14">
        <p className="text-[12px] uppercase tracking-label text-brass">ANANT Pro</p>
        <h1 className="mt-2 font-display text-[34px] font-semibold leading-[1.08] tracking-[-0.02em]">Tracks</h1>
        {isPro ? (
          <p className="mt-3 max-w-[34em] text-[16px] leading-[1.5] text-ash">
            Follow a path through a sector or an interview theme. Each company ticks in Brass once you’ve watched it and
            taken the quiz; finish a track to earn a certificate.
          </p>
        ) : null}

        {!isPro ? (
          <ProLocked />
        ) : (
          <>
            {kits.length > 0 && (
              <section className="mt-12">
                <h2 className="label border-t border-brass pt-4">Interview kits</h2>
                <ul className="mt-2">
                  {kits.map((t) => (
                    <TrackCard key={t.slug} t={t} />
                  ))}
                </ul>
              </section>
            )}
            <section className="mt-12">
              <h2 className="label border-t border-brass pt-4">Sector tracks</h2>
              <ul className="mt-2">
                {sectors.map((t) => (
                  <TrackCard key={t.slug} t={t} />
                ))}
              </ul>
            </section>
          </>
        )}
      </main>
      <Footer />
    </Screen>
  );
}
