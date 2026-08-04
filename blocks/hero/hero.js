/*
 * Hero block.
 * Default hero needs no JS. The GED "ged-hero" variant places its authored
 * image as a full-bleed background behind the headline/subhead/CTA, so here we
 * move the block's <picture> into a dedicated background layer and mark the
 * block so the CSS overlay + gradient scrim apply.
 */
export default function decorate(block) {
  if (!block.classList.contains('ged-hero')) return;

  const picture = block.querySelector('picture');
  if (!picture) return; // no authored image -> CSS gradient fallback stays

  const owningCell = picture.closest(':scope > div') || picture.parentElement;

  const bg = document.createElement('div');
  bg.className = 'hero-bg';
  bg.append(picture);
  block.prepend(bg);

  // Remove any now-empty image cell(s) so only the text content div remains.
  [...block.children].forEach((child) => {
    if (child !== bg && child.textContent.trim() === '' && !child.querySelector('picture, img')) {
      child.remove();
    }
  });
  if (owningCell && owningCell.parentElement
    && owningCell.textContent.trim() === '' && !owningCell.querySelector('picture, img')) {
    owningCell.remove();
  }

  block.classList.add('has-bg');
}
