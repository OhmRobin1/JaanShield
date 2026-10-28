---
name: Obsidian Telemetry
colors:
  surface: '#101419'
  surface-dim: '#101419'
  surface-bright: '#36393f'
  surface-container-lowest: '#0a0e14'
  surface-container-low: '#181c21'
  surface-container: '#1c2025'
  surface-container-high: '#262a30'
  surface-container-highest: '#31353b'
  on-surface: '#e0e2ea'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#e0e2ea'
  inverse-on-surface: '#2d3136'
  outline: '#849495'
  outline-variant: '#3b494b'
  surface-tint: '#00dbe9'
  primary: '#dbfcff'
  on-primary: '#00363a'
  primary-container: '#00f0ff'
  on-primary-container: '#006970'
  inverse-primary: '#006970'
  secondary: '#7dffa2'
  on-secondary: '#003918'
  secondary-container: '#05e777'
  on-secondary-container: '#00622e'
  tertiary: '#f5f5ff'
  on-tertiary: '#002d6e'
  tertiary-container: '#ccd9ff'
  on-tertiary-container: '#0058cb'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#7df4ff'
  primary-fixed-dim: '#00dbe9'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#62ff96'
  secondary-fixed-dim: '#00e475'
  on-secondary-fixed: '#00210b'
  on-secondary-fixed-variant: '#005226'
  tertiary-fixed: '#d9e2ff'
  tertiary-fixed-dim: '#b0c6ff'
  on-tertiary-fixed: '#001945'
  on-tertiary-fixed-variant: '#00429b'
  background: '#101419'
  on-background: '#e0e2ea'
  surface-variant: '#31353b'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
  telemetry-metric:
    fontFamily: JetBrains Mono
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
The design system establishes a mission-critical, hyper-precise telemetry command interface. Merging industrial IoT security operations with aerospace tactical displays, it projects absolute system reliability, sub-second responsiveness, and uncompromising situational awareness. 

The aesthetic is precision dark cyberpunk anchored by functional brutalism and holographic telemetry. Visual cues draw from advanced cockpit avionics, field-ready ruggedized computing, and tactical network operations centers. Surfaces feel monolithic and non-reflective, lit only by high-contrast neon status emissions, thin vector reticles, and live kinetic data paths. The interface prioritizes low visual fatigue in dark ops environments while demanding immediate peripheral attention when anomalies manifest.

## Colors
The palette operates on strict tactical signaling rules against deep, non-emissive obsidian foundations.

- **Foundational Neutrals:** Background canvas sits at `#090D12` (Deep Void Obsidian) with panel elevations stepping to `#0F1722` (Slate Monolith) and `#162232` (Terminal Surface). Borders and vector grids leverage `#22344C` at varying opacities.
- **Primary Telemetry (`#00F0FF`):** Cyan vector beam. Reserved for structural active states, primary system links, crosshairs, active selection bounding boxes, and system nominal feedback.
- **Safety Emerald (`#00E676`):** Physiological baseline, biometric synchronization, nominal air quality, and secure network links.
- **Electric Azure (`#2979FF`):** Secondary tactical layer, peripheral sensor feeds, raw data transfers, and standard operational overlays.
- **Tactical Alerts (Functional):**
  - **Warning Amber (`#FFB300`):** Sensor latency, thermal strain, borderline gas exposure, and device sync retries.
  - **Biohazard Crimson (`#FF3366`):** Critical cardiac anomaly, containment breach, kinetic impact, and immediate operational distress.

Text rendering strictly uses `#E2EDF8` for critical readouts, `#8CA3BA` for standard descriptions, and `#41576E` for static telemetry labels and unit markers.

## Typography
Typographic hierarchy is bifurcated between structured operational data and narrative readability:

- **Display & Headlines (`Space Grotesk`):** Delivers cold, geometric authority. Letter spacing is tight (-0.02em) on display sizes to evoke heavy industrial machinery nameplates.
- **Interface Body (`Inter`):** Selected for rapid scanning and uncompromised legibility across complex multi-panel dashboard layouts.
- **HUD & Telemetry Readouts (`JetBrains Mono`):** Every numerical variable, timestamp, geo-coordinate, biometric parameter, and sensor ID must be rendered in monospace. Tabular numerals prevent UI jittering during high-frequency live stream updates.
- All small labels (`label-sm`, `label-md`) use forced uppercase with expanded letter-spacing (+0.08em to +0.12em) to emulate tactical avionic screens.

## Layout & Spacing
The layout adheres to a high-density, multi-panel fluid grid that maximizes situational awareness without requiring excessive scrolling.

- **Grid Architecture:** Desktop views implement a 12-column or 24-column modular layout with dense `1rem` gutters, facilitating telemetry docks, lateral toolbars, and primary tactical canvas zones. Mobile views compress into a single-column telemetry stack with compact `1rem` canvas margins.
- **Density Scaling:** Telemetry feeds favor tight vertical packing (`space-xs` and `space-sm`) to maximize the visible data density per square inch, while operational group boundaries employ `space-lg` to prevent accidental touch or click input errors.
- **Alignment:** Strict 4px base modular unit. Grid overlays can be surfaced directly as visual UI elements using thin 1px lines at 8% opacity to maintain instrument calibration cues.

## Elevation & Depth
Depth in this system avoids naturalistic diffuse drop shadows; instead, it relies on laser-sharp structural layering, chromatic glows, and high-frequency edge borders.

- **Tonal Layers:** Physical depth is represented by dark stepped planes: Base (`#090D12`), Surface Layer 1 (`#0F1722`), Surface Layer 2 (`#162232`), and Active Panel Overlay (`#1C2B3F`).
- **Tactical Outlines:** Panels rely on 1px crisp borders (`#22344C`). Focused, hovering, or active panels gain a 1px inner stroke illuminated by `#00F0FF` at 60% opacity.
- **Laser-Glow Elevation:** Critical and alert elevations use targeted neon glows rather than black drop-shadows. A high-priority alarm creates an emissive outer glow: `0 0 16px rgba(255, 51, 102, 0.45)`, while nominal focus states use `0 0 12px rgba(0, 240, 255, 0.35)`.
- **Holographic Scrims:** Modals and diagnostic flyouts use semi-transparent backdrops (`#090D12` at 85% opacity) coupled with an 8px hardware blur and subtle scanline rastering.

## Shapes
The shape language is strictly non-organic, geometric, and tactical.

- **Corner Radii:** Zero-radius corners (`0px`) dominate the interface, creating sharp, structural, military-grade enclosures. 
- **Chamfer Accents:** High-level status containers, primary triggers, and corner-docked widgets utilize 45-degree angle cuts (chamfered edges, 6px to 10px cut) on opposite diagonal corners (`top-right` and `bottom-left`), reinforcing aerospace telemetry framing.
- **Reticle Indicators:** Container borders frequently feature broken lines, external corner ticks (crosshair styling), and technical measurement markers along their outer frame.

## Components

### Buttons & Tactical Triggers
- **Primary Command:** Solid `#00F0FF` fill with stark `#090D12` bold typography. Diagonal chamfer on the top-right corner. Hover emits a cyan outer flare.
- **Secondary / Action Bordered:** Transparent slate fill with a 1px border in `#00F0FF` or `#22344C`. Text set in uppercase monospace. On hover, background shifts to `rgba(0, 240, 255, 0.1)`.
- **Destructive / Emergency Override:** Crimson outline `#FF3366`, blinking alert beacon icon, transitioning to solid fill upon confirmation hold.

### Biometric Cards & Sensor Docks
- Encased in `#0F1722` with a 1px `#22344C` perimeter and technical metadata printed in the top header (`SENSOR_ID // [SYNC: OK]`).
- Houses integrated micro-displays: live SVG-rendered ECG polyline streams glowing in emerald (`#00E676`), numerical pulse/oxygen metrics in Space Grotesk/JetBrains Mono, and status ping intervals.

### Radar & Heat Index Gauges
- Circular vector gauges rendered with concentric targeting rings, rotating radial sweep gradients at 15% opacity, and quadrant crosshairs.
- Core telemetry tracks heat indices using color-stratified arcs transitioning from `#00E676` to `#FFB300` and culminating in `#FF3366`.

### Glowing Status Badges & Chips
- Monospaced, all-caps micro-chips. Backgrounds use 12% tint of their respective status hue with an uninterrupted 1px saturated border.
- Prefixed with an animated 6px hardware indicator dot that pulses periodically to signal active data streaming.

### Input Fields & Terminal Controls
- Squared slate input fields (`#0B1118`) with static telemetry brackets flanking the boundaries.
- Carets are solid vertical blocks (`#00F0FF`) with a steady blink cycle. Placeholder text rendered in muted slate (`#41576E`) mimicking command line prompts (`>` syntax).

### Checkboxes & Toggle Switches
- Checkboxes are square, zero-radius frames with an animated interior cross/reticle lock when activated.
- Toggles utilize sliding rectangular block switches featuring dual-state LED pings instead of rounded pill sliders.