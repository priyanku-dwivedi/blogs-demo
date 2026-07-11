/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: 888poker section breaks + section metadata.
 *
 * Runs in afterTransform only. Reads payload.template.sections (from
 * tools/importer/page-templates.json) and, for the "article" template's
 * 4 sections (hero, toc, body, author):
 *   - inserts an <hr> before every non-first section that is present in the DOM
 *   - inserts a "Section Metadata" block after each section that has a `style`
 *     (toc -> "boxed", author -> "light")
 *
 * Sections are processed in reverse order so that inserting <hr>/metadata nodes
 * does not shift the positions of sections we have not handled yet.
 *
 * ⚠️ Every candidate selector comes from the template's section.selector arrays,
 *    which were derived from migration-work/cleaned.html / page-structure.json.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

/**
 * Return the first DOM element matching any of the section's selectors.
 * @param {Element} root scope to search within (the main element)
 * @param {Array<string>} selectors candidate selectors for the section
 * @returns {Element|null}
 */
function findSectionAnchor(root, selectors) {
  if (!Array.isArray(selectors)) return null;
  for (const sel of selectors) {
    if (!sel) continue;
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;

  const template = payload && payload.template;
  const sections = template && Array.isArray(template.sections) ? template.sections : [];
  if (sections.length < 2) return;

  const doc = element.ownerDocument;

  // Resolve the top-most anchor element for each section (walk up while the
  // parent is still fully contained in the section's matched element so that
  // <hr>/metadata are inserted at the block/section boundary, not deep inside).
  const anchors = sections.map((section) => findSectionAnchor(element, section.selector));

  // Process in reverse order so earlier insertions do not invalidate later anchors.
  for (let i = sections.length - 1; i >= 0; i -= 1) {
    const section = sections[i];
    const anchor = anchors[i];
    if (!anchor) continue;

    // Section Metadata block (after the section content) for sections with a style.
    if (section.style) {
      const metadataBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      if (anchor.parentNode) {
        anchor.parentNode.insertBefore(metadataBlock, anchor.nextSibling);
      }
    }

    // Section break before every section except the first, when there is
    // preceding content in the DOM.
    if (i > 0 && anchor.parentNode) {
      const hr = doc.createElement('hr');
      anchor.parentNode.insertBefore(hr, anchor);
    }
  }
}
