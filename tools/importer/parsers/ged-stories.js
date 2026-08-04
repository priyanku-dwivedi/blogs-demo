/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: ged-story (GED home graduate-story teaser cards)
 * Base block: cards (blocks/cards/cards.js) — variant class "ged-story"
 * Source: https://www.ged.com/en/
 *
 * Source shape: a .row containing 3 graduate story cards, each with an <h3>
 * name, a quote <p>, and a "View Story" link. Produces a cards block where each
 * row is one story: [ <h3>name</h3><p>quote</p><p><a>View Story</a></p> ].
 */
export default function parse(element, { document }) {
  const h3s = [...element.querySelectorAll('h3')];
  if (h3s.length === 0) { return; }

  const rows = h3s.map((h3) => {
    const wrap = h3.closest('div');
    const quote = wrap ? [...wrap.querySelectorAll('p')].find((p) => !p.querySelector('a')) : null;
    const storyLink = wrap ? [...wrap.querySelectorAll('a[href]')].pop() : null;

    const cell = document.createElement('div');
    const heading = document.createElement('h3');
    heading.textContent = h3.textContent.replace(/\s+/g, ' ').trim();
    cell.appendChild(heading);
    if (quote) {
      const p = document.createElement('p');
      p.textContent = quote.textContent.replace(/\s+/g, ' ').trim();
      cell.appendChild(p);
    }
    if (storyLink) {
      const lp = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', storyLink.getAttribute('href'));
      a.textContent = storyLink.textContent.replace(/\s+/g, ' ').trim() || 'View Story';
      lp.appendChild(a);
      cell.appendChild(lp);
    }
    return [cell];
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards (ged-story)',
    cells: rows,
  });
  element.replaceWith(block);
}
