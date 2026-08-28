# Design System: HeartFlow OS

## 1. Visual Theme & Atmosphere
A restrained, highly dense utilitarian interface engineered for clinical telemetry. The atmosphere is precise, unornamented, and cockpit-dense — like a modern piece of medical hardware. It abandons marketing fluff (drop shadows, massive radii, neon glows) in favor of absolute data legibility, 1px structural hairlines, and muted semantic pastels.

- **DESIGN_VARIANCE: 6** — Asymmetric bento grids, strict baseline rhythms.
- **MOTION_INTENSITY: 5** — Restrained. Staggered reveals and layout-fluidity for data changes, but no perpetual decorative loops.
- **VISUAL_DENSITY: 8** — Cockpit-dense. Maximum data visibility without visual collision.

## 2. Color Palette & Roles
- **Clinical Canvas** (`#FBFBFA`) — Primary background surface for the application root.
- **Pure Surface** (`#FFFFFF`) — Card and container fill.
- **Ink Black** (`#141413`) — Primary text, CTAs, and active focus rings.
- **Slate Gray** (`#696969`) — Secondary text, metadata, tabular headers, and decorative icons.
- **Whisper Border** (`#EAEAEA`) — Card borders, dividers, 1px structural lines. No shadows.
- **Risk Pastel** (`#FDEBEC` bg / `#9F2F2D` text) — Semantic warning state (e.g., At-Risk predictions).
- **Healthy Pastel** (`#EDF3EC` bg / `#346538` text) — Semantic success state.
- **Soft Bone** (`#F4F4F4`) — Neutral tertiary state or loading badges.

## 3. Typography Rules
- **Display:** `Geist` or `Outfit` (sans-serif) — Track-tight (`-0.02em`), controlled scale, weight-driven hierarchy (Medium 500 for headers).
- **Body:** `Geist` or `Outfit` — Relaxed leading (`1.5`), `450` weight, Slate Gray.
- **Data / Numbers:** `Geist Mono` or Tabular-Nums on the sans font — Mandatory for all live telemetry, timestamps, and confidence percentages to prevent horizontal layout jitter.
- **Banned:** Generic serifs (`Times New Roman`, `Georgia`) are banned in this software UI. Generic `Inter` is discouraged in favor of `Geist` for a more precise technical aesthetic.

## 4. Component Stylings
- **Buttons:** Flat, Ink Black fill. Border radius of `6px` or `8px`. Tactile `scale(0.98)` push feedback on active state. No neon outer glows, no massive pills (999px) in the dashboard.
- **Cards (Bento Grid):** Crisp `12px` or `8px` corners. Strict `1px solid #EAEAEA` border. Absolutely zero drop shadows (`shadow-none`). 
- **Inputs & Navigation:** Focus states must use a harsh, highly-visible 2px ring (`focus-visible:ring-2 focus-visible:ring-[#141413]`). Label above, error below.
- **Loaders:** Skeletal shimmer matching exact layout dimensions. No generic circular spinners.
- **Status Pills:** Small, dense (`text-[11px]`), uppercase with wide tracking (`0.05em`), using the muted semantic pastels above.

## 5. Layout Principles
- **Macro-Whitespace:** 8-point baseline grid. Generous internal padding inside cards (`p-8`), but tightly packed grids (`gap-6`).
- **No Overlapping Elements:** Every element occupies its own clear spatial zone. No absolute-positioned content stacking.
- **Bento Constraints:** The layout must adapt exactly to the number of data panels. No empty slots.
- **Responsive Strictness:** Multi-column layouts must explicitly collapse to a single column below 768px. No horizontal scroll on mobile.
- **Height Constraints:** Full-height views must use `min-h-[100dvh]` to avoid iOS Safari address bar jumps.

## 6. Motion & Interaction
- **Physics Engine:** Spring physics for all interactive layout shifts (`stiffness: 100, damping: 20`). No linear easing.
- **Staggered Orchestration:** List items and bento cards enter via a subtle `translateY(12px)` + `opacity: 0` staggered cascade. Never mount the full dashboard instantly.
- **Hardware Acceleration:** Animate exclusively via `transform` and `opacity`. 
- **Accessibility Sync:** Interactive layout shifts must respect `prefers-reduced-motion`. Live data must have `aria-live="polite"` so motion isn't the only indicator of change.

## 7. Anti-Patterns (BANNED)
- **NO emojis anywhere.** Use Phosphor, Lucide, or Radix UI icons.
- **NO generic purple/blue neon glows** or gradient meshes.
- **NO pure black** (`#000000`).
- **NO drop shadows** (`shadow-md`, `shadow-lg`, etc.). Elevation is handled by 1px borders.
- **NO fake placeholder names** (John Doe, Acme).
- **NO unstyled focus states.** 
- **NO AI copywriting clichés** ("Elevate", "Seamless", "Unleash").
- **NO "Inter" font** as the default assumption; enforce Geist/Outfit.
- **NO non-tabular numbers** for live updating data.
