/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import categoryHeaderParser from './parsers/category-header.js';
import articleListParser from './parsers/article-list.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/888poker-cleanup.js';
import sectionsTransformer from './transformers/888poker-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'listing',
  description: 'Category or tag listing page: category-header (term title + optional description) followed by a query-driven article-list filtered by category or tag with Load More.',
  urls: [
    'https://www.888poker.com/magazine/poker-world',
    'https://www.888poker.com/magazine/tags/wsop',
  ],
  blocks: [
    // article-list is parsed FIRST: it reads the term title from #block-pagetitle,
    // which the category-header parser consumes/replaces. Order matters here.
    {
      name: 'article-list',
      instances: ['.view-display-id-page_category_articles .views-infinite-scroll-content-wrapper'],
    },
    {
      name: 'category-header',
      instances: ['#block-pagetitle'],
    },
  ],
  sections: [
    {
      id: 'listing-header', name: 'Listing Header', selector: ['#block-pagetitle'], style: null, blocks: ['category-header'], defaultContent: [],
    },
    {
      id: 'article-listing', name: 'Article Listing', selector: ['.view-display-id-page_category_articles .views-infinite-scroll-content-wrapper'], style: null, blocks: ['article-list'], defaultContent: [],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  'category-header': categoryHeaderParser,
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
