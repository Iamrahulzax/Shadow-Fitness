/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        shadow: {
          950: '#07070B',
          900: '#0A0A0F',
          850: '#0E0F17',
          800: '#141624',
          750: '#1A1C30',
          700: '#222640',
          600: '#32375C',
        },
        hunter: {
          blue: '#00D4FF',
          sky: '#38BDF8',
          indigo: '#5B7FFF',
          violet: '#7B5CFF',
          purple: '#9D4EDD',
          darkBlue: '#0B192C',
        },
        rank: {
          e: '#64748B',
          d: '#38BDF8',
          c: '#10B981',
          b: '#6366F1',
          a: '#A855F7',
          s: '#F59E0B',
          national: '#EF4444',
        },
        danger: {
          DEFAULT: '#FF3B5C',
          dark: '#8B0018',
          glow: 'rgba(255, 59, 92, 0.4)',
        },
        gold: {
          glow: 'rgba(245, 158, 11, 0.4)',
          amber: '#FFC94A',
        }
      },
      fontFamily: {
        hud: ['Orbitron', 'sans-serif'],
        tech: ['Rajdhani', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(0, 212, 255, 0.4)',
        'glow-cyan-lg': '0 0 25px rgba(0, 212, 255, 0.65)',
        'glow-indigo': '0 0 15px rgba(91, 127, 255, 0.4)',
        'glow-violet': '0 0 18px rgba(123, 92, 255, 0.45)',
        'glow-violet-lg': '0 0 30px rgba(123, 92, 255, 0.6)',
        'glow-gold': '0 0 20px rgba(245, 158, 11, 0.45)',
        'glow-red': '0 0 18px rgba(255, 59, 92, 0.5)',
        'glass-panel': '0 8px 32px 0 rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'subtle-float': 'subtleFloat 4s ease-in-out infinite',
        'scanline': 'scanline 6s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.02)' },
        },
        subtleFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
      }
    },
  },
  plugins: [],
}
