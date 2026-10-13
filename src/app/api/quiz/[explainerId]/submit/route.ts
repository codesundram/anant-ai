import { NextResponse } from "next/server";
import { scoreQuiz } from "@/lib/catalogue";

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
  return NextResponse.json(result);
}
