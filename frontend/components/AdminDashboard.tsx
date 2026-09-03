"use client";

import { useState } from "react";
import { CollaborationsReviewPanel } from "@/components/CollaborationsReviewPanel";
import { OwnerReviewDashboard } from "@/components/OwnerReviewDashboard";
import { cn } from "@/lib/cn";

const TABS = [
  { id: "quotes-pending", label: "Cotizaciones por aprobar" },
  { id: "quotes-approved", label: "Cotizaciones aprobadas" },
  { id: "collabs-pending", label: "Colaboraciones por aprobar" },
  { id: "collabs-approved", label: "Colaboraciones aprobadas" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AdminDashboard() {
  const [active, setActive] = useState<TabId>("quotes-pending");

  return (
    <div>
      <div
        role="tablist"
        aria-label="Secciones de administración"
        className="flex gap-1 overflow-x-auto border-b border-navy-20 sm:gap-2"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors sm:px-4",
              active === tab.id
                ? "border-magenta text-navy"
                : "border-transparent text-ink-soft hover:text-navy",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-8">
        {active === "quotes-pending" ? <OwnerReviewDashboard statusFilter="pending_review" /> : null}
        {active === "quotes-approved" ? <OwnerReviewDashboard statusFilter="approved" /> : null}
        {active === "collabs-pending" ? <CollaborationsReviewPanel statusFilter="pending" /> : null}
        {active === "collabs-approved" ? <CollaborationsReviewPanel statusFilter="approved" /> : null}
      </div>
    </div>
  );
}
