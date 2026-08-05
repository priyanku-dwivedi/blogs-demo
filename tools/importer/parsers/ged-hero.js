/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: ged-hero (GED home hero)
 * Base block: hero (blocks/hero/hero.js) — variant class "ged-hero"
 * Source: https://www.ged.com/en/
 *
 * Source shape: the first .column-control section with an <h1>, a subhead <p>,
 * and a CTA link. Produces a single-cell hero block with the heading, subhead
 * and a button link.
 */
export default function parse(element, { document }) {
  const h1 = element.querySelector('h1');
  if (!h1) { return; }
  const sub = [...element.querySelectorAll('p')].find((p) => !p.querySelector('a') && p.textContent.trim());
  const cta = element.querySelector('a[href]');

  const cell = document.createElement('div');
  const heading = document.createElement('h1');
  heading.textContent = h1.textContent.replace(/\s+/g, ' ').trim();
  cell.appendChild(heading);

  if (sub) {
    const p = document.createElement('p');
    p.textContent = sub.textContent.replace(/\s+/g, ' ').trim();
    cell.appendChild(p);
  }

  if (cta) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.setAttribute('href', cta.getAttribute('href'));
    a.textContent = cta.textContent.replace(/\s+/g, ' ').trim();
    p.appendChild(a);
    cell.appendChild(p);
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'hero (ged-hero)',
    cells: [[cell]],
  });
  element.replaceWith(block);
}
