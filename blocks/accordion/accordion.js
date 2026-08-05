/*
 * Accordion Block
 * A list of expand/collapse items. Each authored row is one item with two
 * cells: a title (cell 1) and the panel body richtext (cell 2). Renders as
 * native <details>/<summary> so it works without JS and is accessible.
 *
 * Used by the GED faq-category and policy-country templates (the source shows
 * a title plus a stack of expandable topics).
 */
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const items = [...block.children];
  block.replaceChildren();

  items.forEach((row) => {
    const cells = [...row.children];
    const titleCell = cells[0];
    const bodyCell = cells[1];

    const details = document.createElement('details');
    details.className = 'accordion-item';
    moveInstrumentation(row, details);

    const summary = document.createElement('summary');
    summary.className = 'accordion-item-title';
    // keep the authored title markup (may contain <sup>, etc.)
    if (titleCell) {
      while (titleCell.firstChild) summary.append(titleCell.firstChild);
    }
    // marker icon (rotates via CSS)
    const marker = document.createElement('span');
    marker.className = 'accordion-item-marker';
    marker.setAttribute('aria-hidden', 'true');
    summary.append(marker);

    const body = document.createElement('div');
    body.className = 'accordion-item-body';
    if (bodyCell) {
      while (bodyCell.firstChild) body.append(bodyCell.firstChild);
    }

    details.append(summary, body);
    block.append(details);
  });
}
