const tokens = require('./tokens.json')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-canvas': 'hsl(var(--color-bg-canvas))',
        'bg-subtle': 'hsl(var(--color-bg-subtle))',
        'bg-card': 'hsl(var(--color-bg-card))',
        'bg-hover': 'hsl(var(--color-bg-hover))',
        'bg-pressed': 'hsl(var(--color-bg-pressed))',
        'fg-default': 'hsl(var(--color-fg-default))',
        'fg-muted': 'hsl(var(--color-fg-muted))',
        'fg-subtle': 'hsl(var(--color-fg-subtle))',
        'fg-on-accent': 'hsl(var(--color-fg-on-accent))',
        
        'accent': 'hsl(var(--color-accent-default))',
        'accent-hover': 'hsl(var(--color-accent-hover))',
        'accent-pressed': 'hsl(var(--color-accent-pressed))',
        'accent-subtle': 'hsl(var(--color-accent-subtle))',
        'accent-muted': 'hsl(var(--color-accent-muted))',
        
        'stroke-divider': 'hsl(var(--color-stroke-divider))',
        'stroke-strong': 'hsl(var(--color-stroke-strong))',
        'stroke-focus': 'hsl(var(--color-stroke-focus))',
        
        'status-success': 'hsl(var(--color-status-success))',
        'status-warning': 'hsl(var(--color-status-warning))',
        'status-danger': 'hsl(var(--color-status-danger))',
        'status-info': 'hsl(var(--color-status-info))',
      },
      borderRadius: {
        sm: tokens.radius.sm,
        md: tokens.radius.md,
        lg: tokens.radius.lg,
        pill: tokens.radius.pill,
      },
      boxShadow: {
        sm: tokens.shadow.sm,
        md: tokens.shadow.md,
        lg: tokens.shadow.lg,
      },
      spacing: {
        1: tokens.space[1],
        2: tokens.space[2],
        3: tokens.space[3],
        4: tokens.space[4],
        5: tokens.space[5],
        6: tokens.space[6],
        8: tokens.space[8],
        10: tokens.space[10],
        12: tokens.space[12],
        16: tokens.space[16],
        20: tokens.space[20],
        24: tokens.space[24],
      },
      fontSize: {
        xs: [tokens.type.xs.size, { lineHeight: tokens.type.xs.lineHeight, letterSpacing: tokens.type.xs.letterSpacing }],
        sm: [tokens.type.sm.size, { lineHeight: tokens.type.sm.lineHeight, letterSpacing: tokens.type.sm.letterSpacing }],
        md: [tokens.type.md.size, { lineHeight: tokens.type.md.lineHeight, letterSpacing: tokens.type.md.letterSpacing }],
        lg: [tokens.type.lg.size, { lineHeight: tokens.type.lg.lineHeight, letterSpacing: tokens.type.lg.letterSpacing }],
        xl: [tokens.type.xl.size, { lineHeight: tokens.type.xl.lineHeight, letterSpacing: tokens.type.xl.letterSpacing }],
        '2xl': [tokens.type['2xl'].size, { lineHeight: tokens.type['2xl'].lineHeight, letterSpacing: tokens.type['2xl'].letterSpacing }],
        '3xl': [tokens.type['3xl'].size, { lineHeight: tokens.type['3xl'].lineHeight, letterSpacing: tokens.type['3xl'].letterSpacing }],
        '4xl': [tokens.type['4xl'].size, { lineHeight: tokens.type['4xl'].lineHeight, letterSpacing: tokens.type['4xl'].letterSpacing }],
      },
      fontFamily: {
        sans: tokens.font.family.system,
        mono: tokens.font.family.mono,
      },
      fontWeight: {
        normal: tokens.font.weight.normal,
        medium: tokens.font.weight.medium,
        semibold: tokens.font.weight.semibold,
        bold: tokens.font.weight.bold,
      },
      transitionDuration: {
        fast: tokens.transition.duration.fast,
        base: tokens.transition.duration.base,
        slow: tokens.transition.duration.slow,
      },
      transitionTimingFunction: {
        'ease-out': tokens.transition.easing.easeOut,
        'ease-in': tokens.transition.easing.easeIn,
        'ease-in-out': tokens.transition.easing.easeInOut,
      },
    },
  },
  plugins: [],
}