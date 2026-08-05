/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: ged-steps (GED home "How to earn your GED" 4-step cards)
 * Base block: cards (blocks/cards/cards.js) — variant class "ged-steps"
 * Source: https://www.ged.com/en/
 *
 * Source shape: a .row containing 4 numbered step cards, each with a
 * description <p> and a CTA link. Produces a cards block where each row is one
 * step: [ <p>description</p><p><a>link</a></p> ] (no image — the CSS variant
 * renders the numbered badge via a counter).
 */
const STEP_HINTS = ['Take a class', 'Take the official', 'Schedule and sit', 'Pass all 4'];

export default function parse(element, { document }) {
  const rows = [];
  STEP_HINTS.forEach((hint) => {
    const desc = [...element.querySelectorAll('p')].find((p) => p.textContent.includes(hint));
    if (!desc) return;
    const card = desc.closest('div');
    const link = card ? card.querySelector('a[href]') : null;

    const cell = document.createElement('div');
    const p = document.createElement('p');
    p.textContent = desc.textContent.replace(/\s+/g, ' ').trim();
    cell.appendChild(p);
    if (link) {
      const lp = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', link.getAttribute('href'));
      a.textContent = link.textContent.replace(/\s+/g, ' ').trim();
      lp.appendChild(a);
      cell.appendChild(lp);
    }
    rows.push([cell]);
  });

  if (rows.length === 0) { return; }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards (ged-steps)',
    cells: rows,
  });
  element.replaceWith(block);
}
