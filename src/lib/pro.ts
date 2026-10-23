import { prisma } from "./db";
import { createClient } from "./supabase/server";

const ACTIVE = ["active", "renewed"];

export async function isProEmail(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const sub = await prisma.proSubscription.findUnique({ where: { email: email.toLowerCase() } });
  if (!sub || !ACTIVE.includes(sub.status)) return false;
  if (sub.currentPeriodEnd && sub.currentPeriodEnd.getTime() < Date.now()) return false;
  return true;
}

// Current signed-in user's email and whether they are Pro. Never throws.
export async function getProState(): Promise<{ email: string | null; isPro: boolean }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const email = user?.email ?? null;
    return { email, isPro: await isProEmail(email) };
  } catch {
    return { email: null, isPro: false };
  }
}
