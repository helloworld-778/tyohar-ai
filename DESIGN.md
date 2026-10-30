---
name: Tyohar AI
description: Intelligent Celebration & Execution Co-Pilot
colors:
  canvas-ivory: "#FAF7F2"
  surface-sandstone: "#F3EFE6"
  surface-card: "#FFFFFF"
  surface-dark-ledger: "#181512"
  kohl-ink: "#161412"
  muted-stone: "#686259"
  sindoor-vermilion: "#C23B22"
  sindoor-deep: "#9E2A15"
  burnished-brass: "#B4690E"
  mehendi-emerald: "#1E5631"
  blueprint-slate: "#2B4C7E"
  hairline-border: "#E4DEC8"
  strong-border: "#C9C0A6"
typography:
  display:
    fontFamily: "'Instrument Serif', 'Playfair Display', Georgia, serif"
    fontSize: "2.5rem"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Instrument Serif', 'Playfair Display', Georgia, serif"
    fontSize: "1.625rem"
    fontWeight: 400
    lineHeight: 1.2
  title:
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "-0.01em"
  body:
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.02em"
  caption:
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
  micro:
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 700
rounded:
  none: "0px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.kohl-ink}"
    textColor: "{colors.canvas-ivory}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  button-accent:
    backgroundColor: "{colors.sindoor-vermilion}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.kohl-ink}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  card-base:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: Tyohar AI

## Overview

**Creative North Star: "The Editorial Bahi-Khata (Architectural Production Ledger)"**

Tyohar AI rejects dark-mode SaaS clichés, neon aurora blurs, and glassmorphic cards. Instead, it treats Indian celebration planning like an architectural production house and a bespoke financial ledger. The visual language pairs warm archival paper surfaces (`#FAF7F2` and `#F3EFE6`), crisp exposed 1px structural hairlines (`#E4DEC8`), deep kohl-ink typography (`#161412`), and decisive, flat pigment accents inspired by Indian craft: Sindoor Vermilion (`#C23B22`), Burnished Brass (`#B4690E`), and Mehendi Emerald (`#1E5631`).

## Color & Surface Hierarchy

### Surfaces
- **Canvas Ivory (`#FAF7F2`):** Primary root background across all views. High-readability, zero eye strain, warm and grounded.
- **Surface Sandstone (`#F3EFE6`):** Secondary structural grouping surface for sidebars, table headers, inset wells, and unselected controls.
- **Surface Card (`#FFFFFF`):** Crisp elevated sheet surface for active ledgers, contract audits, and primary data modules, bounded by a sharp `1px solid #E4DEC8` border.
- **Surface Dark Ledger (`#181512`):** High-contrast espresso/kohl surface used *strictly* for the ⌘K Chaos Mutator Drawer and top-level executive budget summary bars.

### Pigments (Flat & Intentional — Never Gradients)
- **Kohl Ink (`#161412`):** Primary typography and primary action buttons.
- **Sindoor Vermilion (`#C23B22`):** Critical-path bottlenecks, budget overrun alerts, and high-priority celebratory action triggers.
- **Burnished Brass (`#B4690E`):** Shagun Smart Plate savings, active milestone indicators, and unconfirmed estimate markers.
- **Mehendi Emerald (`#1E5631`):** Fiscal equilibrium, locked/verified vendor quotes, and zero-waste food rescue confirmations.
- **Blueprint Slate (`#2B4C7E`):** Topological dependency graphs and demographic breakdown metrics.

## Anti-Slop Rules (Strict Bans)
1. **No Gradients:** Never use `bg-gradient-to-*` on buttons, text, borders, or tab pills. Use solid, flat, high-contrast pigment fills.
2. **No Neon Blurs or Spotlights:** Completely remove `blur-3xl` aurora meshes, `backdrop-blur` glassmorphism, and mouse-tracking radial spotlight glows (`SpotlightCard` effects).
3. **No Bouncy Scale Physics:** Do not put `whileHover={{ scale: 1.02 }}` on cards or buttons. Use crisp color/border transitions (`150ms ease-out`).
4. **Sharp Architectural Radii:** Use `rounded-md` (`6px`) for buttons/inputs and `rounded-lg` (`8px`) for cards—never puffy `rounded-2xl` or `rounded-3xl` containers.

## Typography & Domain Rules

- **Editorial Headers (`Playfair Display` or `Instrument Serif`):** Used at larger sizes with tight tracking (`-0.02em`) and normal/medium weight—never paired with glowing text shadows.
- **UI Body (`Plus Jakarta Sans`):** Left-aligned, high-density, scannable layout. Never center-align multi-line body text inside cards.
- **The Tabular Number Rule (`JetBrains Mono`):** Every INR currency amount (`₹`), guest count, plate estimate, and countdown must use `JetBrains Mono` with `font-variant-numeric: tabular-nums` and standard Indian locale grouping (`₹1,00,000`).
- **The Price Transparency Rule:** Every AI-generated cost estimate must display a crisp flat badge reading `Benchmark Estimate (Unconfirmed)` in Burnished Brass until locked as a `Verified Vendor Quote` in Mehendi Emerald.

## Layout & Structural Grid
- **Exposed Hairline Ledger Grid:** Prefer contiguous architectural grids (`divide-x`, `divide-y`, `border-[#E4DEC8]`) over floating cards with giant gaps where appropriate for financial and timeline data.
- **Studio Shell:** 240px structured sidebar on `#F3EFE6` with `1px solid #E4DEC8` right border, paired with a crisp 52px top command bar and the ⌘K Chaos Mutator Drawer.

## Functional Constraints (Must Preserve)
- Wrap dynamic currency and plate metrics in `<AnimatedCurrency />` and `<AnimatedNumber />`.
- Conceal maximum budget ceilings from vendor negotiation drafts generated in the WhatsApp RFQ studio.
- Maintain print-friendly `@media print` rules for official execution briefs.
- Enforce session-isolated BYOK handling; never hardcode API keys.