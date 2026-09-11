export type CrisisType = "flood" | "wildfire" | "outage";

export type Role = "citizen" | "volunteer" | "coordinator";

export type SOSKind = "water" | "medical" | "rescue" | "shelter";

export type SOSStatus =
  | "unverified"
  | "claimed"
  | "in_progress"
  | "resolved";

export type Urgency = "low" | "medium" | "critical";

export interface SOSRequest {
  id: string;
  kind: SOSKind;
  location: string;
  x: number; // 0-100, position on the map grid
  y: number; // 0-100
  urgency: Urgency;
  note: string;
  status: SOSStatus;
  crisis: CrisisType;
  claimedBy?: string;
  reportedAt: string; // ISO-ish display string
  aiScore?: number; // 1-10, from the offline text/metadata heuristic engine
  aiTags?: string[]; // e.g. "Critical Medical", "Structural Damage"
}

export interface Point {
  x: number;
  y: number;
}

export interface ResourceOffer {
  id: string;
  item: string;
  quantity: string;
  location: string;
  offeredBy: string;
  crisis: CrisisType;
}

export interface Shelter {
  id: string;
  name: string;
  x: number;
  y: number;
  capacity: number;
  occupied: number;
  crisis: CrisisType;
}

export interface HazardPoint {
  id: string;
  x: number;
  y: number;
  radius: number;
  crisis: CrisisType;
  label: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
}

export interface TriageStep {
  id: string;
  prompt: string;
  yesNext: string | null; // next step id, or null = end
  noNext: string | null;
  yesAdvice?: string;
  noAdvice?: string;
}
