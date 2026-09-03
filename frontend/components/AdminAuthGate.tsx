"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminMe } from "@/lib/api";

/**
 * Client-side convenience redirect only — the real access boundary is the
 * backend's session check on every /admin/* request (see app/auth.py).
 * This just avoids flashing the dashboard before that check comes back.
 */
export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "authenticated">("checking");

  useEffect(() => {
    let cancelled = false;
    getAdminMe().then((me) => {
      if (cancelled) return;
      if (me) setStatus("authenticated");
      else router.replace("/admin/login");
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (status !== "authenticated") return null;
  return <>{children}</>;
}
