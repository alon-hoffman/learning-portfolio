# למידה מתחילה בסקרנות — Learning portfolio

Hebrew RTL portfolio with four interactive educational experiences, adapted from real classroom activities. No backend or API keys required.

## Run locally

Requires Node.js 22 (or a compatible Vite 6 release environment).

```sh
npm install
npm run dev
```

Production build: `npm run build`; preview: `npm run preview`.

## Publish for free on GitHub Pages

1. Create a repository (public for free GitHub Pages), copy this directory's contents into it and push to `main`.
2. In repository Settings → Pages → Build and deployment, choose GitHub Actions.
3. Run the included Deploy portfolio workflow (or push a commit to main). The workflow builds and publishes `dist`.
4. Open the actual Pages URL shown in the deployment workflow. Hash-based navigation and relative asset paths support project pages.

## Version 1 scope

- Creature lab: modular SVG creature, 4 habitats, 3 written adaptations, JSON export and print/PDF.
- Engineers: six game-based traits, exact 20-point completion, client-side image resize and local saving, sample opponent or import/export JSON.
- Coffee: two controlled runs, learner-entered question and hypothesis, manually recorded measurements, graph and report. Model is illustrative, not real experimental measurements.
- Hive: fixed seven-cell layout, 7–12 target relationships, editable descriptions, JSON export and printing.
- Local storage only, no accounts or collection of student data. Images are compressed to data URLs and stored locally. Storage can be unavailable or quota-limited; export work to keep a copy. No real-time multi-user sharing.
- Original classroom observations are distinguished from new digital adaptations, which have not yet been tested with students.

## Verification

In the build environment, npm registry DNS was unavailable. The source TSX was transpiled using the installed TypeScript compiler, and a separate offline preview was exercised using a locally available React 16 compatibility runtime and Chromium/Playwright. All four routes loaded, the main creature/engineering/coffee workflows and hive editing passed, and mobile home width was checked. The modern React 19 dependency installation, full TypeScript type check and Vite build must still be run in a connected environment. The offline HTML preview is for evaluation only; use the modern project for deployment.
