import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { GetCertificate } from "@/components/GetCertificate";
import { Header } from "@/components/Header";
import { ProLocked } from "@/components/ProLocked";
import { Screen } from "@/components/Screen";
import { Tick } from "@/components/Tick";
import { TrackBar } from "@/components/TrackBar";
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
          <h1 className="font-display text-[30px] font-semibold leading-tight">This track is Pro.</h1>
          <ProLocked />
        </main>
        <Footer />
      </Screen>
    );
  }
  const t = await getTrack(params.slug, email);
  if (!t) notFound();
  return (
    <Screen theme="keep">
      <Header />
      <main className="column pt-14">
        <p className="label">{t.kind === "interview_kit" ? "Interview kit" : "Sector track"}</p>
        <h1 className="mt-2 font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.01em]">{t.name}</h1>
        {t.blurb && <p className="mt-2 text-[16px] leading-[1.5] text-ash">{t.blurb}</p>}
        <TrackBar done={t.done} total={t.total} />

        {t.complete && (
          <div className="mt-6">
            {t.certificateIssued ? (
              <Link href={`/certificate/${t.slug}`} className="btn max-w-[320px]">
                View your certificate
              </Link>
            ) : (
              <div className="max-w-[320px]">
                <GetCertificate trackSlug={t.slug} />
              </div>
            )}
          </div>
        )}

        <ul className="mt-8">
          {t.items.map((it, i) => (
            <li key={it.slug} className="border-t border-ash last:border-b">
              <Link href={`/c/${it.slug}`} className="row-link -mx-3 flex items-center gap-4 px-3 py-4">
                <Tick done={it.done} />
                <span className="w-6 shrink-0 text-[13px] text-ash tabular-nums">{i + 1}</span>
                <span className="row-name min-w-0 flex-1 font-display text-[17px] font-semibold">{it.name}</span>
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
