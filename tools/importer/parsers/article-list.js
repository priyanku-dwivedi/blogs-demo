/* eslint-disable */
/* global WebImporter */
/**
 * Parser for article-list.
 * Base: custom local block (xwalk model: article-list), query-driven listing.
 * Sources (SAME parser, multiple templates):
 *   - author   page: https://www.888poker.com/magazine/author/frederico-pereira
 *   - category page: https://www.888poker.com/magazine/poker-world
 *   - tag      page: https://www.888poker.com/magazine/tags/wsop
 * Generated for xwalk project.
 *
 * IMPORTANT: article-list is QUERY-DRIVEN. The block reads /query-index.json at
 * runtime and filters, so this parser emits a SINGLE authored config block
 * (heading + filter group + pageSize) — NOT the dozens of static cards in the DOM.
 *
 * Authored model (blocks/article-list/_article-list.json):
 *   Row 1: heading   (text)  -> "{Author}'s Articles" | "{Term} Articles" | term title
 *   Row 2: filter group      -> filter_author, filter_category, filter_tag GROUPED
 *          (shared "filter_" prefix) into ONE cell, each on its own <p> line, in
 *          model order. Only the field relevant to the page type is populated;
 *          the other two lines are emitted empty so the block's positional
 *          [author, category, tag] reader stays aligned.
 *   Row 3: pageSize  (text)  -> "6"
 *
 * Page-type detection (author vs category vs tag) — see detectPageType() below.
 * Backward compatible: author pages still produce a populated author filter.
 */
export default function parse(element, { document }) {
  const PAGE_SIZE = '6';

  // --- Resolve the source URL/path -------------------------------------------
  // Priority: <head> canonical/og:url/twitter:url (present on the live import
  // fetch) -> breadcrumb href -> in-view term links. Returns a lowercase path.
  const resolveSourcePath = () => {
    const metaSelectors = [
      ['link[rel="canonical"]', 'href'],
      ['meta[property="og:url"]', 'content'],
      ['meta[name="twitter:url"]', 'content'],
      ['link[rel="shortlink"]', 'href'],
    ];
    for (const [sel, attr] of metaSelectors) {
      const el = document.querySelector(sel);
      const val = el && el.getAttribute(attr);
      if (val && val.trim()) {
        try {
          return new URL(val.trim(), 'https://www.888poker.com').pathname.toLowerCase();
        } catch (e) {
          return val.trim().toLowerCase();
        }
      }
    }
    // DOM fallback: the breadcrumb's last link, then any /magazine/ anchor.
    const crumbLinks = [...document.querySelectorAll('.breadcrumbs a[href], nav .breadcrumb a[href]')];
    const crumbHref = crumbLinks.length ? crumbLinks[crumbLinks.length - 1].getAttribute('href') : '';
    if (crumbHref && /\/magazine\//i.test(crumbHref)) {
      try { return new URL(crumbHref, 'https://www.888poker.com').pathname.toLowerCase(); } catch (e) {}
    }
    return '';
  };

  // --- Detect the page type ---------------------------------------------------
  // author: /magazine/author/{slug}
  // tag:    /magazine/tags/{tag}
  // category: any other /magazine/{segment} (e.g. poker-world, 888news), and it
  //           is the default for a taxonomy listing page.
  const detectPageType = (path) => {
    // homepage: /magazine or /magazine/ or /magazine/index (no taxonomy segment)
    if (/\/magazine\/?(index)?\/?$/i.test(path)) return 'home';
    if (/\/magazine\/author\//i.test(path)) return 'author';
    if (/\/magazine\/tags?\//i.test(path)) return 'tag';
    if (/\/magazine\/[^/]+\/?$/i.test(path)) return 'category';
    // DOM cues when no clean URL is available.
    if (document.querySelector('.view-display-id-block_hp_headline, .view-display-id-block_hp_categories_articles')) return 'home';
    if (document.querySelector('article.node--type-author, .author_full')) return 'author';
    if (document.querySelector('.view-display-id-page_category_articles, body.path-taxonomy')
      || (document.body && document.body.classList.contains('path-taxonomy'))) return 'category';
    return 'category';
  };

  const sourcePath = resolveSourcePath();
  const pageType = detectPageType(sourcePath);

  // --- Derive the taxonomy term / author name --------------------------------
  // The identity title lives in the page banner (#block-pagetitle) or the
  // author-header H1. Prefer explicit headings, then the page-title.
  const readTitle = () => {
    const h1 = document.querySelector(
      'article.node--type-author h1.title#page-title, h1.title.replaced-title, #block-pagetitle h1.title.page-title, #block-pagetitle h1.page-title, h1#page-title, h1.page-title',
    );
    if (h1 && h1.textContent.trim()) return h1.textContent.replace(/\s+/g, ' ').trim();
    // The category-header parser runs before this one and replaces #block-pagetitle
    // with a parsed block; read the term title back out of that block if present.
    const catHeader = document.querySelector('.category-header');
    if (catHeader && catHeader.textContent.trim()) {
      return catHeader.textContent.replace(/\s+/g, ' ').trim();
    }
    // author pages sometimes only expose "{Name}'s Articles" in span.title_text.
    const titleTextEl = document.querySelector('span.title_text');
    if (titleTextEl) {
      const raw = titleTextEl.textContent.replace(/\s+/g, ' ').trim();
      return raw.replace(/\s+(['’]s\b)/g, '$1');
    }
    // Breadcrumb last crumb (still present during parsing; removed later in cleanup).
    const crumbs = [...document.querySelectorAll('.breadcrumbs a, nav .breadcrumb a, .breadcrumb_line a')];
    if (crumbs.length) {
      const last = crumbs[crumbs.length - 1].textContent.replace(/\s+/g, ' ').trim();
      if (last) return last;
    }
    return '';
  };
  const termTitle = readTitle();

  // --- Build the filter values by page type ----------------------------------
  let filterAuthor = '';
  let filterCategory = '';
  let filterTag = '';

  if (pageType === 'author') {
    // Preserve legacy behaviour: author page path preferred, else a name slug.
    const authorPathMatch = sourcePath.match(/\/magazine\/author\/[a-z0-9-]+/i);
    if (authorPathMatch) {
      filterAuthor = authorPathMatch[0];
    } else if (termTitle) {
      const name = termTitle.replace(/['’]s\s+Articles\s*$/i, '').trim();
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      filterAuthor = slug ? `/magazine/author/${slug}` : name;
    }
  } else if (pageType === 'tag') {
    // Prefer the visible term name; fall back to the slug from the URL.
    filterTag = (termTitle && termTitle.replace(/['’]s\s+Articles\s*$/i, '').trim())
      || (sourcePath.match(/\/magazine\/tags?\/([a-z0-9-]+)/i) || [])[1]
      || '';
  } else if (pageType === 'home') {
    // Homepage: no filter — the latest-articles list shows all categories.
  } else {
    // category
    filterCategory = (termTitle && termTitle.replace(/['’]s\s+Articles\s*$/i, '').trim())
      || (sourcePath.match(/\/magazine\/([^/]+)\/?$/i) || [])[1]
      || '';
  }

  // --- Derive the listing heading --------------------------------------------
  let heading = '';
  if (pageType === 'home') {
    // Homepage latest-articles list: no filter (all categories), clean heading.
    heading = 'Latest Articles';
  } else if (pageType === 'author') {
    // Existing behaviour: prefer the rendered "{Name}'s Articles" heading.
    const titleTextEl = document.querySelector('span.title_text');
    if (titleTextEl && titleTextEl.textContent.trim()) {
      heading = titleTextEl.textContent
        .replace(/\s+/g, ' ')
        .replace(/\s+(['’]s\b)/g, '$1')
        .trim();
    } else if (termTitle) {
      const name = termTitle.replace(/['’]s\s+Articles\s*$/i, '').trim();
      heading = name ? `${name}'s Articles` : '';
    }
  } else {
    // category / tag: use "{Term} Articles". Do NOT read an <h2> from the listing
    // wrapper — those are the article-card titles, not a section heading.
    const term = filterCategory || filterTag || termTitle;
    if (term) heading = `${term} Articles`;
    else heading = termTitle;
  }

  // Bail gracefully if we cannot determine anything to author with.
  const anyFilter = filterAuthor || filterCategory || filterTag;
  if (!anyFilter && !heading) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Helpers -------------------------------------------------------------------
  const hint = (fieldName) => document.createComment(` field:${fieldName} `);
  const headingCell = (value) => {
    const frag = document.createDocumentFragment();
    frag.appendChild(hint('heading'));
    const span = document.createElement('span');
    span.textContent = value;
    frag.appendChild(span);
    return frag;
  };

  // Grouped filter cell: one cell, three field hints in model order, each value
  // on its own <p> line so the block's positional [author, category, tag]
  // reader stays aligned even when some filters are empty.
  const buildFilterCell = () => {
    const frag = document.createDocumentFragment();
    [
      ['filter_author', filterAuthor],
      ['filter_category', filterCategory],
      ['filter_tag', filterTag],
    ].forEach(([field, value]) => {
      frag.appendChild(hint(field));
      const p = document.createElement('p');
      p.textContent = value || '';
      frag.appendChild(p);
    });
    return frag;
  };

  // --- Build cells: heading, grouped filter, pageSize -------------------------
  const cells = [];
  cells.push([headingCell(heading)]);
  cells.push([buildFilterCell()]);
  cells.push([(() => {
    const frag = document.createDocumentFragment();
    frag.appendChild(hint('pageSize'));
    const span = document.createElement('span');
    span.textContent = PAGE_SIZE;
    frag.appendChild(span);
    return frag;
  })()]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'article-list', cells });
  element.replaceWith(block);
}
