# CrisisRelay

**A hyper-local, offline-first emergency coordination hub — built to help individuals and communities prepare for, navigate through, and recover from a crisis.**

Flood. Wildfire. Power outage. In the first hours of any of these, the two things people need most — a way to ask for help, and a way to know what to do next — are usually the two things that break first, because cell towers are jammed, home Wi-Fi is down, and phone batteries are dying. CrisisRelay is a single-page command center that keeps working under exactly those conditions: every request, every score, and every checklist runs on the device itself, with no server round-trip required for the moment that actually matters.

---

## Table of Contents

1. [The Idea](#1-the-idea)
2. [Screenshots](#2-screenshots)
3. [Key Features](#3-key-features)
4. [What Makes CrisisRelay Different](#4-what-makes-crisisrelay-different)
5. [Highlighted Feature: The Offline Risk-Scoring Engine](#5-highlighted-feature-the-offline-risk-scoring-engine)
6. [How SOS Broadcasting & Offline State Work](#6-how-sos-broadcasting--offline-state-work)
7. [Tech Stack](#7-tech-stack)
8. [Project Structure](#8-project-structure)
9. [Getting Started](#9-getting-started)
10. [Demo Script — What to Try](#10-demo-script--what-to-try)
11. [Roadmap](#11-roadmap)

---

## 1. The Idea

Most emergency-response tooling assumes two things that quietly stop being true during an actual disaster: a live internet connection, and a phone with enough battery to keep using it all day. CrisisRelay flips that assumption. It's designed around a simple premise — **a coordination tool is only useful if it survives the exact conditions the crisis creates** — so every core workflow (reporting an SOS, triaging its urgency, and following survival guidance) is built to run entirely on-device, in the browser, with zero dependency on a live connection.

It's aimed at three overlapping audiences in the same event:

- **Citizens** who need to ask for help, offer supplies, or follow a survival checklist.
- **Volunteers / First Responders** who need a live, prioritized feed of who needs help most, right now.
- **Relief Coordinators** who need the aggregate picture — how many requests, how many resolved, which shelters are near capacity.

All three share one dashboard, switchable instantly, so the same demo (or the same real deployment) serves the whole chain of response.

---

## 2. Screenshots

> _Add screenshots to `docs/screenshots/` and reference them below — swap the placeholder paths for your actual filenames._

| View | Screenshot |
|---|---|
| Main dashboard — map + live SOS feed (Citizen view) | `docs/screenshots/dashboard-citizen.png` |
| Broadcast SOS modal, with risk score result | `docs/screenshots/sos-modal-scored.png` |
| Volunteer view — claim / resolve flow | `docs/screenshots/volunteer-feed.png` |
| Coordinator aggregate stats dashboard | `docs/screenshots/coordinator-stats.png` |
| Triage decision tree + survival checklist | `docs/screenshots/triage-tab.png` |
| Wildfire mode (accent + hazard overlay change) | `docs/screenshots/wildfire-mode.png` |
| Low-bandwidth / battery-saver mode | `docs/screenshots/low-bandwidth-mode.png` |

```md
![Dashboard – Citizen view](docs/screenshots/dashboard-citizen.png)
![SOS modal with risk score](docs/screenshots/sos-modal-scored.png)
```

---

## 3. Key Features

### 🔀 Zero-Friction Role Switcher
Swap between **Citizen**, **Volunteer**, and **Relief Coordinator** from the top bar with no login screen. Each role instantly gets a different set of capabilities and a different lens on the same live data:
- **Citizen** — broadcast an SOS, offer supplies, track request status.
- **Volunteer** — see the live SOS feed, claim requests, advance their status.
- **Coordinator** — aggregate stats, unresolved counts, shelter-capacity view.

### 🌊🔥⚡ Multi-Crisis Modes
One header toggle switches the entire app between **Flood**, **Wildfire**, and **Power Outage** modes. Switching crisis type live-updates the accent color (cyan / amber / yellow), the map's hazard overlays, the survival checklist, and the triage decision tree — so the guidance shown is always specific to the crisis at hand, not generic advice.

### 🆘 SOS Beacon & Resource Matching
- **Broadcast SOS** — type of need (Water, Medical, Rescue, Shelter), location, self-reported urgency, and a free-text note.
- **Offer Help / Supplies** — anyone can log what they have available (generator, boat, extra food, etc.) and where to pick it up.
- **Full resolution lifecycle** — every request moves through `Unverified → Claimed → In Progress → Resolved`, with one-tap actions for volunteers, and the map/feed update immediately.
- Requests render as color-coded beacons on an interactive map **and** in a filterable sidebar feed.

### 🩹 Offline Triage & Decision Tree
A step-by-step, yes/no first-aid and survival flowchart tailored to the active crisis mode, plus a persistent survival checklist. Checklist progress is saved via `localStorage`, so it survives a page refresh — useful if the tab reloads mid-crisis.

### 🔋 Low-Bandwidth / Battery-Saver Mode
One click strips glassmorphism, background imagery, blurs, and the map itself, dropping into a high-contrast, text-only monochrome layout — built for the moment your phone is at 8% and your connection is one bar of 2G.

### 🌱 Rich Seeded Demo Data
Loads with 5 varied SOS beacons (spanning every status), 3 shelters at different capacity levels, 2 active resource offers, and live hazard boundary points — so the dashboard feels populated and real the instant it opens, no setup required.

---

## 4. What Makes CrisisRelay Different

Most "crisis coordination" demos are really just CRUD apps with a map skin — a request goes in, sits in a database, and someone eventually looks at it. CrisisRelay is built around a different, narrower bet:

| Typical crisis-response tooling | CrisisRelay |
|---|---|
| Urgency is whatever the reporter typed into a dropdown | Self-reported urgency is a **starting point**, not the final word — it's automatically re-scored against the actual text of the report |
| Prioritization requires a server, a model API, or a human triage queue | Prioritization runs **entirely client-side**, in milliseconds, with no network call |
| "AI scoring" is a black box you have to trust | Every score comes with a **plain-English reasoning string** and a set of named tags — you can see exactly why a report was ranked the way it was |
| The app assumes you have signal | Every core loop (report → score → triage guidance) is designed to keep working **with no connection at all** |
| One generic UI regardless of device state | The UI itself adapts to device reality — low battery and long offline windows actively raise a report's priority, and a one-tap mode strips the app down for a dying phone |

---

## 5. Highlighted Feature: The Offline Risk-Scoring Engine

This is the centerpiece of CrisisRelay: **`lib/aiScoring.ts`**, a fully client-side, deterministic natural-language + device-metadata heuristic engine. No model weights, no API call, no network dependency — it runs the instant a report is submitted, online or off, and produces the same result every time for the same input.

### How it scores a report

**1. Base severity from self-reported urgency**
```
low      → 2
medium   → 4
critical → 7
```

**2. Keyword analysis of the free-text note**, in three escalating tiers (regex-matched, case-insensitive):

| Tier | Example matches | Score bump |
|---|---|---|
| 🔴 Critical / life-threatening | "trapped", "can't breathe", "unconscious", "not breathing", "cardiac arrest", "drowning", "bleeding heavily", "gas leak", "explosion", "on fire" | **+3** |
| 🟠 High / injury & hazard | "injured", "broken bone", "fracture", "chest pain", "difficulty breathing", "smoke", "flooding", "structural damage", "collapsed", "roof down" | **+2** |
| 🟡 Moderate / vulnerability & resource need | "no power/water", "stranded", "elderly", "infant", "children", "disabled", "pregnant", "running low" | **+1** |

**3. Device-signal adjustments** — the same report gets bumped up if the reporter's own device is at risk of going silent:

- **Battery ≤ 15%** → **+1**, tagged `Low Device Battery`
- **Offline for ≥ 30 minutes** → **+1**, tagged `Prolonged Connectivity Outage`

**4. Final score** is clamped to a `1–10` range, paired with up to 4 matched tags and a human-readable reasoning sentence explaining exactly which signals fired.

### Example

> Report: *"Kids trapped in the attic, water still rising, phone at 9% battery."* — self-reported urgency: **medium**

- Base (medium): `4`
- Critical keyword match ("trapped"): `+3`
- Low battery (9%): `+1`
- **Final score: 8/10**, tags: `Life-Threatening Language`, `Low Device Battery`
- Reasoning: *"Base severity for a self-reported 'medium' rescue request. Note text matched: Life-Threatening Language. Reporter's device battery is at 9% — may go silent soon."*

This means a request someone under-labeled as "medium" out of instinct or panic can still surface at the top of the volunteer feed — the system doesn't just trust the dropdown.

---

## 6. How SOS Broadcasting & Offline State Work

It's worth being precise about what "offline-first" means in this build, since the phrase covers two related but different things:

**Within a live session, every role sees the same data instantly.**
All SOS requests, offers, shelters, and hazards live in a single shared React Context store (`lib/store.tsx`). Broadcasting an SOS as a Citizen, claiming it as a Volunteer, and viewing the aggregate count as a Coordinator are all reading and writing the *same* in-memory state — there's no polling, no refresh, and no round-trip delay between roles updating and everyone else seeing it, because they're all subscribed to the same store. This is what makes the Citizen → Volunteer → Coordinator flow feel real-time in the demo.

**Scoring and guidance never need a connection at all.**
The risk score (Section 5) and the triage decision tree are computed entirely in the browser from data already on the device — the reporter's note, urgency, battery level, and offline duration. None of that requires reaching a server, so a report can be scored and triaged the instant it's typed, even with zero bars.

**What persists across a reload, and what doesn't.**
The survival checklist (`components/TriageTab.tsx`) is the one piece of state saved to `localStorage`, keyed per crisis mode — so checklist progress survives a page refresh or an app crash mid-incident. SOS/offer/shelter data, by contrast, is in-memory demo state (`lib/seedData.ts` seeds it) and resets on reload, by design, so every demo run starts from the same clean, populated scenario.

**Scope note for a real deployment.** In this hackathon build, "broadcast to all users" describes instant sync *across roles within one shared session* — it is not yet cross-device or cross-browser sync. A production version would add a lightweight sync layer (e.g., a background-sync service worker, WebSocket/CRDT layer, or peer-to-peer mesh over local Wi-Fi/Bluetooth) so that reports made on one phone actually reach another phone with no shared network at all — the scoring and triage logic described above would carry over unchanged, since they were built to be connection-agnostic from the start.

---

## 7. Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **lucide-react** for icons
- Zero external state-management libraries — a single React Context (`lib/store.tsx`) is the source of truth

---

## 8. Project Structure

```
crisisrelay/
├── app/
│   ├── layout.tsx        # Root layout, fonts, global providers
│   ├── page.tsx          # Main dashboard (navbar + map + tabs)
│   └── globals.css       # Theme tokens, glass utility, focus styles
├── components/
│   ├── Navbar.tsx         # Persona switcher, crisis switcher, battery saver toggle
│   ├── MapPanel.tsx        # Offline-first SVG situational map
│   ├── RightPanel.tsx      # Tab container (Feed / Triage / Coordinator)
│   ├── SOSFeedTab.tsx       # Filterable SOS feed + resource offers
│   ├── TriageTab.tsx        # Decision-tree triage + persistent checklist
│   ├── StatsTab.tsx         # Coordinator aggregate dashboard
│   ├── SOSModal.tsx         # Broadcast SOS form + risk-score result
│   └── OfferHelpModal.tsx    # Offer supplies form
├── lib/
│   ├── types.ts            # Shared TypeScript types
│   ├── seedData.ts          # Demo SOS beacons, shelters, offers, checklists, triage trees
│   ├── store.tsx            # React Context — single source of truth for app state
│   ├── aiScoring.ts          # Client-side text/metadata heuristic risk-scoring engine
│   └── deviceStatus.ts       # Offline-duration + battery-level hook, feeds the heuristic engine
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.mjs
└── postcss.config.mjs
```

---

## 9. Getting Started

1. Install [Node.js 18+](https://nodejs.org). Confirm with:
   ```
   node -v
   npm -v
   ```
2. Unzip the project and open it in your editor:
   ```
   cd path/to/crisisrelay
   code .
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Run the dev server:
   ```
   npm run dev
   ```
5. Open **http://localhost:3000**.

---

## Notes

- The map is a custom offline-first SVG grid rather than a tile-based map service, since real map tiles are the first thing to fail in an actual outage — this keeps the demo functionally honest to its own premise.
- All SOS/offer/shelter/hazard data is in-memory demo data (`lib/seedData.ts`) and resets on page reload, except triage checklist progress, which persists locally per crisis mode.
