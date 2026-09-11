"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  CrisisType,
  HazardPoint,
  ResourceOffer,
  Role,
  Shelter,
  SOSRequest,
  SOSStatus,
} from "./types";
import {
  initialHazards,
  initialOffers,
  initialShelters,
  initialSOS,
} from "./seedData";

interface StoreState {
  role: Role;
  setRole: (r: Role) => void;
  crisis: CrisisType;
  setCrisis: (c: CrisisType) => void;
  lowBandwidth: boolean;
  toggleLowBandwidth: () => void;

  sosList: SOSRequest[];
  addSOS: (s: Omit<SOSRequest, "id" | "status" | "reportedAt" | "crisis">) => void;
  advanceStatus: (id: string, actor: string) => void;

  offers: ResourceOffer[];
  addOffer: (o: Omit<ResourceOffer, "id" | "crisis">) => void;

  shelters: Shelter[];
  hazards: HazardPoint[];
}

const StoreContext = createContext<StoreState | null>(null);

const nextStatus: Record<SOSStatus, SOSStatus> = {
  unverified: "claimed",
  claimed: "in_progress",
  in_progress: "resolved",
  resolved: "resolved",
};

function timeNow() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("citizen");
  const [crisis, setCrisis] = useState<CrisisType>("flood");
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const [sosList, setSosList] = useState<SOSRequest[]>(initialSOS);
  const [offers, setOffers] = useState<ResourceOffer[]>(initialOffers);
  const [shelters] = useState<Shelter[]>(initialShelters);
  const [hazards] = useState<HazardPoint[]>(initialHazards);

  const toggleLowBandwidth = useCallback(() => setLowBandwidth((v) => !v), []);

  const addSOS = useCallback(
    (s: Omit<SOSRequest, "id" | "status" | "reportedAt" | "crisis">) => {
      setSosList((prev) => [
        {
          ...s,
          id: `sos-${Math.floor(1000 + Math.random() * 9000)}`,
          status: "unverified",
          reportedAt: timeNow(),
          crisis,
        },
        ...prev,
      ]);
    },
    [crisis]
  );

  const advanceStatus = useCallback((id: string, actor: string) => {
    setSosList((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newStatus = nextStatus[item.status];
        return {
          ...item,
          status: newStatus,
          claimedBy: item.claimedBy ?? actor,
        };
      })
    );
  }, []);

  const addOffer = useCallback(
    (o: Omit<ResourceOffer, "id" | "crisis">) => {
      setOffers((prev) => [
        { ...o, id: `of-${Math.floor(1000 + Math.random() * 9000)}`, crisis },
        ...prev,
      ]);
    },
    [crisis]
  );

  const value = useMemo(
    () => ({
      role,
      setRole,
      crisis,
      setCrisis,
      lowBandwidth,
      toggleLowBandwidth,
      sosList,
      addSOS,
      advanceStatus,
      offers,
      addOffer,
      shelters,
      hazards,
    }),
    [
      role,
      crisis,
      lowBandwidth,
      toggleLowBandwidth,
      sosList,
      addSOS,
      advanceStatus,
      offers,
      addOffer,
      shelters,
      hazards,
    ]
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
