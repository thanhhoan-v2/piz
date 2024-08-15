import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		// "./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		screens: {
			mobile_s: "320px",
			mobile_m: "375px",
			mobile_l: "425px",
			tablet: "768px",
			laptop: "1024px",
			laptop_l: "1440px",
			"2xl": "1400px",
		},
		container: {
			center: true,
			padding: "2rem",
		},
		extend: {
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				"background-item": {
					DEFAULT: "hsl(var(--background-item))",
					foreground: "hsl(var(--foreground))",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			animation: {
				accordionDown: "accordionDown 0.2s ease-out",
				accordionUp: "accordionUp 0.2s ease-out",
				caretBlink: "caretBlink 1.25s ease-out infinite",
				bounceOnce: "bounceOnce 1s ease-out",
				flipWords: "flipWords 8s infinite",
			},
			keyframes: {
				accordionDown: {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				accordionUp: {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
				caretBlink: {
					"0%,70%,100%": { opacity: "1" },
					"20%,50%": { opacity: "0" },
				},
				bounceOnce: {
					"20%, 50%, 80%, 100%": {
						transform: "translateY(0)",
					},
					"40%": {
						transform: "translateY(-30px)",
					},
					"60%": {
						transform: "translateY(-15px)",
					},
				},
				flipWords: {
					"10%": { transform: "translateY(-112%)" },
					"25%": { transform: "translateY(-100%)" },
					"35%": { transform: "translateY(-212%)" },
					"50%": { transform: "translateY(-200%)" },
					"60%": { transform: "translateY(-312%)" },
					"75%": { transform: "translateY(-300%)" },
					"85%": { transform: "translateY(-412%)" },
					"100%": { transform: "translateY(-400%)" },
				},
			},
		},
	},
	plugins: [
		require("tailwindcss-animate"),
		plugin(({ addComponents, theme }) => {
			addComponents({
				".hidden md:block": {
					backgroundColor: theme("colors.white"),
					borderRadius: theme("borderRadius.lg"),
					padding: theme("spacing.6"),
					boxShadow: theme("boxShadow.xl"),
				},
			});
		}),
	],
} satisfies Config;

export default config;
