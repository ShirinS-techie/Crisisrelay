"use client";

import { useState } from "react";
import { Radio, ClipboardList, LayoutDashboard, LucideIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import SOSFeedTab from "./SOSFeedTab";
import TriageTab from "./TriageTab";
import StatsTab from "./StatsTab";

type TabKey = "feed" | "triage" | "stats";

const tabs: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: "feed", label: "SOS Feed", icon: Radio },
  { key: "triage", label: "Triage", icon: ClipboardList },
  { key: "stats", label: "Coordinator", icon: LayoutDashboard },
];

export default function RightPanel({ onOfferHelp }: { onOfferHelp: () => void }) {
  const { lowBandwidth } = useStore();
  const [active, setActive] = useState<TabKey>("feed");

  return (
    <div className={`h-full flex flex-col rounded-xl ${lowBandwidth ? "no-glass" : "glass"}`}>
      <div className="flex border-b border-borderline">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium border-b-2 transition-colors"
              style={{
                borderColor: isActive ? "#22D3EE" : "transparent",
                color: isActive ? "#22D3EE" : "#7C8AA0",
              }}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {active === "feed" && <SOSFeedTab onOfferHelp={onOfferHelp} />}
        {active === "triage" && <TriageTab />}
        {active === "stats" && <StatsTab />}
      </div>
    </div>
  );
}
