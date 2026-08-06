# NumeroLume — Numerology Calculator

A free, private, fully client-side numerology web application. Enter a name and
birth date and instantly receive a comprehensive Pythagorean numerology report —
Life Path, Destiny, Soul Urge, Karmic Debt, Pinnacles, Challenges, a personal
timeline, interactive charts, and a "Triangle of Life" pyramid — with full
calculation breakdowns for every number. Export to Excel or PDF, or print
directly from the browser.

No backend, no database, no API keys, no build step. Runs entirely in the
browser and deploys straight to GitHub Pages.

---

## Overview

NumeroLume implements the Pythagorean numerology system: each letter of the
alphabet maps to a digit 1–9, and birth-date digits are summed and reduced.
Every calculation on the page shows its full working — not just the final
number — so the result is auditable rather than a black box. Master Numbers
(11, 22, 33, 44) and Karmic Debt numbers (13, 14, 16, 19) are detected and
explained wherever they appear.

## Features

- **30 calculations**: Life Path, Destiny/Expression, Soul Urge, Personality,
  Birthday, Maturity, Balance, Hidden Passion, Karmic Lessons, Karmic Debt,
  Challenge Numbers, Pinnacle Numbers, Personal Year/Month/Day, Attitude,
  Rational Thought, Subconscious Self, Cornerstone, Capstone, First Vowel,
  First Consonant, Plane of Expression, Bridge Numbers, Life Cycles, Period
  Cycles, Essence Number, and Universal Year/Month/Day.
- **Step-by-step math** shown for every number, plus interpretation covering
  positive/negative traits, career, relationships, finance, health, life
  lessons, strengths, weaknesses, suitable professions, compatibility, lucky
  colors/days/numbers, and suggested improvements.
- **Interactive SVG "Triangle of Life" pyramid** — hover or focus any
  Pinnacle/Challenge shape to see age ranges and meaning.
- **Timeline** of the current + upcoming Personal Years and the 12-month
  Personal Month cycle.
- **Charts** (Chart.js): core-number radar, letter-value numerology wheel,
  personal-year life cycle line chart, and plane-of-expression bar chart.
- **Excel export** (SheetJS): Summary, Calculations, Interpretation, Timeline,
  and Compatibility sheets, styled with headers and auto column widths.
- **PDF export** (jsPDF + html2canvas) and browser-native **Print** with
  dedicated print styles.
- **Form validation**: required fields, real calendar/leap-year validation,
  future-date rejection, invalid-character checks, friendly inline errors.
- **Accessible**: semantic HTML, ARIA labels, visible keyboard focus, skip
  link, high-contrast dark/light themes.
- **Responsive** across mobile, tablet, and desktop.
- **Dark/Light theme toggle**, saved to local storage.
- **Offline-friendly PWA**: installable, with a service worker caching the
  app shell (`manifest.json`, `service-worker.js`).
- 100% client-side — your name and birth date never leave your browser.

## Technology Stack

- HTML5, CSS3, vanilla ES6+ JavaScript — no framework, no bundler.
- [Chart.js](https://www.chartjs.org/) (CDN) for data visualization.
- [SheetJS / xlsx](https://sheetjs.com/) (CDN) for Excel export.
- [jsPDF](https://github.com/parallax/jsPDF) + [html2canvas](https://html2canvas.hertzen.com/) (CDN) for PDF export.
- Google Fonts: Cormorant Garamond (display) + Inter (body).

All third-party libraries are loaded from public CDNs at runtime — nothing is
bundled or requires `npm install`.

## Installation / Running Locally

No build step is required.

```bash
git clone https://github.com/<your-username>/numerolume.git
cd numerolume
```

Then simply open `index.html` in a browser, **or** serve it locally (recommended,
since some browsers restrict `fetch`/service-worker registration on `file://`):

```bash
# Python
python3 -m http.server 8000

# or Node
npx serve .
```

Visit `http://localhost:8000`.

## Deploying to GitHub Pages

1. Push this repository to GitHub.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
4. Choose the `main` branch and the `/ (root)` folder, then **Save**.
5. Wait a minute for GitHub to publish; your app will be live at
   `https://<your-username>.github.io/<repo-name>/`.

No further configuration, build step, or `npm install` is needed.

## Folder Structure

```
/
├── index.html          # Page structure, form, results, help sections
├── style.css            # Design tokens, layout, responsive + print styles
├── numerology.js         # Core calculation engine (pure functions) + meanings dictionary
├── pyramid.js            # Interactive SVG "Triangle of Life" renderer
├── report.js              # Report HTML assembly + Chart.js visualizations
├── excel.js                # SheetJS multi-sheet workbook export
├── script.js                # App entry point: form wiring, validation, exports, theme
├── manifest.json             # PWA manifest
├── service-worker.js          # Offline app-shell cache
├── favicon.ico
├── assets/                     # (reserved for future static assets)
├── README.md
└── LICENSE
```

## Numerology Concepts

**Calculation method.** Letters are mapped 1–9 using the standard Pythagorean
grid (A=1, B=2 … I=9, J=1 … R=9, S=1 … Z=8). Birth-date digits and name-letter
values are summed, then repeatedly digit-summed ("reduced") until a single
digit remains — unless a Master Number is hit first.

**Master Numbers (11, 22, 33, 44).** These are *not* reduced further under
normal circumstances, because they are considered to carry amplified
potential and challenge beyond the single digits they would otherwise reduce
to (e.g. 2 or 4). NumeroLume detects and flags them throughout the report.

**Karmic Debt Numbers (13, 14, 16, 19).** When one of these exact totals
appears as the *first* pre-reduction sum in a calculation, it is flagged as a
Karmic Debt — traditionally interpreted as a lesson carried over from a past
pattern that this lifetime is here to resolve. Each is explained on the
report page and in the Help section.

## Disclaimer

NumeroLume is provided **for educational and entertainment purposes only**.
Numerology is not a scientifically validated practice. Nothing in this
application constitutes medical, legal, financial, or psychological advice,
and it should not be used as the sole basis for major life decisions.

## Future Improvements

- Additional languages (Chinese, Bahasa Malaysia)
- Name-compatibility and business/baby-name numerology calculators
- House number and vehicle number numerology
- Shareable report links

## Contributing

Issues and pull requests are welcome. Please keep contributions dependency-free
(CDN-only) so the project keeps working on GitHub Pages with zero build step.

## Credits

Built with Chart.js, SheetJS, jsPDF, and html2canvas — see their respective
licenses for terms of use of those libraries.

## License

Released under the [MIT License](LICENSE).
