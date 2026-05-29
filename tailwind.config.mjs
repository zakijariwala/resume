/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Semantic surface tokens
        bg:               'var(--bg)',
        surface:          'var(--surface)',
        'surface-raised': 'var(--surface-raised)',
        border:           'var(--border)',
        'border-strong':  'var(--border-strong)',

        // Semantic text tokens
        text:             'var(--text)',
        'text-muted':     'var(--text-muted)',
        'text-disabled':  'var(--text-disabled)',

        // Mode-reactive accent
        accent:           'var(--accent)',
        'accent-subtle':  'var(--accent-subtle)',
        'accent-border':  'var(--accent-border)',
        'accent-text':    'var(--accent-text)',

        // Fixed gold (structural)
        accent2:          'var(--accent2)',
        'accent2-subtle': 'var(--accent2-subtle)',
        'accent2-border': 'var(--accent2-border)',
        'accent2-text':   'var(--accent2-text)',

        // Primitive accent values (for reference in one-off utilities)
        'accent-recruiter': '#1A6BFF',
        'accent-developer': '#1A8A5A',
        'accent-curious':   '#B87A00',

        // Status
        'status-active':          'var(--status-active)',
        'status-active-text':     'var(--status-active-text)',
        'status-done':            'var(--status-done)',
        'status-done-text':       'var(--status-done-text)',
        'status-pending':         'var(--status-pending)',
        'status-pending-text':    'var(--status-pending-text)',
        'status-dim':             'var(--status-dim)',
        'status-dim-text':        'var(--status-dim-text)',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Courier New', 'monospace'],
        // Keep old aliases for transition period
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs-token':   'var(--text-xs)',
        'sm-token':   'var(--text-sm)',
        'base-token': 'var(--text-base)',
        'lg-token':   'var(--text-lg)',
        'xl-token':   'var(--text-xl)',
        '2xl-token':  'var(--text-2xl)',
        '3xl-token':  'var(--text-3xl)',
      },
      borderRadius: {
        xs:   'var(--radius-xs)',
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        pill: 'var(--radius-pill)',
      },
      spacing: {
        nav:  'var(--nav-height)',
      },
      maxWidth: {
        layout: 'var(--layout-max)',
      },
    },
  },
  plugins: [],
};
