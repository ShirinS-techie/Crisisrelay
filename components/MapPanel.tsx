"use client";

import { useEffect, useMemo, useState } from "react";
import { Home, TriangleAlert, Navigation, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { CRISIS_META } from "@/lib/seedData";
import { Point, SOSRequest } from "@/lib/types";
import { computeSafeRoute, toPolylinePoints } from "@/lib/routing";

const statusColor: Record<SOSRequest["status"], string> = {
  unverified: "#94A3B8",
  claimed: "#FACC15",
  in_progress: "#22D3EE",
  resolved: "#34D399",
};

// Fixed reference point representing the current user's position on the map.
const YOU: Point = { x: 50, y: 90 };

type SelectedTarget = { id: string; kind: "sos" | "shelter"; point: Point; label: string } | null;

export default function MapPanel() {
  const { sosList, shelters, hazards, crisis, lowBandwidth } = useStore();
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedTarget>(null);
  const meta = CRISIS_META[crisis];
  const visibleSOS = sosList.filter((s) => s.crisis === crisis);
  const visibleShelters = shelters.filter((s) => s.crisis === crisis);
  const visibleHazards = hazards.filter((h) => h.crisis === crisis);

  // Clear any selected route when switching crisis mode, since the
  // selected pin may no longer exist in the new scope.
  useEffect(() => {
    setSelected(null);
  }, [crisis]);

  const routePath = useMemo(() => {
    if (!selected) return null;
    return computeSafeRoute(YOU, selected.point, visibleHazards);
  }, [selected, visibleHazards]);

  function selectSOS(s: SOSRequest) {
    setSelected((prev) =>
      prev?.id === s.id
        ? null
        : { id: s.id, kind: "sos", point: { x: s.x, y: s.y }, label: `${s.kind} — ${s.location}` }
    );
  }

  function selectShelter(sh: (typeof shelters)[number]) {
    setSelected((prev) =>
      prev?.id === sh.id
        ? null
        : { id: sh.id, kind: "shelter", point: { x: sh.x, y: sh.y }, label: sh.name }
    );
  }

  if (lowBandwidth) {
    return (
      <div className="no-glass rounded-lg p-4 h-full overflow-y-auto">
        <h2 className="font-display font-semibold text-sm uppercase tracking-wide text-muted mb-3">
          Map disabled in Battery Saver mode
        </h2>
        <ul className="space-y-2 text-sm font-mono">
          {visibleSOS.map((s) => (
            <li key={s.id} className="border-b border-borderline pb-2">
              [{s.status.toUpperCase()}] {s.location} — {s.kind}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl h-full p-3 flex flex-col">
      <div className="flex items-center justify-between px-2 pt-1 pb-2">
        <h2 className="font-display font-semibold text-sm text-muted uppercase tracking-wide">
          Live Situational Map
        </h2>
        <span
          className="text-xs font-mono px-2 py-1 rounded"
          style={{ color: meta.accent, backgroundColor: meta.accentSoft }}
        >
          {meta.label} mode
        </span>
      </div>

      {selected && (
        <div className="flex items-center justify-between px-3 py-2 mx-2 mb-2 rounded-md bg-flood/10 border border-flood/30 text-xs">
          <span className="flex items-center gap-1.5 text-flood">
            <Navigation size={12} />
            Evacuation route to <span className="font-medium">{selected.label}</span>
          </span>
          <button onClick={() => setSelected(null)} aria-label="Clear route">
            <X size={13} className="text-muted" />
          </button>
        </div>
      )}

      <div className="relative flex-1 rounded-lg overflow-hidden border border-borderline bg-[#070A12]">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#141B2E" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Hazard zones */}
          {visibleHazards.map((h) => (
            <circle
              key={h.id}
              cx={h.x}
              cy={h.y}
              r={h.radius}
              fill={meta.accent}
              opacity={0.08}
              stroke={meta.accent}
              strokeOpacity={0.4}
              strokeDasharray="1.5,1.5"
            />
          ))}

          {/* Evacuation route */}
          {routePath && (
            <polyline
              points={toPolylinePoints(routePath)}
              fill="none"
              stroke="#22D3EE"
              strokeWidth={0.8}
              strokeDasharray="2,1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Shelters */}
          {visibleShelters.map((s) => {
            const full = s.occupied / s.capacity >= 0.9;
            const isSelected = selected?.id === s.id;
            return (
              <g
                key={s.id}
                transform={`translate(${s.x},${s.y})`}
                onClick={() => selectShelter(s)}
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}
              >
                {isSelected && (
                  <circle r={4.2} fill="none" stroke="#22D3EE" strokeWidth={0.5} opacity={0.7} />
                )}
                <rect
                  x={-3}
                  y={-3}
                  width={6}
                  height={6}
                  rx={1.3}
                  fill={full ? "#EF4444" : "#34D399"}
                  opacity={0.9}
                />
              </g>
            );
          })}

          {/* SOS beacons */}
          {visibleSOS.map((s) => {
            const isSelected = selected?.id === s.id;
            return (
              <g
                key={s.id}
                transform={`translate(${s.x},${s.y})`}
                onClick={() => selectSOS(s)}
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}
              >
                {isSelected && (
                  <circle r={4.2} fill="none" stroke="#22D3EE" strokeWidth={0.5} opacity={0.7} />
                )}
                {s.status !== "resolved" && s.urgency === "critical" && (
                  <circle r={3.5} fill={statusColor[s.status]} opacity={0.3} className="animate-beacon" />
                )}
                <circle r={1.8} fill={statusColor[s.status]} stroke="#090D16" strokeWidth={0.4} />
              </g>
            );
          })}

          {/* You are here */}
          <g transform={`translate(${YOU.x},${YOU.y})`}>
            <circle r={2.2} fill="#0F1526" stroke="#E2E8F0" strokeWidth={0.6} />
            <circle r={0.8} fill="#E2E8F0" />
          </g>
        </svg>

        {hovered &&
          (() => {
            const s = visibleSOS.find((x) => x.id === hovered);
            if (s) {
              return (
                <div
                  className="absolute glass rounded-md px-3 py-2 text-xs pointer-events-none max-w-[220px]"
                  style={{ left: `${s.x}%`, top: `${s.y}%`, transform: "translate(-50%, -130%)" }}
                >
                  <p className="font-semibold font-mono">{s.id}</p>
                  <p className="text-muted">{s.location}</p>
                  <p className="capitalize">{s.kind} · {s.status.replace("_", " ")}</p>
                  <p className="text-muted mt-1">Click to route from your location</p>
                </div>
              );
            }
            const sh = visibleShelters.find((x) => x.id === hovered);
            if (sh) {
              return (
                <div
                  className="absolute glass rounded-md px-3 py-2 text-xs pointer-events-none max-w-[220px]"
                  style={{ left: `${sh.x}%`, top: `${sh.y}%`, transform: "translate(-50%, -130%)" }}
                >
                  <p className="font-semibold">{sh.name}</p>
                  <p className="text-muted">{sh.occupied}/{sh.capacity} sheltered</p>
                  <p className="text-muted mt-1">Click to route from your location</p>
                </div>
              );
            }
            return null;
          })()}
      </div>

      <div className="flex flex-wrap items-center gap-4 px-2 pt-3 text-xs text-muted">
        <span className="flex items-center gap-1">
          <Home size={12} className="text-safe" /> Shelter (open)
        </span>
        <span className="flex items-center gap-1">
          <Home size={12} className="text-danger" /> Shelter (at capacity)
        </span>
        <span className="flex items-center gap-1">
          <TriangleAlert size={12} style={{ color: meta.accent }} /> Hazard zone
        </span>
        <span className="flex items-center gap-1">
          <Navigation size={12} className="text-flood" /> Safe evacuation route
        </span>
        {(Object.entries(statusColor) as [SOSRequest["status"], string][]).map(
          ([status, color]) => (
            <span key={status} className="flex items-center gap-1 capitalize">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              {status.replace("_", " ")}
            </span>
          )
        )}
      </div>
    </div>
  );
}
