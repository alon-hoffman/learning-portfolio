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

## Design

Purple educational-portal look (purple header band, white cards) with a mobile bottom tab bar; layouts are responsive down to 360px. System fonts only, no external requests.

## Version 1 scope

- Creature lab: Paint-style drawing editor built on Fabric.js (pencil, eraser, fill, line/rectangle/ellipse, text, emoji stickers, undo/redo, habitat-coloured canvas), 4 habitats, 3 written adaptations, drawing saved locally, creature card with the drawing, JSON export, PNG download and print/PDF.
- Engineers: six game-based traits, exact 20-point completion, client-side image resize and local saving, sample opponent or import/export JSON.
- Coffee: two controlled runs, learner-entered question and hypothesis, manually recorded measurements, graph and report. Model is illustrative, not real experimental measurements.
- Hive: seven free-draggable hexagons that snap to a hex grid (mouse, touch or arrow keys). Hexagons that touch edge to edge form a connection badge; students explain 7–12 of those connections. Editable descriptions, JSON export and printing.
- Grading rubrics: a "how grading works" page (`#grading`) and a hand-graded rubric table (weights sum to 100, three levels, points per cell) in each assignment. Content lives in `src/rubrics.ts`; there is no score entry or saving.
- Local storage only, no accounts or collection of student data. Images are compressed to data URLs and stored locally. Storage can be unavailable or quota-limited; export work to keep a copy. No real-time multi-user sharing.
- Original classroom observations are distinguished from new digital adaptations, which have not yet been tested with students.

## Verification

`npm run build` (TypeScript type check plus Vite build) passes with React 19 and Vite 6. The activities were exercised manually in a browser, including mobile width, import validation and recovery from corrupted saved data. The digital adaptations have not yet been tested with students.
