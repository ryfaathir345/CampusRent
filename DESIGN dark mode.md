---
name: CampusRent Dark
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8c909f'
  outline-variant: '#424753'
  surface-tint: '#afc6ff'
  primary: '#afc6ff'
  on-primary: '#002d6c'
  primary-container: '#528dff'
  on-primary-container: '#00275f'
  inverse-primary: '#0059c6'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#ca8100'
  on-tertiary-container: '#3e2400'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#afc6ff'
  on-primary-fixed: '#001a43'
  on-primary-fixed-variant: '#004398'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style
The design system transitions to a high-end, "Midnight Academic" aesthetic. It targets students and property managers seeking a premium, focused experience that reduces eye strain during late-night browsing. The style is a hybrid of **Modern Corporate** and **Glassmorphism**, utilizing deep obsidian surfaces with translucent overlays to create a sense of architectural depth. The emotional response is one of security, sophistication, and clarity.

## Colors
The palette is anchored by a deep navy-black base. The Royal Blue primary color has been shifted to a slightly higher luminosity (#4D8BFF) to ensure WCAG AA compliance against dark backgrounds while maintaining its vibrant brand equity. 

- **Surface Tiers:** Use the darkest navy for the main background and lighter navy shades for containers to imply elevation.
- **Accents:** Secondary green is used for "Available" statuses, and Tertiary amber for "Urgent/New" alerts.
- **Contrast:** Always ensure primary actions maintain a 4.5:1 contrast ratio against their respective surface.

## Typography
This design system utilizes **Plus Jakarta Sans** across all levels to maintain a friendly yet modern geometric feel. 

- **Weight:** Use SemiBold (600) or Bold (700) for titles to ensure they pop against the dark background.
- **Hierarchy:** Use `on-surface-medium` for body text to reduce glare, reserving `on-surface-high` (pure white-off) for headings and critical information.
- **Letter Spacing:** Headlines utilize slight negative tracking for a tighter, premium editorial look.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a 12-column structure for desktop and a 4-column structure for mobile. 

- **Rhythm:** All spacing must be multiples of 8px. 
- **Breathing Room:** Increase vertical padding in dark mode to prevent the interface from feeling "heavy." 
- **Desktop Max-Width:** Limit content containers to 1280px to maintain readability on ultra-wide monitors.

## Elevation & Depth
In this dark mode iteration, depth is conveyed through **Tonal Layering** and **Glassmorphism** rather than heavy shadows.

- **Surface Levels:** As an element rises in elevation (e.g., a modal), its background color becomes lighter (`surface-elevated`).
- **Glass Effects:** Use a 12px backdrop blur with a 10% white tint for sticky navigation bars and floating filters to maintain context of the content underneath.
- **Inner Glows:** For primary buttons, apply a subtle 1px top-inner-border (white at 10% opacity) to simulate light hitting the top edge.

## Shapes
Following the "Round Eight" philosophy, the standard border radius is 0.5rem (8px). 

- **Small Components:** Checkboxes and tags use 4px (Soft).
- **Standard UI:** Buttons, Input fields, and Cards use 8px (Rounded).
- **Large Containers:** Modals and bottom sheets use 16px (rounded-lg) to soften the large surface area.

## Components
- **Buttons:** Primary buttons use the Royal Blue fill with white text. Secondary buttons use a `surface-elevated` fill with a subtle `outline-subtle`.
- **Inputs:** Use `surface-container` for the background. The active state should trigger a 2px Royal Blue border and a soft blue outer glow (blur: 4px).
- **Cards:** Property cards should have a 1px `outline-subtle` border. On hover, the border color shifts to `outline-strong` and the card scales slightly (1.02x).
- **Chips:** Use low-contrast backgrounds (e.g., `primary` at 15% opacity) with high-contrast text for categories like "Studio" or "Pet Friendly."
- **Search Bar:** A prominent component; use `surface-elevated` with a glassmorphic blur and a search icon in `on-surface-medium`.