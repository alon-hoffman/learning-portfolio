# UI/UX redesign: Ofek look, mobile, paint editor, draggable hive

<!-- Project record kept by the one-shot skill. Alon may read it. -->

- **Phase:** Delivered
- **Kind:** Change to existing system
- **Last updated:** 2026-11-26
- **Folder:** C:\Users\Alon\Desktop\Claude projects\Alon-learning-portfolio (app in `learning-portfolio/`, cloned from github.com/alon-hoffman/learning-portfolio)

## The idea, in Alon's words

"The content is good but I don't like the UI and UX": not responsive on mobile; the creature editor "needs to feel like Microsoft Paint where you can actually draw, maybe with stickers", use an existing open-source library; the hive is unpleasant, students should move hexagons around (Google Slides example: coloured hexagons packed edge to edge); overall look like myofek.cet.ac.il. Then /ship and set up GitHub Pages. Alon waived the discovery interview ("continue without me").

## Existing system

- Vite 6 + React 19 + TS, hash routing, localStorage, Hebrew RTL. Dense one-line `App.tsx`; content (projects, assignment guides, rubrics) must stay as is.
- Reuse: all Hebrew content, `rubrics.ts`, Engineers/Coffee logic, save/load/export helpers, existing `pages.yml` workflow at repo root.
- No tests, no lint; build = `tsc --noEmit && vite build`.

## Answers so far

| # | Question | Answer | Date |
|---|----------|--------|------|
| 1 | Discovery | Waived by Alon; refs given | 2026-11-26 |

## Waiting on Alon

(none)

## Agreed scope

- **Will do:** new Ofek-style visual system (purple search band, white rounded cards, filter chips, bottom nav on mobile); responsive at 360px+; Paint-style editor on Fabric.js (pencil/brush, sizes, palette, eraser, shapes, text, emoji stickers, undo/redo, background per habitat, save/export PNG); hive as free-draggable hexagons with snap-to-grid, touching hexes = connections to explain.
- **Won't do:** backend, accounts, content changes, auto-grading.
- **Defaults chosen:** Fabric.js 6 (MIT) lazy-loaded; hive uses plain pointer events (no lib needed); system font stack (no external font requests, student privacy).
- **Change boundary:** `src/` UI + new deps; rubric/guide text untouched; workflow already deploys Pages.

## Acceptance examples

| # | Given | When | Expect | Kind | Result |
|---|-------|------|--------|------|--------|
| E1 | 375px viewport | open home and each activity | no horizontal page scroll, bottom nav visible | main | PASS (independent QA + own check) |
| E2 | creatures page | draw with pencil, add a sticker, undo | stroke and sticker appear on canvas, undo removes the last | main | PASS (independent QA + own check) |
| E3 | creatures, drawing + 3 adaptations filled | click make card | card shows the drawing image | main | PASS (independent QA + own check) |
| E4 | hive | drag a hexagon next to another | it snaps to grid; a link badge appears between touching hexes | main | PASS (independent QA + own check) |
| E5 | hive with 7 named hexes touching | explain >= required links | export enabled | main | PASS (independent QA + own check) |
| E6 | reload after editing | reopen creature/hive | drawing and hex positions restored | main | PASS (independent QA + own check) |
| E7 | engineers/coffee | existing flows | unchanged | regression | PASS (independent QA + own check) |
| E8 | hive | drag hexagon onto an occupied cell | lands on nearest free cell, no overlap | failure | PASS (independent QA + own check) |

## Baseline

Original repo had no tests; `npm run build` to be recorded.

## Decisions for Alon after delivery

- Coffee run B shows "החלב כבר בכוס" at 10:00 (pre-existing wording, left alone). Fix it? Recommend yes, small.
