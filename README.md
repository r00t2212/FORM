# FORM — Smart Workout Generator

A mat-only, bodyweight workout app that builds a personalised training plan in seconds — no equipment, no subscription, no internet required after the first load.

Built as part of a PM portfolio to demonstrate end-to-end product thinking: problem framing, feature prioritisation, accessibility, and PWA delivery.

---

## Features

- **Smart plan generation** — selects exercises based on muscle group, session duration, and active injuries, with weighted randomisation so no two sessions are the same
- **Injury adaptation** — 9 injury filters (knee, lower back, shoulder, IT band, wrist, elbow, neck, hip, upper back) that automatically swap out aggravating movements and prioritise safer alternatives
- **Active session timer** — work/rest ring timer with per-set tracking, side-switching for unilateral exercises, and audio + haptic cues when rest ends
- **Progress tracking** — counts sets actually completed vs planned; surfaces completion % on the finish screen
- **Exercise swap** — replace any exercise before starting without regenerating the whole plan
- **Workout history & streak** — last 10 sessions stored locally; streak shown on the home screen
- **Share workout** — exports a plain-text summary via Web Share API, with clipboard fallback
- **PWA** — installable on iOS and Android, works offline after first visit

---

## Tech Stack

Pure vanilla — no frameworks, no build step, no dependencies.

| Layer | Detail |
|---|---|
| HTML / CSS / JS | Single-page app, all screens in one HTML shell |
| Exercise data | Static library in `js/data.js` — 47 exercises across 5 muscle groups + warmup/cooldown pools |
| Storage | `localStorage` only (workout history) |
| PWA | `manifest.json` + cache-first service worker |
| Icons | Inline SVGs (Lucide-style, `js/icons.js`) |

---

## Running Locally

No build step required.

```bash
# Quickest — open directly (service worker won't register without a server)
open index.html

# Recommended — local dev server
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

---

## Project Structure

```
FORM/
├── index.html          # Single HTML shell — all 4 screens
├── styles.css          # All styles
├── manifest.json       # PWA manifest
├── sw.js               # Service worker (cache-first)
├── icons/
│   ├── icon-192.png    # Home screen icon (Android)
│   └── icon-512.png    # Splash / high-res icon
├── IMAGES/             # Exercise PNG animations (optional — gracefully hidden if missing)
└── js/
    ├── icons.js        # SVG icon strings (shared across workout.js and session.js)
    ├── data.js         # Exercise library, warmup/cooldown pools, workout title pool
    ├── ui.js           # Toast, screen transitions, workout history rendering
    ├── workout.js      # Plan generation, exercise selector, swap, share
    └── session.js      # Active session timer, set/rest flow, finish screen
```

---

## Accessibility

- WCAG AA contrast throughout
- All interactive elements are `<button>` with keyboard support
- `aria-live="polite"` on toast notifications
- `prefers-reduced-motion` respected — transitions and animations disabled when set
- Minimum 44×44 px touch targets
- Pinch-to-zoom never blocked

---

## Adding Exercise Images

Drop a PNG named exactly after the exercise (e.g. `Glute Bridge.png`) into the `IMAGES/` folder. The app will pick it up automatically. Any exercise without a matching file gracefully hides the image area — nothing breaks.

---
