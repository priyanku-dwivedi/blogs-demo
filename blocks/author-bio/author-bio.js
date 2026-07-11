/*
 * Author Bio Block
 * Renders an "About the Author" card: label, author image, name, bio text,
 * and links to the author's page / all articles.
 *
 * Authored cell order (fields grouped via model prefixes):
 *   1: label ("About the Author")
 *   2: author image (picture)
 *   3: author group -> name, bio text, link to author page
 */

export default function decorate(block) {
  block.classList.add('author-bio');

  const rows = [...block.children];
  const labels = ['label', 'image', 'author'];
  rows.forEach((row, i) => {
    const label = labels[i] || `row-${i}`;
    row.classList.add(`author-bio-${label}`);
    const cell = row.firstElementChild;
    if (cell) cell.classList.add(`author-bio-${label}-content`);
  });

  const imageRow = block.querySelector('.author-bio-image');
  if (imageRow && imageRow.querySelector('picture')) {
    imageRow.classList.add('author-bio-has-image');
  }
}
