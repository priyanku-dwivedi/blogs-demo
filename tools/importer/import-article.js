/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import articleHeroParser from './parsers/article-hero.js';
import tocParser from './parsers/toc.js';
import embedParser from './parsers/embed.js';
import authorBioParser from './parsers/author-bio.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/888poker-cleanup.js';
import sectionsTransformer from './transformers/888poker-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'article',
  description: 'Poker blog article page: hero with title/date/reading-time/author, in-page table of contents, default-content rich body with inline video/social embeds, and an author bio.',
  urls: [
    'https://www.888poker.com/magazine/jason-koon-poker-net-worth',
  ],
  blocks: [
    {
      name: 'article-hero',
      instances: ['.region--content .grid-container-teaser'],
    },
    {
      name: 'toc',
      instances: ['#block-tocforcontentarticlebody', '.block-table-of-contents'],
    },
    {
      name: 'embed',
      instances: ['.field--name-body iframe', '.field--name-body blockquote.twitter-tweet'],
    },
    {
      name: 'author-bio',
      instances: ['.field--name-field-author', '.author_details_full_block'],
    },
  ],
  sections: [
    {
      id: 'hero', name: 'Article Hero', selector: ['.region--content .grid-container-teaser'], style: null, blocks: ['article-hero'], defaultContent: [],
    },
    {
      id: 'toc', name: 'Table of Contents', selector: ['#block-tocforcontentarticlebody', '.block-table-of-contents'], style: 'boxed', blocks: ['toc'], defaultContent: [],
    },
    {
      id: 'body', name: 'Article Body', selector: ['.field--name-body.field--type-text-with-summary'], style: null, blocks: ['embed'], defaultContent: ['.field--name-body.field--type-text-with-summary'],
    },
    {
      id: 'author', name: 'Author Bio', selector: ['.field--name-field-author', '.author_details_full_block'], style: 'light', blocks: ['author-bio'], defaultContent: [],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  'article-hero': articleHeroParser,
  toc: tocParser,
  embed: embedParser,
  'author-bio': authorBioParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already detached by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
