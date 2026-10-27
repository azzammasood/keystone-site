# Keystone site: design options (design gate)

Six concepts for the owner to choose from. `preview.html` (same folder) renders each concept's
Radar and Pipeline Live hero from the real exports in `keystone-pipeline` (`data/publish/site`,
generated 2026-10-23). Nothing is built past this gate until one concept is chosen.

Fixed for every concept (brief section 11, not a design choice):

- Static Next.js + React + TypeScript + Tailwind, exported to GitHub Pages, English only.
- Every number comes from an export file and shows its generation time. Empty or partial exports
  show their `status` ("partial data", "pending data", "skipped") in a banner, never filler.
- Repository and package level only; no people. "Signals", never predictions.
- Motion only from real metrics; nothing moves when the last run moved nothing.
  `prefers-reduced-motion` turns all motion off.
- Light and dark: tokens on `:root`, dark via `prefers-color-scheme` plus a manual toggle.
- Accessibility: WCAG 2.2 AA contrast for text and status colours in both modes (axe in CI), status
  never by colour alone (text label always present), keyboard focus visible, tables with real
  headers, charts with text alternatives and a data table fallback.

## 1. Ledger

- **Idea:** an editorial ledger; the radar reads like a newspaper table of record.
- **Mood:** sober, authoritative, slow to read and easy to trust.
- **Palette:** paper `#f6f1e7`, ink `#1d1a16`, oxblood accent `#8a2b1f`, ochre for status.
  Dark: `#1b1916` / `#ece5d8` / `#e8836f`.
- **Type:** Source Serif 4 (headings, prose), IBM Plex Mono (numbers, tables).
- **Layout:** single wide column, double rule under page titles, ruled tables, column rules.
- **Radar:** dense ruled table with small-caps headers; signal chips as footnote markers.
- **Pipeline Live:** a "masthead" strip of totals between heavy rules; services as an indented list.
- **Motion:** none beyond a fade on data refresh.
- **Light/dark:** light native; dark is "night edition" warm brown.
- **Accessibility:** serif body at 17px min; mono numerals for tabular alignment.

## 2. Control Room

- **Idea:** an operations console; the pipeline is a rack of services with status lamps.
- **Mood:** technical, live, engineering portfolio.
- **Palette:** `#0b0f14` background, phosphor green `#5ce1a6`, amber `#f2b84b` for warnings.
  Light ("daylight console"): `#e9eef2` / `#047857` / `#9a5b00`.
- **Type:** JetBrains Mono throughout.
- **Layout:** panel grid with thin borders; services as rack rows (lamp, name, role, last ran).
- **Radar:** terminal-like table, status lamps per signal.
- **Pipeline Live:** strongest fit; lamps pulse at a period derived from measured events/s, still
  when the rate is 0 (as now).
- **Light/dark:** dark native.
- **Accessibility:** risk of low contrast on dim rows; inactive rows keep text at AA, only the lamp dims.

## 3. Blueprint

- **Idea:** a technical drawing; every figure is a labelled plate of the machine.
- **Mood:** precise, engineered, explanatory.
- **Palette:** navy `#0f2a4a` with grid lines, cyan `#8fd3ff`, yellow `#ffcf70` warnings.
  Light: white `#f7fbff` with pale blue grid, `#1d5fbf`.
- **Type:** IBM Plex Sans, IBM Plex Mono for figures; "FIG." labels.
- **Layout:** grid paper background, dashed frames, arrows between pipeline stages.
- **Radar:** table as a "parts list".
- **Pipeline Live:** flow as a left-to-right schematic with arrows; Lineage page fits naturally.
- **Motion:** a dash travelling along an arrow only for stages that moved rows in the last run.
- **Light/dark:** dark native.
- **Accessibility:** grid background kept below 1.5:1 so text contrast is unaffected.

## 4. Swiss

- **Idea:** a strict typographic grid with huge numerals, black rules and one red.
- **Mood:** confident, modern, poster-like.
- **Palette:** white, black `#0a0a0a`, red `#d61f14` (status and accents only).
  Dark: inverted, red `#ff5a4e`.
- **Type:** Inter 800 for numerals and titles, Inter 400 body.
- **Layout:** 12-column grid, thick top rules over each figure, generous margins.
- **Radar:** large rank numerals, minimal table.
- **Pipeline Live:** totals as giant numbers; services as a ruled list.
- **Motion:** numbers count up once from the previous export value to the new one (both real).
- **Light/dark:** both equal.
- **Accessibility:** red used with text labels; large type helps low vision.

## 5. Field Survey

- **Idea:** a survey map; repositories as terrain, signals as contour readings.
- **Mood:** warm, humane, exploratory.
- **Palette:** sand `#efe8da`, moss `#4d6b4a`, rust `#b5562b`. Dark: `#1d1f1a` / `#9cc28f` / `#e7895a`.
- **Type:** Fraunces (headings, big numbers), Inter body.
- **Layout:** cards with soft asymmetric corners over faint contour lines.
- **Radar:** cards or table toggle; coverage shown as contour density.
- **Pipeline Live:** services as stations along a route.
- **Motion:** none by default; contour backdrop is static.
- **Light/dark:** light native.
- **Accessibility:** backdrop is decorative (`aria-hidden`), low opacity.

## 6. Quiet Signal

- **Idea:** calm and plain; lots of space, one teal accent, accessibility first.
- **Mood:** neutral, trustworthy, low maintenance.
- **Palette:** stone `#fafaf9` / `#1c1917`, teal `#0f766e`, amber `#a16207` for status.
  Dark: `#0c0a09` / `#f5f5f4` / `#5eead4`.
- **Type:** system UI stack (no web fonts: fastest, nothing to host).
- **Layout:** rounded cards, 8px spacing scale, wide margins.
- **Radar:** clean sortable table; signal chips with text.
- **Pipeline Live:** cards with an accent bar for active services.
- **Motion:** none except a 150ms fade.
- **Light/dark:** both equal.
- **Accessibility:** simplest to keep at AA; least custom CSS to maintain.

## Logo directions (`logos/`)

- **A. Arch:** an arch with the keystone filled in (structure held by one piece).
- **B. Sweep:** a keystone wedge with radar arcs (the radar).
- **C. Blocks:** a K formed from a pillar and two wedges.
- **D. Points:** a keystone built from data points; the last point is faint (partial data).

## Recommendation

**2. Control Room** for portfolio value (Pipeline Live is the headline page and this concept makes
volume, rate and services the most obvious), with logo **B. Sweep**. **6. Quiet Signal** is the
lowest-effort, safest choice if the radar should come first.
