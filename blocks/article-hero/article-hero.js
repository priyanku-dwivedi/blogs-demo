/*
 * Article Hero Block
 * Renders a blog article intro: title, category, publish date, reading time,
 * hero image, and author byline. Derived from the hero block for article pages.
 *
 * Authored cell order (fields grouped via model prefixes):
 *   1: hero image (picture)
 *   2: title (heading)
 *   3: meta group -> category, publish date, reading time
 *   4: author group -> author image, author name, author link
 */

export default function decorate(block) {
  block.classList.add('article-hero');

  const rows = [...block.children];
  const labels = ['image', 'title', 'meta', 'author'];
  rows.forEach((row, i) => {
    const label = labels[i] || `row-${i}`;
    row.classList.add(`article-hero-${label}`);
    const cell = row.firstElementChild;
    if (cell) cell.classList.add(`article-hero-${label}-content`);
  });

  const imageRow = block.querySelector('.article-hero-image');
  if (imageRow && imageRow.querySelector('picture')) {
    imageRow.classList.add('article-hero-has-image');
  }
}
