/*
 * Author Header Block
 * Top-of-page author identity banner: large portrait, author name (heading),
 * short bio, and a row of social links. Distinct from the compact article-foot
 * "author-bio" card. Derived for author listing pages.
 *
 * Authored cell order (fields grouped via model prefixes):
 *   1: author image (picture)
 *   2: name (heading)
 *   3: bio (richtext)
 *   4: social group -> facebook, twitter/x, linkedin links
 */

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  block.classList.add('author-header');

  const rows = [...block.children];
  const labels = ['image', 'name', 'bio', 'social'];
  rows.forEach((row, i) => {
    const label = labels[i] || `row-${i}`;
    row.classList.add(`author-header-${label}`);
    const cell = row.firstElementChild;
    if (cell) cell.classList.add(`author-header-${label}-content`);
  });

  const imageRow = block.querySelector('.author-header-image');
  if (imageRow && imageRow.querySelector('picture')) {
    imageRow.classList.add('author-header-has-image');
    imageRow.querySelectorAll('picture > img').forEach((img) => {
      const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]);
      moveInstrumentation(img, optimized.querySelector('img'));
      img.closest('picture').replaceWith(optimized);
    });
  }

  // Turn the social links row into an accessible icon list
  const socialRow = block.querySelector('.author-header-social');
  if (socialRow) {
    const links = [...socialRow.querySelectorAll('a')];
    if (links.length) {
      const ul = document.createElement('ul');
      ul.className = 'author-header-social-list';
      links.forEach((a) => {
        const li = document.createElement('li');
        a.classList.add('author-header-social-link');
        if (!a.getAttribute('aria-label') && a.title) a.setAttribute('aria-label', a.title);
        li.append(a);
        ul.append(li);
      });
      socialRow.replaceChildren(ul);
    }
  }
}
