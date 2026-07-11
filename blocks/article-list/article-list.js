/*
 * Article List Block
 * Query-driven article listing. Reads /query-index.json, filters entries by
 * author, category, and/or tag (client-side), and renders a responsive grid of
 * article cards with a progressive "Load More" pagination pattern.
 *
 * Authored cell order (fields grouped via model prefixes):
 *   1: heading (optional section heading, e.g. "{Author}'s Articles")
 *   2: filter group (author, category, tag - any combination; empty = ignored)
 *   3: page size (number of cards per page; defaults to 6)
 *
 * Filters are ANDed: an entry must match every filter that is set. When only
 * the author filter is set the block behaves exactly as before (backward
 * compatible). Author listing pages set the author filter; category listing
 * pages set the category filter; tag listing pages set the tag filter.
 *
 * Cards rendered from query-index fields: image, title (link), date, excerpt,
 * optional category.
 */

import { createOptimizedPicture } from '../../scripts/aem.js';

const DEFAULT_PAGE_SIZE = 6;
const QUERY_INDEX = '/query-index.json';

function readConfig(block) {
  const rows = [...block.children];
  const text = (row) => (row ? row.textContent.trim() : '');
  // Lines within a cell: the xwalk model groups the author/category/tag filter
  // fields under a shared "filter_" prefix, so they render as separate lines
  // (paragraphs) inside a single filter cell.
  const lines = (row) => {
    if (!row) return [];
    const cell = row.children.length ? row.children[row.children.length - 1] : row;
    const parts = [...cell.querySelectorAll('p')].map((p) => p.textContent.trim());
    if (parts.length) return parts;
    return cell.textContent.trim() ? [cell.textContent.trim()] : [];
  };

  const heading = text(rows[0]);
  const last = text(rows[rows.length - 1]);
  const pageSize = parseInt(last, 10) || DEFAULT_PAGE_SIZE;

  // Filter values live in the row(s) between heading and pageSize. Support:
  //  - grouped: one filter cell with author/category/tag on separate lines
  //  - flat 5-row legacy: heading, author, category, tag, pageSize
  //  - flat 3-row legacy: heading, author, pageSize
  const middle = rows.slice(1, rows.length - 1);
  let author = '';
  let category = '';
  let tag = '';
  if (middle.length >= 3) {
    // flat rows: author, category, tag
    author = text(middle[0]);
    category = text(middle[1]);
    tag = text(middle[2]);
  } else if (middle.length === 1) {
    // grouped filter cell (1-3 lines) or a single legacy author row
    const [a = '', c = '', t = ''] = lines(middle[0]);
    author = a;
    category = c;
    tag = t;
  } else if (middle.length === 2) {
    author = text(middle[0]);
    category = text(middle[1]);
  }

  return {
    heading, author, category, tag, pageSize,
  };
}

function normalize(value) {
  return (value || '').toString().trim().toLowerCase();
}

async function fetchIndex() {
  try {
    const resp = await fetch(QUERY_INDEX);
    if (!resp.ok) return [];
    const json = await resp.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (e) {
    return [];
  }
}

function matchesAuthor(entry, author) {
  if (!author) return true;
  const target = normalize(author);
  return [entry.author, entry.authorName, entry.authorPage, entry.path]
    .some((field) => normalize(field).includes(target));
}

function matchesCategory(entry, category) {
  if (!category) return true;
  const target = normalize(category);
  return [entry.category, entry.categories]
    .some((field) => normalize(field).includes(target));
}

function matchesTag(entry, tag) {
  if (!tag) return true;
  const target = normalize(tag);
  return [entry.tag, entry.tags, entry.keywords]
    .some((field) => normalize(field).includes(target));
}

function matchesFilters(entry, config) {
  return matchesAuthor(entry, config.author)
    && matchesCategory(entry, config.category)
    && matchesTag(entry, config.tag);
}

function formatDate(entry) {
  const raw = entry.publishDate || entry.date || entry.lastModified;
  if (!raw) return '';
  const ts = Number(raw);
  let dateInput = raw;
  if (!Number.isNaN(ts)) {
    dateInput = ts > 1e12 ? ts : ts * 1000;
  }
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function buildCard(entry) {
  const li = document.createElement('li');
  li.className = 'article-list-card';
  const href = entry.path || entry.link || '#';

  if (entry.image) {
    const imageWrap = document.createElement('div');
    imageWrap.className = 'article-list-card-image';
    const a = document.createElement('a');
    a.href = href;
    a.append(createOptimizedPicture(entry.image, entry.title || '', false, [{ width: '750' }]));
    imageWrap.append(a);
    li.append(imageWrap);
  }

  const body = document.createElement('div');
  body.className = 'article-list-card-body';

  if (entry.category) {
    const cat = document.createElement('div');
    cat.className = 'article-list-card-category';
    cat.textContent = entry.category;
    body.append(cat);
  }

  const title = document.createElement('h3');
  title.className = 'article-list-card-title';
  const titleLink = document.createElement('a');
  titleLink.href = href;
  titleLink.textContent = entry.title || '';
  title.append(titleLink);
  body.append(title);

  const date = formatDate(entry);
  if (date) {
    const dateEl = document.createElement('div');
    dateEl.className = 'article-list-card-date';
    const time = document.createElement('time');
    time.textContent = date;
    dateEl.append(time);
    body.append(dateEl);
  }

  if (entry.description) {
    const excerpt = document.createElement('p');
    excerpt.className = 'article-list-card-excerpt';
    excerpt.textContent = entry.description;
    body.append(excerpt);
  }

  const cta = document.createElement('a');
  cta.className = 'article-list-card-cta';
  cta.href = href;
  cta.textContent = 'Read full article';
  body.append(cta);

  li.append(body);
  return li;
}

export default async function decorate(block) {
  block.classList.add('article-list');
  const config = readConfig(block);
  block.replaceChildren();

  if (config.heading) {
    const h = document.createElement('h2');
    h.className = 'article-list-heading';
    h.textContent = config.heading;
    block.append(h);
  }

  const list = document.createElement('ul');
  list.className = 'article-list-grid';
  block.append(list);

  const tsOf = (e) => {
    const raw = e.publishDate || e.date || e.lastModified;
    if (!raw) return 0;
    const n = Number(raw);
    if (!Number.isNaN(n)) return n > 1e12 ? n : n * 1000;
    const t = Date.parse(raw);
    return Number.isNaN(t) ? 0 : t;
  };
  const entries = (await fetchIndex())
    .filter((e) => matchesFilters(e, config))
    .sort((a, b) => tsOf(b) - tsOf(a));

  let shown = 0;
  const renderPage = () => {
    const next = entries.slice(shown, shown + config.pageSize);
    next.forEach((entry) => list.append(buildCard(entry)));
    shown += next.length;
  };

  renderPage();

  if (entries.length > shown) {
    const wrapper = document.createElement('div');
    wrapper.className = 'article-list-loadmore';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'article-list-loadmore-button';
    button.textContent = 'Load More';
    button.addEventListener('click', () => {
      renderPage();
      if (shown >= entries.length) wrapper.remove();
    });
    wrapper.append(button);
    block.append(wrapper);
  }

  if (!entries.length) {
    const empty = document.createElement('p');
    empty.className = 'article-list-empty';
    empty.textContent = 'No articles found.';
    block.append(empty);
  }
}
