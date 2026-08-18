# figma-home — Final Status

## Built & validated (design foundation)
- **Positivus global theme** `body.figma-home` in `styles/styles.css` (tokens: accent #b9ff66,
  dark #191a23, surface #f3f3f3) + **Space Grotesk** @font-face in `styles/fonts.css`. Lint clean.
- **Positivus accordion variant** in `blocks/accordion/` (step numbers, lime active card, circular
  +/- toggle, hard offset shadow) with an author-selectable "Variation" picker. `build:json` run.
- **Import pipeline**: `tools/importer/import-figma-home.js` (+ bundle) and a new
  `tools/importer/parsers/figma-steps.js` that maps a step section to `accordion (positivus)`.

## Imported
- `content/ged-pages/figma-home.plain.html` created via the import script (Template=figma-home,
  GED nav/footer). Renders at `http://localhost:3000/content/ged-pages/figma-home` (HTTP 200).

## Honest gaps found during QA
1. **Live content changed.** `https://www.ged.com/en/` no longer serves the old marketing home
   (hero / 4-step "how to earn" / graduate stories). It now serves a University-Acceptance +
   search/Google-Maps page. So the ged-hero/figma-steps/ged-stories selectors matched **0 blocks**
   (import logged "Found 0 block instances", 73.2% completeness) → the page came through as default
   content with **no accordion**, so the Positivus block isn't showcased on this URL.
2. **Theme not applied on the local /content/ path.** Rendered body class is only `appear` — neither
   `ged-poc` nor `figma-home`. Reasons: (a) SITE_SECTIONS matches prefix `/ged-pages`, but the local
   server serves this page under `/content/ged-pages/...`; (b) the Template→body-class wiring
   (`decorateTemplateAndTheme`) needs the metadata as a `<meta name="template">`, which the
   published pipeline produces but the local plain-html preview did not. Result: 888 chrome + dark
   theme shown locally.

## To actually see Positivus on figma-home, choose one:
- **A. Point at real Positivus content** — provide the top-level Positivus Figma frame link (and let
  the Figma API rate limit reset) so the hero/services/CTA/process sections can be extracted and the
  page built from the Figma design instead of the (changed) live GED URL.
- **B. Author sample step content** — add an `accordion (positivus)` block with the 6 Positivus
  process steps directly, so the built block renders regardless of the live site.
- **C. Fix theme wiring** — add a SITE_SECTIONS entry (or template-class handling) so
  `figma-home` reliably applies its body class on both local and published routes.
