"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import MapPanel from "@/components/MapPanel";
import RightPanel from "@/components/RightPanel";
import SOSModal from "@/components/SOSModal";
import OfferHelpModal from "@/components/OfferHelpModal";
import { useStore } from "@/lib/store";

export default function Home() {
  const { lowBandwidth } = useStore();
  const [showSOS, setShowSOS] = useState(false);
  const [showOffer, setShowOffer] = useState(false);

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar onBroadcast={() => setShowSOS(true)} />

      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 p-4 md:p-6">
        <div className="md:col-span-3 min-h-[420px]">
          <MapPanel />
        </div>
        <div className="md:col-span-2 min-h-[420px]">
          <RightPanel onOfferHelp={() => setShowOffer(true)} />
        </div>
      </div>

      <footer
        className={`text-center text-xs py-3 text-muted ${
          lowBandwidth ? "" : "border-t border-borderline"
        }`}
      >
        CrisisRelay — demo data only. Not a substitute for official emergency services.
      </footer>

      {showSOS && <SOSModal onClose={() => setShowSOS(false)} />}
      {showOffer && <OfferHelpModal onClose={() => setShowOffer(false)} />}
    </main>
  );
}
