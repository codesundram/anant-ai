import type { Metadata } from "next";
import Link from "next/link";
import { InfinityMark } from "@/components/InfinityMark";
import { PrintButton } from "@/components/PrintButton";
import { ProBadge } from "@/components/ProBadge";
import { Screen } from "@/components/Screen";
import { getProState } from "@/lib/pro";
import { getCertificate } from "@/lib/tracks";

export const metadata: Metadata = { title: "Certificate" };
export const dynamic = "force-dynamic";

export default async function CertificatePage({ params }: { params: { slug: string } }) {
  const { email } = await getProState();
  const cert = await getCertificate(params.slug, email);
  if (!cert) {
    return (
      <Screen theme="keep">
        <main className="column flex flex-1 flex-col justify-center py-20 text-center">
          <h1 className="font-display text-[26px] font-semibold">No certificate yet.</h1>
          <p className="mt-3 text-[16px] text-ash">Finish the track to earn it.</p>
          <Link href="/tracks" className="btn mx-auto mt-8 max-w-[320px]">
            Back to tracks
          </Link>
        </main>
      </Screen>
    );
  }
  const issued = new Date(cert.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  return (
    <Screen theme="keep">
      <div className="column flex items-center justify-between pt-6 print:hidden">
        <Link href="/tracks" className="lk text-[14px] text-ash">
          ‹ Tracks
        </Link>
        <ProBadge />
      </div>
      <main className="column flex flex-1 flex-col items-center justify-center py-12 text-center">
        {/* Double Brass frame */}
        <div className="w-full max-w-[580px] border border-ash p-2">
          <div className="border border-brass px-8 py-12">
            <div className="flex items-center justify-center gap-3">
              <InfinityMark className="w-[40px]" />
              <span className="font-display text-[22px] font-semibold tracking-[-0.01em]">ANANT</span>
            </div>
            <p className="mt-10 text-[12px] uppercase tracking-label text-brass">Certificate of completion</p>
            <p className="mt-8 font-serif text-[19px] italic text-ash">This certifies that</p>
            <p className="mt-2 font-display text-[22px] font-semibold">{cert.name ?? cert.email}</p>
            <p className="mt-6 font-serif text-[19px] italic text-ash">has completed the track</p>
            <p className="mt-2 font-display text-[28px] font-semibold leading-tight tracking-[-0.01em]">
              {cert.trackName}
            </p>
            <hr className="hairline mx-auto my-8 w-16 border-brass" />
            <p className="mx-auto max-w-[36em] text-[12px] leading-[1.6] text-ash">
              Attests completion of this track on ANANT. Educational only — not an accredited qualification.
            </p>
            <p className="mt-3 text-[12px] text-ash">Issued {issued}</p>
          </div>
        </div>
        <div className="mt-8 flex gap-3 print:hidden">
          <Link href="/tracks" className="btn-quiet">
            Back to tracks
          </Link>
          <PrintButton />
        </div>
      </main>
    </Screen>
  );
}
