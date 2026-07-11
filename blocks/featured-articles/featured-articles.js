/*
 * Featured Articles Block
 * Manually-curated set of featured article cards. NOT query-driven - each card
 * is hand-authored. The first card renders as a large "lead" card; the rest
 * render as smaller cards (matching the source magazine headline layout).
 *
 * Authored structure (container + repeatable article-card items):
 *   Each article-card item is one row with cells (grouped via model prefixes):
 *     - image (reference / picture)
 *     - card_title (text) + card_link (article href) + card_category (text)
 *     - card_author (text) + card_excerpt (optional richtext)
 *
 * Decoration turns each row into a linked card. The first card gets the
 * "featured-articles-card-lead" treatment.
 */

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'featured-articles-grid';

  [...block.children].forEach((row, index) => {
    const li = document.createElement('li');
    li.className = index === 0 ? 'featured-articles-card featured-articles-card-lead' : 'featured-articles-card';
    moveInstrumentation(row, li);

    while (row.firstElementChild) li.append(row.firstElementChild);

    // Resolve a target link for the whole card: prefer the first anchor.
    const firstLink = li.querySelector('a[href]');
    const href = firstLink ? firstLink.getAttribute('href') : null;

    [...li.children].forEach((cell) => {
      if (cell.children.length === 1 && cell.querySelector('picture')) {
        cell.className = 'featured-articles-card-image';
        if (href && !cell.querySelector('a')) {
          const link = document.createElement('a');
          link.href = href;
          link.append(...cell.childNodes);
          cell.append(link);
        }
      } else {
        cell.className = 'featured-articles-card-body';
      }
    });

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.replaceChildren(ul);
}
