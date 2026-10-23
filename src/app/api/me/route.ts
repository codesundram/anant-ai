import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// The signed-in user's email, read server-side (not trusted from the client).
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return NextResponse.json({ email: user?.email ?? null });
  } catch {
    return NextResponse.json({ email: null });
  }
}
