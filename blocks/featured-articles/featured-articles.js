/*
 * Featured Articles Block
 * Manually-curated set of featured article cards. NOT query-driven - each card
 * is hand-authored. The first card renders as a large "lead" card; the rest
 * render as smaller cards (matching the source magazine headline layout).
 *
 * Authored structure (container + repeatable article-card items):
 *   Each article-card item is one row with cells (grouped via model prefixes):
 *     - image (reference / picture)
 *     - card_title (text) + card_link (article href) + card_category (text)
 *     - card_author (text) + card_excerpt (optional richtext)
 *
 * Decoration turns each row into a linked card. The first card gets the
 * "featured-articles-card-lead" treatment.
 */

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function makeAuthorAvatar(name) {
  const parts = (name || '').trim().split(/\s+/);
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : (parts[0] || '').substring(0, 2).toUpperCase();
  const avatar = document.createElement('span');
  avatar.className = 'featured-articles-card-author-avatar';
  avatar.textContent = initials;
  avatar.setAttribute('aria-hidden', 'true');
  return avatar;
}

function authorNameToPath(name) {
  return `/magazine/author/${(name || '').toLowerCase().replace(/\s+/g, '-')}`;
}

const authorImageCache = new Map();

async function fetchAuthorImage(authorPage) {
  if (authorImageCache.has(authorPage)) return authorImageCache.get(authorPage);
  authorImageCache.set(authorPage, null);
  try {
    const resp = await fetch(`${authorPage}.plain.html`);
    if (!resp.ok) return null;
    const html = await resp.text();
    const match = html.match(/class="author-header"[\s\S]*?<img[^>]+src="([^"]+)"/);
    if (!match) return null;
    const rawSrc = match[1].replace(/&#x26;/g, '&').replace(/&amp;/g, '&');
    const imgUrl = new URL(rawSrc, `${window.location.origin}${authorPage}`).href;
    authorImageCache.set(authorPage, imgUrl);
    return imgUrl;
  } catch (e) {
    return null;
  }
}

async function enrichCards(ul) {
  try {
    // Fetch query-index for dates
    const resp = await fetch('/query-index.json');
    const byPath = resp.ok
      ? new Map(((await resp.json()).data || []).map((e) => [e.path, e]))
      : new Map();

    // Collect unique author names
    const authorNames = new Set();
    ul.querySelectorAll('.featured-articles-card-author-name').forEach((el) => {
      const name = el.textContent.trim();
      if (name) authorNames.add(name);
    });

    // Fetch all author images in parallel
    const authorImgMap = new Map();
    await Promise.all(Array.from(authorNames).map(async (name) => {
      const imgUrl = await fetchAuthorImage(authorNameToPath(name));
      if (imgUrl) authorImgMap.set(name, imgUrl);
    }));

    // Update each card: avatar photo + date
    ul.querySelectorAll('.featured-articles-card').forEach((card) => {
      // Replace initials avatar with real photo
      const nameEl = card.querySelector('.featured-articles-card-author-name');
      const avatarEl = card.querySelector('.featured-articles-card-author-avatar');
      if (nameEl && avatarEl) {
        const imgUrl = authorImgMap.get(nameEl.textContent.trim());
        if (imgUrl) {
          const img = document.createElement('img');
          img.src = imgUrl;
          img.alt = nameEl.textContent.trim();
          avatarEl.textContent = '';
          avatarEl.append(img);
          avatarEl.classList.add('featured-articles-card-author-avatar-photo');
        }
      }

      // Date enrichment from query-index
      const linkEl = card.querySelector('a[href]');
      if (!linkEl) return;
      let path;
      try { path = new URL(linkEl.href, window.location.href).pathname; } catch (e) { return; }
      const entry = byPath.get(path);
      if (!entry) return;
      const raw = entry.publishedDate || entry.lastModified;
      if (!raw) return;
      const ts = Number(raw);
      let d;
      if (!Number.isNaN(ts)) {
        d = new Date(ts > 1e12 ? ts : ts * 1000);
      } else {
        d = new Date(raw);
      }
      if (Number.isNaN(d.getTime())) return;
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).replace(',', '');
      const authorEl = card.querySelector('.featured-articles-card-author');
      if (!authorEl) return;
      authorEl.querySelector('.featured-articles-card-author-sep')?.remove();
      authorEl.querySelector('.featured-articles-card-author-date')?.remove();
      const sep = document.createElement('span');
      sep.className = 'featured-articles-card-author-sep';
      sep.setAttribute('aria-hidden', 'true');
      sep.textContent = '|';
      const dateEl = document.createElement('span');
      dateEl.className = 'featured-articles-card-author-date';
      dateEl.textContent = dateStr;
      authorEl.append(sep, dateEl);
    });
  } catch (e) {
    // silently ignore
  }
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'featured-articles-grid';

  [...block.children].forEach((row, index) => {
    const li = document.createElement('li');
    li.className = index === 0 ? 'featured-articles-card featured-articles-card-lead' : 'featured-articles-card';
    moveInstrumentation(row, li);

    while (row.firstElementChild) li.append(row.firstElementChild);

    // Resolve a target link for the whole card: prefer the first anchor.
    const firstLink = li.querySelector('a[href]');
    const href = firstLink ? firstLink.getAttribute('href') : null;

    [...li.children].forEach((cell) => {
      if (cell.children.length === 1 && cell.querySelector('picture')) {
        cell.className = 'featured-articles-card-image';
        if (href && !cell.querySelector('a')) {
          const link = document.createElement('a');
          link.href = href;
          link.append(...cell.childNodes);
          cell.append(link);
        }
      } else {
        cell.className = 'featured-articles-card-body';
        const children = [...cell.children];
        children.forEach((child, i) => {
          const linkEl = child.children.length === 1 ? child.querySelector('a[href]') : null;
          const isPathLink = linkEl && /^\//.test(linkEl.getAttribute('href'))
            && child.textContent.trim() === linkEl.getAttribute('href');
          if (i === 0) {
            child.className = 'featured-articles-card-title';
            if (href && !child.querySelector('a')) {
              const a = document.createElement('a');
              a.href = href;
              a.append(...child.childNodes);
              child.append(a);
            }
          } else if (isPathLink) {
            child.className = 'featured-articles-card-link';
          } else if (i === children.length - 1) {
            child.className = 'featured-articles-card-author';
            const authorName = child.textContent.trim();
            child.textContent = '';
            const avatar = makeAuthorAvatar(authorName);
            const bySpan = document.createElement('span');
            bySpan.className = 'featured-articles-card-author-by';
            bySpan.textContent = 'By ';
            const nameStrong = document.createElement('strong');
            nameStrong.className = 'featured-articles-card-author-name';
            nameStrong.textContent = authorName;
            child.append(avatar, bySpan, nameStrong);
          } else {
            child.className = 'featured-articles-card-category';
          }
        });
      }
    });

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.replaceChildren(ul);

  enrichCards(ul);
}
