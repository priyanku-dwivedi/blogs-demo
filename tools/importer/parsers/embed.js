/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: embed
 * Base block: embed (xwalk model: embed)
 * Source: https://www.888poker.com/magazine/jason-koon-poker-net-worth
 *
 * Model fields (blocks/embed/_embed.json):
 *   link (aem-content) -> the embed URL as an <a href=URL>
 *   linkText (text)    -> collapses onto the anchor text (suffix "Text")
 *
 * Handles two source shapes matched by page-templates.json instances[]:
 *   - .field--name-body iframe            (YouTube embeds; also the Twitter platform iframe)
 *   - .field--name-body blockquote.twitter-tweet / div.twitter-tweet (Twitter/X posts)
 */
export default function parse(element, { document }) {
  let url = '';
  let label = '';

  // Case 1: element is (or wraps) an iframe
  const iframe = element.matches('iframe') ? element : element.querySelector('iframe');
  if (iframe) {
    const src = iframe.getAttribute('src') || '';

    // Twitter/X post rendered as a platform iframe (…embed/Tweet.html?…id=TWEETID…)
    const tweetMatch = src.match(/[?&]id=(\d+)/);
    if (/platform\.twitter\.com|twitter\.com\/embed|x\.com\/embed/i.test(src) && tweetMatch) {
      url = `https://twitter.com/i/status/${tweetMatch[1]}`;
      label = 'View post on X';
    } else if (/platform\.twitter\.com|widgets\/widget_iframe|csxd\.contentsquare|rufous-sandbox|onetrust/i.test(src)) {
      // Non-content platform/utility iframe with no tweet id — not an embed. Bail.
      element.replaceWith(...element.childNodes);
      return;
    } else {
      // YouTube: normalize /embed/VIDEOID?… -> watch?v=VIDEOID
      const yt = src.match(/youtube(?:-nocookie)?\.com\/embed\/([^?&/]+)/i);
      if (yt) {
        url = `https://www.youtube.com/watch?v=${yt[1]}`;
        label = 'Watch on YouTube';
      } else {
        url = src;
      }
    }
  } else {
    // Case 2: a twitter-tweet blockquote/div. Prefer the permalink anchor, else the inner iframe id.
    const permalink = element.querySelector('a[href*="twitter.com/"], a[href*="x.com/"], a[href*="/status/"]');
    if (permalink && permalink.getAttribute('href')) {
      url = permalink.getAttribute('href');
      label = permalink.textContent.replace(/\s+/g, ' ').trim() || 'View post on X';
    } else {
      const inner = element.querySelector('iframe');
      const tid = inner && (inner.getAttribute('src') || '').match(/[?&]id=(\d+)/);
      if (tid) {
        url = `https://twitter.com/i/status/${tid[1]}`;
        label = 'View post on X';
      }
    }
  }

  // Empty-block guard: no usable embed URL
  if (!url) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Row: link (field:link). linkText (suffix "Text") collapses onto the anchor text.
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.textContent = label || url;

  const frag = document.createDocumentFragment();
  frag.appendChild(document.createComment(' field:link '));
  frag.appendChild(a);

  const cells = [[frag]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'embed', cells });
  element.replaceWith(block);
}
