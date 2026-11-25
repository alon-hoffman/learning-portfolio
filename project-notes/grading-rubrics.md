# Grading rubrics for the portfolio

<!-- Project record kept by the one-shot skill. Alon may read it. -->

- **Phase:** Delivered
- **Kind:** Change to existing system
- **Last updated:** 2026-11-25
- **Folder:** C:\Users\Alon\Desktop\Claude projects\learning-portfolio (app in `learning-portfolio/`)

## The idea, in Alon's words

Hard-metric assessment: 3-5 measurable metrics per assignment, 3 main levels each (not satisfactory / satisfactory-good / great), plus midpoints between levels (5 scored options) and a 0 option. Points written in each cell, with an example of what each main level looks like. A "How grading works" page, and each assignment shows its table with a link to that page. Grading is done by hand by the teacher; the midpoints are deliberately loose, for teacher flexibility. Purpose: make the teacher's life easier and make expectations visible.

## Existing system

- What it is and how it is built: Vite 6 + React 19 + TypeScript single-page app, Hebrew RTL, hash routing (`#home`, `#about`, `#<project id>`). Almost everything is in `learning-portfolio/src/App.tsx` (dense, one-line style); styles in `src/style.css` (minified-style single block). No tests, no lint. Build: `npm run build` (tsc --noEmit + vite build). Deployed to GitHub Pages by `.github/workflows/pages.yml`.
- Assignments (4), in the `projects` array: creatures (מעבדת היצורים), engineers (אתגר המהנדסים), coffee (תעלומת הקפה), hive (כוורת הידע). Each has a "case" section with 4 cards, the 4th being `assessment` (הערכת הלמידה), a short teacher-facing text on what to check.
- Parts we can reuse: `projects[].assessment` text as the seed for the metrics; `.case` / `.case-grid` section styling; `.measurement-table table` styling pattern; route/title handling in `App.syncTitle` and `render`; `.note` and `.eyebrow` classes.
- Instructions and conventions found: no CLAUDE.md/AGENTS.md. READMEs describe scope; the app README has a "Version 1 scope" list that should mention the rubrics. Activities state they have no automatic grade ("אין ציון אוטומטי").

## Answers so far

| # | Question | Answer | Date |
|---|----------|--------|------|
| 1 | Rubric design | 3 levels + midpoints + 0, points per cell, examples on main levels, hand graded, loose midpoints | 2026-11-25 |
| 2 | Structure | One "How grading works" page; each assignment shows a table and links to it | 2026-11-25 |
| 3 | Computed totals / data engine | Not needed, plain static tables | 2026-11-25 |
| 4 | Total to result mapping (my proposal: 0-5 points per metric, percentage bands) | Rejected. The points in each cell are the actual score and the total is the grade out of 100. Students must know in advance what they need to do to reach a given score ("too lazy for a 100? this is what you need for 80"). No bands needed. | 2026-11-25 |
| 5 | Table format | Shared a real example, "מתן ציון על מצגת": 4 criteria rows with unequal weights (40/25/25/10 = 100); 3 columns (במידה רבה / בינונית / נמוכה); the cell holds the points (40/30/20-0, 25/15/5, 25/15/5, 10/5/0); the criterion cell holds a guiding question; the low column can be a range down to 0. Midpoints are not columns, they are the teacher's discretion. "More like this." Supersedes my equal 25/6-cell scale. | 2026-11-25 |

## Waiting on Alon

(empty: discovery done)

## Agreed scope

DRAFT, awaiting Alon's confirmation.

- **Will do:**
  - New route `#grading`, page "איך מעריכים" (one screen): how to read a table, the three columns, points in the cell are the actual score, total = grade out of 100, midpoints and the low range are the teacher's discretion, one worked example, and "what it takes to reach 80".
  - A rubric table in each of the 4 assignments' "behind the scenes" section, in the format of Alon's presentation rubric: 4-5 criteria, unequal weights summing to 100, three columns, a guiding question in the criterion cell, a one-line observable descriptor plus points in each cell. Each table links to `#grading`.
  - Small entry point to the grading page from the header nav, `document.title` for the route, README scope line.
  - Mobile-friendly table (no page-level horizontal scroll), `caption` and `th scope` for accessibility.
- **Won't do:** computed totals, entering or saving student scores, a rubric data engine or editor, English version, changes to the four activities, new dependencies.
- **Defaults chosen for Alon:**
  - Hebrew, RTL, criterion column on the right, columns ordered high / medium / low (as in his example).
  - Low column shown as a range "0-N" so the teacher can give 0 for missing (his image shows "20-0").
  - Rubric content drafted by me from each assignment's existing `assessment` text; weights below. Cell wording is reviewed by Alon on the running page.
  - The current `assessment` card stays; the rubric sits right after the 4-card grid.
- **Setup and storage:** none; static JSX in `App.tsx` (a small `Rubric` component plus a `rubrics` constant keyed by project id), styles appended to `style.css`.
- **Change boundary:** may change `App.tsx`, `style.css`, `learning-portfolio/README.md`. Must not change activity behaviour, saved-data keys (`learn-*`), or the deploy workflow.

### Draft criteria and points (high / medium / low)

Creatures (מעבדת היצורים)
1. מגוון ההתאמות: שלושה סוגים (מבנית, התנהגותית, פיזיולוגית), כל אחד מסווג נכון: 30 / 20 / 0-10
2. קישור בין תכונה לאתגר הסביבה: 40 / 25 / 0-10
3. דיוק מדעי של ההסבר (מנגנון, לא רק תיאור): 20 / 12 / 0-5
4. הצגת היצור (שם, כרטיס ברור): 10 / 5 / 0-3

Engineers (אתגר המהנדסים)
1. איכות הנימוקים לחלוקת הנקודות: 35 / 22 / 0-10
2. התייחסות לצורך של המוצר: 25 / 15 / 0-5
3. תגובה לטיעון נגדי בדיבייט: 25 / 15 / 0-5
4. הצגה ברורה של ההחלטות והוויתורים: 15 / 10 / 0-5

Coffee (תעלומת הקפה)
1. שאלת חקר והשערה לפני המדידה: 20 / 12 / 0-5
2. בקרת משתנים (משנים דבר אחד): 25 / 15 / 0-5
3. תיעוד מדידות (שני הניסויים עד דקה 10): 20 / 12 / 0-5
4. מסקנה שנשענת על נתונים: 35 / 22 / 0-8

Hive (כוורת הידע)
1. נכונות המושגים: 20 / 12 / 0-5
2. הסבר המושגים במילים של התלמיד: 20 / 12 / 0-5
3. עומק הקשרים (איך ולמה, לא "קשור ל"): 35 / 22 / 0-8
4. גיוון סוגי הקשרים: 15 / 9 / 0-3
5. עמידה בדרישה הכמותית (7 מושגים, מספר הקשרים הנדרש): 10 / 6 / 0-2

Each set sums to 100 in the high column.

## Acceptance examples

DRAFT, awaiting confirmation.

| # | Given | When | Expect | Kind | Result |
|---|-------|------|--------|------|--------|
| E1 | Site open at `#home` | Open each of the 4 assignments (`#creatures`, `#engineers`, `#coffee`, `#hive`) | Under the 4-card "מאחורי הקלעים" section a rubric table appears with columns criterion / במידה רבה / במידה בינונית / במידה נמוכה and 4 rows (5 for hive) | main | pass |
| E2 | Any assignment page | Add up the numbers in the "במידה רבה" column | The sum is exactly 100 on all four pages | main | pass |
| E3 | Any rubric table | Read the low column | Each low cell is a range starting at 0, e.g. "0-10" | main | pass |
| E4 | Any rubric table | Click the "איך מעריכים?" link | URL becomes `#grading`, page title is "איך מעריכים \| אלון הופמן", the grading page shows: how to read the table, what the points mean, midpoint/low-range rule, a worked example with a total, and "what it takes to reach 80" | main | pass |
| E5 | On `#grading` | Click back link, or the browser back button | Returns to the page the user came from or to `#home` | main | pass |
| E6 | Browser closed | Open the site directly at `/#grading` | Grading page renders (deep link works) | main | pass |
| E7 | Header nav | Look at it on any page | A link to the grading page exists; it shows `aria-current=page` when on `#grading` | main | pass |
| E8 | Viewport 390px wide | Open a rubric table and `#grading` | No horizontal page scroll; the table is readable (scrolls inside its own container or reflows) | failure | pass |
| E9 | Any rubric table | Inspect it | It has a caption, header cells with scope, and the link is keyboard focusable | failure | pass |
| E10 | Existing app with saved data in localStorage (`learn-*`) | Open all four activities | They behave as before: saved data loads, example buttons and export work; `#unknown-route` still shows the home page | regression | pass |
| E11 | Repo | Run `npm run build` in `learning-portfolio/` | Type check and build pass | regression | pass |

## Baseline

- **Work in progress found before we started:** none (git status clean at session start)
- **Checks before any change:**

| Check | Command | Result before | Result after |
|-------|---------|---------------|--------------|
| Type check + build | `npm run build` (in `learning-portfolio/`) | passed | passed |

## Decisions and scope changes

- 2026-11-25 Rubric lives per assignment as static JSX/data in the existing `projects` array or a sibling constant, rendered by one small shared component - routine.

## Running it

- **Started with:** `npx vite --port 5199 --strictPort` in `learning-portfolio/` (background)
- **Access:** http://localhost:5199/ (rubric pages `/#creatures` etc., grading page `/#grading`)
- **How to reopen it:** `cd learning-portfolio && npm run dev`

## Review results

(after build)

## Decisions for Alon after delivery

(none yet)
