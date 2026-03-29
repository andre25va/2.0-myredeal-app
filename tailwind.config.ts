import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#F8F9FC',
          card: '#FFFFFF',
          border: '#E2E4EA',
          primary: '#7C5CFC',
          'primary-hover': '#6B4FE0',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          text: '#1A1A2E',
          'text-secondary': '#4A4A68',
          'text-muted': '#8E8EA0',
        },
        side: {
          buy: '#3B82F6',
          sell: '#F97316',
          dual: '#A855F7',
          referral: '#D1D5DB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
