"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useStore } from "@/lib/store";

export default function OfferHelpModal({ onClose }: { onClose: () => void }) {
  const { addOffer } = useStore();
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [offeredBy, setOfferedBy] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item.trim() || !location.trim()) return;
    addOffer({
      item: item.trim(),
      quantity: quantity.trim() || "1",
      location: location.trim(),
      offeredBy: offeredBy.trim() || "Anonymous neighbor",
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass rounded-xl w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg">Offer Help / Supplies</h2>
          <button onClick={onClose} aria-label="Close">
            <X size={18} className="text-muted" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1" htmlFor="item">
              What can you offer?
            </label>
            <input
              id="item"
              required
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="e.g. Generator, Boat, Extra Food"
              className="w-full bg-surface2 border border-borderline rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1" htmlFor="qty">
              Quantity
            </label>
            <input
              id="qty"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 20 bottles, 1 unit"
              className="w-full bg-surface2 border border-borderline rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1" htmlFor="loc2">
              Pickup location
            </label>
            <input
              id="loc2"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-surface2 border border-borderline rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1" htmlFor="by">
              Your name (optional)
            </label>
            <input
              id="by"
              value={offeredBy}
              onChange={(e) => setOfferedBy(e.target.value)}
              className="w-full bg-surface2 border border-borderline rounded-md px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-md bg-safe text-[#04231A] font-semibold text-sm"
          >
            Log Offer
          </button>
        </form>
      </div>
    </div>
  );
}
