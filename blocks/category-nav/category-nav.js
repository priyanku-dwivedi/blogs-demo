/*
 * Category Nav Block
 * A horizontal navigation of category links for the magazine landing page.
 *
 * Authored structure: a single cell containing a list of links (label + href),
 * one per category (e.g. "All Articles", "888news", "News", ...). Authors just
 * type or paste the category links as a normal list.
 *
 * Decoration flattens the list into styled tab buttons and marks the tab
 * matching the current path (or the first tab) as active.
 */

export default function decorate(block) {
  const links = [...block.querySelectorAll('a[href]')];

  const nav = document.createElement('nav');
  nav.className = 'category-nav-tabs';
  nav.setAttribute('aria-label', 'Poker Categories');

  const list = document.createElement('ul');
  list.className = 'category-nav-list';

  const current = window.location.pathname.replace(/\/$/, '');

  links.forEach((link, index) => {
    const li = document.createElement('li');
    li.className = 'category-nav-item';

    const a = document.createElement('a');
    a.className = 'category-nav-link';
    a.href = link.getAttribute('href');
    a.textContent = link.textContent.trim();

    const linkPath = (a.getAttribute('href') || '').replace(/\/$/, '');
    if ((current && linkPath === current) || (!current && index === 0)) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }

    li.append(a);
    list.append(li);
  });

  nav.append(list);
  block.replaceChildren(nav);
}
