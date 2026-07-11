/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: 888poker site-wide cleanup (Drupal 9 poker-blog magazine).
 *
 * Scope: MAIN ARTICLE COLUMN ONLY. Removes non-authorable site chrome and the
 * excluded regions defined in migration-work/page-structure.json:
 *   - aside.col-grow-4 .region--sidebar-second (sidebar banner sliders / ads / newsletter)
 *   - .breadcrumb_line (breadcrumb bar)
 *   - header, footer, #onetrust-banner-sdk, .cookie (chrome + consent)
 *
 * ⚠️ Every selector below was verified against migration-work/cleaned.html.
 * ⚠️ We deliberately do NOT blanket-remove <header>/<footer>/<nav>: the source
 *    contains content-internal <header> (author byline node__title link at
 *    .field--name-field-author > article > header) and empty share-widget <nav>
 *    that are either authorable or harmless. We target the site-chrome instances
 *    by their specific selectors instead.
 * ⚠️ The Table of Contents (#block-tocforcontentarticlebody) is nested INSIDE
 *    .region--sidebar-second in the source DOM but is authorable content required
 *    by the template's "Table of Contents" section. We therefore remove only the
 *    non-authorable sidebar block (#block-sidebarbannersliderblock) and NOT the
 *    whole .region--sidebar-second, preserving the TOC.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie / consent banner — blocks nothing structurally but is non-authorable.
    // Found in cleaned.html: <div id="onetrust-banner-sdk"> and .cookie-setting-link inside it.
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-banner-sdk',       // cleaned.html line 1138
      '#onetrust-consent-sdk',      // OneTrust wrapper (belt-and-suspenders)
      '.cookie',                    // per excludedRegions selector
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // 1. Site chrome (top-level, non-authorable). Specific selectors so we do not
    //    touch the content-internal <header> (author byline) or share-widget <nav>.
    WebImporter.DOMUtils.remove(element, [
      'header.header',                        // cleaned.html line 6 — global site header
      'nav#menu',                             // cleaned.html line 54 — top nav wrapper
      'footer#footer.regular-footer',         // cleaned.html line 599 — global site footer
    ]);

    // 2. Breadcrumb bar (captured as page metadata, not body content).
    WebImporter.DOMUtils.remove(element, [
      '.breadcrumb_line',                     // cleaned.html line 252
    ]);

    // 3. Right-side sidebar non-authorable blocks. We keep the TOC (a sibling
    //    authorable block inside the same region) and remove only the banner
    //    slider / ads block plus the empty trailing container.
    WebImporter.DOMUtils.remove(element, [
      '#block-sidebarbannersliderblock',      // cleaned.html line 515 — banner sliders / ads
      '.content-after-apps',                  // cleaned.html line 590 — empty apps container
    ]);

    // 4. Non-authorable in-article UI widgets (font-size changer, share bar).
    WebImporter.DOMUtils.remove(element, [
      '.fontsize-changer',                    // cleaned.html line 336 — font size control
      '.share-wrapper',                       // cleaned.html line 341 — social share widget
      '.messages-list',                       // cleaned.html line 284 — Drupal status messages
    ]);

    // 5. Leftover author scaffolding. The author-bio parser (which runs before this
    //    afterTransform hook) reads the label/name out of these, but the source
    //    "About the Author / See all … Articles" title line and the bare-name
    //    .author_details_full_block are not consumed and would render as duplicate
    //    stray text. Remove them after parsing.
    WebImporter.DOMUtils.remove(element, [
      '.author_title_line',                   // "About the Author … See all Articles" divider line
      '.author_details_full_block',           // bare author-name block (already in author-bio)
    ]);

    // 6. Author-listing (Drupal view) scaffolding. The article-list block is
    //    query-driven and the author-header parser reads the primary author node;
    //    these sibling view artifacts are not consumed and would render as stray
    //    duplicate content below the list. Selectors match only on author pages.
    // NOTE: do NOT remove .block-views-blockauthor-author-teaser — the author-header
    // parser replaces the <article> node INSIDE it, so the parsed block lives there;
    // removing the container would delete the block.
    WebImporter.DOMUtils.remove(element, [
      '.js-pager__items',                        // hidden Load More pager (block replicates it)
      'h2.title_tag',                            // view-header heading (article-list renders its own)
      '.block-page-title-block',                 // "{Author} 's Articles" page-title block (article-list has its own heading)
      '.block-home-banner-slider',               // homepage right-rail promo banner slider (utm_medium=slider)
      '.view-display-id-category_headline_block', // category-page "featured strip" (duplicates the main list)
    ]);

    // 7. Safe leftover element cleanup.
    WebImporter.DOMUtils.remove(element, [
      'iframe',                               // handled by embed parser; strip stragglers
      'noscript',
      'link',
    ]);
  }
}
