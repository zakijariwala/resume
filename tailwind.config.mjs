/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Tailwind tokens configured to reference semantic CSS custom properties
        background: 'var(--background)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        
        // Exact accent hex specifications mapping to perspective states
        'accent-recruiter': '#1A6BFF',
        'accent-developer': '#1A8A5A',
        'accent-curious': '#B87A00',
        
        // Dynamic active accent bound to custom property reference
        accent: 'var(--accent)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        pill: '24px',
      },
    },
  },
  plugins: [],
};
