# GED.com → AEM Edge Delivery Services POC Migration Plan

## Objective

Demonstrate an end-to-end lift-and-shift migration proof-of-concept for **https://www.ged.com/en/**, structured to show the customer four capabilities in sequence:

1. **Site discovery** — enumerate pages and group them into layout templates
2. **Block identification** — map each template's sections to EDS blocks, reuse-first
3. **Block validation** — build/instrument the blocks and test them with sample (draft) content before any real content is moved
4. **Content-migration planning** — produce a concrete plan (not execution) for migrating real content later

> **Execution note:** This is the plan only. Running discovery, scraping, and block builds requires **Execute mode** (Shift+Tab in the CLI). Nothing below will be executed while plan mode is active.

## Confirmed Scope Decisions

- **Depth:** Cap discovery at the **top 5 templates** for the POC. Discover the full URL set, but only carry the 5 most representative/high-value templates forward into analysis and build.
- **Design fidelity:** **Source styling is required.** Blocks must visually match the ged.com source (colors, typography, spacing, layout), not just reproduce structure. A design-fidelity/visual-critique pass is in scope for each built block.

## Scope & Approach

- **Migration style:** Lift-and-shift — preserve existing structure, layout, and visual design; no redesign.
- **Block strategy (strict priority):**
  1. **Reuse** an existing block from the project / block collection if it satisfies the requirement.
  2. **Variation** — create a variant of an existing block if reuse is close but not exact.
  3. **New block** — build from scratch only when neither reuse nor variation can meet the requirement.
- **Content:** Deferred. Blocks are validated against **draft/sample content** in this POC; real content migration is planned but not performed.

## Phase 1 — Site Discovery

- Discover URLs for `www.ged.com/en/` (sitemap first, fall back to crawl).
- Group URLs by structural similarity into page templates.
- Rank templates and select the **top 5** for the POC (by prevalence + representativeness); note the rest as out-of-POC.
- For each of the 5: pick a representative URL, note coverage gaps, record a short description.
- **Deliverable:** a site catalog (`tools/importer/page-templates.json`) + a discovery summary (all templates found, the chosen top 5, page counts, representative URLs).
- **Checkpoint:** review the top-5 template selection with the customer and confirm which of the 5 to take all the way through block build (Phase 3).

## Phase 2 — Per-Template Page & Block Analysis (top 5)

For each of the 5 representative pages:

- Analyze section boundaries and content sequences (default content vs. block-worthy).
- Survey the available block palette (project blocks + block collection).
- For every block-worthy section, decide **reuse / variant / new** and record the rationale.
- Capture source design tokens (colors, fonts, spacing) needed for the fidelity pass.
- **Deliverable:** authoring analysis + a **block decision matrix** (section → chosen block → reuse|variant|new → justification).
- **Checkpoint:** confirm the block decisions before building.

## Phase 3 — Block Build & Validation (with sample content + source-matched styling)

- Implement or instrument the chosen blocks (JS + CSS + model), following the reuse-first priority.
- Apply **source-matched styling** — extract exact computed styles from ged.com and reproduce them in block CSS.
- Create **draft/sample content** (static HTML in a `drafts/` folder) exercising each block's fields and variants.
- Preview locally, run a **visual-critique pass against the source** (target high visual similarity), check responsive behavior, run `npm run lint`, and target performance best practices.
- **Deliverable:** working, source-styled blocks + a per-block validation note (visual comparison vs. source).

## Phase 4 — Content Migration Plan (planning only)

- Define the import pipeline per template (parsers, transformers, import scripts) needed for the real content later.
- Identify metadata/SEO fields to preserve, image/DAM handling, and any redirects.
- Sequence the eventual content migration (which templates first, volumes, dependencies).
- **Deliverable:** a content-migration runbook the customer can approve for a later execution phase.

## Assumptions

- `www.ged.com/en/` is publicly reachable for scraping/analysis.
- POC targets the **English** site only (`/en/`).
- The current repo (aem-boilerplate-xwalk based) is the target project for the POC blocks.
- Any authenticated/gated pages are out of scope for the POC.
- The specific template(s) taken through full block build (Phase 3) are chosen at the Phase 1 checkpoint, once the top 5 are known.

## Checklist

- [ ] **Phase 1:** Discover URLs for `www.ged.com/en/` (sitemap → crawl fallback)
- [ ] **Phase 1:** Group URLs into templates; rank and select the **top 5** for the POC
- [ ] **Phase 1:** Select representative URLs + coverage gaps for the 5 templates
- [ ] **Phase 1:** Produce site catalog + discovery summary
- [ ] **Phase 1 checkpoint:** Review top-5 selection with customer; confirm which to fully build in Phase 3
- [ ] **Phase 2:** Analyze each of the 5 representative pages (sections, sequences, default vs. block)
- [ ] **Phase 2:** Survey block palette (project + block collection)
- [ ] **Phase 2:** Capture source design tokens (colors, fonts, spacing) for fidelity
- [ ] **Phase 2:** Build block decision matrix (reuse → variant → new, with rationale); confirm
- [ ] **Phase 3:** Implement/instrument blocks per reuse-first priority
- [ ] **Phase 3:** Apply source-matched styling (extract computed styles from ged.com)
- [ ] **Phase 3:** Create draft/sample content exercising each block + variants
- [ ] **Phase 3:** Preview, run visual-critique vs. source, check responsive, run `npm run lint`
- [ ] **Phase 4:** Define import pipeline (parsers/transformers/scripts) per template
- [ ] **Phase 4:** Document metadata/SEO, image/DAM, and redirect handling
- [ ] **Phase 4:** Deliver sequenced content-migration runbook for later approval
- [ ] Switch to **Execute mode** to begin Phase 1
