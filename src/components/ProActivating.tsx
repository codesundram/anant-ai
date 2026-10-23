"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

// After checkout the webhook sets Pro within a few seconds; re-check a few times.
export function ProActivating() {
  const router = useRouter();
  const tries = useRef(0);
  useEffect(() => {
    const id = setInterval(() => {
      tries.current += 1;
      router.refresh();
      if (tries.current >= 6) clearInterval(id);
    }, 4000);
    return () => clearInterval(id);
  }, [router]);
  return null;
}
