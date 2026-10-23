"use client";

import { useState } from "react";

// Starts a Dodo hosted checkout for ANANT Pro. Reads the signed-in email from
// the server (/api/me), creates a checkout session, and redirects to Dodo.
export function SubscribeButton({ className, label = "Subscribe · ₹149 / month" }: { className?: string; label?: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const productId = process.env.NEXT_PUBLIC_DODO_PRO_PRODUCT_ID;

  const go = async () => {
    setBusy(true);
    setErr(null);
    try {
      const me = await fetch("/api/me").then((r) => r.json());
      if (!me.email) {
        window.location.href = "/?next=/pro";
        return;
      }
      if (!productId) {
        setErr("Pro isn’t configured yet.");
        setBusy(false);
        return;
      }
      const res = await fetch("/api/pro/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          product_cart: [{ product_id: productId, quantity: 1 }],
          customer: { email: me.email },
          metadata: { user_email: me.email },
        }),
      });
      if (!res.ok) throw new Error();
      const { checkout_url } = await res.json();
      if (!checkout_url) throw new Error();
      window.location.href = checkout_url;
    } catch {
      setErr("Couldn’t start checkout. Try again.");
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" onClick={go} disabled={busy} className={className ?? "btn"}>
        {busy ? "Opening checkout" : label}
      </button>
      {err && <p className="mt-2 text-center text-[13px] text-ash">{err}</p>}
    </>
  );
}
