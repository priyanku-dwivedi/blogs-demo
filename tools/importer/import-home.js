/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import featuredArticlesParser from './parsers/featured-articles.js';
import categoryNavParser from './parsers/category-nav.js';
import articleListParser from './parsers/article-list.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/888poker-cleanup.js';
import sectionsTransformer from './transformers/888poker-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'home',
  description: 'Magazine landing page: page-title (default content), hand-curated featured-articles, category-nav, and a query-driven article-list (all categories, newest-first) with Load More.',
  urls: [
    'https://www.888poker.com/magazine/',
  ],
  blocks: [
    {
      name: 'featured-articles',
      instances: ['.view-display-id-block_hp_headline'],
    },
    {
      name: 'category-nav',
      instances: ['.view-display-id-block_hp_categories_articles .view-filters'],
    },
    {
      name: 'article-list',
      instances: ['.view-display-id-block_hp_categories_articles .view-content'],
    },
  ],
  sections: [
    {
      id: 'featured', name: 'Featured Articles', selector: ['.view-display-id-block_hp_headline'], style: null, blocks: ['featured-articles'], defaultContent: [],
    },
    {
      id: 'category-nav', name: 'Category Nav', selector: ['.view-display-id-block_hp_categories_articles .view-filters'], style: null, blocks: ['category-nav'], defaultContent: [],
    },
    {
      id: 'latest', name: 'Latest Articles', selector: ['.view-display-id-block_hp_categories_articles .view-content'], style: null, blocks: ['article-list'], defaultContent: [],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  'featured-articles': featuredArticlesParser,
  'category-nav': categoryNavParser,
  'article-list': articleListParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

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

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

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

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    ) || '/magazine/index';

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
