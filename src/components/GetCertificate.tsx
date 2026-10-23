"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function GetCertificate({ trackSlug }: { trackSlug: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const claim = async () => {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/certificates/${encodeURIComponent(trackSlug)}`, { method: "POST" });
      if (!res.ok) throw new Error();
      router.push(`/certificate/${trackSlug}`);
    } catch {
      setErr("Couldn’t issue the certificate. Try again.");
      setBusy(false);
    }
  };
  return (
    <>
      <button type="button" className="btn" onClick={claim} disabled={busy}>
        {busy ? "Issuing" : "Get your certificate"}
      </button>
      {err && <p className="mt-2 text-[13px] text-ash">{err}</p>}
    </>
  );
}
