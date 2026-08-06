# AGENTROPOLIS 3D UI REBUILD PROMPT

## Mission
Rebuild the Agentropolis GitHub Pages `/3d/` surface as a spatial city-first interface. The city is the product surface. UI must support the world rather than cover it.

## Canon
- Agentropolis is a 3D city and the Intelligence Grid.
- Infrastructure is terrain.
- Districts are institutions and must appear as spatial structures.
- HERMES is the operator dock and orchestration interface.
- Mission Control remains human-controlled.
- Every meaningful action follows: Identity → Mandate → Plan → Execute → Receipt → Audit.

## Visual direction
Use the operator’s `neurometax.com` visual identity as the brand reference, reinforced by these explicit rules:

1. **Black obsidian motherboard**
   - Near-black reflective terrain.
   - Fine etched circuitry and micro-grid geometry.
   - Red and cyan signal traces only; avoid rainbow cyberpunk.
   - LEDs pulse at nodes, building edges, transit paths, and runtime state points.

2. **iOS spatial aesthetic**
   - Calm hierarchy, generous spacing, precise typography, and restrained controls.
   - Rounded 22–30 px liquid-glass surfaces.
   - Translucent materials with edge highlights, blur, saturation, inner specular lines, and soft depth shadows.
   - Segmented controls and bottom dock should feel native to a premium spatial operating system, not a SaaS dashboard.

3. **City-first composition**
   - At least 65% of the initial viewport must show unobscured city/world space.
   - No modal, directory, or large panel may be open on initial load.
   - The hero headline must never cover the visual center of the city or clip offscreen.
   - The city requires visible front, side, and top faces plus luminous depth edges.
   - Video hero sits behind the city as atmosphere, not as the primary readable layer.

4. **Red/cyan depth law**
   - Cyan = online, navigation, trusted signal, read operations.
   - Red = risk, boundary, denial, escalation, irreversible action.
   - Gold is reserved for sealed receipts or warning states.

## Interaction model
- Drag the city to orbit.
- Wheel or pinch to zoom.
- Click a structure to select it.
- A small floating glass card may identify the selected structure.
- City directory, HERMES Dock, and Hero Media are collapsed drawers activated from a bottom liquid-glass dock.
- Provide a City Focus control that hides nonessential UI.
- Escape closes the active drawer.

## Hero video requirements
- Accept MP4, WebM, and Ogg.
- Enforce a 200 MB local ceiling.
- Persist operator-local video through IndexedDB.
- Display the video full-bleed behind the 3D city with controlled opacity, saturation, brightness, and contrast.
- Never allow the video to reduce building silhouette legibility.
- Shared public uploads require a separate governed Cloudflare R2 corridor; GitHub Pages is static and must not pretend otherwise.

## Technical constraints
- Static GitHub Pages deployment.
- No Jekyll dependency.
- Avoid runtime dependency chains that can freeze the boot screen.
- Baseline must work with native HTML, CSS, Canvas, video, and JavaScript.
- Preserve HERMES MCP configuration generation, runtime health checks, and read-only authority ceiling.
- Respect reduced-motion preferences.
- Maintain keyboard accessibility and mobile bottom-sheet behavior.

## Acceptance tests
1. At 1536×960, the city remains clearly visible and occupies the visual center.
2. No panel is open on load.
3. Hero text uses no more than 40% of viewport width on desktop.
4. The motherboard reads as black obsidian with visible red/cyan traces.
5. Buildings show depth, luminous edges, labels, and selectable states.
6. Liquid-glass UI is translucent and spatial, with visible background refraction/blur.
7. Video upload changes the atmospheric background without hiding the city.
8. HERMES config generation and health checks still work.
9. The page has no third-party JavaScript runtime requirement.
10. Mobile controls remain reachable without covering the entire city.

## Anti-patterns
- Flat dashboard cards covering the world.
- A giant cropped headline obscuring the city.
- An open directory panel on initial load.
- Bright generic neon gradients without material depth.
- Fake 3D made only from CSS tilt effects.
- Excessive glass that destroys text contrast.
- Animation that competes with navigation or accessibility.
