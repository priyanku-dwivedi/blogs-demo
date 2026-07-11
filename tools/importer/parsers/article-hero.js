/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: article-hero
 * Base block: article-hero (xwalk model: article-hero)
 * Source: https://www.888poker.com/magazine/jason-koon-poker-net-worth
 * Generated for import infrastructure.
 *
 * Model fields (blocks/article-hero/_article-hero.json):
 *   image (reference) + imageAlt (collapsed) -> hero picture
 *   title (richtext)
 *   meta_category, meta_publishDate, meta_readingTime (grouped in one cell)
 *   author_image (reference) + author alt (collapsed), author_name (text), author_link (aem-content) (grouped)
 */
export default function parse(element, { document }) {
  // --- Extract ---
  // Title (h1)
  const title = element.querySelector('h1.block-title, h1, .block-title, [class*="title"] h1');

  // Hero image lives in .article-image (col3), NOT the author avatar.
  const heroImg = element.querySelector('.article-image img, .col3 img, .article-image picture img');

  // Meta: publish date + reading time (category comes from breadcrumb, usually absent here)
  const dateEl = element.querySelector('.date time, .article_time_wrapper time, time');
  const readingEl = element.querySelector('.reading_time, .reading_time .silver');

  // Author avatar (col4 author_section), name, and link.
  // The name/link anchor is in .views-field-field-author (has text); the avatar anchor
  // in .views-field-field-author-image wraps only a picture (no text) — prefer the text one.
  const authorImg = element.querySelector('.views-field-field-author-image img, .author_section img, .col4 img');
  const authorAnchor = element.querySelector('.views-field-field-author a[href*="/author/"], .views-field-field-author a')
    || Array.from(element.querySelectorAll('.author_section a[href*="/author/"], a[href*="/author/"]'))
      .find((a) => a.textContent.replace(/\s+/g, ' ').replace(/^\s*by\s+/i, '').trim().length > 0)
    || element.querySelector('.author_section a[href*="/author/"], a[href*="/author/"]');

  // Empty-block guard
  if (!title && !heroImg && !authorAnchor) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row: image (field:image). imageAlt collapses onto the <img alt>.
  if (heroImg) {
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createComment(' field:image '));
    frag.appendChild(heroImg);
    cells.push([frag]);
  }

  // Row: title (field:title)
  if (title) {
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createComment(' field:title '));
    frag.appendChild(title);
    cells.push([frag]);
  }

  // Row: meta group -> meta_category, meta_publishDate, meta_readingTime (one cell, grouped)
  {
    const frag = document.createDocumentFragment();
    let hasMeta = false;
    // meta_category (breadcrumb-derived; usually absent in hero DOM) -> omit if empty
    if (dateEl) {
      const p = document.createElement('p');
      p.textContent = dateEl.textContent.trim();
      frag.appendChild(document.createComment(' field:meta_publishDate '));
      frag.appendChild(p);
      hasMeta = true;
    }
    if (readingEl) {
      const p = document.createElement('p');
      p.textContent = readingEl.textContent.replace(/\s+/g, ' ').trim();
      frag.appendChild(document.createComment(' field:meta_readingTime '));
      frag.appendChild(p);
      hasMeta = true;
    }
    if (hasMeta) cells.push([frag]);
  }

  // Row: author group -> author_image, author_name, author_link (one cell, grouped)
  {
    const frag = document.createDocumentFragment();
    let hasAuthor = false;
    if (authorImg) {
      frag.appendChild(document.createComment(' field:author_image '));
      frag.appendChild(authorImg);
      hasAuthor = true;
    }
    // author_name: clean name text (strip leading "By")
    let name = '';
    if (authorAnchor) name = authorAnchor.textContent.replace(/^\s*by\s+/i, '').replace(/\s+/g, ' ').trim();
    if (name) {
      const p = document.createElement('p');
      p.textContent = name;
      frag.appendChild(document.createComment(' field:author_name '));
      frag.appendChild(p);
      hasAuthor = true;
    }
    // author_link: aem-content -> represent as <a href>
    if (authorAnchor && authorAnchor.getAttribute('href')) {
      const a = document.createElement('a');
      const href = authorAnchor.getAttribute('href');
      a.setAttribute('href', href);
      a.textContent = name || href;
      frag.appendChild(document.createComment(' field:author_link '));
      frag.appendChild(a);
      hasAuthor = true;
    }
    if (hasAuthor) cells.push([frag]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'article-hero', cells });
  element.replaceWith(block);
}
