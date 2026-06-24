# Design System & Guidelines: WVSU-LC Kiosk

Branding guidelines, typography, and design tokens for the West Visayas State University - Lambunao Campus Interactive Kiosk.

## 🎨 Color Palette

| Color Role | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Primary (WVSU Blue)** | `#0B3C5D` | Headers, primary buttons, branding accents |
| **Secondary (WVSU Gold)**| `#EFB11D` | Highlights, active states, active icons |
| **Dark Neutral** | `#1D2731` | Body text, headers, dark backgrounds |
| **Light Neutral** | `#F9F9FA` | Page backgrounds, card borders, light mode sections |
| **Accent/Action** | `#328CC1` | Links, tags, secondary call-to-actions |

## 📐 Typography

- **Headings Font**: *Outfit* or *Inter* (Fallback: Sans-Serif)
- **Body Font**: *Inter* or *Roboto*
- **Sizes**:
  - `h1`: `2.25rem` (36px)
  - `h2`: `1.75rem` (28px)
  - `h3`: `1.25rem` (20px)
  - `body`: `1rem` (16px)
  - `small`: `0.875rem` (14px)

## 📱 Kiosk UI Layout Guidelines

1. **Touch Targets**: All interactive elements (buttons, links, search items) must have a minimum width/height of `48px` to support reliable touch gestures.
2. **Accessibility**: High color contrast must be maintained. Text should be legible from a distance of 3-4 feet.
3. **No Dead Ends**: Every screen must have a clearly visible "Home" button at a consistent location (e.g., top-left or sticky footer).
4. **Auto-Timeout**: If no user interaction is detected for 2 minutes, return to the screensaver/welcome loop.
