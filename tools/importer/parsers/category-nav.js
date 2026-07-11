/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: category-nav
 * Base: custom local block (xwalk model: category-nav).
 *   Single field "links" (richtext) -> a <ul> of category <a> links.
 * Source (home / magazine landing): https://www.888poker.com/magazine/
 *   Selector: .view-display-id-block_hp_categories_articles .view-filters
 *   Contains a "Poker Categories" label, a hidden <select id="edit-tid">, and
 *   a ul.pop-list of 9 filter-tab <button>s (JS filters -> static links here).
 * Generated for xwalk project.
 *
 * The source tabs/options carry NO hrefs (they are JS filter controls), so each
 * label is mapped to its /magazine/ destination: an explicit map for the known
 * categories/tags, with a generic slug fallback (lowercase, drop '&',
 * spaces -> hyphens). "all articles" -> /magazine/.
 *
 * Field hinting (see hinting.md): single content cell -> <!-- field:links --> <ul>.
 */
export default function parse(element, { document }) {
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

  // Explicit label -> href overrides (tags live under /magazine/tags/).
  const HREF_MAP = {
    'all articles': '/magazine/',
    '- any -': '/magazine/',
    '888news': '/magazine/888news',
    news: '/magazine/news',
    'opinion & insights': '/magazine/opinion-insights',
    wsop: '/magazine/tags/wsop',
    strategy: '/magazine/strategy',
    'poker world': '/magazine/poker-world',
    'live events': '/magazine/live-events',
    'poker glossary': '/magazine/poker-glossary',
  };

  const slugify = (label) => label
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const hrefFor = (label) => {
    const key = label.toLowerCase();
    if (HREF_MAP[key]) return HREF_MAP[key];
    const slug = slugify(label);
    return slug ? `/magazine/${slug}` : '/magazine/';
  };

  // Collect category labels, preferring the visible pop-list tabs; fall back to
  // the hidden <select> options if the list is absent. Skip "- Any -" duplicates.
  const seen = new Set();
  const labels = [];
  const pushLabel = (raw) => {
    const label = clean(raw);
    if (!label) return;
    const key = label.toLowerCase();
    if (key === '- any -') return; // select placeholder; "all articles" covers it
    if (seen.has(key)) return;
    seen.add(key);
    labels.push(label);
  };

  const tabs = Array.from(element.querySelectorAll('ul.pop-list li button, ul.pop-list li .filter-tab, ul.pop-list li'));
  if (tabs.length) {
    tabs.forEach((el) => pushLabel(el.textContent));
  } else {
    Array.from(element.querySelectorAll('select#edit-tid option, select option'))
      .forEach((opt) => pushLabel(opt.textContent));
  }

  // Empty-block guard.
  if (!labels.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Build a <ul> of <a> links.
  const list = document.createElement('ul');
  labels.forEach((label) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.setAttribute('href', hrefFor(label));
    a.textContent = label;
    li.appendChild(a);
    list.appendChild(li);
  });

  // Single "links" cell with a field hint.
  const cell = document.createDocumentFragment();
  cell.appendChild(document.createComment(' field:links '));
  cell.appendChild(list);

  const cells = [];
  cells.push([cell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'category-nav', cells });
  element.replaceWith(block);
}
