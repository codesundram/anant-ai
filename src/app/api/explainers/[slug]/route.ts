import { NextResponse } from "next/server";
import { getExplainer } from "@/lib/catalogue";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const explainer = await getExplainer(params.slug);
  if (!explainer) return NextResponse.json({ error: "not_covered" }, { status: 404 });
  return NextResponse.json(explainer);
}
