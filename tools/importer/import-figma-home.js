/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import gedHeroParser from './parsers/ged-hero.js';
import figmaStepsParser from './parsers/figma-steps.js';
import gedStoriesParser from './parsers/ged-stories.js';
import gedCtaParser from './parsers/ged-cta.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/ged-cleanup.js';

// PAGE TEMPLATE CONFIGURATION
// figma-home: same live GED home content as home-ged, but rendered with the
// Positivus (Figma) design system. The page sets Template=figma-home so the
// scoped body.figma-home theme (Positivus tokens + Space Grotesk) applies, and
// the "How to earn" steps render via the Positivus accordion variant.
const PAGE_TEMPLATE = {
  name: 'figma-home',
  description: 'GED home content styled with the Positivus (Figma) design system: hero, feature sections, a step/process accordion (Positivus variant), graduate-story teaser cards, and a closing sign-up CTA band.',
  urls: [
    'https://www.ged.com/en/',
  ],
  blocks: [
    { name: 'ged-hero', instances: ['main .column-control.flex-layout--vertically-centered'] },
    { name: 'figma-steps', instances: ['main .row:has(p)'] },
    { name: 'ged-stories', instances: ['main .row:has(h3)'] },
    { name: 'ged-cta', instances: ['main .column-control.bgcolor--background-dark'] },
  ],
  sections: [],
};

// PARSER REGISTRY
const parsers = {
  'ged-hero': gedHeroParser,
  'figma-steps': figmaStepsParser,
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
  if (stepsRow) found.push({ name: 'figma-steps', element: stepsRow });

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
 * figma-home metadata block. Template=figma-home activates the scoped Positivus
 * theme in styles/styles.css; nav/footer reuse the existing ged-pages fragments.
 */
function appendGedMetadata(main, document) {
  const cells = [
    ['Title', 'Home — GED (Figma / Positivus)'],
    ['Description', 'The GED is the #1 most recognized higher secondary certificate worldwide, accepted by universities in over 100 countries.'],
    ['Template', 'figma-home'],
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

    const path = WebImporter.FileUtils.sanitizePath('/ged-pages/figma-home');

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
