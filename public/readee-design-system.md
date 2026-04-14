# Readee Design System — Reference for Claude Code

## Overview
Readee's visual identity is **dark purple + warm yellow** — an edtech look inspired by Zearn, Duolingo, and Khan Academy. Playful but professional. Parent-trustworthy, kid-appealing. This system applies to BOTH the landing site (readee.app) and the app (learn.readee.app).

---

## Color Palette

### Primary — Purple (brand color, used everywhere)
| Token              | Hex       | Usage                                              |
|--------------------|-----------|-----------------------------------------------------|
| `purple-deep`      | `#2d1b69` | Dark backgrounds, hero sections, premium cards, CTA blocks, footer |
| `purple-dark`      | `#3b2380` | Hover states on dark bg, nav active                 |
| `purple`           | `#6c4ce0` | Primary buttons, links, active states, icons        |
| `purple-mid`       | `#8b6cf7` | Gradients, progress bars, secondary accents         |
| `purple-light`     | `#c4b5fd` | Borders, disabled states, subtle accents            |
| `purple-pale`      | `#ede9fe` | Light card backgrounds, tag backgrounds, input bg   |
| `purple-wash`      | `#f8f6ff` | Page section backgrounds (alternating with white)   |

### Accent — Yellow/Gold (CTAs, rewards, highlights)
| Token              | Hex       | Usage                                              |
|--------------------|-----------|-----------------------------------------------------|
| `yellow`           | `#fbbf24` | Primary CTA buttons on dark bg, XP badges, stars, highlights |
| `yellow-light`     | `#fef3c7` | Tag backgrounds, soft highlight areas               |

### The Key Combo: Yellow on Dark Purple
This is the signature look. Use `yellow (#fbbf24)` buttons/text on `purple-deep (#2d1b69)` backgrounds. It creates high contrast, feels premium, and is instantly recognizable. Examples:
- CTA buttons in hero sections
- Pricing card buttons (Readee+ tier)
- Badge/reward elements
- Section headers on dark backgrounds

### Semantic Colors
| Token              | Hex       | Usage                                              |
|--------------------|-----------|-----------------------------------------------------|
| `green`            | `#34d399` | Success, correct answers, progress, "Phonics ↑"    |
| `green-dark`       | `#059669` | Text on green backgrounds                           |
| `green-light`      | `#d1fae5` | Success tag/badge backgrounds                       |
| `coral`            | `#fb7185` | Streaks, hearts, warm gamification                  |
| `pink-light`       | `#fce7f3` | Coral badge backgrounds                             |
| `orange`           | `#fb923c` | Step 3 accent, warnings                             |
| `sky`              | `#38bdf8` | Info, secondary features                            |
| `sky-light`        | `#e0f2fe` | Info backgrounds                                    |

### Text Colors
| Token              | Hex       | Usage                                              |
|--------------------|-----------|-----------------------------------------------------|
| `ink`              | `#1e1b3a` | Primary headings, strong text                       |
| `text`             | `#4a4565` | Body text                                           |
| `text-soft`        | `#8078a0` | Secondary text, descriptions, muted labels          |

---

## Typography

### Fonts
- **Headings:** `'Baloo 2', cursive` — rounded, friendly, edtech feel. Used for all h1-h3, logo, card titles, pricing amounts.
- **Body:** `'Nunito', sans-serif` — clean, readable, pairs well with Baloo. Used for paragraphs, labels, nav links, buttons.

### Scale
| Element    | Font       | Weight | Size           |
|------------|------------|--------|----------------|
| h1 (hero)  | Baloo 2    | 800    | clamp(2.6rem, 5vw, 3.8rem) |
| h2         | Baloo 2    | 800    | clamp(2rem, 4vw, 2.8rem)   |
| h3         | Baloo 2    | 700    | 1.1–1.5rem     |
| Body       | Nunito     | 600    | 1rem–1.15rem   |
| Small/tags | Nunito     | 700-800| 0.72–0.85rem   |
| Buttons    | Nunito     | 800    | 1rem–1.1rem    |

### Google Fonts import
```
https://fonts.googleapis.com/css2?family=Baloo+2:wght@400..800&family=Nunito:wght@400..900&display=swap
```

---

## Component Patterns

### Buttons
- **Primary (on light bg):** `bg: purple (#6c4ce0)`, white text, border-radius 100px, font-weight 800
- **Primary (on dark bg):** `bg: yellow (#fbbf24)`, purple-deep text, border-radius 100px, font-weight 800, box-shadow with yellow glow
- **Secondary/outline:** transparent bg, 2px border, border-radius 100px
- **Hover:** translateY(-2px) + enhanced box-shadow

### Cards
- **Light cards:** white bg, border-radius 24px, 1px border `rgba(108,76,224,0.08)`, shadow on hover
- **Dark/premium cards (like Readee+ pricing):** `bg: purple-deep (#2d1b69)`, white text, yellow accents, larger shadow `0 12px 48px rgba(45,27,105,0.25)`
- **Glassmorphism cards (on purple bg):** `bg: rgba(255,255,255,0.1)`, `border: 1px solid rgba(255,255,255,0.12)`, backdrop-filter blur

### Tags/Badges
- Border-radius 100px (pill shape)
- Font: Nunito, weight 800, size 0.72-0.82rem
- Uppercase + letter-spacing 0.08em for section labels
- Color-coded: purple-pale bg for default, green-light for success, yellow-light for rewards

### Section Layout
- Alternate between white, purple-wash (#f8f6ff), and full-color (purple #6c4ce0 or purple-deep #2d1b69) backgrounds
- Add organic blob shapes (large blurred circles) on dark sections for depth
- Use wave SVG dividers between major sections instead of hard lines
- Max-width: 1240px for content, full-bleed for section backgrounds

### Border Radius
- Cards/modals: 24-28px
- Buttons/tags: 100px (pill)
- Icons/avatars: 14px (rounded square) or 50% (circle)
- Input fields: 12-14px

---

## Tailwind Config (for the Next.js app)

```js
// Add to tailwind.config.js → theme.extend
colors: {
  purple: {
    50: '#f8f6ff',
    100: '#ede9fe',
    200: '#c4b5fd',
    300: '#8b6cf7',
    400: '#6c4ce0',
    500: '#5e3bb5',
    600: '#4c2d9e',
    700: '#3b2380',
    800: '#2d1b69',
    900: '#1e1b3a',
  },
  yellow: {
    DEFAULT: '#fbbf24',
    light: '#fef3c7',
  },
  green: {
    DEFAULT: '#34d399',
    dark: '#059669',
    light: '#d1fae5',
  },
  coral: {
    DEFAULT: '#fb7185',
    light: '#fce7f3',
  },
},
fontFamily: {
  display: ['"Baloo 2"', 'cursive'],
  body: ['"Nunito"', 'sans-serif'],
},
borderRadius: {
  'card': '24px',
  'pill': '100px',
},
```

---

## Key Design Rules

1. **Yellow on dark purple is the signature.** Use it for every primary CTA on dark backgrounds.
2. **No emoji icons in the landing page or marketing.** Use SVGs or custom illustrations (bunny mascot).
3. **Emoji are OK inside the app** where kids interact (lesson screens, gamification).
4. **Alternate section backgrounds** — never have two white sections in a row. Go: dark → white → purple-wash → colored → white.
5. **Rounded everything.** Pill buttons, rounded cards, circular avatars. Sharp corners feel wrong for this brand.
6. **Baloo 2 for anything kids or parents read first** (headings, titles, prices). Nunito for everything else.
7. **The dark purple premium card style** (Readee+ pricing) should also be used for: upgrade prompts in-app, paywall modals, premium feature callouts.
