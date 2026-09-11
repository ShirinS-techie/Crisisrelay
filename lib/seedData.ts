import {
  ChecklistItem,
  CrisisType,
  HazardPoint,
  ResourceOffer,
  Shelter,
  SOSRequest,
  TriageStep,
} from "./types";

export const CRISIS_META: Record<
  CrisisType,
  { label: string; accent: string; accentSoft: string; textOn: string }
> = {
  flood: {
    label: "Flood",
    accent: "#22D3EE",
    accentSoft: "rgba(34,211,238,0.14)",
    textOn: "#04222B",
  },
  wildfire: {
    label: "Wildfire",
    accent: "#F97316",
    accentSoft: "rgba(249,115,22,0.14)",
    textOn: "#2B1200",
  },
  outage: {
    label: "Power Outage",
    accent: "#FACC15",
    accentSoft: "rgba(250,204,21,0.14)",
    textOn: "#2B2400",
  },
};

export const initialSOS: SOSRequest[] = [
  {
    id: "sos-1001",
    kind: "rescue",
    location: "Elm St & 4th, Block 12",
    x: 28,
    y: 34,
    urgency: "critical",
    note: "Family of 4 on rooftop, water still rising.",
    status: "unverified",
    crisis: "flood",
    reportedAt: "07:12",
    aiScore: 9,
    aiTags: ["Life-Threatening", "Trapped Individuals", "Structural Damage"],
  },
  {
    id: "sos-1002",
    kind: "medical",
    location: "Riverside Apartments, Bldg C",
    x: 46,
    y: 58,
    urgency: "critical",
    note: "Elderly resident, insulin running out.",
    status: "claimed",
    claimedBy: "Volunteer Priya S.",
    crisis: "flood",
    reportedAt: "06:47",
    aiScore: 8,
    aiTags: ["Critical Medical", "Requires Immediate Aid"],
  },
  {
    id: "sos-1003",
    kind: "water",
    location: "Cedar Grove Community Hall",
    x: 62,
    y: 22,
    urgency: "medium",
    note: "40+ people sheltering, drinking water low.",
    status: "in_progress",
    claimedBy: "Relief Truck 3",
    crisis: "flood",
    reportedAt: "05:30",
    aiScore: 5,
    aiTags: ["Water Shortage"],
  },
  {
    id: "sos-1004",
    kind: "shelter",
    location: "Oak Ridge Trailer Park",
    x: 18,
    y: 68,
    urgency: "medium",
    note: "Displaced household of 3, no vehicle.",
    status: "unverified",
    crisis: "flood",
    reportedAt: "07:40",
    // No photo scan submitted yet — feed sort falls back to urgency-based score.
  },
  {
    id: "sos-1005",
    kind: "medical",
    location: "Maple & 9th",
    x: 74,
    y: 44,
    urgency: "low",
    note: "Minor injury, non-urgent, needs bandaging.",
    status: "resolved",
    claimedBy: "Volunteer Dan K.",
    crisis: "flood",
    reportedAt: "04:58",
    aiScore: 2,
    aiTags: ["Visible Injury"],
  },
];

export const initialShelters: Shelter[] = [
  { id: "sh-1", name: "Lincoln High Gym", x: 40, y: 20, capacity: 200, occupied: 140, crisis: "flood" },
  { id: "sh-2", name: "St. Anne's Community Center", x: 70, y: 66, capacity: 90, occupied: 88, crisis: "flood" },
  { id: "sh-3", name: "Northside Fire Station", x: 15, y: 45, capacity: 60, occupied: 22, crisis: "flood" },
];

export const initialOffers: ResourceOffer[] = [
  { id: "of-1", item: "Boat (4-seat)", quantity: "1", location: "Cedar Grove", offeredBy: "Marcus T.", crisis: "flood" },
  { id: "of-2", item: "Bottled Water", quantity: "60 bottles", location: "Northside Church", offeredBy: "Linh N.", crisis: "flood" },
];

export const initialHazards: HazardPoint[] = [
  { id: "hz-1", x: 34, y: 40, radius: 14, crisis: "flood", label: "Rising water, road impassable" },
  { id: "hz-2", x: 58, y: 30, radius: 10, crisis: "flood", label: "Downed power line near water" },
];

export const checklistsByCrisis: Record<CrisisType, ChecklistItem[]> = {
  flood: [
    { id: "f1", text: "Move to higher ground; avoid walking or driving through moving water" },
    { id: "f2", text: "Turn off electricity at the main breaker if water is entering the building" },
    { id: "f3", text: "Fill clean containers with drinking water before supply is contaminated" },
    { id: "f4", text: "Keep important documents in a sealed waterproof bag" },
    { id: "f5", text: "Charge phones and power banks fully while power is available" },
    { id: "f6", text: "Know your evacuation route to the nearest verified shelter" },
  ],
  wildfire: [
    { id: "w1", text: "Pack a go-bag: meds, documents, water, N95 masks" },
    { id: "w2", text: "Close all windows and vents; remove flammable items from around the house" },
    { id: "w3", text: "Keep vehicle fueled and pointed toward the exit route" },
    { id: "w4", text: "Monitor air quality index; stay indoors if smoke is heavy" },
    { id: "w5", text: "Wet down roof and vegetation near structures if time allows" },
    { id: "w6", text: "Know two evacuation routes in case one is blocked" },
  ],
  outage: [
    { id: "o1", text: "Keep refrigerator/freezer closed to preserve food (holds ~4 hrs)" },
    { id: "o2", text: "Use flashlights, not candles, to avoid fire risk" },
    { id: "o3", text: "Unplug sensitive electronics to prevent surge damage on restoration" },
    { id: "o4", text: "Check on neighbors who rely on powered medical equipment" },
    { id: "o5", text: "Keep one phone reserved and on airplane mode to save battery" },
    { id: "o6", text: "Report downed lines — do not approach them" },
  ],
};

export const triageByCrisis: Record<CrisisType, Record<string, TriageStep>> = {
  flood: {
    start: {
      id: "start",
      prompt: "Is the person in water that is moving or rising?",
      yesNext: "safety",
      noNext: "conscious",
      yesAdvice: "Do not enter the water yourself. Call for rescue and guide them toward higher, stable ground.",
    },
    safety: {
      id: "safety",
      prompt: "Can they reach higher ground without entering deep or fast water?",
      yesNext: null,
      noNext: null,
      yesAdvice: "Guide them to higher ground immediately, then broadcast an SOS with your exact location.",
      noAdvice: "Stay visible and broadcast an SOS marked Critical. Do not attempt a water rescue without training or a flotation aid.",
    },
    conscious: {
      id: "conscious",
      prompt: "Is the person conscious and breathing normally?",
      yesNext: null,
      noNext: null,
      yesAdvice: "Keep them warm and dry, monitor for shock, and broadcast an SOS if they need medical follow-up.",
      noAdvice: "Begin CPR if trained and broadcast a Critical medical SOS immediately with exact location.",
    },
  },
  wildfire: {
    start: {
      id: "start",
      prompt: "Is smoke or fire visibly approaching your location?",
      yesNext: "evac",
      noNext: "air",
      yesAdvice: "Evacuate now using your primary route. Do not wait for an official order if the threat is immediate.",
    },
    evac: {
      id: "evac",
      prompt: "Is your primary evacuation route clear?",
      yesNext: null,
      noNext: null,
      yesAdvice: "Leave immediately via the primary route and broadcast your route status as an SOS note for others.",
      noAdvice: "Switch to your secondary route now. If both are blocked, broadcast a Critical rescue SOS with your exact location.",
    },
    air: {
      id: "air",
      prompt: "Is breathing becoming difficult from smoke?",
      yesNext: null,
      noNext: null,
      yesAdvice: "Move indoors, seal doors and windows, use an N95 if available, and broadcast a Medical SOS if symptoms worsen.",
      noAdvice: "Stay alert, keep monitoring air quality, and keep your go-bag by the door.",
    },
  },
  outage: {
    start: {
      id: "start",
      prompt: "Does anyone nearby depend on powered medical equipment?",
      yesNext: "backup",
      noNext: "food",
      yesAdvice: "Check their backup battery runtime now and broadcast a Medical SOS early — do not wait for equipment to fail.",
    },
    backup: {
      id: "backup",
      prompt: "Do they have more than 2 hours of backup power?",
      yesNext: null,
      noNext: null,
      yesAdvice: "Monitor closely and identify the nearest powered shelter or hospital as a fallback.",
      noAdvice: "Broadcast a Critical Medical SOS now and begin moving toward the nearest powered facility.",
    },
    food: {
      id: "food",
      prompt: "Has the outage lasted more than 4 hours?",
      yesNext: null,
      noNext: null,
      yesAdvice: "Assume refrigerated food is at risk. Prioritize using perishables and avoid opening the freezer.",
      noAdvice: "Keep doors closed and conserve device battery. Re-check this checklist if the outage continues.",
    },
  },
};
