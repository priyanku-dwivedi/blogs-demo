/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: GED site-wide cleanup (ged.com).
 *
 * Scope: removes non-authorable site chrome so only the main content column
 * survives into the migrated page. The GED nav/footer are supplied by the
 * ged-pages nav/footer fragments, so the source header/footer are dropped.
 *
 * Verified against the live DOM of https://www.ged.com/transcripts/international.html:
 *   - banner / header  -> global site header (utility bar + logo + primary nav)
 *   - contentinfo / footer -> global site footer
 *   - #onetrust-* / .cookie / [role="dialog"] -> consent banner
 *   - .to-top-button   -> back-to-top control
 *   - chat widget + skip link -> non-authorable UI
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Consent / cookie banner and non-content overlays.
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-banner-sdk',
      '#onetrust-consent-sdk',
      '.cookie',
      '[role="dialog"]',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // 1. Global site chrome (nav + footer come from ged-pages fragments).
    WebImporter.DOMUtils.remove(element, [
      'header',
      'nav',
      'footer',
    ]);

    // 2. Non-authorable UI widgets.
    WebImporter.DOMUtils.remove(element, [
      'a[href="#main-content-starts"]',   // skip-to-content link
      '.to-top-button',                    // back-to-top control
      'a.to-top-button',
      '#arklex-chat-widget',               // chat bot
      '[id*="chat"]',                      // chat widget stragglers
    ]);

    // 3. Safe leftover element cleanup.
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'noscript',
      'script',
      'style',
      'link',
    ]);
  }
}
