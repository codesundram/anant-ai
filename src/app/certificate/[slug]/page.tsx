import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { InfinityMark } from "@/components/InfinityMark";
import { PrintButton } from "@/components/PrintButton";
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
        <Header />
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
      <main className="column flex flex-1 flex-col items-center justify-center py-16 text-center">
        <div className="w-full max-w-[560px] border border-ash p-10">
          <div className="flex items-center justify-center gap-3">
            <InfinityMark className="w-[40px]" />
            <span className="font-display text-[22px] font-semibold">ANANT</span>
          </div>
          <p className="mt-10 text-[12px] uppercase tracking-label text-ash">Certificate of completion</p>
          <p className="mt-6 font-serif text-[20px] italic">This certifies that</p>
          <p className="mt-2 font-display text-[22px] font-semibold">{cert.name ?? cert.email}</p>
          <p className="mt-6 font-serif text-[20px] italic">completed the track</p>
          <p className="mt-2 font-display text-[26px] font-semibold leading-tight">{cert.trackName}</p>
          <hr className="hairline my-8" />
          <p className="text-[13px] leading-[1.5] text-ash">
            Attests completion of this track on ANANT. Educational only — not an accredited qualification.
          </p>
          <p className="mt-2 text-[12px] text-ash">Issued {issued}</p>
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
