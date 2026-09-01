module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 深色主题基础
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",

        // 医疗品牌色
        primary: "hsl(var(--primary) / <alpha-value>)",
        "primary-dark": "hsl(var(--primary-dark) / <alpha-value>)",
        secondary: "hsl(var(--secondary) / <alpha-value>)",
        success: "hsl(var(--success) / <alpha-value>)",
        warning: "hsl(var(--warning) / <alpha-value>)",
        destructive: "hsl(var(--destructive) / <alpha-value>)",
        accent: "hsl(var(--accent) / <alpha-value>)",

        // 中性色
        slate: {
          950: "#0f1419",
          900: "#1a1f2e",
          800: "#2d3748",
          700: "#374151",
        },
      },
      fontFamily: {
        display: ["JetBrains Mono", "monospace"],
        body: ["Lexend", "system-ui", "sans-serif"],
        mono: ["Victor Mono", "monospace"],
      },
      spacing: {
        sidebar: "280px",
        header: "64px",
      },
      animation: {
        "type-effect": "type-effect 0.05s steps(1, end)",
        "fade-in": "fade-in 0.3s ease-in",
        "pulse-cyan": "pulse-cyan 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "type-effect": {
          "0%": { "max-width": "0" },
          "100%": { "max-width": "100%" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-cyan": {
          "0%, 100%": { "box-shadow": "0 0 0 0 rgba(0, 217, 255, 0.7)" },
          "50%": { "box-shadow": "0 0 0 10px rgba(0, 217, 255, 0)" },
        },
      },
      boxShadow: {
        "glow": "0 0 20px rgba(0, 217, 255, 0.3)",
      },
    },
  },
  plugins: [],
}
