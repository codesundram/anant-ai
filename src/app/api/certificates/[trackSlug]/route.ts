import { NextResponse } from "next/server";
import { getProState } from "@/lib/pro";
import { issueCertificate } from "@/lib/tracks";

export const dynamic = "force-dynamic";

// Issues a track-completion certificate for the signed-in Pro user.
export async function POST(_req: Request, { params }: { params: { trackSlug: string } }) {
  const { email, isPro } = await getProState();
  if (!email) return NextResponse.json({ error: "sign_in" }, { status: 401 });
  if (!isPro) return NextResponse.json({ error: "pro_only" }, { status: 402 });
  const ok = await issueCertificate(params.trackSlug, email);
  if (!ok) return NextResponse.json({ error: "not_complete" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
