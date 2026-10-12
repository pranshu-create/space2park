---
name: Obsidian Orbit
colors:
  surface: '#121416'
  surface-dim: '#121416'
  surface-bright: '#38393c'
  surface-container-lowest: '#0c0e10'
  surface-container-low: '#1a1c1e'
  surface-container: '#1e2022'
  surface-container-high: '#282a2c'
  surface-container-highest: '#333537'
  on-surface: '#e2e2e5'
  on-surface-variant: '#d3c4b1'
  inverse-surface: '#e2e2e5'
  inverse-on-surface: '#2f3033'
  outline: '#9b8f7d'
  outline-variant: '#4f4537'
  surface-tint: '#f3be5f'
  primary: '#f6c162'
  on-primary: '#422c00'
  primary-container: '#d8a64a'
  on-primary-container: '#583d00'
  inverse-primary: '#7d5700'
  secondary: '#c3c7cc'
  on-secondary: '#2d3135'
  secondary-container: '#43474c'
  on-secondary-container: '#b2b5bb'
  tertiary: '#44e2b1'
  on-tertiary: '#003828'
  tertiary-container: '#0ac597'
  on-tertiary-container: '#004b37'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdeaa'
  primary-fixed-dim: '#f3be5f'
  on-primary-fixed: '#271900'
  on-primary-fixed-variant: '#5f4100'
  secondary-fixed: '#e0e3e8'
  secondary-fixed-dim: '#c3c7cc'
  on-secondary-fixed: '#181c20'
  on-secondary-fixed-variant: '#43474c'
  tertiary-fixed: '#64fcc9'
  tertiary-fixed-dim: '#40dfae'
  on-tertiary-fixed: '#002116'
  on-tertiary-fixed-variant: '#00513c'
  background: '#121416'
  on-background: '#e2e2e5'
  surface-variant: '#333537'
typography:
  display:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Manrope
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Manrope
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.12em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  data-mono:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies the calculated precision of an ultra-luxury electric vehicle cockpit fused with the navigational clarity of Apple Maps. Designed for high-end autonomous and smart-mobility platforms, the interface projects composure, quiet authority, and technological dominance. The emotional response is one of effortless command, calm efficiency, and sophisticated engineering.

The aesthetic philosophy centers on **Dark Glass & Precision Minimal**: deep charcoal tones, micro-ruled borders, subtle ambient luminance, and typographic discipline. Visual weight is communicated through high-clarity typography and negative space rather than heavy decoration. Micro-interactions evoke physical aerospace instruments—snappy, dampened, and luminous.

## Colors

The palette relies on absolute darkness paired with metallic warm brass accents and telemetry-grade status tones.

- **Primary Accent (`#D8A64A`)**: Warm luxury gold representing focus states, reserve actions, and active waypoints. Supported by **Highlight Gold (`#EBC878`)** for interactive hovers and state changes.
- **Ambient Glow (`rgba(216, 166, 74, 0.15)`)**: Soft, diffused backlight reserved for key actions and active vehicle/bay indicators.
- **Surfaces & Layers**:
  - **Canvas Base (`#0B0D0F`)**: Deepest black-slate ground.
  - **Surface Level 1 (`#14181C`)**: Structural panels, side navigation rails, and bottom sheets.
  - **Container Level 2 (`#191E23`)**: Floating cards, contextual sheets, and interactive elements.
  - **Precision Borders (`#252C34`)**: Subtle 1px structural partitions with low optical footprint.
- **Telemetry Indicators**:
  - **Available / Live Status (`#38D9A9`)**: Crisp emerald green indicating bay availability, fast-charging active states, and clearance.
  - **Occupied / Inert (`#2E3640`)**: Low-energy, non-competing slate indicating occupied slots or passive entities.
- **Typography Hierarchy**:
  - **Primary Text (`#F5F5F2`)**: Off-white matte pearl delivering readable contrast without harsh glare.
  - **Secondary / Subtext (`#9EA5AD`)**: Cool neutral slate for metadata, distances, units, and timestamps.

## Typography

Typographic execution draws inspiration from high-speed digital dashboards: clean, ultra-legible, and structured. 

- **Manrope** provides authoritative geometric strength for headlines, key figures, and upper-cased labels. All section headers, status badges, and telemetry categories employ `label-caps` with wide letter-spacing (`0.12em`) to mirror premium automotive instrumentation.
- **Inter** ensures effortless legibility for continuous reading, contextual specs, and technical coordinates across mobile overlays and ambient in-car displays.
- Keep numeral representations structured; use tabular numbers for slot identifiers, pricing tickers, and distance meters.

## Layout & Spacing

The layout adopts a flexible screen-edge philosophy optimized for full-canvas map experiences. 

- **Desktop & In-Dash Screens**: Utilizes an asymmetrical fluid grid. Navigation and telemetry HUD panels occupy fixed anchors (`380px` to `460px`), while spatial map engines and bay routing stretch edge-to-edge. Outer margin is `3rem` for spacious airiness.
- **Mobile (Smartphones)**: Content collapses into persistent top search/status bars and floating bottom sheets that snap into three heights (collapsed preview, mid summary, expanded reservation). Outer margin drops to `1.25rem`.
- **Rhythm & Gaps**: Maintain internal component spacing on a strict 8pt rhythm, using `space-xs` and `space-sm` for tight data pairs (e.g., floor number and bay ID) and `space-lg` to separate functional interactive blocks.

## Elevation & Depth

Depth is conveyed through calibrated surface tiers, hairline borders, and targeted light diffusion rather than heavy dropshadows:

- **Level 0 (Base)**: `#0B0D0F`, the non-interactive navigational canvas and satellite geometry.
- **Level 1 (Docked Surfaces)**: `#14181C`, backed by `backdrop-filter: blur(24px)` with 85% opacity when floating over vector map terrain.
- **Level 2 (Cards & Modules)**: `#191E23`, paired with a crisp `1px solid #252C34` boundary stroke. 
- **Active State / Atmospheric Glow**: When a bay or card becomes focused, apply `box-shadow: 0 0 24px 0 rgba(216, 166, 74, 0.15)`. No heavy black drop shadows; light behaves like calibrated LEDs on anodized metal.

## Shapes

The geometry uses a balanced `roundedness: 2` scale, pairing precision corners with subtle curves.

- **Primary Cards & Drawers**: `rounded-lg` (16px) creates a continuous, ergonomic border reminiscent of modern vehicle touch consoles.
- **Interactive Badges, Chips, and Micro-Triggers**: Standard `rounded` (8px) or fully continuous pills (for live statuses and state chips).
- **Control Inputs & Segmented Switches**: `rounded` (8px), matching hardware-like tolerances.

## Components

### Buttons
- **Primary Action**: Background `#D8A64A`, foreground `#0B0D0F`, weight `600`. Subtle hover transition to `#EBC878`. Focused states project an ambient ring: `0 0 0 1px #EBC878, 0 0 16px rgba(216, 166, 74, 0.25)`.
- **Secondary Action**: Background `#191E23`, border `1px solid #252C34`, text `#F5F5F2`. Hover elevates border to `#D8A64A` with zero background shift.
- **Ghost / Map Control**: Transparent surface with `backdrop-filter: blur(16px)`, border `1px solid #252C34`, text `#F5F5F2`.

### Chips & Badges
- **Status Indicator (Available)**: Background `rgba(56, 217, 169, 0.12)`, text `#38D9A9`, border `1px solid rgba(56, 217, 169, 0.3)`. Accompanied by a 6px circular pulsing indicator.
- **Status Indicator (Occupied)**: Background `#191E23`, text `#9EA5AD`, border `1px solid #252C34`.
- **Telemetry Tag**: Uses `label-caps` in `#9EA5AD` with uppercase tracking.

### Cards & Modules
- Base background `#191E23` with a precise `1px solid #252C34` boundary.
- Internal padding set strictly to `space-lg` (24px) for desktop, `space-md` (16px) for mobile.
- Headers integrate an icon anchor, category tracker in `label-caps`, and clear numerical metrics in `Manrope`.

### Input Fields & Search Bars
- Background `#14181C`, border `1px solid #252C34`, text `#F5F5F2`.
- Active focus smoothly transitions border to `#D8A64A` and invokes a localized gold ambient aura without intrusive browser outlines.
- Clear search icons styled in `#9EA5AD`.

### Selection Controls (Checkboxes & Radios)
- Custom square (`rounded: 4px`) and circular toggles inside `#14181C` housing with `#252C34` border.
- Selected state fills with `#D8A64A`, utilizing an off-black `#0B0D0F` check or dot marker.

### Specialized Mobility Elements
- **Bay Slot Indicator**: A high-contrast rectangular cell showing bay code, EV charging capacity badge (e.g., "350 kW DC"), and dynamic ETA distance counter.
- **Route Guidance HUD**: Floating translucent header showing directional turn vectors in `#F5F5F2` with distance counters rendered in tabular `data-mono`.