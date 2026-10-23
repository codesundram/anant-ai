import { Checkout } from "@dodopayments/nextjs";

export const dynamic = "force-dynamic";

// Creates a Dodo hosted checkout session (built lazily so no key is needed at
// build). The client sends the signed-in user's email so the subscription
// binds to the right account. Returns { checkout_url }.
export async function POST(request: Request) {
  const handler = Checkout({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
    environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode") ?? "live_mode",
    type: "session",
  });
  return handler(request as unknown as Parameters<typeof handler>[0]);
}
