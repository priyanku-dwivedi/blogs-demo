I need a couple of key inputs before I can finalize this plan. Let me ask.# Figma-Assisted Migration Plan — `figma-home` (ged.com/en Home Page)

## Objective
Migrate the **ged.com/en home page** to AEM Edge Delivery Services as a single page named **`figma-home`**, where:
- **Design comes from Figma** — build only the blocks that exist in the Figma design (strict; no new non-Figma blocks).
- **Content comes from the live site** — https://www.ged.com/en.
- **Global design** (tokens, fonts, colors, spacing) is set up from Figma for the page.

## Decisions Confirmed
- **Content source:** https://www.ged.com/en (home page), which we already cataloged.
- **Design source:** Figma (link to be provided — see checklist).
- **Block scope:** **Figma blocks only (strict).** Map live content onto Figma-designed blocks. Do **not** create any block that is not in Figma.
- **Enable `excat-figma` plugin:** Yes (approved this turn).
- **Page name:** `figma-home`.

## Prerequisites & Open Inputs
- [ ] **`excat-figma` plugin must be enabled** — requires writing `.agents/settings.json` (an execute-mode action). Plugin skills only load on the following turn.
- [ ] **Figma file URL + specific frame/page** for the home page design — still needed (will request once the plugin is active).
- [ ] **Figma access** — confirm the file is reachable (public link or connected Figma integration/token via Settings, never pasted in chat).
- [ ] **Org name caveat:** Config Service org is currently defaulted to `priyanku-dwivedi`; verify if it matters for preview URLs.

> ⚠️ **Execution requires Execute mode.** This plan is read-only. Enabling the plugin, extracting Figma, building blocks, and importing content are all execute-mode actions.

## Checklist

### Phase 0 — Enable Figma tooling
- [ ] Write `.agents/settings.json` to enable `excat-figma@excat-extended` (merge with existing `project-management` entry).
- [ ] Wait for session reinit; confirm `excat-figma` skills appear in available skills.
- [ ] Ask user for the **Figma file URL and target home-page frame**.

### Phase 1 — Extract Figma design
- [ ] Connect to the Figma file and extract the home-page frame.
- [ ] Enumerate the **blocks present in the Figma design** (the authoritative block set for this migration).
- [ ] Extract **global design tokens**: color palette, typography/fonts, spacing scale, breakpoints, buttons.
- [ ] Produce a Figma block inventory + design-token spec artifact.

### Phase 2 — Reconcile Figma blocks vs. live content
- [ ] Pull the cataloged structure of the live ged.com/en home page (hero, columns, cards, accordion, etc.).
- [ ] Map each live content section → a Figma-designed block.
- [ ] Flag any live content that has **no** matching Figma block (per strict rule: it will be mapped to the closest Figma block or default content, never a new block).
- [ ] Flag any Figma block with no corresponding live content (built but may be unused on this page).

### Phase 3 — Global design setup
- [ ] Apply Figma design tokens to global styles (`styles/styles.css`, `fonts.css`) — colors, typography, spacing, breakpoints.
- [ ] Set up fonts from Figma (add to `fonts/` + `fonts.css`) as needed.
- [ ] Ensure global setup is scoped so it renders the `figma-home` page correctly without breaking existing blog/888 theme.

### Phase 4 — Build the Figma blocks
- [ ] For each Figma block: implement/adapt `blocks/{name}/{name}.js`, `{name}.css`, and `_{name}.json` model to match the Figma design.
- [ ] Reuse existing repo blocks **only** where they correspond to a Figma block (restyled to Figma); otherwise build the Figma block. **No blocks outside the Figma set.**
- [ ] Run `npm run build:json` to regenerate component definitions/models.
- [ ] Lint (`npm run lint`) and fix.

### Phase 5 — Import the home page content as `figma-home`
- [ ] Generate import artifacts (parser/transformer/template) for the home page.
- [ ] Import live ged.com/en home content, mapped onto the Figma blocks, to a page named **`figma-home`**.
- [ ] Place the page in the viewable content/preview area.

### Phase 6 — Verify & QA
- [ ] Render `figma-home` in the local preview (snapshot/evaluate) and confirm each block appears.
- [ ] Visually compare `figma-home` against the Figma design (design fidelity) and against live content (content completeness).
- [ ] Iterate on block CSS until it matches the Figma design.
- [ ] Report final page path and any content-with-no-Figma-block gaps.

## Notes & Risks
- **Strict block rule:** If the live home page contains a content type not designed in Figma, it will **not** get a new block — it maps to the nearest Figma block or becomes default content. I'll surface these gaps in Phase 2 for your decision.
- **Two content-source realities:** The Config Service reports this project as **Universal Editor + AEM author** (not Document Authoring), per the handover findings. Import target will follow the repo's actual xwalk/UE setup.
- **Theme coexistence:** The repo currently carries a blog/888poker theme and a GED POC theme. Global Figma tokens will be applied so `figma-home` renders correctly without breaking existing pages.
- **Figma access is the critical dependency** — nothing in Phases 1–6 can start until the Figma link is provided and reachable.

**To proceed:** approve this plan and switch to **Execute mode**. I'll start by enabling the `excat-figma` plugin, then request the Figma file URL.
