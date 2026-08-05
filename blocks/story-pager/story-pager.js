/*
 * Story Pager Block
 * The "Previous Story / Next Story" navigation at the foot of a GED graduate
 * story. Two authored rows, each with: a label (e.g. "Previous Story"), the
 * story name, and a link. Renders as a two-up row of prev/next cards.
 */
export default function decorate(block) {
  const rows = [...block.children];
  block.replaceChildren();

  const nav = document.createElement('nav');
  nav.className = 'story-pager-nav';
  nav.setAttribute('aria-label', 'Story navigation');

  rows.forEach((row, i) => {
    const cell = row.firstElementChild || row;
    const link = cell.querySelector('a');
    const paras = [...cell.querySelectorAll('p')].map((p) => p.textContent.trim()).filter(Boolean);
    // label = first line, name = second line (fallbacks handle either order)
    const label = paras[0] || (i === 0 ? 'Previous Story' : 'Next Story');
    const name = paras.find((t) => link && t !== link.textContent.trim() && t !== label) || '';

    const item = document.createElement('a');
    item.className = `story-pager-item story-pager-${i === 0 ? 'prev' : 'next'}`;
    if (link) item.href = link.getAttribute('href');

    const labelEl = document.createElement('span');
    labelEl.className = 'story-pager-label';
    labelEl.textContent = label;

    const nameEl = document.createElement('span');
    nameEl.className = 'story-pager-name';
    nameEl.textContent = name;

    item.append(labelEl, nameEl);
    nav.append(item);
  });

  block.append(nav);
}
