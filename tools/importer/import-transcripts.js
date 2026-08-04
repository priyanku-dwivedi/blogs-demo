/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import gedCardsParser from './parsers/ged-cards.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/ged-cleanup.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'transcripts',
  description: 'GED "Request Transcripts" page: an H1 + subheading followed by a set of year-range option cards (each a single link) that route to the right transcript-request destination.',
  urls: [
    'https://www.ged.com/transcripts/international.html',
  ],
  blocks: [
    {
      name: 'ged-cards',
      instances: ['section.column-control:has(a h3)'],
    },
  ],
  sections: [],
};

// PARSER REGISTRY
const parsers = {
  'ged-cards': gedCardsParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
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
    // Only take the FIRST matching selector so we don't parse the same content twice.
    let matched = null;
    for (const selector of blockDef.instances) {
      const el = document.querySelector(selector);
      if (el) { matched = { selector, el }; break; }
    }
    if (!matched) {
      console.warn(`Block "${blockDef.name}" selectors not found: ${blockDef.instances.join(', ')}`);
      return;
    }
    pageBlocks.push({
      name: blockDef.name,
      selector: matched.selector,
      element: matched.el,
      section: blockDef.section || null,
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

/**
 * Build the GED metadata block (Title/Description/Template/Nav/Footer) so the
 * migrated page picks up the ged-poc template and the ged-pages nav/footer
 * fragments — matching the other pages under /ged-pages.
 */
function appendGedMetadata(main, document) {
  // Prefer the page H1 ("Request Transcripts") over the terse <title> ("International").
  const h1 = document.querySelector('h1');
  const h1Text = h1 ? h1.textContent.replace(/\s+/g, ' ').trim() : '';
  const title = h1Text
    ? h1Text.replace(/\b(\w)(\w*)/g, (m, a, b) => a + b.toLowerCase()) // Title Case
    : (document.querySelector('title')?.textContent || '')
      .replace(/\s*[-|]\s*GED.*$/i, '').replace(/\s+/g, ' ').trim();
  const descMeta = document.querySelector('meta[name="description"]');
  const description = descMeta ? descMeta.getAttribute('content') : '';

  const cells = [
    ['Title', title ? `${title} — GED` : 'Request Transcripts — GED'],
    ['Description', description || 'Request your official GED transcript. Choose the option that matches when you earned your GED.'],
    ['Template', 'ged-poc'],
    ['Nav', '/ged-pages/nav'],
    ['Footer', '/ged-pages/footer'],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'metadata', cells });
  main.appendChild(block);
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

    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // GED chrome + template metadata (replaces the default createMetadata rule).
    const hr = document.createElement('hr');
    main.appendChild(hr);
    appendGedMetadata(main, document);

    // Force the migrated page under /ged-pages so it inherits GED chrome + styling.
    const slug = new URL(params.originalURL).pathname
      .replace(/\/$/, '').replace(/\.html$/, '')
      .split('/').filter(Boolean).join('-');
    const path = WebImporter.FileUtils.sanitizePath(`/ged-pages/${slug}`);

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
