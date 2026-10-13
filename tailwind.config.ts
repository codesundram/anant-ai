import type { Config } from "tailwindcss";

// The palette is replaced, not extended: only the five locked tokens exist.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      "black-room": "var(--black-room)",
      bone: "var(--bone)",
      paper: "var(--paper)",
      ash: "var(--ash)",
      brass: "var(--brass)",
      bg: "var(--bg)",
      fg: "var(--fg)",
    },
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Geist", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        label: "0.08em",
      },
    },
  },
  plugins: [],
};

export default config;
