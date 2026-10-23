import { NextResponse } from "next/server";
import { scoreQuiz } from "@/lib/catalogue";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Scores the attempt. Streak and progress are recorded on the device in Phase 1.
export async function POST(req: Request, { params }: { params: { explainerId: string } }) {
  const body = await req.json().catch(() => null);
  const answers = body?.answers;
  if (!Array.isArray(answers) || !answers.every((a) => Number.isInteger(a))) {
    return NextResponse.json({ error: "answers must be an array of option indexes" }, { status: 400 });
  }
  const result = await scoreQuiz(params.explainerId, answers);
  if (!result) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Record a server-side completion for the signed-in account (powers Pro tracks).
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const email = user?.email?.toLowerCase();
    if (email) {
      const companySlug = params.explainerId.replace(/-v\d+$/, "");
      await prisma.completion.upsert({
        where: { email_companySlug: { email, companySlug } },
        create: { email, companySlug },
        update: {},
      });
    }
  } catch {
    // never block quiz scoring on completion recording
  }

  return NextResponse.json(result);
}
