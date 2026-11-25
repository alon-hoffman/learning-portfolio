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

1. Push this repository to GitHub (public for free GitHub Pages). The workflow in `.github/workflows/pages.yml` at the repository root builds the app from the `learning-portfolio/` folder.
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

`npm run build` (TypeScript type check plus Vite build) passes with React 19 and Vite 6. The activities were exercised manually in a browser, including mobile width, import validation and recovery from corrupted saved data. The digital adaptations have not yet been tested with students.
