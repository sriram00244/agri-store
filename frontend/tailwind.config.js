/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'Outfit', 'system-ui', '-apple-system', 'sans-serif'],
                display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
            },
            colors: {
                agri: {
                    dark: '#090D16',
                    darker: '#04070C',
                    surface: '#0F172A',
                    border: 'rgba(255, 255, 255, 0.08)',
                    emerald: '#10B981',
                    emeraldDark: '#047857',
                    emeraldLight: '#34D399',
                    gold: '#F59E0B',
                    cyan: '#06B6D4',
                    sky: '#38BDF8',
                    accent: '#8B5CF6'
                }
            },
            boxShadow: {
                'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
                'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
                'glow-gold': '0 0 25px -5px rgba(245, 158, 11, 0.35)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.12)',
                'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
            }
        },
    },
    plugins: [],
}
