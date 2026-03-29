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
          bg: '#13141A',
          card: '#1C1D25',
          border: '#2A2B35',
          primary: '#7C5CFC',
          'primary-hover': '#6B4FE0',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
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