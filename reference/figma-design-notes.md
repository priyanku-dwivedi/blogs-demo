# Figma Design Extraction Notes — Positivus Landing Page

Source file: https://www.figma.com/design/RPW3gqnCXsbwrxZZKHKJFC/Positivus-Landing-Page-Design--Community-
Confirmed node: `338:195` = "Process block" (6-step accordion)

## Status
- Metadata + screenshot extracted for node `338:195` (Process block).
- `get_variable_defs` → **403 "Limited by Figma plan"** (design variables/tokens are gated by the file's Figma plan tier).
- `get_design_context` → repeated **429 "Rate limit exceeded"** even after 45s and 90s cooldowns.
- Top-level page frame node id NOT yet available — the metadata tool only traverses downward, so the parent frame cannot be discovered from a child node.

## Design tokens observed (from screenshot — approximate, pending API confirmation)
Positivus is a well-known community design system with these signature tokens:
- **Accent / primary green:** `#B9FF66` (bright lime — active accordion card background, buttons)
- **Dark / text:** `#191A23` (near-black — headings, borders, dark sections)
- **Light grey surface:** `#F3F3F3` (inactive accordion cards, section backgrounds)
- **White:** `#FFFFFF`
- **Card style:** large radius (~45px), 1px dark border, hard offset drop shadow (~5px 5px 0 #191A23)
- **Typography:** "Space Grotesk" (headings + body), large bold numerals for step counters
- **Section rhythm:** generous vertical spacing, 1440px design width, ~100px side gutters

## Process block structure (node 338:195)
- 6 stacked "Card" frames (accordion items): Consultation, Research and Strategy Development,
  Implementation, Monitoring and Optimization, Reporting and Communication, Continual Improvement.
- Each card: large step number (01–06) + title + circular +/- toggle. Expanded card shows a divider
  line and a paragraph of body copy, and uses the green accent background.
- Maps cleanly to the existing repo `accordion` block (with a Positivus visual variant).

## Blocker
Full-page migration requires either:
1. The top-level landing-page frame node id (Figma "Copy link to selection" on the outer frame), AND
2. Figma API rate limit / plan access sufficient for get_design_context + get_screenshot per section.
