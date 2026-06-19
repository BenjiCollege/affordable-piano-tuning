# Cadence Piano Service

Marketing site for a San Antonio piano‑tuning business, built with **Next.js (App Router) + TypeScript**. Ported from a Claude Design HTML/CSS/JS prototype into a real, server‑rendered React app — every interaction from the original is preserved.

## Features

- **Static / server‑rendered** — the page is prerendered to HTML (`○ Static`), so all marketing copy is crawlable for SEO; React hydrates it on the client.
- **Web Audio piano** — hovering keys and scrolling the keyboard section synthesize real piano tones (additive sine partials through a low‑pass filter).
- **Scroll choreography** — GSAP + ScrollTrigger drive the hero intro, counters, sheet‑music draw‑on, parallax, the pinned scroll‑driven keyboard, and the crescendo wave; Lenis adds smooth scrolling.
- **Dark / light theme** with `localStorage` persistence, **sound toggle**, magnetic buttons, cursor spotlight, and tilt cards.
- **Reduced‑motion aware** — respects `prefers-reduced-motion` and degrades gracefully.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # production build
npm start        # serve the production build
```

## Project structure

```
app/
  layout.tsx            Root layout — fonts, <head>, SEO metadata
  page.tsx              Renders <CadenceSite/>
  globals.css           CSS variables (dark/light), base styles, keyframes
components/
  CadenceSite.tsx       'use client' — all page markup + mounts the controller
lib/
  cadenceController.ts  Imperative behavior (Web Audio, GSAP/Lenis, keyboards, toggles)
  css.ts                Helper: CSS string -> React style object (kept the prototype's exact styles)
  data.ts               Services, FAQs, service‑area cities, map points
design-reference/       The original Claude Design prototype, kept for reference
```

## Architecture notes

- **Why a controller class?** The original prototype orchestrated everything imperatively against the DOM. Rather than fight that, `CadenceController` keeps the imperative behavior in one place; `CadenceSite` renders the markup as JSX and instantiates the controller in a `useEffect`. GSAP, ScrollTrigger, and Lenis are **dynamically imported** inside the effect so nothing touches `window` during server rendering.
- **Styling fidelity.** The prototype's inline styles are reused verbatim via the `css()` helper, so the visual output stays pixel‑identical to the design. Theme colors come from CSS custom properties in `globals.css`.
- **Cleanup.** The controller fully tears down on unmount (kills ScrollTriggers, destroys Lenis, removes the GSAP ticker, closes the AudioContext, drops listeners), so it's safe under React StrictMode's double‑mount in dev.

## Note on responsiveness

The source design is **desktop‑first** and has no mobile breakpoints (fixed multi‑column grids, 40px gutters). This port matches it 1:1. Adding a responsive/mobile layout (collapsing nav, stacked grids) is a natural follow‑up.
