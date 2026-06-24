---
name: Academic Trust
colors:
  surface: '#101415'
  surface-dim: '#101415'
  surface-bright: '#363a3b'
  surface-container-lowest: '#0b0f10'
  surface-container-low: '#191c1e'
  surface-container: '#1d2022'
  surface-container-high: '#272a2c'
  surface-container-highest: '#323537'
  on-surface: '#e0e3e5'
  on-surface-variant: '#c4c6d0'
  inverse-surface: '#e0e3e5'
  inverse-on-surface: '#2d3133'
  outline: '#8e909a'
  outline-variant: '#43474f'
  surface-tint: '#abc7ff'
  primary: '#abc7ff'
  on-primary: '#0c2f60'
  primary-container: '#1a3a6b'
  on-primary-container: '#89a5dd'
  inverse-primary: '#415e91'
  secondary: '#ffb94c'
  on-secondary: '#442b00'
  secondary-container: '#d28d00'
  on-secondary-container: '#482e00'
  tertiary: '#c6c6c7'
  on-tertiary: '#2f3131'
  tertiary-container: '#393b3b'
  on-tertiary-container: '#a4a5a5'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#abc7ff'
  on-primary-fixed: '#001b3f'
  on-primary-fixed-variant: '#284678'
  secondary-fixed: '#ffddb2'
  secondary-fixed-dim: '#ffb94c'
  on-secondary-fixed: '#291800'
  on-secondary-fixed-variant: '#624000'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#101415'
  on-background: '#e0e3e5'
  surface-variant: '#323537'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  button-text:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  touch-target-min: 56px
  gutter: 24px
  margin-page: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system for the WVSU-LC Student Kiosk is built on the foundations of **Institutional Minimalism**. It prioritizes clarity, authority, and reliability, reflecting the prestigious nature of West Visayas State University. The visual language is designed to instill confidence in students and staff, ensuring that administrative tasks feel secure and straightforward.

The aesthetic utilizes a **Corporate / Modern** approach with a high-contrast dark-mode baseline. By using deep navy as the canvas, the interface reduces glare in physical kiosk environments while making the accent gold and crisp white surfaces feel premium and significant. The emotional response is one of stability and academic excellence.

## Colors
The palette is deeply rooted in the university's identity. 

- **Primary Navy Blue (#1A3A6B):** Used as the global background and the primary brand anchor. It provides a stable, serious atmosphere.
- **Accent Gold (#E8A020):** Reserved for primary actions, success states, and highlighting critical academic information. It provides the necessary "pop" against the dark background.
- **Card White (#FFFFFF):** Used for content containers to ensure maximum legibility for body text and data tables.
- **Neutral Surface:** A palette of subtle grays is used for secondary text and borders within white cards to maintain a clean hierarchy.

## Typography
**Inter** is the sole typeface for the design system to ensure a systematic, utilitarian, and highly readable experience. 

- **Headlines:** Use Bold weights with slight negative letter-spacing to create a compact, authoritative look.
- **Body:** Standardized at 16px and 18px to accommodate various viewing distances from a kiosk screen.
- **Labels:** Use uppercase for small labels or descriptors to differentiate them from interactive body text.
- **Scaling:** For tablet and desktop kiosks, the "display-lg" style is used for welcome screens. On smaller diagnostic screens, it scales down to 32px.

## Layout & Spacing
This design system utilizes a **Fixed Grid** model optimized for high-traffic kiosk hardware.

- **Grid:** A 12-column grid for desktop/landscape orientations with a 24px gutter.
- **Margins:** Generous 40px outer margins to prevent content from feeling "trapped" by the physical kiosk bezel.
- **Touch Targets:** A strict minimum height of 56px is enforced for all interactive elements (buttons, inputs, list items) to ensure accessibility for all users, including those with motor impairments.
- **Vertical Rhythm:** A base-8 spacing system drives the distance between elements, ensuring a disciplined and organized layout.

## Elevation & Depth
Depth is created through **Tonal Layering** rather than heavy shadows.

- **Level 0:** The base Navy Blue background (#1A3A6B).
- **Level 1:** Content cards in Solid White (#FFFFFF). These cards sit "on top" of the navy and contain the majority of the information.
- **Shadows:** Use a single, high-diffusion "Ambient Shadow" (0px 8px 24px, 15% opacity of the primary navy) on White cards to lift them slightly from the background.
- **Interaction:** Buttons use a slight vertical offset (2px) when pressed to simulate a tactile physical push, appropriate for kiosk hardware.

## Shapes
The shape language balances approachability with professional structure.

- **Cards:** Use a 16px radius. This softens the large white blocks against the dark background, making the kiosk feel modern and welcoming.
- **Interactive Elements:** Buttons, text inputs, and dropdowns use a 12px radius. This slightly sharper corner differentiates functional controls from structural containers.
- **Icons:** Should follow a "Linear" style with a 2px stroke weight and slightly rounded caps to match the typography.

## Components
Consistent component behavior is critical for a public kiosk.

- **Buttons:**
  - **Primary:** Gold background (#E8A020) with Navy Blue text (#1A3A6B). 56px height.
  - **Secondary:** Transparent with a 2px White border.
- **Input Fields:**
  - 56px height. White background with a subtle light-gray border (#E2E8F0). Focus state uses a 2px Gold border.
- **Cards:**
  - White background. 16px corner radius. Used for grouping student information, grades, or schedule modules.
- **Lists:**
  - Each list item must be at least 56px tall. Use 16px horizontal padding. Include a chevron icon for navigable items.
- **Selection (Checkboxes/Radio):**
  - Oversized for touch. 28px x 28px hit area within the 56px row.
- **Kiosk Navigation:**
  - A persistent footer or side-rail containing "Home," "Back," and "Language" options, always using high-contrast icons and labels.