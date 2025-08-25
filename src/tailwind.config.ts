import type {Config} from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        headline: ['var(--font-headline)', 'var(--font-serif-sc)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
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
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'content-show': {
          from: { opacity: '0', transform: 'translate(-50%, -48%) scale(0.96)' },
          to: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
        },
        'content-hide': {
            from: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
            to: { opacity: '0', transform: 'translate(-50%, -48%) scale(0.96)' },
        },
        'overlay-show': {
            from: { opacity: '0' },
            to: { opacity: '1' },
        },
        'overlay-hide': {
            from: { opacity: '1' },
            to: { opacity: '0' },
        },
        'warp': {
          from: { transform: 'translateX(-100%) scaleX(0)', opacity: '0.7' },
          to: { transform: 'translateX(200vw) scaleX(1)', opacity: '0' }
        },
        'wave-line-1': {
          '0%': { transform: 'translateY(-20%) translateX(0%) rotate(-15deg) scale(1.1)' },
          '50%': { transform: 'translateY(20%) translateX(5%) rotate(0deg) scale(1)' },
          '100%': { transform: 'translateY(-20%) translateX(0%) rotate(-15deg) scale(1.1)' },
        },
        'wave-line-2': {
          '0%': { transform: 'translateY(10%) translateX(-5%) rotate(20deg) scale(1.2)' },
          '50%': { transform: 'translateY(-10%) translateX(0%) rotate(5deg) scale(1)' },
          '100%': { transform: 'translateY(10%) translateX(-5%) rotate(20deg) scale(1.2)' },
        },
        'wave-line-3': {
          '0%': { transform: 'translateY(-5%) translateX(2%) rotate(-5deg) scale(1)' },
          '100%': { transform: 'translateY(5%) translateX(-2%) rotate(10deg) scale(1.1)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'content-show': 'content-show 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'content-hide': 'content-hide 0.2s ease-in',
        'overlay-show': 'overlay-show 0.2s ease-out',
        'overlay-hide': 'overlay-hide 0.2s ease-in',
        'warp': 'warp 1s ease-out forwards',
        'wave-line-1': 'wave-line-1 15s ease-in-out infinite',
        'wave-line-2': 'wave-line-2 20s ease-in-out infinite',
        'wave-line-3': 'wave-line-3 25s ease-in-out infinite alternate',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
