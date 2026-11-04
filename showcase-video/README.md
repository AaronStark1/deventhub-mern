# DEVentHub showcase reel

A 60-second product reel for DEVentHub (1920 × 1080, 60 fps, 3600 frames), built with [Remotion](https://www.remotion.dev).

## Run it

```bash
cd showcase-video
npm install

# 1. Capture the live app (frontend on :5173 and backend on :3000 must be running)
npm run capture

# 2. Preview in Remotion Studio
npm run dev

# 3. Render the final file → out/deventhub-showcase.mp4
npm run render
```

`npm run capture` takes about a minute. Re-run it whenever the app's UI or data changes.

## How it's built

The reel combines two techniques, chosen per surface:

| Surface | Technique | Why |
| --- | --- | --- |
| Format cards, footer, logo tile | Vector ports in `src/app/`, driven per frame | Stays sharp at any zoom. Hover states (spotlight, edge, photo scale, pill lift, underline) and breakpoints become props, so they animate deterministically. |
| Landing hero background | `Balatro.tsx`, the app's shader verbatim, with `iTime` taken from the frame | The hero moves for real instead of being a still. |
| Hero "Host and attend …" line | `RotatingLine.tsx` | Same words, cadence and spring as `RotatingText`, with pill widths measured in the app. |
| Every other page (events, details, about, auth, dashboards, ticket, create event, globe, featured ring) | 2× Playwright captures composited in browser frames | Real data and real WebGL, at exactly what the app renders. |

`scripts/capture.mjs` launches Chromium in new-headless mode on the GPU (ANGLE/Metal on macOS). The default headless shell renders the cobe globe as a black disc. Signed-in pages use a demo session with the signed-in endpoints mocked, so nothing is written to the database. The script also writes `src/generated/captures.json`, which records each capture's size, the element rects the cursor and callouts aim at, and layout measured in the live app: the Conferences card at 1440/768/390, the stack geometry, the footer, and the rotating-word widths.

## Timeline

| Act | Frames | Content | Transition in |
| --- | --- | --- | --- |
| 1 · Brand | 0–480 | Grid draws in, badge, kinetic tagline | Loop seam (grid sweep) |
| 2 · Platform | 480–1200 | Live hero, layout inspector, Featured ring, globe, route map of real pages | Shared-element morph: badge → browser frame |
| 3 · Formats | 1200–2160 | ScrollStack replayed frame by frame under a 3D tilt; four callouts, grain loupe | Z-space parallax push (0.94 → 1) |
| 4 · Interaction | 2160–2760 | Cursor-driven spotlight, edge, photo and pill hover; Conference filter; About | Continuous; bezel → viewport morph; spotlight wipe |
| 5 · Responsive | 2760–3180 | 1440 → 768 → 390 with the card's real 12-column grid and live `clamp()` values | Spotlight wipe |
| 6 · Footer | 3180–3600 | `.shell` edge guides, link and GitHub hovers, end card, retract to frame 0 | Device frame → full-bleed page |

All timing lives in `src/timeline.ts` and the act files under `src/acts/`. Motion uses the brief's spring (`damping 22, stiffness 120, mass 0.9`) and the app's `cubic-bezier(0.22, 1, 0.36, 1)`. App hover states replay their CSS durations: 300, 450, 500 and 700 ms.

## Keeping it in sync

The ports in `src/app/` mirror `EventScrollStack.jsx`, `Footer.jsx` and the `.format-card*` / `.link-underline` / `.logo-tile` rules in `src/index.css`. If those change, update the ports by hand and re-run `npm run capture`.

`public/captures/`, `public/formats/` and `src/generated/` are generated and gitignored.
