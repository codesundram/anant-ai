import { NextResponse } from "next/server";
import { getProState } from "@/lib/pro";
import { saveServerQuiz } from "@/lib/progress-server";

export const dynamic = "force-dynamic";

// Mirror a quiz attempt (and the streak / industry count it advances) to the
// signed-in account. No-op when logged out.
export async function POST(request: Request) {
  const { email } = await getProState();
  if (!email) return NextResponse.json({ ok: false });
  try {
    const body = await request.json();
    const { explainerId, slug, industrySlug, industryTotal, score, answers } = body ?? {};
    if (
      typeof explainerId !== "string" ||
      typeof slug !== "string" ||
      typeof industrySlug !== "string" ||
      typeof industryTotal !== "number" ||
      typeof score !== "number" ||
      !Array.isArray(answers) ||
      !answers.every((a) => typeof a === "number")
    ) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    await saveServerQuiz(email, { explainerId, slug, industrySlug, industryTotal, score, answers });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
