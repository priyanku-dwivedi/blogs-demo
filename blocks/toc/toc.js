/*
 * Table of Contents Block
 * Renders an in-page navigation list linking to the article's sub-headings.
 * Authored links are matched to the real heading IDs on the page by text, so
 * imported anchors that carry source-specific suffixes still resolve. When no
 * links are authored, anchors are auto-generated from the H2/H3 headings.
 */

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getBodyHeadings(block) {
  const scope = block.closest('main') || document;
  return [...scope.querySelectorAll('h2, h3')].filter((hd) => !block.contains(hd));
}

export default function decorate(block) {
  block.classList.add('toc');

  const firstRow = block.firstElementChild;
  const headingText = firstRow ? firstRow.textContent.trim() : '';
  const authoredLinks = [...block.querySelectorAll('a')];
  const headings = getBodyHeadings(block);
  headings.forEach((hd) => {
    if (!hd.id) hd.id = slugify(hd.textContent);
  });
  const byText = new Map(headings.map((hd) => [hd.textContent.trim().toLowerCase(), hd]));

  const nav = document.createElement('nav');
  nav.className = 'toc-nav';
  nav.setAttribute('aria-label', headingText || 'Table of contents');

  if (headingText) {
    const h = document.createElement('h2');
    h.className = 'toc-title';
    h.textContent = headingText;
    nav.append(h);
  }

  const list = document.createElement('ul');
  list.className = 'toc-list';

  const source = authoredLinks.length
    ? authoredLinks.map((a) => {
      const text = a.textContent.trim();
      return { text, heading: byText.get(text.toLowerCase()) };
    })
    : headings.map((hd) => ({ text: hd.textContent.trim(), heading: hd }));

  source.forEach(({ text, heading }) => {
    const li = document.createElement('li');
    if (heading && heading.tagName.toLowerCase() === 'h3') li.className = 'toc-item-sub';
    else li.className = 'toc-item';
    const link = document.createElement('a');
    link.className = 'toc-link';
    link.href = heading ? `#${heading.id}` : `#${slugify(text)}`;
    link.textContent = text;
    li.append(link);
    list.append(li);
  });

  nav.append(list);
  block.textContent = '';
  block.append(nav);
}
