/*
 * Tabs Block
 * A horizontal tab bar with switchable panels. Each authored row is one tab:
 *   cell 1: tab label
 *   cell 2: panel content (may itself contain an .accordion block)
 * Renders pill-style tabs (first active) and shows one panel at a time.
 * Used by the GED policy-country template (category tabs → accordion sets).
 */
import { moveInstrumentation } from '../../scripts/scripts.js';

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

  // Decorate any nested accordion blocks inside the panels (EDS does not
  // auto-decorate blocks nested inside another block's cells).
  const nestedAccordions = block.querySelectorAll('.accordion');
  if (nestedAccordions.length) {
    const { default: decorateAccordion } = await import('../accordion/accordion.js');
    nestedAccordions.forEach((acc) => decorateAccordion(acc));
  }
}
