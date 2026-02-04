# Tailwind CSS v4 Setup

This project uses **Tailwind CSS v4** with the new simplified configuration approach.

## Key Differences from v3

### ❌ No Longer Needed:
- `tailwind.config.js` - Removed
- `postcss.config.js` - Removed
- `@tailwind base/components/utilities` - Replaced

### ✅ New v4 Approach:
- Single `@import "tailwindcss"` in `app/globals.css`
- Configuration via `@theme` directive in CSS
- Automatic PostCSS integration

## File Structure

```
app/
  globals.css          # Tailwind import + custom styles + @theme config
  layout.tsx           # Imports globals.css
```

## globals.css Structure

```css
@import "tailwindcss";

@theme {
  /* Custom theme variables */
  --font-orbitron: 'Orbitron', sans-serif;
  --color-cyber-dark: #0a0e27;
}

@layer base {
  /* Base styles */
}

@layer components {
  /* Component classes like .cyber-card */
}

@layer utilities {
  /* Utility classes like .glow-cyan */
}
```

## Custom Classes Available

### Cards
- `.cyber-card` - Base cyberpunk card
- `.card-kkl` - KKL league themed card (cyan)
- `.card-kdl` - KDL league themed card (violet)
- `.card-mmh` - MMH league themed card (emerald)
- `.card-bsb` - BSB league themed card (rose)
- `.tool-card` - Tool card for hub pages

### Text Effects
- `.gradient-text-cyan` - Cyan gradient text
- `.gradient-text-violet` - Violet gradient text
- `.gradient-text-emerald` - Emerald gradient text
- `.gradient-text-rose` - Rose gradient text
- `.glow-cyan/violet/emerald/rose` - Glowing text shadows

### Animations
- `.float` - Floating animation
- `.slide-in-up` - Slide up entrance
- `.glitch-text` - Glitch effect
- `.scan-line` - Scanning line overlay

### Backgrounds
- `.cyber-bg` - Cyberpunk gradient background with animated effects

## Installation

```bash
npm install
```

Tailwind v4 is automatically configured and will work with Next.js without additional setup.

## Development

```bash
npm run dev
```

Tailwind will automatically compile and watch for changes.

## Build

```bash
npm run build
```

Tailwind optimizations are applied automatically during the build process.

## Resources

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Tailwind v4 Migration Guide](https://tailwindcss.com/docs/upgrade-guide)
