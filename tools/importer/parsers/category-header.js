/* eslint-disable */
/* global WebImporter */
/**
 * Parser for category-header.
 * Base: custom local block (xwalk model: category-header).
 * Source: https://www.888poker.com/magazine/poker-world (category) and
 *         https://www.888poker.com/magazine/tags/wsop (tag) — same structure.
 * Generated for xwalk project.
 *
 * Listing-page header for Drupal taxonomy pages (category and tag). Just the
 * taxonomy term name (title) plus an optional description. Distinct from
 * author-header (portrait/bio/social), which is intentionally NOT reused here.
 *
 * Simple block, one column. Model fields (blocks/category-header/_category-header.json):
 *   Row 1: title       (text)     -> #block-pagetitle h1.title.page-title
 *   Row 2: description (richtext) -> taxonomy term description; EMPTY on the
 *          sampled pages. The row/cell is always emitted so the model shape is
 *          complete, but per the xwalk hinting rules an EMPTY cell carries NO
 *          field comment.
 */
export default function parse(element, { document }) {
  // --- Title ------------------------------------------------------------------
  // The page-title block holds the taxonomy term name. Prefer the scoped
  // page-title heading, then progressively looser fallbacks. Look inside the
  // target element first, then the whole document (the block target may be the
  // #block-pagetitle div itself or an ancestor section).
  const titleEl = element.querySelector('h1.title.page-title, h1.page-title, h1.title, h1')
    || document.querySelector('#block-pagetitle h1.title.page-title, #block-pagetitle h1.page-title, #block-pagetitle h1, h1.page-title');
  const title = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';

  // --- Description (optional) -------------------------------------------------
  // Drupal renders a taxonomy term description here when present. Absent on the
  // sampled category/tag pages; captured defensively for terms that do have one.
  const descEl = element.querySelector(
    '.field--name-description, .taxonomy-term-description, .term-description, .page-title-description',
  ) || document.querySelector(
    '#block-pagetitle .field--name-description, .region--content-top .field--name-description, .taxonomy-term-description',
  );
  const hasDescription = descEl && descEl.textContent.trim();

  // Empty-block guard: bail if there is no term title to author with.
  if (!title && !hasDescription) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Helper: field-hint comment (placed BEFORE cell content, xwalk hinting Rule 4).
  const hint = (fieldName) => document.createComment(` field:${fieldName} `);

  const cells = [];

  // Row 1: title (text).
  if (title) {
    const frag = document.createDocumentFragment();
    frag.appendChild(hint('title'));
    const span = document.createElement('span');
    span.textContent = title;
    frag.appendChild(span);
    cells.push([frag]);
  } else {
    cells.push(['']);
  }

  // Row 2: description (richtext, optional). Emit the row so the model shape is
  // complete; an EMPTY cell gets NO field comment (hinting Rule 4).
  if (hasDescription) {
    const frag = document.createDocumentFragment();
    frag.appendChild(hint('description'));
    frag.appendChild(descEl);
    cells.push([frag]);
  } else {
    cells.push(['']);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'category-header', cells });
  element.replaceWith(block);
}
