---
name: Elite Water Pitch
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c2c6d8'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8c90a1'
  outline-variant: '#424656'
  surface-tint: '#b3c5ff'
  primary: '#b3c5ff'
  on-primary: '#002b75'
  primary-container: '#0066ff'
  on-primary-container: '#f8f7ff'
  inverse-primary: '#0054d6'
  secondary: '#d3fbff'
  on-secondary: '#00363a'
  secondary-container: '#00eefc'
  on-secondary-container: '#00686f'
  tertiary: '#c6c6c7'
  on-tertiary: '#2f3131'
  tertiary-container: '#707272'
  on-tertiary-container: '#f8f8f8'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae1ff'
  primary-fixed-dim: '#b3c5ff'
  on-primary-fixed: '#001849'
  on-primary-fixed-variant: '#003fa4'
  secondary-fixed: '#7df4ff'
  secondary-fixed-dim: '#00dbe9'
  on-secondary-fixed: '#002022'
  on-secondary-fixed-variant: '#004f54'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-xl:
    fontFamily: Lexend
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Lexend
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Lexend
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  stat-value:
    fontFamily: Lexend
    fontSize: 28px
    fontWeight: '500'
    lineHeight: '1.0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin: 40px
  container-max: 1440px
  bento-gap: 16px
---

## Brand & Style

This design system is engineered for the high-stakes environment of elite hockey management. The brand personality is aggressive, precise, and technologically superior. It draws inspiration from a "Water Pitch"—the slick, high-speed surface of modern field hockey—and translates that into an ice-hockey context through high-contrast visuals and fluid depth.

The design style combines **Minimalism** with high-end **Glassmorphism**. By utilizing a "Carbon and Neon" aesthetic, the interface prioritizes data clarity while maintaining a premium sports-tech feel. Layouts rely on a structured Bento Grid system to organize disparate data points—player stats, rink heatmaps, and financial metrics—into a cohesive, glanceable dashboard. The emotional response is one of absolute control and modern professionalism.

## Colors

The palette is anchored by a deep, immersive dark mode. The primary color is a high-energy **Electric Blue**, used exclusively for interactive elements, primary actions, and critical data highlights. 

- **Primary Background:** Deep Carbon Black (#0A0A0A) provides the "pitch" for all components.
- **Surface Layers:** Charcoal Grays (#1A1A1A) create subtle separation for container elements.
- **Accents:** A secondary Cyan-tinted neon is used for data visualization gradients to simulate the refractive quality of water and ice. 
- **Functional Colors:** High-saturation reds and greens are reserved for performance indicators (e.g., injury status or upward scouting trends).

## Typography

The typography system utilizes two distinct sans-serifs to balance athletic energy with technical utility. 

**Lexend** is the primary choice for headlines and data labels. Its geometric clarity and wide apertures echo the "athletic" feel of sports branding while remaining highly legible. It is used for large displays, stat values, and section headers.

**Inter** handles the heavy lifting for body copy and administrative tables. It provides a neutral, utilitarian counterpoint to Lexend, ensuring that complex management text—such as contract terms or scouting reports—is easy to parse in high-density views.

## Layout & Spacing

This design system employs a **Bento Grid** layout model, characterized by modular rectangular containers of varying sizes. This approach is essential for hockey management, allowing "Player Profiles," "Roster Depth," and "Financial Summaries" to coexist in a rigid, organized hierarchy.

- **Grid:** A 12-column fluid grid system with a generous 24px gutter.
- **Rhythm:** An 8px base unit drives all padding and margin decisions. 
- **Bento Modules:** Use consistent inner padding (24px or 32px) to ensure content within cards feels premium and uncluttered.
- **Negative Space:** Use aggressive margins around the main container to focus the user’s eye on the "Water Pitch" surface.

## Elevation & Depth

Depth is conveyed through **Glassmorphism** and tonal stacking rather than traditional shadows. 

1.  **Base Layer:** The Carbon Black (#0A0A0A) background.
2.  **Surface Layer:** Bento cards use Charcoal Gray (#1A1A1A) with a subtle 1px border (#FFFFFF 10% opacity).
3.  **Glass Layer:** Overlays, modals, and dropdowns utilize a backdrop-filter blur (20px to 40px) with a semi-transparent fill (Primary Blue at 5% or White at 5%). 

Interaction is signaled through "Glow" effects. When a component is active or hovered, a soft, diffused outer glow using the Primary Blue (#0066FF) replaces the need for high-elevation shadows, simulating light reflecting off a polished surface.

## Shapes

The shape language is "Sophisticated-Rounded." A medium corner radius (0.5rem base) is applied to all primary containers and cards. This softens the aggressive dark theme and provides a modern, "app-like" feel. 

Buttons and small interactive elements (tags, chips) use a more pronounced rounding or full pill-shape to distinguish them from the structural Bento grid containers. Interactive inputs and form fields maintain the base roundedness for a consistent, architectural look.

## Components

**Buttons:** 
- *Primary:* Solid Primary Blue (#0066FF) with white text. High-gloss finish.
- *Secondary:* Ghost style with 1px Primary Blue border and subtle glass blur background.

**Cards (Bento Modules):** 
The core of the system. Cards must have a 1px inner stroke (#FFFFFF at 10% opacity) to define edges against the black background. Use `backdrop-filter: blur()` on cards that overlap data-heavy backgrounds.

**Chips & Badges:** 
Used for player positions (e.g., "LW", "D") and status. These should be pill-shaped with high-contrast fills. Use the "Water" theme by applying a slight gradient from Primary Blue to Cyan for active states.

**Inputs:** 
Dark-themed text fields with Charcoal Gray backgrounds. Focus states must trigger a Primary Blue outer glow and a 1px border highlight.

**Rink Heatmaps:** 
A custom component unique to this system. The rink should be rendered in deep grays with data "blooms" using Primary Blue and Cyan gradients to represent player movement and puck density.

**Data Tables:** 
High-density but breathable. Use "zebra-striping" with subtle opacity shifts rather than alternating colors. Row hovers should trigger a slight Primary Blue left-border accent.