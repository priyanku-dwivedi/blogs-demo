# figma-home — Block Reconciliation (Figma design ↔ live GED content)

**Rule:** Strict — build/use ONLY blocks present in the Figma design. Map live
ged.com/en home content onto those blocks. No new non-Figma blocks.

## Figma blocks confirmed (via API, node 338:195)
| Figma frame | EDS block | Repo status | Design variant |
|-------------|-----------|-------------|----------------|
| Process block (6-step accordion) | `accordion` | Exists | **`positivus`** variant added (blocks/accordion/accordion.css + model option) |

> Only the "Process block" node was reachable via the Figma API. The rest of the
> Positivus layout (nav, hero, logos, services, CTA, case studies, team,
> testimonials, contact, footer) could not be extracted because:
> - `get_variable_defs` → 403 "Limited by Figma plan"
> - `get_design_context` / `get_screenshot` per-section → sustained 429 rate limits
> - the top-level page frame node id was not provided (metadata can't traverse upward)

## Global design (Phase 3) — DONE
- Scoped theme `body.figma-home` in `styles/styles.css` with Positivus tokens:
  accent `#b9ff66`, dark `#191a23`, surface `#f3f3f3`, white `#fff`.
- `Space Grotesk` @font-face added to `styles/fonts.css` (Google CDN fallback).
- Isolated from 888poker + GED themes; existing pages unaffected.

## Block build (Phase 4) — DONE for the confirmed block
- `accordion` gains an author-selectable **Variation** picker: Default (GED) /
  Positivus (Figma). `_accordion.json` model + block definition updated;
  `npm run build:json` re-run; CSS lint clean.

## Content mapping (Phase 5) — PENDING import
The live ged.com/en home page (per catalog: hero → rich-text → columns → cards)
has no 1:1 "process/accordion" section. Under the strict rule, the GED home
content maps onto the single confirmed Figma block (accordion) as a step/FAQ
list, OR the full Positivus section set must be extracted first (blocked above).

**Accordion content table shape (for import):**
```
| accordion (positivus) |
| <title>  | <body richtext> |
| ...      | ...             |
```

## To finish the FULL figma-home page
Provide the top-level Positivus frame link (Figma → Copy link to selection on the
outer frame) and allow the Figma rate limit to reset, so every section frame can
be extracted and built as its matching EDS block before the content import.
