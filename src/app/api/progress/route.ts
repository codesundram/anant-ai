import { NextResponse } from "next/server";
import { getProState } from "@/lib/pro";
import { getServerProgress } from "@/lib/progress-server";
import { EMPTY } from "@/lib/progress-shared";

export const dynamic = "force-dynamic";

// The signed-in user's cloud progress, in the same shape as the on-device store.
// Logged-out callers get the empty state (never another user's data).
export async function GET() {
  const { email } = await getProState();
  if (!email) return NextResponse.json(EMPTY);
  try {
    return NextResponse.json(await getServerProgress(email));
  } catch {
    return NextResponse.json(EMPTY);
  }
}
