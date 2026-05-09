import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#faf9f6",
        foreground: "#1f1a17",
        accent: "#c75d45",
        accentSoft: "#f1ddd6",
        slateWarm: "#655b56",
        card: "#fffdf9",
        border: "#eadfd7",
        success: "#2f7d4b",
        warning: "#b7791f",
        muted: "#f4efe9"
      },
      fontFamily: {
        serif: [
          "Georgia",
          "Cambria",
          "\"Times New Roman\"",
          "Times",
          "serif"
        ],
        sans: [
          "\"Avenir Next\"",
          "Avenir",
          "\"Segoe UI\"",
          "sans-serif"
        ]
      },
      boxShadow: {
        card: "0 18px 45px -24px rgba(86, 63, 45, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
