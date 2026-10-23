import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { GetCertificate } from "@/components/GetCertificate";
import { Header } from "@/components/Header";
import { ProLocked } from "@/components/ProLocked";
import { Screen } from "@/components/Screen";
import { Tick } from "@/components/Tick";
import { getProState } from "@/lib/pro";
import { getTrack } from "@/lib/tracks";

export const metadata: Metadata = { title: "Track" };
export const dynamic = "force-dynamic";

export default async function TrackPage({ params }: { params: { slug: string } }) {
  const { email, isPro } = await getProState();
  if (!isPro) {
    return (
      <Screen theme="keep">
        <Header />
        <main className="column pt-14">
          <p className="text-[12px] uppercase tracking-label text-brass">ANANT Pro</p>
          <h1 className="mt-2 font-display text-[30px] font-semibold leading-tight">This track is Pro.</h1>
          <ProLocked />
        </main>
        <Footer />
      </Screen>
    );
  }
  const t = await getTrack(params.slug, email);
  if (!t) notFound();
  const pct = t.total ? Math.round((t.done / t.total) * 100) : 0;
  return (
    <Screen theme="keep">
      <Header />
      <main className="column pt-14">
        <Link href="/tracks" className="lk text-[13px] text-ash">
          ‹ All tracks
        </Link>
        <p className="label mt-6 text-brass">{t.kind === "interview_kit" ? "Interview kit" : "Sector track"}</p>
        <h1 className="mt-2 font-display text-[32px] font-semibold leading-[1.08] tracking-[-0.01em]">{t.name}</h1>
        {t.blurb && <p className="mt-2 text-[16px] leading-[1.5] text-ash">{t.blurb}</p>}

        <div className="mt-6">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-[22px] font-semibold tabular-nums">
              {t.done}
              <span className="text-ash"> / {t.total}</span>
            </span>
            <span className="text-[12px] uppercase tracking-label text-ash">{pct}% complete</span>
          </div>
          <div className="mt-3 h-[3px] w-full bg-ash" aria-hidden="true">
            <div className="h-[3px] bg-brass" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {t.complete && (
          <div className="mt-8 border border-brass p-5">
            <p className="text-[12px] uppercase tracking-label text-brass">Track complete</p>
            <p className="mt-2 text-[15px] leading-[1.5]">You’ve finished every company in this track.</p>
            <div className="mt-4 max-w-[320px]">
              {t.certificateIssued ? (
                <Link href={`/certificate/${t.slug}`} className="btn">
                  View your certificate
                </Link>
              ) : (
                <GetCertificate trackSlug={t.slug} />
              )}
            </div>
          </div>
        )}

        <ul className="mt-10">
          {t.items.map((it, i) => (
            <li key={it.slug} className="border-t border-ash last:border-b">
              <Link href={`/c/${it.slug}`} className="row-link -mx-3 flex items-center gap-4 px-3 py-4">
                <Tick done={it.done} />
                <span className="w-5 shrink-0 text-[13px] text-ash tabular-nums">{i + 1}</span>
                <span className={`row-name min-w-0 flex-1 font-display text-[17px] font-semibold ${it.done ? "text-ash" : ""}`}>
                  {it.name}
                </span>
                <span className="shrink-0 text-right text-[12px] text-ash">{it.industry}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </Screen>
  );
}
