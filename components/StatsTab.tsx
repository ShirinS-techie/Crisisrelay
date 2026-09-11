"use client";

import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, Home, ListChecks } from "lucide-react";
import { useStore } from "@/lib/store";

export default function StatsTab() {
  const { sosList, shelters, crisis, role, lowBandwidth } = useStore();

  const scoped = useMemo(
    () => sosList.filter((s) => s.crisis === crisis),
    [sosList, crisis]
  );
  const total = scoped.length;
  const unresolved = scoped.filter((s) => s.status !== "resolved").length;
  const resolved = scoped.filter((s) => s.status === "resolved").length;
  const shelterList = shelters.filter((s) => s.crisis === crisis);
  const atCapacity = shelterList.filter((s) => s.occupied / s.capacity >= 0.9).length;

  const cardClass = lowBandwidth
    ? "no-glass rounded-lg p-4"
    : "bg-surface/60 border border-borderline rounded-lg p-4";

  if (role !== "coordinator") {
    return (
      <div className={cardClass}>
        <p className="text-sm text-muted">
          Aggregate stats and bulk verification controls are available to the{" "}
          <span className="text-ink font-medium">Relief Coordinator</span> role.
          Switch roles in the top bar to view this dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className={cardClass}>
          <div className="flex items-center gap-2 text-muted text-xs mb-2">
            <ListChecks size={14} /> Total SOS
          </div>
          <p className="text-2xl font-display font-semibold">{total}</p>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-2 text-muted text-xs mb-2">
            <AlertTriangle size={14} className="text-outage" /> Unresolved
          </div>
          <p className="text-2xl font-display font-semibold">{unresolved}</p>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-2 text-muted text-xs mb-2">
            <CheckCircle2 size={14} className="text-safe" /> Resolved
          </div>
          <p className="text-2xl font-display font-semibold">{resolved}</p>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-2 text-muted text-xs mb-2">
            <Home size={14} className="text-danger" /> Shelters at Capacity
          </div>
          <p className="text-2xl font-display font-semibold">
            {atCapacity}/{shelterList.length}
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-display font-semibold text-sm uppercase tracking-wide text-muted mb-2">
          Shelter Occupancy
        </h3>
        <ul className="space-y-2">
          {shelterList.map((s) => {
            const pct = Math.min(100, Math.round((s.occupied / s.capacity) * 100));
            const full = pct >= 90;
            return (
              <li key={s.id} className={cardClass}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium">{s.name}</span>
                  <span className="font-mono text-xs text-muted">
                    {s.occupied}/{s.capacity}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-black/30 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: full ? "#EF4444" : "#34D399",
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="font-display font-semibold text-sm uppercase tracking-wide text-muted mb-2">
          Bulk Verification
        </h3>
        <p className="text-xs text-muted mb-2">
          Unverified reports awaiting confirmation before dispatch.
        </p>
        <ul className="space-y-2">
          {scoped
            .filter((s) => s.status === "unverified")
            .map((s) => (
              <li
                key={s.id}
                className={`${cardClass} flex items-center justify-between text-sm`}
              >
                <span>{s.location} — <span className="capitalize">{s.kind}</span></span>
                <span className="text-xs font-mono text-muted">{s.id}</span>
              </li>
            ))}
          {scoped.filter((s) => s.status === "unverified").length === 0 && (
            <p className="text-sm text-muted text-center py-2">Nothing pending verification.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
