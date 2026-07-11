/*
 * Category Header Block
 * Top-of-page listing header for taxonomy listing pages (category and tag).
 * Renders the term name as the page heading with an optional description below.
 * Distinct from author-header (which carries a portrait, bio and social links);
 * this header is title + optional description only.
 *
 * Authored cell order:
 *   1: title (heading - the category or tag name)
 *   2: description (optional richtext intro)
 */

export default function decorate(block) {
  block.classList.add('category-header');

  const rows = [...block.children];
  const labels = ['title', 'description'];
  rows.forEach((row, i) => {
    const label = labels[i] || `row-${i}`;
    row.classList.add(`category-header-${label}`);
    const cell = row.firstElementChild;
    if (cell) cell.classList.add(`category-header-${label}-content`);
  });

  // Promote the title text to an accessible page heading if it isn't already
  // a heading element.
  const titleRow = block.querySelector('.category-header-title');
  if (titleRow) {
    const cell = titleRow.firstElementChild || titleRow;
    if (!cell.querySelector('h1, h2')) {
      const text = cell.textContent.trim();
      if (text) {
        const h1 = document.createElement('h1');
        h1.textContent = text;
        cell.replaceChildren(h1);
      }
    }
  }

  // Remove an empty description row so it doesn't take up vertical space.
  const descRow = block.querySelector('.category-header-description');
  if (descRow && !descRow.textContent.trim()) {
    descRow.remove();
  }
}
