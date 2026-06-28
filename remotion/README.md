# Maestro Remotion Demo

Standalone Remotion subproject that renders the demo video for the Maestro
landing page. Lives in its own `package.json` so it can evolve independently
from the Laravel + Inertia frontend.

## Stack

- [Remotion 4](https://www.remotion.dev/) — programmatic video in React.
- [motion](https://motion.dev/) — declarative animations inside scenes.
- 30-second composition, 1920×1080, 30 fps.

## Usage

```bash
# Install dependencies (one time, from this directory)
npm install

# Open the Remotion Studio to preview and tweak the video
npm start

# Render the MP4 into the Laravel public directory
npm run build:video
#   → ../public/video/maestro-demo.mp4

# Render a still poster (used as the <video poster="...">)
npm run build:poster
#   → ../public/video/maestro-demo-poster.png
```

The landing page (`resources/js/pages/central/welcome.tsx`) expects the files
at `/video/maestro-demo.mp4` and `/video/maestro-demo-poster.png`.

## Layout

```
remotion/
├── package.json
├── remotion.config.ts
├── tsconfig.json
└── src/
    ├── index.ts                # registerRoot()
    ├── Root.tsx                # composition registry
    ├── styles.css              # shared scene styles
    ├── compositions/
    │   └── MaestroDemo.tsx     # 30s sequence of 5 scenes
    └── scenes/
        ├── IntroScene.tsx      # 0–5s   brand reveal
        ├── FeaturesScene.tsx   # 5–12s  6 feature cards
        ├── StackScene.tsx      # 12–18s tech chips
        ├── CodeScene.tsx       # 18–24s typewriter code
        └── OutroScene.tsx      # 24–30s CTA
```

## Tweaking the timeline

Edit `TIMING` in [`src/compositions/MaestroDemo.tsx`](src/compositions/MaestroDemo.tsx).
The composition duration in [`src/Root.tsx`](src/Root.tsx) must match
`DURATION_SECONDS × fps` (defaults to 30s × 30fps = 900 frames).
