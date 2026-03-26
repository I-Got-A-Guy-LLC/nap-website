import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#1F3149",
        gold: "#FBC761",
        manchester: "#71D4D1",
        murfreesboro: "#1F3149",
        nolensville: "#F5BE61",
        smyrna: "#FE6651",
        "light-gray": "#F5F5F5",
      },
      fontFamily: {
        heading: ["var(--font-league-spartan)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      height: {
        "18": "4.5rem",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
