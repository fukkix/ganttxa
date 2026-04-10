# Design System Strategy: The Architectural Chronoscope

## 1. Overview & Creative North Star
**Creative North Star: "The Editorial Architect"**

This design system rejects the cluttered, "spreadsheet-heavy" aesthetics of traditional project management tools. Instead, it treats project data as an editorial narrative. We move beyond the "template" look by utilizing a **high-contrast typographic hierarchy** and **asymmetric spatial rhythm**. 

The goal is to make the Gantt chart feel less like a chore and more like a high-end blueprint. We achieve this through "Atmospheric Depth"—using tonal shifts rather than lines—to create a workspace that feels expansive, breathable, and premium. The interface doesn't just show data; it curates it.

## 2. Colors & Tonal Depth
Our palette is rooted in deep, intellectual teals (`primary`) and sophisticated purples (`tertiary`). This isn't just a color choice; it’s a functional strategy to differentiate complex project phases without visual noise.

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders for sectioning are strictly prohibited. 
Structural boundaries must be defined solely through background color shifts. For example, a sidebar should use `surface_container_low` against a `surface` main dashboard. This creates a "molded" look rather than a "caged" look.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine paper. 
- **Base Layer:** `background` (#f8fafb)
- **Primary Layout Sections:** `surface_container_low`
- **Interactive Cards/Modules:** `surface_container_lowest` (Pure White)
- **Utility Overlays:** `surface_container_high`

### The "Glass & Gradient" Rule
To elevate the tool into the "Premium" tier, floating elements (like the Gantt "Today" indicator or hovering task details) should utilize **Glassmorphism**:
- **Fill:** `surface` at 70% opacity.
- **Effect:** 20px Backdrop Blur.
- **Soul:** Use a subtle linear gradient on the Gantt bars, transitioning from `primary` (#00464a) to `primary_container` (#006064) to give the bars a slight 3D "gemstone" quality.

## 3. Typography: The Editorial Voice
We utilize a duo-sans-serif approach to balance authority with utility.

*   **Display & Headlines (Manrope):** This is our "Editorial" voice. Use `display-md` for project titles and `headline-sm` for phase headers. Manrope’s geometric nature provides a modern, architectural feel.
*   **Data & UI (Inter):** Our "Utility" voice. All Gantt labels, timestamps, and body text use Inter. Its high x-height ensures readability even at `label-sm` (0.6875rem) on mobile screens.

**Hierarchy Note:** Always pair a `headline-sm` in `on_surface` with a `label-md` in `on_surface_variant` to create immediate visual clarity without using bold weights for everything.

## 4. Elevation & Depth
Traditional drop shadows are too "cheap" for this system. We use **Tonal Layering**.

### The Layering Principle
Depth is achieved by "stacking" tiers. A Gantt task card (`surface_container_lowest`) sitting on the chart area (`surface_container_low`) creates a natural lift.

### Ambient Shadows
When a floating element (like a "New Task" modal) is required:
- **Color:** Use a 6% opacity tint of `primary` (#00464a) rather than grey.
- **Values:** `0px 24px 48px`. This mimics soft, diffused natural light.

### The "Ghost Border" Fallback
If contrast is legally required for accessibility, use the **Ghost Border**:
- `outline_variant` at 15% opacity. It should be felt, not seen.

## 5. Components & Primitive Styling

### The Gantt Bar (Signature Component)
- **Surface:** Linear gradient (`primary` to `primary_container`).
- **Rounding:** `md` (0.375rem) to maintain a professional, slightly architectural edge.
- **Mobile View:** On small screens, the bar collapses into a "Milestone Dot" using the `full` rounding token.

### Buttons: The "Soft-Touch" Interaction
- **Primary:** Background `primary`, Text `on_primary`. No shadow.
- **Secondary:** Background `secondary_container`, Text `on_secondary_container`.
- **Tertiary:** No background. Text `primary`. Use for low-emphasis actions like "Cancel" or "Archive."

### Chips (Phase Indicators)
- **Research Phase:** `primary_fixed_dim` background with `on_primary_fixed` text.
- **Design Phase:** `tertiary_fixed_dim` background with `on_tertiary_fixed` text.
- **Development Phase:** `secondary_fixed_dim` background with `on_secondary_fixed` text.

### Cards & Lists: The "Invisible Container"
- **Rule:** Forbid the use of divider lines. 
- **Separation:** Use `40px` of vertical white space (from our spacing scale) to separate list items. If content is dense, use a alternating subtle shift between `surface` and `surface_container_low`.

### Input Fields
- **Default:** `surface_container_highest` with a `none` border. 
- **Focus:** Transition to a `Ghost Border` using `primary` at 40% opacity.

## 6. Do’s and Don’ts

### Do:
- **Do** use intentional asymmetry. Align the project title to the far left and the "Share" actions to the far right with massive "dead space" in between to emphasize luxury.
- **Do** use `surface_tint` at 5% opacity for large empty states to keep them from looking "broken."
- **Do** optimize the Gantt chart for horizontal swiping on mobile while keeping the Task Names pinned using a `surface_container_lowest` glass effect.

### Don't:
- **Don't** use pure black (#000000) for text. Use `on_surface` to maintain the sophisticated teal-tinted grey profile.
- **Don't** use standard "Success Green." Use the `primary` (Deep Teal) to signify completion—it’s more professional and aligns with the palette.
- **Don't** use `DEFAULT` (0.25rem) rounding for large containers; use `xl` (0.75rem) for main dashboard panels to soften the overall "software" feel.