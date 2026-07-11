/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: author-bio
 * Base block: author-bio (xwalk model: author-bio)
 * Source: https://www.888poker.com/magazine/jason-koon-poker-net-worth
 *
 * Model fields (blocks/author-bio/_author-bio.json):
 *   label (text)               -> "About the Author"
 *   image (reference) + imageAlt (collapsed) -> author picture
 *   author_name (text), author_text (richtext bio), author_link (aem-content) -> grouped in one cell
 */
export default function parse(element, { document }) {
  // Label ("About the Author"). It may live inside the matched element or as a
  // sibling in the author_title_line; search within, then fall back to nearby DOM.
  let labelEl = element.querySelector('.author_title.first, .author_title_line .author_title.first, .author_title_line .author_title');
  if (!labelEl) {
    const scope = element.closest('.node__content, article, main, body') || document;
    labelEl = scope.querySelector('.author_title.first, .author_title_line .author_title');
  }

  // Author image (avatar under article)
  const authorImg = element.querySelector('.field--name-field-author-image img, .node__content img, img');

  // Author link + name from the heading anchor ("By Frederico Pereira")
  const nameAnchor = element.querySelector('.node__title a[href*="/author/"], h2 a[href*="/author/"], a[href*="/author/"]');

  // Author name — prefer the dedicated .author_name div, fall back to the heading anchor text
  const nameDiv = element.querySelector('.author_name');

  // Bio text (rich text paragraph)
  const bioEl = element.querySelector('.node__content .field--name-body, .col-grow-8 .field--name-body, .field--name-body');

  // Empty-block guard. Also skip the inner .author_details_full_block match from the
  // union selector: it only carries a bare author name (no image/bio/link) and is already
  // represented by the full .field--name-field-author instance — emitting it would duplicate.
  const hasCore = !!(authorImg || bioEl || (nameAnchor && nameAnchor.getAttribute('href')));
  if (!hasCore) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row: label (field:label)
  if (labelEl) {
    const frag = document.createDocumentFragment();
    const p = document.createElement('p');
    p.textContent = labelEl.textContent.replace(/\s+/g, ' ').trim();
    frag.appendChild(document.createComment(' field:label '));
    frag.appendChild(p);
    cells.push([frag]);
  }

  // Row: image (field:image). imageAlt collapses onto the <img alt>.
  if (authorImg) {
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createComment(' field:image '));
    frag.appendChild(authorImg);
    cells.push([frag]);
  }

  // Row: author group -> author_name, author_text, author_link (one cell, grouped)
  {
    const frag = document.createDocumentFragment();
    let hasAuthor = false;

    // author_name (strip leading "By")
    let name = '';
    if (nameDiv) name = nameDiv.textContent.replace(/\s+/g, ' ').trim();
    if (!name && nameAnchor) name = nameAnchor.textContent.replace(/^\s*by\s+/i, '').replace(/\s+/g, ' ').trim();
    if (name) {
      const p = document.createElement('p');
      p.textContent = name;
      frag.appendChild(document.createComment(' field:author_name '));
      frag.appendChild(p);
      hasAuthor = true;
    }

    // author_text (bio richtext)
    if (bioEl) {
      frag.appendChild(document.createComment(' field:author_text '));
      frag.appendChild(bioEl);
      hasAuthor = true;
    }

    // author_link (aem-content) -> <a href>
    if (nameAnchor && nameAnchor.getAttribute('href')) {
      const a = document.createElement('a');
      const href = nameAnchor.getAttribute('href');
      a.setAttribute('href', href);
      a.textContent = name || href;
      frag.appendChild(document.createComment(' field:author_link '));
      frag.appendChild(a);
      hasAuthor = true;
    }

    if (hasAuthor) cells.push([frag]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'author-bio', cells });
  element.replaceWith(block);
}
