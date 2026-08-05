/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: ged-cta (GED home closing call-to-action band)
 * Base block: hero (blocks/hero/hero.js) — variant class "ged-cta"
 * Source: https://www.ged.com/en/ (the dark "Join the millions…" band)
 *
 * Source shape: a .column-control.bgcolor--background-dark section with an
 * <h2> and a sign-up link. Produces a single-cell hero block with the heading
 * and a button link.
 */
export default function parse(element, { document }) {
  const h2 = element.querySelector('h2');
  if (!h2) { return; }
  const cta = element.querySelector('a[href]');

  const cell = document.createElement('div');
  const heading = document.createElement('h2');
  heading.textContent = h2.textContent.replace(/\s+/g, ' ').trim();
  cell.appendChild(heading);

  if (cta) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.setAttribute('href', cta.getAttribute('href'));
    a.textContent = cta.textContent.replace(/\s+/g, ' ').trim();
    p.appendChild(a);
    cell.appendChild(p);
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'hero (ged-cta)',
    cells: [[cell]],
  });
  element.replaceWith(block);
}
