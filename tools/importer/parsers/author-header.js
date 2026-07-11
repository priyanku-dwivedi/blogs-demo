/* eslint-disable */
/* global WebImporter */
/**
 * Parser for author-header.
 * Base: custom local block (xwalk model: author-header).
 * Source: https://www.888poker.com/magazine/author/frederico-pereira
 * Generated for xwalk project.
 *
 * Top-of-page author identity banner (distinct from the article-foot author-bio card).
 * Simple block, one column. Model fields (blocks/author-header/_author-header.json):
 *   Row: image (reference) + imageAlt (collapsed onto <img alt>, no comment)
 *   Row: name  (richtext) -> author name H1
 *   Row: bio   (richtext) -> short bio paragraph
 *   Row: social group -> social_facebook, social_twitter, social_linkedin (grouped
 *        into one cell, each an <a href> for the aem-content hint). Empty hrefs are
 *        skipped gracefully; the grouped row is still emitted so the cell exists.
 */
export default function parse(element, { document }) {
  // --- Avatar image -----------------------------------------------------------
  // .field--name-field-author-image holds the portrait; fall back to first img.
  const image = element.querySelector(
    '.field--name-field-author-image img, span[class*="author-image"] img, .author_full img, img',
  );

  // --- Author name (H1) -------------------------------------------------------
  const nameEl = element.querySelector('h1.title#page-title, h1#page-title, h1.title, h1');

  // --- Bio paragraph ----------------------------------------------------------
  const bioEl = element.querySelector(
    '.field--name-body p, .text-content p, .author_full .field--name-body, .author_full p',
  );

  // --- Social links -----------------------------------------------------------
  // Grouped model fields: social_facebook, social_twitter, social_linkedin.
  // Hrefs may be empty on this instance (the <ul> is empty). Only include links
  // that have a real destination; skip empties gracefully.
  const socialSelectors = {
    social_facebook: 'a.facebook_link, a[href*="facebook.com"], a[class*="facebook"]',
    social_twitter: 'a.twitter_link, a[href*="twitter.com"], a[href*="x.com"], a[class*="twitter"]',
    social_linkedin: 'a.linkedin_link, a[href*="linkedin.com"], a[class*="linkedin"]',
  };
  const socialRoot = element.querySelector('.author_social_links') || element;
  const socialLinks = {};
  Object.entries(socialSelectors).forEach(([field, sel]) => {
    const a = socialRoot.querySelector(sel);
    const href = a && a.getAttribute('href');
    if (href && href.trim() && href.trim() !== '#') {
      const link = document.createElement('a');
      link.href = href.trim();
      link.textContent = a.textContent.trim() || href.trim();
      socialLinks[field] = link;
    }
  });

  // Empty-block guard: bail if there is no meaningful identity content.
  if (!nameEl && !image && !bioEl) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Helper: cell fragment prefixed with an xwalk field hint comment.
  const hint = (fieldName) => document.createComment(` field:${fieldName} `);

  const cells = [];

  // Row: image (imageAlt is a collapsed suffix — it stays on the <img alt>,
  // never gets its own field comment).
  if (image) {
    const frag = document.createDocumentFragment();
    frag.appendChild(hint('image'));
    frag.appendChild(image);
    cells.push([frag]);
  } else {
    cells.push(['']);
  }

  // Row: name (richtext).
  if (nameEl) {
    const frag = document.createDocumentFragment();
    frag.appendChild(hint('name'));
    frag.appendChild(nameEl);
    cells.push([frag]);
  } else {
    cells.push(['']);
  }

  // Row: bio (richtext).
  if (bioEl) {
    const frag = document.createDocumentFragment();
    frag.appendChild(hint('bio'));
    frag.appendChild(bioEl);
    cells.push([frag]);
  } else {
    cells.push(['']);
  }

  // Row: social group — all three fields collapsed into one grouped cell, in
  // model order. Only present links are emitted; the row/cell always exists.
  const socialFrag = document.createDocumentFragment();
  ['social_facebook', 'social_twitter', 'social_linkedin'].forEach((field) => {
    if (socialLinks[field]) {
      socialFrag.appendChild(hint(field));
      socialFrag.appendChild(socialLinks[field]);
    }
  });
  cells.push([socialFrag]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'author-header', cells });
  element.replaceWith(block);
}
