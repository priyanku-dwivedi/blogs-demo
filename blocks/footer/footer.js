import { loadFragment } from '../fragment/fragment.js';
import { resolveChromePath } from '../../scripts/scripts.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment — page metadata wins, else the page's site-section
  // (hierarchy) chrome, else the default /footer.
  const footerPath = resolveChromePath('footer', '/footer');
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  block.append(footer);

  // Payment + regulation logo wall: the source presents these as two
  // side-by-side groups (payment | regulation) of bordered boxes with a
  // vertical divider. EDS flattens every logo into its own <p>, so re-group
  // them here. Regulation logos are identified by alt text; everything else
  // in that region is a payment logo.
  const REGULATION_ALTS = new Set([
    'MGA', 'GBGA', 'HM Government of Gibraltar', '888 Responsible', '18+', 'Gordon Moody',
  ]);
  const regions = [...footer.querySelectorAll(':scope > div > div')];
  const logoRegion = regions.find((reg) => reg.querySelector('img[alt="Visa"]'));
  if (logoRegion) {
    const wrapper = logoRegion.querySelector('.default-content-wrapper') || logoRegion;
    const logoParas = [...wrapper.children].filter((el) => el.querySelector('img'));
    if (logoParas.length) {
      logoRegion.classList.add('footer-logos-region');
      const payGroup = document.createElement('div');
      payGroup.className = 'footer-logos-payment';
      const regGroup = document.createElement('div');
      regGroup.className = 'footer-logos-regulation';
      logoParas.forEach((p) => {
        const img = p.querySelector('img');
        const alt = img ? img.getAttribute('alt') : '';
        (REGULATION_ALTS.has(alt) ? regGroup : payGroup).append(p);
      });
      wrapper.replaceChildren(payGroup, regGroup);
    }
  }
}
