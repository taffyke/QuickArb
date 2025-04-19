
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Crypto theme colors matching arbitragescanner.io
				crypto: {
					green: '#00e396',
					red: '#ff3b69',
					blue: '#00b1f2',
					yellow: '#feb019',
					purple: '#775dd0',
					gray: '#2d3748',
					'gray-light': '#e2e8f0',
					'gray-dark': '#1a202c',
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'pulse-green': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5', backgroundColor: 'rgba(0, 227, 150, 0.15)' }
				},
				'pulse-red': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5', backgroundColor: 'rgba(255, 59, 105, 0.15)' }
				},
				'pulse-blue': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5', backgroundColor: 'rgba(0, 177, 242, 0.15)' }
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-right': {
					'0%': { transform: 'translateX(-10px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'number-change': {
					'0%': { opacity: '0', transform: 'translateY(5px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-green': 'pulse-green 2s ease-in-out infinite',
				'pulse-red': 'pulse-red 2s ease-in-out infinite',
				'pulse-blue': 'pulse-blue 2s ease-in-out infinite',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'slide-right': 'slide-right 0.3s ease-out',
				'number-change': 'number-change 0.3s ease-out'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
				'crypto-gradient': 'linear-gradient(to right, #00e396, #00b1f2)',
				'alert-gradient': 'linear-gradient(to right, #ff3b69, #feb019)',
				'card-gradient': 'linear-gradient(to bottom, rgba(38, 43, 54, 0.8), rgba(28, 32, 40, 0.9))'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
