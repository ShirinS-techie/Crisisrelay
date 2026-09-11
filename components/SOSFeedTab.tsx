"use client";

import { useMemo, useState } from "react";
import { CircleCheck, HandHeart, PackageOpen, Gauge } from "lucide-react";
import { useStore } from "@/lib/store";
import { SOSStatus } from "@/lib/types";
import { effectiveScore } from "@/lib/aiScoring";

const statusLabel: Record<SOSStatus, string> = {
  unverified: "Unverified",
  claimed: "Claimed",
  in_progress: "In Progress",
  resolved: "Resolved",
};

const statusStyle: Record<SOSStatus, string> = {
  unverified: "bg-slate-500/20 text-slate-300 border-slate-500/40",
  claimed: "bg-outage/20 text-outage border-outage/40",
  in_progress: "bg-flood/20 text-flood border-flood/40",
  resolved: "bg-safe/20 text-safe border-safe/40",
};

const nextActionLabel: Record<SOSStatus, string> = {
  unverified: "Claim Request",
  claimed: "Mark In-Progress",
  in_progress: "Mark Resolved",
  resolved: "Resolved",
};

export default function SOSFeedTab({
  onOfferHelp,
}: {
  onOfferHelp: () => void;
}) {
  const { sosList, offers, crisis, role, advanceStatus, lowBandwidth } = useStore();
  const [filter, setFilter] = useState<"all" | SOSStatus>("all");

  const items = useMemo(
    () =>
      sosList
        .filter((s) => s.crisis === crisis)
        .filter((s) => filter === "all" || s.status === filter)
        .sort(
          (a, b) =>
            effectiveScore(b.aiScore, b.urgency) - effectiveScore(a.aiScore, a.urgency)
        ),
    [sosList, crisis, filter]
  );

  const canAct = role === "volunteer" || role === "coordinator";

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display font-semibold text-sm uppercase tracking-wide text-muted">
            Active SOS Feed
          </h3>
          <button
            onClick={onOfferHelp}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border border-borderline text-muted hover:text-ink"
          >
            <HandHeart size={13} /> Offer Help
          </button>
        </div>
        <p className="flex items-center gap-1 text-[11px] text-muted mb-2">
          <Gauge size={11} /> Sorted by AI urgency score, highest first
        </p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {(["all", "unverified", "claimed", "in_progress", "resolved"] as const).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="text-xs px-2.5 py-1 rounded-full border capitalize"
                style={{
                  borderColor: filter === f ? "#22D3EE" : "#1E293B",
                  color: filter === f ? "#22D3EE" : "#7C8AA0",
                }}
              >
                {f === "all" ? "All" : statusLabel[f]}
              </button>
            )
          )}
        </div>

        <ul className="space-y-2">
          {items.map((s) => (
            <li
              key={s.id}
              className={`rounded-lg p-3 border ${
                lowBandwidth ? "no-glass" : "bg-surface/60 border-borderline"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs text-muted">{s.id} · {s.reportedAt}</p>
                  <p className="font-medium capitalize text-sm mt-0.5">
                    {s.kind} — {s.location}
                  </p>
                  {s.note && <p className="text-xs text-muted mt-1">{s.note}</p>}
                  {s.claimedBy && (
                    <p className="text-xs text-muted mt-1">Handled by {s.claimedBy}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className="text-[11px] font-mono font-semibold px-2 py-1 rounded-full border whitespace-nowrap"
                    style={{
                      color: effectiveScore(s.aiScore, s.urgency) >= 8 ? "#EF4444" : effectiveScore(s.aiScore, s.urgency) >= 5 ? "#FACC15" : "#34D399",
                      borderColor: "currentColor",
                      backgroundColor: "transparent",
                    }}
                    title={s.aiScore !== undefined ? "AI-assessed urgency score" : "Estimated from reported urgency (no scan submitted)"}
                  >
                    {effectiveScore(s.aiScore, s.urgency)}/10{s.aiScore === undefined && "*"}
                  </span>
                  <span
                    className={`text-[11px] font-medium px-2 py-1 rounded-full border whitespace-nowrap ${statusStyle[s.status]}`}
                  >
                    {statusLabel[s.status]}
                  </span>
                </div>
              </div>

              {s.aiTags && s.aiTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {s.aiTags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-danger/15 text-danger border border-danger/30"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {canAct && s.status !== "resolved" && (
                <button
                  onClick={() =>
                    advanceStatus(
                      s.id,
                      role === "coordinator" ? "Relief Coordinator" : "Volunteer (you)"
                    )
                  }
                  className="mt-2 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-flood/15 text-flood border border-flood/30"
                >
                  <CircleCheck size={13} />
                  {nextActionLabel[s.status]}
                </button>
              )}
            </li>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-muted py-4 text-center">No requests match this filter.</p>
          )}
        </ul>
      </div>

      <div>
        <h3 className="font-display font-semibold text-sm uppercase tracking-wide text-muted mb-2 flex items-center gap-1.5">
          <PackageOpen size={14} /> Resource Offers
        </h3>
        <ul className="space-y-2">
          {offers
            .filter((o) => o.crisis === crisis)
            .map((o) => (
              <li
                key={o.id}
                className={`rounded-lg p-3 border text-sm ${
                  lowBandwidth ? "no-glass" : "bg-surface/60 border-borderline"
                }`}
              >
                <p className="font-medium">{o.item} <span className="text-muted font-normal">· {o.quantity}</span></p>
                <p className="text-xs text-muted mt-0.5">
                  {o.location} — offered by {o.offeredBy}
                </p>
              </li>
            ))}
          {offers.filter((o) => o.crisis === crisis).length === 0 && (
            <p className="text-sm text-muted py-2 text-center">No offers logged yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
