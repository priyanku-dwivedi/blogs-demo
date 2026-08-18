/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: figma-steps (GED home "How to earn your GED" steps)
 * Base block: accordion (blocks/accordion) — Positivus (Figma) variant.
 * Source: https://www.ged.com/en/
 *
 * The Positivus design's signature section is the "Process block" — a numbered
 * expand/collapse list. We map the GED home 4-step "how to earn" content onto
 * that block: each step becomes one accordion item (title + body), and the
 * block carries the "positivus" class so it renders with the Figma styling
 * (step numbers, lime active card, circular +/- toggle, hard offset shadow).
 */
const STEPS = [
  { hint: 'Take a class', title: 'Take a class or study on your own' },
  { hint: 'Take the official', title: 'Take the official GED Ready practice test' },
  { hint: 'Schedule and sit', title: 'Schedule and sit for the exam' },
  { hint: 'Pass all 4', title: 'Pass all 4 subject tests' },
];

export default function parse(element, { document }) {
  const rows = [];
  STEPS.forEach(({ hint, title }) => {
    const desc = [...element.querySelectorAll('p')].find((p) => p.textContent.includes(hint));
    if (!desc) return;

    const titleCell = document.createElement('div');
    const t = document.createElement('p');
    t.textContent = title;
    titleCell.appendChild(t);

    const bodyCell = document.createElement('div');
    const b = document.createElement('p');
    b.textContent = desc.textContent.replace(/\s+/g, ' ').trim();
    bodyCell.appendChild(b);

    rows.push([titleCell, bodyCell]);
  });

  if (rows.length === 0) { return; }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'accordion (positivus)',
    cells: rows,
  });
  element.replaceWith(block);
}
