import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'surface-canvas': 'var(--surface-canvas)',
        'surface-panel': 'var(--surface-panel)',
        'surface-card': 'var(--surface-card)',
        'surface-elevated': 'var(--surface-elevated)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-inverse': 'var(--text-inverse)',
        'text-brand': 'var(--text-brand)',
        'text-link': 'var(--text-link)',
        'brand-primary': 'var(--brand-primary)',
        'brand-accent': 'var(--brand-accent)',
        'brand-heritage': 'var(--brand-heritage)',
        'brand-field': 'var(--brand-field)',
        'border-subtle': 'var(--border-subtle)',
        'border-strong': 'var(--border-strong)',
        'border-active': 'var(--border-active)',
        'border-evidence': 'var(--border-evidence)',
        'risk-bg': 'var(--risk-bg)',
        'risk-text': 'var(--risk-text)',
        'risk-rail': 'var(--risk-rail)',
        'risk-border': 'var(--risk-border)',
      },
      fontFamily: {
        ui: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        token: 'var(--shadow-sm)',
        'token-md': 'var(--shadow-md)',
        'token-lg': 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
} satisfies Config
