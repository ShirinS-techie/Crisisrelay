"use client";

import { useState } from "react";
import { X, ScanLine, Loader2, TriangleAlert, WifiOff, BatteryLow, Cpu } from "lucide-react";
import { useStore } from "@/lib/store";
import { SOSKind, Urgency } from "@/lib/types";
import { AIScanResult, scoreFromHeuristics } from "@/lib/aiScoring";
import { useDeviceStatus } from "@/lib/deviceStatus";

const kinds: SOSKind[] = ["water", "medical", "rescue", "shelter"];
const urgencies: Urgency[] = ["low", "medium", "critical"];

export default function SOSModal({ onClose }: { onClose: () => void }) {
  const { addSOS } = useStore();
  const device = useDeviceStatus();
  const [kind, setKind] = useState<SOSKind>("rescue");
  const [location, setLocation] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("medium");
  const [note, setNote] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<AIScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  async function runScan() {
    setScanning(true);
    setScanResult(null);
    setScanError(null);
    const ctx = { batteryLevel: device.batteryLevel, minutesOffline: device.minutesOffline };
    try {
      // Text/metadata heuristic engine only, entirely offline.
      setScanResult(scoreFromHeuristics(kind, urgency, note, ctx));
    } catch (err) {
      setScanError(err instanceof Error ? err.message : "Scan failed.");
    } finally {
      setScanning(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!location.trim()) return;
    addSOS({
      kind,
      location: location.trim(),
      x: 15 + Math.random() * 70,
      y: 15 + Math.random() * 70,
      urgency,
      note: note.trim(),
      aiScore: scanResult?.score,
      aiTags: scanResult?.tags,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass rounded-xl w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg">Broadcast SOS</h2>
          <button onClick={onClose} aria-label="Close">
            <X size={18} className="text-muted" />
          </button>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-muted mb-3">
          <span className="flex items-center gap-1">
            {device.online ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            ) : (
              <WifiOff size={11} className="text-amber-400" />
            )}
            {device.online ? "Online" : `Offline ${device.minutesOffline}m`}
          </span>
          {device.batteryLevel !== null && (
            <span className="flex items-center gap-1">
              <BatteryLow size={11} />
              {Math.round(device.batteryLevel * 100)}%
            </span>
          )}
          <span className="text-borderline">·</span>
          <span>All scoring runs on-device — no data leaves this browser</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1">Type of need</label>
            <div className="grid grid-cols-4 gap-2">
              {kinds.map((k) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => {
                    setKind(k);
                    setScanResult(null);
                  }}
                  className="capitalize text-sm py-1.5 rounded-md border"
                  style={{
                    borderColor: kind === k ? "#EF4444" : "#1E293B",
                    backgroundColor: kind === k ? "rgba(239,68,68,0.12)" : "transparent",
                  }}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted mb-1" htmlFor="loc">
              Location
            </label>
            <input
              id="loc"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Elm St & 4th"
              className="w-full bg-surface2 border border-borderline rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Urgency</label>
            <div className="grid grid-cols-3 gap-2">
              {urgencies.map((u) => (
                <button
                  type="button"
                  key={u}
                  onClick={() => {
                    setUrgency(u);
                    setScanResult(null);
                  }}
                  className="capitalize text-sm py-1.5 rounded-md border"
                  style={{
                    borderColor: urgency === u ? "#EF4444" : "#1E293B",
                    backgroundColor: urgency === u ? "rgba(239,68,68,0.12)" : "transparent",
                  }}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted mb-1" htmlFor="note">
              Note (optional, but improves the offline scan)
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setScanResult(null);
              }}
              rows={3}
              placeholder="Anything responders should know"
              className="w-full bg-surface2 border border-borderline rounded-md px-3 py-2 text-sm resize-none"
            />
          </div>

          <button
            type="button"
            onClick={runScan}
            disabled={scanning}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-md border border-flood/30 bg-flood/10 text-flood text-sm font-medium disabled:opacity-60"
          >
            {scanning ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Running offline heuristic engine...
              </>
            ) : (
              <>
                <ScanLine size={14} />
                Analyze report (offline heuristics)
              </>
            )}
          </button>

          {scanError && (
            <div className="rounded-md border border-danger/40 bg-danger/10 p-2.5 text-xs text-danger flex items-start gap-1.5">
              <TriangleAlert size={12} className="mt-0.5 shrink-0" />
              <span>{scanError}</span>
            </div>
          )}

          {scanResult && (
            <div className="rounded-md border border-borderline bg-surface2 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1 text-[11px] text-muted">
                  <Cpu size={11} />
                  Offline Text/Metadata Heuristic
                </span>
                <span
                  className="text-sm font-mono font-semibold"
                  style={{
                    color: scanResult.score >= 8 ? "#EF4444" : scanResult.score >= 5 ? "#FACC15" : "#34D399",
                  }}
                >
                  {scanResult.score}/10
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {scanResult.tags.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-danger/15 text-danger border border-danger/30"
                  >
                    <TriangleAlert size={10} />
                    {t}
                  </span>
                ))}
              </div>
              {scanResult.reasoning && (
                <p className="mt-2 text-[11px] text-muted leading-snug">{scanResult.reasoning}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-md bg-danger text-white font-semibold text-sm"
          >
            Send SOS
          </button>
        </form>
      </div>
    </div>
  );
}
