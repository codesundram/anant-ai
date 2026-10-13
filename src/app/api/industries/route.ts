import { NextResponse } from "next/server";
import { getIndustryTotals } from "@/lib/catalogue";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getIndustryTotals());
}
