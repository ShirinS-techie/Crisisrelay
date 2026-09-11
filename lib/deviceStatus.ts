"use client";

import { useEffect, useState } from "react";

export interface DeviceStatus {
  online: boolean;
  minutesOffline: number; // 0 while online or before any offline period observed
  batteryLevel: number | null; // 0-1, null if the Battery Status API is unavailable
  batteryCharging: boolean | null;
}

// Module-level so the offline clock survives across component remounts
// (e.g. closing and reopening the SOS modal) within the same tab session.
let offlineSince: number | null = null;
if (typeof navigator !== "undefined" && !navigator.onLine) {
  offlineSince = Date.now();
}

interface BatteryManagerLike {
  level: number;
  charging: boolean;
  addEventListener: (type: string, cb: () => void) => void;
  removeEventListener: (type: string, cb: () => void) => void;
}

/**
 * Tracks two purely local, offline-available signals used by the
 * text/metadata heuristic engine (lib/aiScoring.ts) when no on-device
 * vision model is available:
 *  - how long this device has been continuously offline
 *  - device battery level/charging state (Battery Status API — still
 *    shipped in Chromium browsers behind navigator.getBattery(); silently
 *    unavailable elsewhere, feature-detected below)
 */
export function useDeviceStatus(): DeviceStatus {
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [minutesOffline, setMinutesOffline] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [batteryCharging, setBatteryCharging] = useState<boolean | null>(null);

  useEffect(() => {
    function handleOnline() {
      offlineSince = null;
      setOnline(true);
      setMinutesOffline(0);
    }
    function handleOffline() {
      offlineSince = Date.now();
      setOnline(false);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const interval = setInterval(() => {
      if (offlineSince) {
        setMinutesOffline(Math.floor((Date.now() - offlineSince) / 60000));
      }
    }, 15000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const nav = navigator as Navigator & {
      getBattery?: () => Promise<BatteryManagerLike>;
    };
    if (!nav.getBattery) return;

    let battery: BatteryManagerLike | null = null;
    let cancelled = false;
    const update = () => {
      if (battery) {
        setBatteryLevel(battery.level);
        setBatteryCharging(battery.charging);
      }
    };

    nav.getBattery().then((b) => {
      if (cancelled) return;
      battery = b;
      update();
      b.addEventListener("levelchange", update);
      b.addEventListener("chargingchange", update);
    });

    return () => {
      cancelled = true;
      if (battery) {
        battery.removeEventListener("levelchange", update);
        battery.removeEventListener("chargingchange", update);
      }
    };
  }, []);

  return { online, minutesOffline, batteryLevel, batteryCharging };
}
