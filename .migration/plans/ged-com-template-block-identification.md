# GED.com — Template & Block Identification

## 1. Discovery summary

- **Source:** `https://www.ged.com/en/` · **Discovery method:** sitemap (`/en/sitemap.xml`) · **URLs discovered:** 145 · **Project type:** xwalk (Crosswalk / Universal Editor)
- Live source confirmed reachable (`/en/` → 200, sitemap → 200). Catalog artifact: `migration-work/ged/page-templates.json`.
- ⚠️ **Note:** the catalog file lives in `migration-work/ged/` which is **git-ignored** (per §3.1 it should be moved to a git-visible path). I'll flag that but it doesn't change the findings below.

## 2. Unique templates (145 URLs → 5 POC templates + 4 folded-in)

| # | Template | Pages | Representative URL | What it is |
|---|----------|-------|--------------------|------------|
| 1 | **graduate-story** | 74 | `/en/graduatestories/atom-2.html` | Portrait hero (image + name + quote), video embed + paragraph, prev/next story pager. Highest volume. |
| 2 | **policy-country** | 15 | `/en/policies/india.html` | Country title H1 + ~13 expandable policy accordions. |
| 3 | **faq-category** | 10 | `/en/faqs/taking-the-exam.html` | Left FAQ-category nav + heading + Q&A accordions. |
| 4 | **content-landing** | 23 | `/en/how-to-graduate.html` (also `about-test`, `study`, `university-acceptance`) | Stacked marketing sections: headings, rich text, feature blocks, step cards, CTAs. |
| 5 | **home** | 1 | `/en` | Full-width hero, promo strip, alternating text/CTA features, numbered 4-step block, graduate-stories teaser row, closing sign-up CTA. Most diverse block set. |

**Folded into content-landing / out of POC scope:** `professional-development` (7), `additional-resources` (6), `curriculum` (4), `utility-legal` (6 — terms/privacy/contact-us; contact-us also uses accordions).

> Note: `university-acceptance` (your §8 list) is a **member of the content-landing template**, not its own template. `contactus` sits in utility-legal but was migrated in the existing package because it uses the accordion + contact-card patterns.

## 3. Blocks per template (reuse-first)

All map onto **existing blocks via `ged-*` variants** — no net-new blocks were needed. Variants already exist in the repo (`blocks/*/*.css` + `_*.json`).

| Template | Blocks (variant) | Path |
|----------|------------------|------|
| **home** | `hero` **ged-hero** (headline over photo) + **ged-cta** band · `columns` **ged-feature** (text + framed photo) · `cards` **ged-steps** (numbered) + **ged-story** (teasers) | reuse + variant |
| **content-landing** | `hero` **ged-hero** · `columns` **ged-feature** · `cards` **ged-steps** | reuse + variant |
| **policy-country** | `hero` **ged-banner** (title) · `accordion` (GED-themed, `--ged-brand`) | reuse + variant |
| **faq-category** | `tabs`/`category-nav` (GED-themed) + `accordion` | reuse + variant |
| **graduate-story** | `hero` **ged-story** (portrait + quote) · `embed` (video) · `story-pager` (prev/next) | reuse + variant |
| **contactus** | `hero` **ged-banner** · `cards` **ged-contact** (regional) · `accordion` | reuse + variant |

## 4. Full block & variant inventory (what's built)

| Block | GED variants | Author picker in `_*.json`? |
|-------|--------------|------------------------------|
| **hero** | `ged-hero`, `ged-cta`, `ged-story`, `ged-banner` | ✅ "Variation" select |
| **cards** | `ged-steps`, `ged-story`, `ged-options`, `ged-contact` | ✅ "Variation" select |
| **columns** | `ged-feature` | ✅ "Variation" select |
| **accordion** | GED theme (`--ged-brand #0084a9`, Roboto Slab) | ⚠️ CSS only — scoped via `body.ged-poc`, no picker field |
| **tabs** | GED theme | ⚠️ CSS only |
| **header / footer** | GED chrome via `body.ged-poc` + `SITE_SECTIONS` (`/ged-pages` → GED nav/footer, GED logo, forced light theme) | hierarchy-resolved, no per-page metadata |

**Design tokens (extracted from source):** brand teal `#0084a9`, dark `#006c8a`, text `#303030`, body font Roboto, heading font Roboto Slab.

## 5. Two gaps worth flagging

1. **Models are only on `pearson`.** None of the 76 GED commits are on `main`, so the hero/cards/columns "Variation" pickers are **not yet visible in Universal Editor** (§2 rule). A PR to `main` is required for authoring.
2. **`accordion`/`tabs` have GED styling but no author-selectable picker** (§6 wants a picker whenever a variant exists) — they're applied via the `body.ged-poc` scope instead. If policy/FAQ pages must be author-toggatable that's a follow-up.

---

That's the identification. This was read-only discovery — I didn't build or change anything. Want me to turn this into the full execution plan (per-template build + visual-fidelity verification + the `main` PR), or focus on one template first?
