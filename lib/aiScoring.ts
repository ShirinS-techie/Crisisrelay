import { Urgency } from "./types";

export interface AIScanResult {
  score: number; // 1-10
  tags: string[];
  reasoning?: string;
  source: "heuristic";
}

const URGENCY_BASE: Record<Urgency, number> = {
  low: 2,
  medium: 4,
  critical: 7,
};

// Keyword tiers for the text/metadata heuristic engine. Matches are
// case-insensitive against the reporter's note. This is entirely
// deterministic, no randomness.
const CRITICAL_KEYWORDS: [RegExp, string][] = [
  [
    /\b(trapped|pinned|can'?t (move|get out|breathe)|unconscious|not breathing|no pulse|cardiac arrest|drowning|bleeding (heavily|badly|a lot)|gas leak|explosion|on fire|burning)\b/i,
    "Life-Threatening Language",
  ],
];
const HIGH_KEYWORDS: [RegExp, string][] = [
  [
    /\b(injur(ed|y)|broken (bone|leg|arm)|fracture|severe pain|chest pain|difficulty breathing|smoke|flood(ing)?|structural damage|collapse[d]?|wall (down|fell)|roof (down|collapsed)|building damage)\b/i,
    "Reported Injury / Hazard",
  ],
];
const MODERATE_KEYWORDS: [RegExp, string][] = [
  [
    /\b(no (power|electricity|water)|stranded|need supplies|running low|elderly|infant|child(ren)?|disab(led|ility)|pregnant)\b/i,
    "Vulnerable / Resource Need",
  ],
];

function keywordFindings(note: string): { bump: number; tags: string[] } {
  const tags: string[] = [];
  let bump = 0;
  for (const [re, tag] of CRITICAL_KEYWORDS) {
    if (re.test(note)) {
      bump += 3;
      tags.push(tag);
    }
  }
  for (const [re, tag] of HIGH_KEYWORDS) {
    if (re.test(note)) {
      bump += 2;
      tags.push(tag);
    }
  }
  for (const [re, tag] of MODERATE_KEYWORDS) {
    if (re.test(note)) {
      bump += 1;
      tags.push(tag);
    }
  }
  return { bump, tags };
}

export interface HeuristicContext {
  batteryLevel?: number | null; // 0-1
  minutesOffline?: number;
}

/**
 * Client-side natural-language + device-metadata heuristic engine.
 * Entirely offline, entirely deterministic — this is the sole source of
 * every report's AI score.
 */
export function scoreFromHeuristics(
  kind: string,
  urgency: Urgency,
  note: string,
  ctx: HeuristicContext = {}
): AIScanResult {
  let score = URGENCY_BASE[urgency];
  const tags: string[] = [];
  const reasons: string[] = [`Base severity for a self-reported "${urgency}" ${kind} request.`];

  const { bump, tags: kwTags } = keywordFindings(note || "");
  if (bump > 0) {
    score += bump;
    tags.push(...kwTags);
    reasons.push(`Note text matched: ${kwTags.join(", ")}.`);
  }

  if (typeof ctx.batteryLevel === "number" && ctx.batteryLevel <= 0.15) {
    score += 1;
    tags.push("Low Device Battery");
    reasons.push(`Reporter's device battery is at ${Math.round(ctx.batteryLevel * 100)}% — may go silent soon.`);
  }

  if (typeof ctx.minutesOffline === "number" && ctx.minutesOffline >= 30) {
    score += 1;
    tags.push("Prolonged Connectivity Outage");
    reasons.push(`Device has been offline for ${ctx.minutesOffline} minute${ctx.minutesOffline === 1 ? "" : "s"}.`);
  }

  return {
    score: Math.min(10, Math.max(1, Math.round(score))),
    tags: Array.from(new Set(tags)).slice(0, 4),
    reasoning: reasons.join(" "),
    source: "heuristic",
  };
}

/**
 * Feed items reported without any scan still need a sort position. Falls
 * back to a score derived from the self-reported urgency so the feed
 * always orders sensibly, scanned or not.
 */
export function effectiveScore(aiScore: number | undefined, urgency: Urgency): number {
  if (typeof aiScore === "number") return aiScore;
  return URGENCY_BASE[urgency];
}
