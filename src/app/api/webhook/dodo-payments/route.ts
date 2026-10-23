import { Webhooks } from "@dodopayments/nextjs";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Flip the account's Pro status from Dodo subscription events. The account is
// keyed by email (metadata.user_email set at checkout, else the customer email).
async function setStatus(payload: unknown, status: string) {
  const d = (payload as { data?: Record<string, unknown> })?.data ?? {};
  const customer = (d.customer as { email?: string; customer_id?: string }) ?? {};
  const metadata = (d.metadata as { user_email?: string }) ?? {};
  const email = (metadata.user_email || customer.email || "").toLowerCase();
  if (!email) return;
  const end = (d.next_billing_date as string) || (d.current_period_end as string) || null;
  const currentPeriodEnd = end ? new Date(end) : null;
  const dodoSubscriptionId = (d.subscription_id as string) ?? null;
  const dodoCustomerId = customer.customer_id ?? null;
  await prisma.proSubscription.upsert({
    where: { email },
    create: { email, status, dodoSubscriptionId, dodoCustomerId, currentPeriodEnd },
    update: {
      status,
      dodoSubscriptionId: dodoSubscriptionId ?? undefined,
      dodoCustomerId: dodoCustomerId ?? undefined,
      currentPeriodEnd: currentPeriodEnd ?? undefined,
    },
  });
}

// Built lazily so the verifier isn't constructed at build time (no key yet).
export async function POST(request: Request) {
  const handler = Webhooks({
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY ?? "",
    onSubscriptionActive: (p) => setStatus(p, "active"),
    onSubscriptionRenewed: (p) => setStatus(p, "renewed"),
    onSubscriptionOnHold: (p) => setStatus(p, "on_hold"),
    onSubscriptionPaused: (p) => setStatus(p, "on_hold"),
    onSubscriptionCancelled: (p) => setStatus(p, "cancelled"),
    onSubscriptionExpired: (p) => setStatus(p, "expired"),
  });
  return handler(request as unknown as Parameters<typeof handler>[0]);
}
