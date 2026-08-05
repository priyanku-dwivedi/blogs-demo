/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: ged-cards (GED "transcripts" year-range option cards)
 * Base block: cards (blocks/cards/cards.js)
 * Source: https://www.ged.com/transcripts/international.html
 *
 * Source shape: a .content-tile__figure containing a set of anchor "cards",
 * each wrapping an <h3> (option label) and a <p> (description), interleaved
 * with plain "or" separator paragraphs. Each anchor becomes one cards row:
 *   [ <h3><a href=…>label</a></h3> + <p>description</p> ]
 * so the whole card is a single link (matching the source behaviour).
 *
 * The "or" separators are dropped (they are presentation-only chrome).
 */
export default function parse(element, { document }) {
  const cards = [...element.querySelectorAll('a[href]')].filter((a) => a.querySelector('h3'));
  if (cards.length === 0) {
    // Nothing card-like — leave the DOM untouched.
    return;
  }

  const rows = cards.map((a) => {
    const href = a.getAttribute('href');
    const h3 = a.querySelector('h3');
    const desc = a.querySelector('p');

    const cell = document.createElement('div');

    // Heading as the card's link (title becomes the anchor).
    if (h3) {
      const heading = document.createElement('h3');
      const link = document.createElement('a');
      link.setAttribute('href', href);
      link.textContent = h3.textContent.replace(/\s+/g, ' ').trim();
      heading.appendChild(link);
      cell.appendChild(heading);
    }

    // Description paragraph.
    if (desc && desc.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = desc.textContent.replace(/\s+/g, ' ').trim();
      cell.appendChild(p);
    }

    return [cell];
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards (ged-options)',
    cells: rows,
  });

  element.replaceWith(block);
}
