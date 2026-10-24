import { NextResponse } from "next/server";
import { getProState } from "@/lib/pro";
import { saveServerNote } from "@/lib/progress-server";

export const dynamic = "force-dynamic";

// Mirror a kept note to the signed-in account. No-op when logged out.
export async function POST(request: Request) {
  const { email } = await getProState();
  if (!email) return NextResponse.json({ ok: false });
  try {
    const { explainerId, slug, text30w } = await request.json();
    if (typeof explainerId !== "string" || typeof slug !== "string" || typeof text30w !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    await saveServerNote(email, explainerId, slug, text30w);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
