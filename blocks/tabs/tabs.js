/*
 * Tabs Block
 * A horizontal tab bar with switchable panels. Each authored row is one tab:
 *   cell 1: tab label
 *   cell 2: panel content — a heading followed by alternating question/answer
 *           paragraphs (a nested accordion block does NOT survive publish, so
 *           the Q&A arrives as flat <p> pairs and is rebuilt here).
 * Renders pill-style tabs (first active), shows one panel at a time, and turns
 * each panel's Q&A paragraphs into an expand/collapse accordion.
 * Used by the GED policy-country template (category tabs → accordion sets).
 */
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Build an accordion out of a panel's flat children: an optional leading
 * heading is kept, then each following pair of <p> (question, answer) becomes
 * one <details>/<summary> item. Anything already inside a real .accordion is
 * left alone.
 */
function buildAccordionFromParagraphs(panel) {
  if (panel.querySelector('.accordion, details')) return; // already structured
  const kids = [...panel.children];
  const paras = kids.filter((el) => el.tagName === 'P');
  if (paras.length < 2) return; // nothing accordion-like

  const acc = document.createElement('div');
  acc.className = 'accordion';

  for (let i = 0; i < paras.length; i += 2) {
    const q = paras[i];
    const a = paras[i + 1];
    const details = document.createElement('details');
    details.className = 'accordion-item';

    const summary = document.createElement('summary');
    summary.className = 'accordion-item-title';
    while (q.firstChild) summary.append(q.firstChild);
    const marker = document.createElement('span');
    marker.className = 'accordion-item-marker';
    marker.setAttribute('aria-hidden', 'true');
    summary.append(marker);

    const body = document.createElement('div');
    body.className = 'accordion-item-body';
    if (a) { while (a.firstChild) body.append(a.firstChild); }

    details.append(summary, body);
    acc.append(details);
  }

  // remove the consumed paragraphs, keep any non-<p> (e.g. the heading)
  paras.forEach((p) => p.remove());
  panel.append(acc);
}

export default async function decorate(block) {
  const rows = [...block.children];
  block.replaceChildren();

  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  const panels = document.createElement('div');
  panels.className = 'tabs-panels';

  const tabButtons = [];

  rows.forEach((row, i) => {
    const cells = [...row.children];
    const labelCell = cells[0];
    const bodyCell = cells[1] || document.createElement('div');
    const label = (labelCell ? labelCell.textContent : `Tab ${i + 1}`).trim();
    const id = `tab-${i}`;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tabs-tab';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', `${id}-panel`);
    btn.id = id;
    btn.textContent = label;
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    tablist.append(btn);
    tabButtons.push(btn);

    const panel = document.createElement('div');
    panel.className = 'tabs-panel';
    panel.id = `${id}-panel`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', id);
    if (i !== 0) panel.hidden = true;
    moveInstrumentation(row, panel);
    while (bodyCell.firstChild) panel.append(bodyCell.firstChild);
    panels.append(panel);

    btn.addEventListener('click', () => {
      tabButtons.forEach((b) => b.setAttribute('aria-selected', b === btn ? 'true' : 'false'));
      [...panels.children].forEach((p) => { p.hidden = p !== panel; });
    });
  });

  block.append(tablist, panels);

  // Each panel's Q&A arrives as flat <p> pairs (a nested accordion block does
  // not survive publish). Rebuild an accordion in every panel; if a real
  // nested .accordion did survive, decorate it instead.
  const { default: decorateAccordion } = await import('../accordion/accordion.js');
  [...panels.children].forEach((panel) => {
    const nested = panel.querySelector('.accordion');
    if (nested) {
      decorateAccordion(nested);
    } else {
      buildAccordionFromParagraphs(panel);
    }
  });
}
