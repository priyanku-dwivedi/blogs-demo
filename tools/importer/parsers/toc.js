/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: toc
 * Base block: toc (xwalk model: toc)
 * Source: https://www.888poker.com/magazine/jason-koon-poker-net-worth
 *
 * Model fields (blocks/toc/_toc.json):
 *   title (text)   -> heading text
 *   links (richtext) -> optional explicit <ul> of anchor links
 */
export default function parse(element, { document }) {
  // Heading text ("Table of contents")
  const titleEl = element.querySelector('.block__title, h2, h3, [class*="title"]');

  // Anchor list (in-page fragment links)
  const list = element.querySelector('.block__content ul, ul');

  if (!titleEl && !list) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row: title (field:title)
  if (titleEl) {
    const frag = document.createDocumentFragment();
    const p = document.createElement('p');
    p.textContent = titleEl.textContent.replace(/\s+/g, ' ').trim();
    frag.appendChild(document.createComment(' field:title '));
    frag.appendChild(p);
    cells.push([frag]);
  }

  // Row: links (field:links) — preserve the <ul> of anchors
  if (list) {
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createComment(' field:links '));
    frag.appendChild(list);
    cells.push([frag]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'toc', cells });
  element.replaceWith(block);
}
