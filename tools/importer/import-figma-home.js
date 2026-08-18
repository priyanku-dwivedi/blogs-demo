/* eslint-disable */
/* global WebImporter */

// figma-home renders the live GED home content with the Positivus (Figma)
// design system: a Positivus hero, a Positivus services cards grid, and the
// Positivus process accordion. Content is pulled from the live GED home DOM
// with verified fallbacks (captured from https://www.ged.com/en) so the page
// builds even if the client-rendered markup shifts.
const PAGE_TEMPLATE = {
  name: 'figma-home',
  description: 'GED home content mapped onto Positivus (Figma) hero, services cards, and process accordion.',
  urls: ['https://www.ged.com/en/'],
  blocks: [
    { name: 'hero', instances: ['main'] },
    { name: 'cards', instances: ['main'] },
    { name: 'accordion', instances: ['main'] },
  ],
  sections: [],
};

// --- verified fallbacks from the live GED home page ------------------------
const HERO = {
  heading: 'Go to a university. Anywhere.',
  sub: '#1 most recognized higher secondary certificate worldwide.',
  ctaText: 'Create a free account',
  ctaHref: 'https://app.ged.com/signup?language=ENU&locale=OC',
};

const FEATURES = [
  {
    hint: 'only higher secondary certificate available',
    title: 'Internationally recognized',
    body: 'The GED program is the only higher secondary certificate available in over 100 countries and accepted by nearly all universities in the U.S. and many across the world.',
    linkText: 'See universities',
    linkHref: 'https://www.ged.com/en/university-acceptance.html',
  },
  {
    hint: 'American alternative to the A-level',
    title: 'Alternative higher secondary certificate',
    body: 'The GED is the American alternative to the A-level test, HSC, New Zealand’s NCEA, the International Baccalaureate Diploma Programme and other higher secondary credentials.',
    linkText: 'View curriculum',
    linkHref: 'https://www.ged.com/en/about-test.html',
  },
  {
    hint: 'taken anytime throughout the year',
    title: 'Flexibility to test on your schedule',
    body: 'The GED exam can be taken anytime throughout the year, so you don’t have to wait months for specific exam dates. Schedule your exam when you and your teacher know you are ready.',
    linkText: 'See where I can test',
    linkHref: 'https://wsr.pearsonvue.com/testtaker/find/testcenter/GEDTS?locale=en_US',
  },
  {
    hint: 'same day scoring',
    title: 'Faster scores and transcripts',
    body: 'With same day scoring and transcripts available within days of passing, the GED allows you to go to a university sooner.',
    linkText: 'Request your transcript',
    linkHref: 'https://www.ged.com/transcripts/international.html',
  },
];

const STEPS = [
  {
    hint: 'Take a class', title: 'Take a class or study on your own',
    body: 'Take a class or study on your own.',
    linkText: 'Find a prep center', linkHref: 'https://www.ged.com/en/prep-centers.html',
  },
  {
    hint: 'practice test', title: 'Take the official practice test online',
    body: 'Take the official practice test online.',
    linkText: 'Learn more', linkHref: 'https://www.ged.com/en/how-to-graduate/ged-ready.html',
  },
  {
    hint: 'Schedule and sit', title: 'Schedule and sit for your exams',
    body: 'Schedule and sit for your exams.',
    linkText: 'Log in to schedule', linkHref: 'https://app.ged.com/login?language=ENU&locale=OC',
  },
  {
    hint: 'Pass all 4', title: 'Pass all 4 exams and get your transcript',
    body: 'Pass all 4 exams and get your transcript.',
    linkText: 'Request your transcript', linkHref: 'https://www.ged.com/transcripts/international.html',
  },
];

/** live copy/link for an item hint, falling back to the verified defaults. */
function resolve(document, item) {
  const scope = document.querySelector('main') || document.body;
  const desc = [...scope.querySelectorAll('p, li')].find((p) => p.textContent.includes(item.hint));
  let { body, linkText, linkHref } = item;
  if (desc) {
    body = desc.textContent.replace(/\s+/g, ' ').trim();
    let host = desc.parentElement;
    for (let i = 0; i < 3 && host; i += 1) {
      if (host.querySelector('a[href]')) break;
      host = host.parentElement;
    }
    const link = host ? host.querySelector('a[href]') : null;
    if (link) {
      linkText = link.textContent.replace(/\s+/g, ' ').trim();
      linkHref = link.getAttribute('href');
    }
  }
  return { body, linkText, linkHref };
}

function el(document, tag, text) {
  const n = document.createElement(tag);
  if (text) n.textContent = text;
  return n;
}

function buildHero(document) {
  const cell = document.createElement('div');
  cell.appendChild(el(document, 'h1', HERO.heading));
  cell.appendChild(el(document, 'p', HERO.sub));
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.setAttribute('href', HERO.ctaHref);
  a.textContent = HERO.ctaText;
  p.appendChild(a);
  cell.appendChild(p);
  return WebImporter.Blocks.createBlock(document, { name: 'hero (positivus)', cells: [[cell]] });
}

function buildCards(document) {
  const rows = FEATURES.map((f) => {
    const r = resolve(document, f);
    const body = document.createElement('div');
    body.appendChild(el(document, 'h3', f.title));
    body.appendChild(el(document, 'p', r.body));
    if (r.linkHref) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', r.linkHref);
      a.textContent = r.linkText || 'Learn more';
      p.appendChild(a);
      body.appendChild(p);
    }
    return [body];
  });
  return WebImporter.Blocks.createBlock(document, { name: 'cards (positivus)', cells: rows });
}

function buildAccordion(document) {
  const rows = STEPS.map((s) => {
    const r = resolve(document, s);
    const title = document.createElement('div');
    title.appendChild(el(document, 'p', s.title));
    const body = document.createElement('div');
    body.appendChild(el(document, 'p', r.body));
    if (r.linkHref) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', r.linkHref);
      a.textContent = r.linkText || 'Learn more';
      p.appendChild(a);
      body.appendChild(p);
    }
    return [title, body];
  });
  return WebImporter.Blocks.createBlock(document, { name: 'accordion (positivus)', cells: rows });
}

function appendGedMetadata(main, document) {
  const cells = [
    ['Title', 'GED Home — Positivus (Figma)'],
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
    const { document } = payload;

    // Fresh, clean page: Positivus hero → services cards → services heading →
    // process heading → process accordion → CTA → metadata.
    const main = document.createElement('div');

    main.appendChild(buildHero(document));

    main.appendChild(el(document, 'h2', 'Why the GED'));
    main.appendChild(buildCards(document));

    const stepHeading = [...document.querySelectorAll('main h2, main h1')]
      .find((h) => /How to earn/i.test(h.textContent));
    main.appendChild(el(document, 'h2', stepHeading ? stepHeading.textContent.trim() : 'How to earn your GED certificate'));
    main.appendChild(buildAccordion(document));

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
        blocks: ['hero (positivus)', 'cards (positivus)', 'accordion (positivus)'],
      },
    }];
  },
};
