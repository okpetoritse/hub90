import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        stadiumBg: {
          start: "#0A1F1D",
          end: "#051412"
        },
        electricLime: "#CCFF00",  
        fireCoral: "#FF4B4B",     
        glassWhite: "rgba(255, 255, 255, 0.07)", 
      },
    },
  },
  plugins: [],
};
export default config;