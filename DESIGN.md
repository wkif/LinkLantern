---
name: LinkLantern
description: A warm personal link manager for fast search, bookmarking, import, and selective sharing.
colors:
  primary-50: "#f5f1f4"
  primary-100: "#ebe3e9"
  primary-200: "#d7c7d3"
  primary-300: "#c3abbd"
  primary-400: "#af8fa7"
  primary-500: "#563950"
  primary-600: "#4a3044"
  primary-700: "#3d2738"
  primary-800: "#311e2c"
  primary-900: "#241520"
  primary-950: "#180c14"
  accent-50: "#fffef5"
  accent-100: "#fffceb"
  accent-200: "#fff9d6"
  accent-300: "#fff6c2"
  accent-400: "#fff3ad"
  accent-500: "#FAED25"
  accent-600: "#d4c91f"
  accent-700: "#aea519"
  secondary-50: "#f6f5f6"
  secondary-100: "#edecee"
  secondary-200: "#dbd9dc"
  secondary-300: "#c9c6cb"
  secondary-400: "#b7b3b9"
  secondary-500: "#5B5561"
  secondary-600: "#4d4852"
  secondary-700: "#403c43"
  secondary-800: "#322f34"
  secondary-900: "#252225"
  secondary-950: "#171517"
  surface: "#ffffff"
  surface-dark: "#311e2c"
  text-muted: "#5B5561"
typography:
  display:
    fontFamily: "MiSans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
  headline:
    fontFamily: "MiSans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
  title:
    fontFamily: "MiSans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "MiSans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "MiSans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.25
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  2xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary-500}"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-600}"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "10px 16px"
  button-accent:
    backgroundColor: "{colors.accent-500}"
    textColor: "{colors.secondary-400}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  card-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary-950}"
    rounded: "{rounded.2xl}"
    padding: "24px"
  input-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary-950}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
---

# Design System: LinkLantern

## 1. Overview

**Creative North Star: "Curated Hearth"**

LinkLantern should feel like a warm place where useful paths gather: personal, searchable, and ready without ceremony. The system is product-first, so familiar controls do the work; personality arrives through a remembered palette, soft surfaces, and small moments of feedback.

The visual system must honor the product promise from `PRODUCT.md`: fast paths first, personal lantern, and calm over clutter. It explicitly rejects template SaaS aesthetics, noisy portal density, and cold admin-console grayness. Even management screens should retain a sense of ownership without turning into decoration.

**Key Characteristics:**
- Warm product utility with a personal, curated atmosphere.
- Restrained surfaces, rounded controls, and clear task hierarchy.
- Signal color used sparingly for primary calls to action and moments of confirmation.
- Dense link and admin screens structured through tables, tabs, filters, and progressive disclosure.

## 2. Colors

The palette is warm and restrained: Link Plum grounds the interface, Signal Glow creates memorable action moments, and Quiet Mauve carries neutral structure.

### Primary
- **Link Plum**: The core product color for primary actions, active navigation, important icons, and selected states. It should feel stable and personal, never corporate blue by default.
- **Deep Link Plum**: The dark-mode surface family and pressed/hover state for primary controls.
- **Soft Link Plum**: The light-mode tint family for backgrounds, selected rows, empty-state icons, and low-emphasis panels.

### Secondary
- **Signal Glow**: The bright yellow accent for decisive CTAs, badges, floating action moments, and rare emphasis. It is memorable because it is scarce.
- **Soft Signal Glow**: The softer tint for hover states, gentle highlights, and warm empty-state accents.

### Neutral
- **Quiet Mauve**: The gray-purple neutral for secondary text, borders, scrollbars, muted UI, and panel separation.
- **Paper Surface**: The current card and content surface for light mode.
- **Night Plum Surface**: The current dark-mode card and background surface.

### Named Rules
**The Signal Rarity Rule.** Signal Glow is for actions and feedback, not decoration. If more than one area on a screen is shouting yellow, the screen is wrong.

**The Plum Instead of Blue Rule.** LinkLantern should not default to generic blue-purple SaaS color habits. Blue can appear in legacy utility states, but new primary product language belongs to Link Plum and Quiet Mauve.

## 3. Typography

**Display Font:** MiSans (with ui-sans-serif, system-ui, sans-serif fallback)  
**Body Font:** MiSans (with ui-sans-serif, system-ui, sans-serif fallback)  
**Label/Mono Font:** No separate mono role is currently defined.

**Character:** The system uses a single clean sans family to keep product screens direct and native-feeling. Type should be calm, compact, and readable across search, tables, forms, cards, and admin tools.

### Hierarchy
- **Display** (700, 1.875rem, 1.2): Page-level headings and primary dashboard greetings.
- **Headline** (700, 1.5rem, 1.25): Major panels, empty-state titles, and hero-like product moments.
- **Title** (600, 1.25rem, 1.3): Card headers, form section titles, and modal titles.
- **Body** (400, 1rem, 1.5): Standard prose, descriptions, and form copy. Long prose should stay under 65-75 characters per line.
- **Label** (500, 0.875rem, 1.25): Button text, field labels, table headers, badges, and metadata.

### Named Rules
**The One Sans Rule.** Product UI stays on MiSans. Do not introduce display fonts for labels, buttons, tables, or admin navigation.

## 4. Elevation

LinkLantern uses soft layered surfaces: translucent panels, warm borders, and modest shadows create depth without turning the app into glass decoration. Shadows are strongest on hover, floating actions, auth cards, and menus; resting data surfaces should stay quieter.

### Shadow Vocabulary
- **Card hover lift** (`0 12px 24px rgba(86, 57, 80, 0.15)`): Use for interactive cards that open links or reveal a clear action.
- **Primary button hover** (`0 4px 12px rgba(86, 57, 80, 0.3)`): Use for primary action confidence, not every button.
- **Signal glow** (`0 8px 20px rgba(250, 237, 37, 0.4)`): Use only on accent CTAs and floating moments.
- **Floating panel** (`shadow-xl` / `shadow-2xl`): Use for menus, auth cards, and overlays that must sit above content.

### Named Rules
**The Soft Layer Rule.** Surfaces can blur and lift only when that helps focus or state. Decorative glassmorphism is forbidden.

## 5. Components

### Buttons
- **Shape:** Soft product corners (8-12px), with full pill shapes reserved for badges, floating actions, and compact link clusters.
- **Primary:** Link Plum background with light text, medium-bold label, and a darker Link Plum hover state.
- **Accent:** Signal Glow background for highest-emphasis CTA. It should be rare and paired with strong readable text.
- **Hover / Focus:** Transitions run around 200-300ms. Hover may lift or scale slightly; focus must remain visible and keyboard-friendly.
- **Secondary / Ghost / Tertiary:** Use Nuxt UI neutral and ghost variants for supporting actions, especially in tables and filters.

### Chips
- **Style:** Soft badges use tinted backgrounds, compact labels, and icon reinforcement for public/private or status meaning.
- **State:** Selected filters use solid primary treatment; unselected filters stay outline or ghost. Do not rely on color alone for status.

### Cards / Containers
- **Corner Style:** Rounded panels (12-24px) define auth cards, search panels, link cards, and empty states.
- **Background:** Light mode uses Paper Surface and pale tints; dark mode uses Night Plum Surface and deep neutral panels.
- **Shadow Strategy:** Cards are soft by default and gain lift on interactive hover. Nested card stacks should be avoided.
- **Border:** Use subtle primary or neutral borders to separate translucent surfaces.
- **Internal Padding:** Compact cards use 16px; larger search, auth, and settings panels use 24-32px.

### Inputs / Fields
- **Style:** Rounded Nuxt UI fields with leading icons, clear placeholders, and adequate vertical padding.
- **Focus:** Use visible focus rings or border shifts; avoid layout-shifting focus effects.
- **Error / Disabled:** Error messages should be textual and visible near the field. Disabled controls should reduce opacity without hiding labels.

### Navigation
- **Style, typography, default/hover/active states, mobile treatment.** Navigation is familiar product UI: top bars, admin sidebars, tabs, and dropdowns. Active states use Link Plum fills or tints; hover states use low-contrast mauve surfaces. Mobile behavior should collapse structure before text becomes cramped.

### Search And Link Surfaces
The search panel, link grid, table rows, and suggestion menu are signature surfaces. They must prioritize rapid scanning: clear title, compact metadata, icon support, and immediate action. Suggestions should maintain keyboard selection and visible hover/active states.

## 6. Do's and Don'ts

### Do:
- **Do** use Link Plum for primary action, active navigation, and selected state.
- **Do** keep Signal Glow rare: one main CTA or feedback moment per local surface.
- **Do** preserve the Curated Hearth mood: warm, personal, and efficient.
- **Do** keep link-heavy screens dense but ordered through filters, tabs, tables, and empty states.
- **Do** support WCAG AA with visible focus, readable contrast, and text/icon pairs for public and private states.

### Don't:
- **Don't** drift into template SaaS aesthetics: generic blue-purple gradients, oversized marketing cards, empty claims, or decorative hero-metric patterns.
- **Don't** create noisy portal design with too many competing modules, ad-like density, or scattered focal points.
- **Don't** become a cold admin console of gray tables and forms; preserve personal warmth even in management screens.
- **Don't** use decorative glassmorphism as the default. Blur must clarify layering or focus.
- **Don't** use gradient text or side-stripe borders as decoration.
- **Don't** let bounce, glow, or breathing animations run on core task controls unless they communicate state.
