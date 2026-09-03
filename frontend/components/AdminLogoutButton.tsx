"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { adminLogout } from "@/lib/api";

export function AdminLogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await adminLogout();
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <Button type="button" variant="secondary" size="md" onClick={handleLogout} disabled={isLoggingOut}>
      {isLoggingOut ? "Saliendo…" : "Cerrar sesión"}
    </Button>
  );
}
