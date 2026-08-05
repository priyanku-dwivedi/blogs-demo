import {
  getMetadata,
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
export function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Builds the "Poker > Blog > {category} > {title}" breadcrumb shown above the
 * article on the source. Category comes from page metadata; the title from the
 * article H1. Returns null when there is no title to anchor it.
 * @param {Element} hero The article-hero block
 */
function buildArticleBreadcrumb(hero) {
  const title = hero.querySelector('h1, h2');
  if (!title) return null;
  const category = (getMetadata('category') || '').trim();

  const nav = document.createElement('nav');
  nav.className = 'article-breadcrumb';
  nav.setAttribute('aria-label', 'Breadcrumb');
  const ol = document.createElement('ol');

  const crumb = (text, href) => {
    const li = document.createElement('li');
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = text;
      li.append(a);
    } else {
      li.setAttribute('aria-current', 'page');
      li.textContent = text;
    }
    ol.append(li);
  };

  crumb('Poker', 'https://www.888poker.com');
  crumb('Blog', '/magazine');
  if (category) {
    const slug = category.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    crumb(category, `/magazine/${slug}`);
  }
  crumb(title.textContent.trim());

  nav.append(ol);
  return nav;
}

/**
 * Article pages use a two-column layout: the article (hero + body) on the left
 * and a sticky Table of Contents sidebar on the right (matching the source
 * design), with a breadcrumb above. The importer emits the hero in one section
 * and a body section holding the article content, the author-bio card, a stray
 * author-name paragraph, and the TOC block all stacked. This restructures them
 * into content + sidebar columns.
 * @param {Element} main The main element
 */
function decorateArticleLayout(main) {
  const hero = main.querySelector('.article-hero');
  const toc = main.querySelector('.toc');
  if (!hero || !toc) return; // not an article page

  main.classList.add('article-page');

  const bodySection = toc.closest('.section');
  if (!bodySection) return;
  bodySection.classList.add('article-body-section');

  // Remove the stray standalone author-name paragraph the importer leaves
  // between the body and the TOC (the byline + author-bio already cover it).
  [...bodySection.children].forEach((child) => {
    if (child.classList.contains('default-content-wrapper')
      && child.children.length === 1
      && child.firstElementChild.tagName === 'P'
      && !child.querySelector('a, img, ul, ol, h1, h2, h3')) {
      child.remove();
    }
  });

  // Build the two columns: hero + body go left; TOC goes right.
  const contentCol = document.createElement('div');
  contentCol.className = 'article-content';
  const sidebarCol = document.createElement('div');
  sidebarCol.className = 'article-sidebar';

  const tocWrapper = toc.closest('.toc-wrapper') || toc;
  [...bodySection.children].forEach((child) => {
    if (child === tocWrapper || child.contains(toc)) {
      sidebarCol.append(child);
    } else {
      contentCol.append(child);
    }
  });

  // Pull the hero (and skip-link, if any) from its own section into the top of
  // the left column so the sidebar aligns with the hero. Then drop the now
  // empty hero section.
  const heroSection = hero.closest('.section');
  const heroWrapper = hero.closest('.article-hero-wrapper') || hero;
  if (heroSection && heroSection !== bodySection) {
    // Preserve the skip-to-main-content link at the top of main.
    const skip = heroSection.querySelector('a[href="#main-content"]');
    if (skip) {
      const skipWrap = skip.closest('.default-content-wrapper') || skip.closest('p') || skip;
      main.prepend(skipWrap);
    }
    contentCol.prepend(heroWrapper);
    if (!heroSection.querySelector('.article-hero')) heroSection.remove();
  }

  const grid = document.createElement('div');
  grid.className = 'article-grid';
  grid.append(contentCol, sidebarCol);
  bodySection.replaceChildren(grid);

  // Breadcrumb above the grid.
  const breadcrumb = buildArticleBreadcrumb(hero);
  if (breadcrumb) bodySection.prepend(breadcrumb);
}

const THEME_STORAGE_KEY = 'color-theme';

/**
 * Returns the currently stored color theme ('dark' or 'light'), defaulting to
 * light when nothing is stored.
 */
export function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) !== 'light' ? 'dark' : 'light';
  } catch (e) {
    return 'dark';
  }
}

/**
 * Applies a color theme by toggling the `dark` class on <html> and persisting
 * the choice, matching the source's dark/light mode toggle.
 * @param {string} theme 'dark' or 'light'
 */
export function setTheme(theme) {
  const dark = theme === 'dark';
  document.documentElement.classList.toggle('dark', dark);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light');
  } catch (e) {
    // storage unavailable — theme still applies for this page view
  }
}

/**
 * Site sections — different content hierarchies get different chrome (nav +
 * footer) and a body class for section-scoped styling. Add an entry per brand/
 * sub-site. `prefix` is matched against the current page path; the first match
 * wins, so list more specific prefixes first. The default 888poker chrome
 * (`/nav`, `/footer`) is the implicit fallback when nothing matches.
 *
 * On delivery the content root is stripped (e.g. /content/blogs-888/ged-pages/x
 * → /ged-pages/x), so prefixes are authored as delivery paths.
 */
const SITE_SECTIONS = [
  {
    prefix: '/ged-pages',
    nav: '/ged-pages/nav',
    footer: '/ged-pages/footer',
    bodyClass: 'ged-poc',
    // GED has its own light-only brand theme — never apply the 888poker dark
    // mode here, and hide the theme toggle (handled in header.js via bodyClass).
    forceLightTheme: true,
  },
];

/**
 * Returns the site-section config whose prefix matches the given path, or null.
 * @param {string} [pathname] path to test (defaults to current location)
 */
export function getSiteSection(pathname = window.location.pathname) {
  return SITE_SECTIONS.find((s) => pathname.startsWith(s.prefix)) || null;
}

/**
 * Resolves the nav/footer fragment path for the current page. Resolution order:
 *   1. page metadata (`nav` / `footer`) — genuinely page-specific override;
 *   2. hierarchy-based section config (SITE_SECTIONS) matched on path;
 *   3. the boilerplate default.
 * `getMetadata` joins duplicate meta tags with ", " — take the first real,
 * non-default value so a stray global default can't corrupt the path.
 * @param {'nav'|'footer'} kind which fragment to resolve
 * @param {string} defaultPath fallback path (e.g. '/nav')
 */
export function resolveChromePath(kind, defaultPath) {
  const raw = getMetadata(kind);
  const candidates = raw
    ? raw.split(',').map((v) => v.trim()).filter(Boolean)
    : [];
  // a page-specific value = anything other than the bare default
  const pageValue = candidates.find((v) => v !== defaultPath);
  if (pageValue) return new URL(pageValue, window.location).pathname;
  const section = getSiteSection();
  if (section && section[kind]) return section[kind];
  if (candidates.length) return new URL(candidates[0], window.location).pathname;
  return defaultPath;
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateButtons(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  // Apply the section body class (e.g. ged-poc) so hierarchy-scoped chrome/
  // styling applies from first paint. Sections may pin their own theme.
  const section = getSiteSection();
  if (section && section.forceLightTheme) {
    document.documentElement.classList.remove('dark');
  } else {
    setTheme(getStoredTheme());
  }
  decorateTemplateAndTheme();
  if (section && section.bodyClass) document.body.classList.add(section.bodyClass);
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  decorateArticleLayout(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
