import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#090D16",
        surface: "#0F1526",
        surface2: "#141B2E",
        borderline: "#1E293B",
        ink: "#E2E8F0",
        muted: "#7C8AA0",
        flood: "#22D3EE",
        wildfire: "#F97316",
        outage: "#FACC15",
        danger: "#EF4444",
        safe: "#34D399",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        glass: "0 1px 0 0 rgba(255,255,255,0.04) inset",
      },
      keyframes: {
        beaconPulse: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.6)", opacity: "0.35" },
        },
      },
      animation: {
        beacon: "beaconPulse 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
