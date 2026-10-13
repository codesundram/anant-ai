import { NextResponse } from "next/server";
import { getQuiz } from "@/lib/catalogue";

export const dynamic = "force-dynamic";

// Questions only; the correct answers stay on the server until submit.
export async function GET(_req: Request, { params }: { params: { explainerId: string } }) {
  const questions = await getQuiz(params.explainerId);
  if (!questions) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(questions);
}
