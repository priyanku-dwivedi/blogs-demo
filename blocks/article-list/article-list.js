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

function titleFromPath(path) {
  const segment = (path || '').split('/').filter(Boolean).pop() || '';
  return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function isArticle(entry) {
  const { path, author } = entry;
  if (!author) return false;
  if (!path || /\/author\/|\/tags\//.test(path)) return false;
  return true;
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
  const raw = entry.publishedDate || entry.publishDate || entry.date || entry.lastModified;
  if (!raw) return '';
  const ts = Number(raw);
  let dateInput = raw;
  if (!Number.isNaN(ts)) {
    dateInput = ts > 1e12 ? ts : ts * 1000;
  }
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).replace(',', '');
}

const CALENDAR_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5zm2 4h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>';

function formatRelativeTime(entry) {
  const raw = entry.publishedDate || entry.publishDate || entry.date || entry.lastModified;
  if (!raw) return '';
  const ts = Number(raw);
  let time;
  if (!Number.isNaN(ts)) {
    time = ts > 1e12 ? ts : ts * 1000;
  } else {
    time = Date.parse(raw);
  }
  if (!time || Number.isNaN(time)) return '';
  const days = Math.floor((Date.now() - time) / 86400000);
  if (days === 0) return 'Last update: today';
  if (days === 1) return 'Last update: yesterday';
  if (days < 7) return `Last update: ${days} days ago`;
  const weeks = Math.floor(days / 7);
  const rem = days % 7;
  if (rem === 0) return `Last update: ${weeks} week${weeks > 1 ? 's' : ''} ago`;
  return `Last update: ${weeks} week${weeks > 1 ? 's' : ''} ${rem} day${rem > 1 ? 's' : ''} ago`;
}

const authorListCache = new Map();

async function fetchAuthorImageForList(authorPage) {
  if (authorListCache.has(authorPage)) return authorListCache.get(authorPage);
  authorListCache.set(authorPage, null);
  try {
    const resp = await fetch(`${authorPage}.plain.html`);
    if (!resp.ok) return null;
    const html = await resp.text();
    const match = html.match(/class="author-header"[\s\S]*?<img[^>]+src="([^"]+)"/);
    if (!match) return null;
    const rawSrc = match[1].replace(/&#x26;/g, '&').replace(/&amp;/g, '&');
    const imgUrl = new URL(rawSrc, `${window.location.origin}${authorPage}`).href;
    authorListCache.set(authorPage, imgUrl);
    return imgUrl;
  } catch (e) {
    return null;
  }
}

async function enrichListAvatars(list) {
  const cards = [...list.querySelectorAll('.article-list-card')];
  // Collect unique author pages
  const authorPages = new Set();
  cards.forEach((card) => {
    const ap = card.dataset.authorPage;
    if (ap) authorPages.add(ap);
  });
  // Fetch all in parallel
  const imgMap = new Map();
  await Promise.all(Array.from(authorPages).map(async (ap) => {
    const url = await fetchAuthorImageForList(ap);
    if (url) imgMap.set(ap, url);
  }));
  // Apply to avatars
  cards.forEach((card) => {
    const ap = card.dataset.authorPage;
    if (!ap || !imgMap.has(ap)) return;
    const avatarEl = card.querySelector('.article-list-card-avatar');
    if (!avatarEl) return;
    const img = document.createElement('img');
    img.src = imgMap.get(ap);
    img.alt = avatarEl.textContent.trim();
    avatarEl.textContent = '';
    avatarEl.append(img);
    avatarEl.classList.add('article-list-card-avatar-photo');
  });
}

function makeListAvatar(name) {
  const parts = (name || '').trim().split(/\s+/);
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : (parts[0] || '').substring(0, 2).toUpperCase();
  const el = document.createElement('span');
  el.className = 'article-list-card-avatar';
  el.textContent = initials;
  el.setAttribute('aria-hidden', 'true');
  return el;
}

function buildCard(entry) {
  const li = document.createElement('li');
  li.className = 'article-list-card';
  const href = entry.path || entry.link || '#';
  if (entry.authorPage) li.dataset.authorPage = entry.authorPage;

  if (entry.image) {
    const imageWrap = document.createElement('div');
    imageWrap.className = 'article-list-card-image';
    const imageLink = document.createElement('a');
    imageLink.href = href;
    imageLink.append(createOptimizedPicture(entry.image, entry.title || '', false, [{ width: '750' }]));
    imageWrap.append(imageLink);
    li.append(imageWrap);
  }

  const body = document.createElement('div');
  body.className = 'article-list-card-body';

  // Date header: calendar icon + publish date + relative "Last update" time
  const date = formatDate(entry);
  if (date) {
    const dateHeader = document.createElement('div');
    dateHeader.className = 'article-list-card-date-header';
    const calIcon = document.createElement('span');
    calIcon.className = 'article-list-card-calendar-icon';
    calIcon.innerHTML = CALENDAR_SVG;
    const dateEl = document.createElement('time');
    dateEl.className = 'article-list-card-date';
    dateEl.textContent = date;
    const relTime = document.createElement('span');
    relTime.className = 'article-list-card-reltime';
    relTime.textContent = formatRelativeTime(entry);
    dateHeader.append(calIcon, dateEl, relTime);
    body.append(dateHeader);
  }

  const title = document.createElement('h3');
  title.className = 'article-list-card-title';
  const titleLink = document.createElement('a');
  titleLink.href = href;
  titleLink.textContent = entry.title || titleFromPath(href);
  title.append(titleLink);
  body.append(title);

  if (entry.description) {
    const desc = document.createElement('p');
    desc.className = 'article-list-card-description';
    desc.textContent = entry.description;
    body.append(desc);
  }

  // Footer: author (left) + CTA button (right)
  const footer = document.createElement('div');
  footer.className = 'article-list-card-footer';

  if (entry.author) {
    const authorRow = document.createElement('div');
    authorRow.className = 'article-list-card-author-row';
    authorRow.append(makeListAvatar(entry.author));
    const authorEl = document.createElement('span');
    authorEl.className = 'article-list-card-author';
    authorEl.textContent = `By ${entry.author}`;
    authorRow.append(authorEl);
    footer.append(authorRow);
  }

  const cta = document.createElement('a');
  cta.className = 'article-list-card-cta';
  cta.href = href;
  cta.textContent = 'Read full article ▶';
  footer.append(cta);

  body.append(footer);
  li.append(body);
  return li;
}

export default async function decorate(block) {
  block.classList.add('article-list');
  const config = readConfig(block);
  block.replaceChildren();

  // Mark the containing section for light-background styling
  const section = block.closest('.section');
  if (section) section.classList.add('article-list-section');

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
    const raw = e.publishedDate || e.publishDate || e.date || e.lastModified;
    if (!raw) return 0;
    const n = Number(raw);
    if (!Number.isNaN(n)) return n > 1e12 ? n : n * 1000;
    const t = Date.parse(raw);
    return Number.isNaN(t) ? 0 : t;
  };
  const entries = (await fetchIndex())
    .filter((e) => isArticle(e) && matchesFilters(e, config))
    .sort((a, b) => tsOf(b) - tsOf(a));

  let shown = 0;
  const renderPage = () => {
    const next = entries.slice(shown, shown + config.pageSize);
    next.forEach((entry) => list.append(buildCard(entry)));
    shown += next.length;
  };

  renderPage();
  enrichListAvatars(list);

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
