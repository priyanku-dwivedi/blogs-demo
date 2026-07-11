/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: featured-articles
 * Base: custom local CONTAINER block (xwalk container + items).
 *   Container model: featured-articles (filter -> article-card)
 *   Item model: article-card (blocks/featured-articles/_featured-articles.json)
 * Source (home / magazine landing): https://www.888poker.com/magazine/
 *   Selector: .view-display-id-block_hp_headline
 *   Hand-curated featured articles: 1x article.hp-article-headline.big + 3x .small.
 * Generated for xwalk project.
 *
 * CONTAINER + ITEMS row structure (mirrors WebImporter.Blocks.createBlock):
 *   Row 1 (auto) : block name "Featured Articles"
 *   Row 2..N     : ONE ROW PER article-card item. Each item row has 2 cells:
 *     cell A -> image   : <!-- field:image --> <img> (imageAlt collapses onto <img alt>)
 *     cell B -> grouped "card_" cell, field hints in model order:
 *        <!-- field:card_title -->     title text
 *        <!-- field:card_titleLink --> <a href=article> (aem-content)
 *        <!-- field:card_category -->  category term label
 *        <!-- field:card_author -->    author name
 *
 * Field hinting (see hinting.md):
 *   - imageAlt ends with "Alt" -> collapsed onto <img>, NO hint/row.
 *   - card_* share the "card_" prefix -> grouped into ONE cell, one hint per value.
 */
export default function parse(element, { document }) {
  // Each featured article is an <article class="hp-article-headline ...">.
  const articles = Array.from(
    element.querySelectorAll('article.hp-article-headline, .grid-container article, article'),
  );

  // Empty-block guard: nothing to author.
  if (!articles.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const hint = (field) => document.createComment(` field:${field} `);

  const cells = [];

  articles.forEach((article) => {
    // --- image (linked to the article) ---------------------------------------
    // The image lives in .views-field-field-image (wrapped by an <a> to the article).
    const img = article.querySelector(
      '.views-field-field-image img, .views-field-field-image picture img, .shadow_wrapper img',
    );

    // --- title text + article link -------------------------------------------
    // .views-field-title a.article_title wraps the linked title; text is in a <span>.
    const titleAnchor = article.querySelector(
      '.views-field-title a.article_title, .views-field-title a, a.article_title',
    );
    let titleText = '';
    let articleHref = '';
    if (titleAnchor) {
      titleText = clean(titleAnchor.getAttribute('title') || titleAnchor.textContent);
      articleHref = titleAnchor.getAttribute('href') || '';
    }
    // Fallback: derive the article href from the image link if the title lacks one.
    if (!articleHref) {
      const imgLink = article.querySelector('.views-field-field-image a[href], .shadow_wrapper a[href]');
      if (imgLink) articleHref = imgLink.getAttribute('href') || '';
    }

    // --- category term (label + href) ----------------------------------------
    const categoryAnchor = article.querySelector('.views-field-term-node-tid a, .views-field-term-node-tid');
    const categoryText = clean(categoryAnchor && categoryAnchor.textContent);

    // --- author name ----------------------------------------------------------
    // .views-field-field-author holds "By {Name}" with the name inside the <a>.
    const authorAnchor = article.querySelector('.views-field-field-author a[href*="/author/"], .views-field-field-author a');
    const authorName = clean(authorAnchor && authorAnchor.textContent).replace(/^by\s+/i, '');

    // Skip cards with no meaningful content.
    if (!img && !titleText && !articleHref) return;

    // --- cell A: image (imageAlt collapses onto the <img alt>) -----------------
    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(hint('image'));
      imageCell.appendChild(img);
    }

    // --- cell B: grouped card_ fields in model order --------------------------
    const cardCell = document.createDocumentFragment();
    if (titleText) {
      cardCell.appendChild(hint('card_title'));
      const p = document.createElement('p');
      p.textContent = titleText;
      cardCell.appendChild(p);
    }
    if (articleHref) {
      cardCell.appendChild(hint('card_titleLink'));
      const a = document.createElement('a');
      a.setAttribute('href', articleHref);
      a.textContent = titleText || articleHref;
      cardCell.appendChild(a);
    }
    if (categoryText) {
      cardCell.appendChild(hint('card_category'));
      const p = document.createElement('p');
      p.textContent = categoryText;
      cardCell.appendChild(p);
    }
    if (authorName) {
      cardCell.appendChild(hint('card_author'));
      const p = document.createElement('p');
      p.textContent = authorName;
      cardCell.appendChild(p);
    }

    // One row per item: [imageCell, cardCell].
    cells.push([imageCell, cardCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'featured-articles', cells });
  element.replaceWith(block);
}
