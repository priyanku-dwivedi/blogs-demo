/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import gedHeroParser from './parsers/ged-hero.js';
import gedStepsParser from './parsers/ged-steps.js';
import gedStoriesParser from './parsers/ged-stories.js';
import gedCtaParser from './parsers/ged-cta.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/ged-cleanup.js';

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'home-ged',
  description: 'GED home page: hero, several default-content feature sections, a "Why choose" list, a 4-step "How to earn" cards grid, graduate-story teaser cards, and a closing sign-up CTA band.',
  urls: [
    'https://www.ged.com/en/',
  ],
  blocks: [
    { name: 'ged-hero', instances: ['main .column-control.flex-layout--vertically-centered'] },
    { name: 'ged-steps', instances: ['main .row:has(p)'] },
    { name: 'ged-stories', instances: ['main .row:has(h3)'] },
    { name: 'ged-cta', instances: ['main .column-control.bgcolor--background-dark'] },
  ],
  sections: [],
};

// PARSER REGISTRY
const parsers = {
  'ged-hero': gedHeroParser,
  'ged-steps': gedStepsParser,
  'ged-stories': gedStoriesParser,
  'ged-cta': gedCtaParser,
};

const transformers = [cleanupTransformer];

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
 * Find the FIRST element for each block, in a fixed order. ged-steps and
 * ged-stories both match `.row`, so we resolve them explicitly: the row that
 * contains the step descriptions is steps; the row that contains <h3> names is
 * stories.
 */
function findBlocksOnPage(document) {
  const found = [];

  const hero = document.querySelector('main .column-control.flex-layout--vertically-centered');
  if (hero) found.push({ name: 'ged-hero', element: hero });

  // steps: the .row whose paragraphs include the step hints
  const stepsRow = [...document.querySelectorAll('main .row')].find((row) => (
    [...row.querySelectorAll('p')].some((p) => /Take a class|Pass all 4 exams/.test(p.textContent))
  ));
  if (stepsRow) found.push({ name: 'ged-steps', element: stepsRow });

  // stories: the .row that holds the graduate <h3> names
  const storiesRow = [...document.querySelectorAll('main .row')].find((row) => (
    row.querySelectorAll('h3').length >= 2 && /Atom|Bonus|Bosshy/.test(row.textContent)
  ));
  if (storiesRow) found.push({ name: 'ged-stories', element: storiesRow });

  const cta = [...document.querySelectorAll('main .column-control.bgcolor--background-dark')].find((s) => (
    s.querySelector('h2') && /Join the millions/.test(s.textContent)
  ));
  if (cta) found.push({ name: 'ged-cta', element: cta });

  console.log(`Found ${found.length} block instances on page`);
  return found;
}

/**
 * GED metadata block (Title/Description/Template/Nav/Footer) so the page uses
 * the ged-poc template and the ged-pages nav/footer fragments.
 */
function appendGedMetadata(main, document) {
  const cells = [
    ['Title', 'Home — GED'],
    ['Description', 'The GED is the #1 most recognized higher secondary certificate worldwide, accepted by universities in over 100 countries.'],
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

    const pageBlocks = findBlocksOnPage(document);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      try {
        parser(block.element, { document, url, params });
      } catch (e) {
        console.error(`Failed to parse ${block.name}:`, e);
      }
    });

    executeTransformers('afterTransform', main, payload);

    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    appendGedMetadata(main, document);

    const path = WebImporter.FileUtils.sanitizePath('/ged-pages/home');

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
