"use client";

import { Radio, Battery, Waves, Flame, ZapOff, Siren, LucideIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { CRISIS_META } from "@/lib/seedData";
import { CrisisType, Role } from "@/lib/types";

const crisisIcons: Record<CrisisType, LucideIcon> = {
  flood: Waves,
  wildfire: Flame,
  outage: ZapOff,
};

const roleLabels: Record<Role, string> = {
  citizen: "Citizen",
  volunteer: "Volunteer / First Responder",
  coordinator: "Relief Coordinator",
};

export default function Navbar({ onBroadcast }: { onBroadcast: () => void }) {
  const { role, setRole, crisis, setCrisis, lowBandwidth, toggleLowBandwidth } =
    useStore();
  const meta = CRISIS_META[crisis];

  return (
    <header
      className={`sticky top-0 z-30 flex flex-wrap items-center gap-3 px-4 py-3 md:px-6 ${
        lowBandwidth ? "no-glass" : "glass"
      }`}
      style={{ borderBottom: `1px solid ${lowBandwidth ? "#334155" : "#1E293B"}` }}
    >
      <div className="flex items-center gap-2 mr-2">
        <Radio size={20} style={{ color: lowBandwidth ? "#E2E8F0" : meta.accent }} />
        <span className="font-display font-semibold text-lg tracking-tight">
          CrisisRelay
        </span>
      </div>

      {/* Crisis switcher */}
      <div className="flex items-center gap-1 bg-black/20 rounded-lg p-1 border border-borderline">
        {(Object.keys(CRISIS_META) as CrisisType[]).map((c) => {
          const Icon = crisisIcons[c];
          const active = c === crisis;
          const m = CRISIS_META[c];
          return (
            <button
              key={c}
              onClick={() => setCrisis(c)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              style={{
                backgroundColor: active && !lowBandwidth ? m.accentSoft : "transparent",
                color: active ? (lowBandwidth ? "#fff" : m.accent) : "#7C8AA0",
                border: active && lowBandwidth ? "1px solid #E2E8F0" : "1px solid transparent",
              }}
              aria-pressed={active}
            >
              <Icon size={15} />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Role switcher */}
      <label className="flex items-center gap-2 text-sm text-muted ml-auto md:ml-4">
        <span className="hidden md:inline">Viewing as</span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="bg-surface2 border border-borderline rounded-md px-2 py-1.5 text-ink text-sm font-medium"
        >
          {(Object.keys(roleLabels) as Role[]).map((r) => (
            <option key={r} value={r}>
              {roleLabels[r]}
            </option>
          ))}
        </select>
      </label>

      {/* Low bandwidth toggle */}
      <button
        onClick={toggleLowBandwidth}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors"
        style={{
          borderColor: lowBandwidth ? "#E2E8F0" : "#1E293B",
          color: lowBandwidth ? "#fff" : "#7C8AA0",
        }}
        aria-pressed={lowBandwidth}
        title="Toggle low-bandwidth / battery saver mode"
      >
        <Battery size={15} />
        {lowBandwidth ? "Battery Saver: ON" : "Battery Saver"}
      </button>

      {/* Broadcast SOS */}
      <button
        onClick={onBroadcast}
        className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold text-white"
        style={{ backgroundColor: lowBandwidth ? "#EF4444" : "#EF4444" }}
      >
        <Siren size={16} />
        Broadcast SOS
      </button>
    </header>
  );
}
