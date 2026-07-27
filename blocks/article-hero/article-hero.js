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

  // Byline: the authored cell holds an avatar, the author name, and a link
  // whose text is the raw author-page URL. Rebuild it as an avatar + a single
  // "By {name}" link pointing at the author page (matching the source).
  // Wrap title + meta together into a hero card (side-by-side at desktop)
  const titleRow = block.querySelector('.article-hero-title');
  const metaRow = block.querySelector('.article-hero-meta');
  if (titleRow && metaRow) {
    const card = document.createElement('div');
    card.className = 'article-hero-card';
    block.insertBefore(card, titleRow);
    card.append(titleRow, metaRow);
  }

  const authorRow = block.querySelector('.article-hero-author');
  if (authorRow) {
    const cell = authorRow.firstElementChild || authorRow;
    const avatar = cell.querySelector('picture, img');
    const link = cell.querySelector('a');
    const paras = [...cell.querySelectorAll('p')];
    // author name = first <p> that is not just the avatar and not the URL link
    const nameP = paras.find((p) => {
      const t = p.textContent.trim();
      return t && !p.querySelector('picture, img') && !/^https?:|^\//.test(t);
    });
    const name = nameP ? nameP.textContent.trim() : '';
    const href = link ? link.getAttribute('href') : '';
    cell.replaceChildren();
    if (avatar) {
      const av = document.createElement('span');
      av.className = 'article-hero-author-avatar';
      av.append(avatar.tagName === 'IMG' ? avatar.closest('picture') || avatar : avatar);
      cell.append(av);
    }
    if (name) {
      const byline = href ? document.createElement('a') : document.createElement('span');
      byline.className = 'article-hero-author-name';
      if (href) byline.href = href;
      byline.textContent = `By ${name}`;
      cell.append(byline);
    }
  }
}
