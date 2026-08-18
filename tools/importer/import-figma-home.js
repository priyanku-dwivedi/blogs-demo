/* eslint-disable */
/* global WebImporter */

// PAGE TEMPLATE CONFIGURATION
// figma-home showcases the Positivus (Figma) "Process block". It takes the live
// GED home "How to earn your GED certificate" steps and renders them as the
// Positivus accordion variant, on a clean page using the figma-home theme.
const PAGE_TEMPLATE = {
  name: 'figma-home',
  description: 'Positivus (Figma) Process block, populated with the live GED "How to earn your GED certificate" steps.',
  urls: ['https://www.ged.com/en/'],
  blocks: [{ name: 'accordion', instances: ['main'] }],
  sections: [],
};

// The four GED "how to earn" steps. `hint` matches the live DOM so we prefer
// the source's own copy/links; `title`/`body`/`link` are verified fallbacks
// (captured from https://www.ged.com/en) used when the client-rendered step
// text isn't present at transform time.
const STEP_HINTS = [
  {
    hint: 'Take a class',
    title: 'Take a class or study on your own',
    body: 'Take a class or study on your own.',
    linkText: 'Find a prep center',
    linkHref: 'https://www.ged.com/en/prep-centers.html',
  },
  {
    hint: 'practice test',
    title: 'Take the official practice test online',
    body: 'Take the official practice test online.',
    linkText: 'Learn more',
    linkHref: 'https://www.ged.com/en/how-to-graduate/ged-ready.html',
  },
  {
    hint: 'Schedule and sit',
    title: 'Schedule and sit for your exams',
    body: 'Schedule and sit for your exams.',
    linkText: 'Log in to schedule',
    linkHref: 'https://app.ged.com/login?language=ENU&locale=OC',
  },
  {
    hint: 'Pass all 4',
    title: 'Pass all 4 exams and get your transcript',
    body: 'Pass all 4 exams and get your transcript.',
    linkText: 'Request your transcript',
    linkHref: 'https://www.ged.com/transcripts/international.html',
  },
];

/** Build the accordion rows, preferring live DOM copy/links, else fallbacks. */
function extractSteps(document) {
  const scope = document.querySelector('main') || document.body;
  const paras = [...scope.querySelectorAll('p')];
  const rows = [];

  STEP_HINTS.forEach((step) => {
    const desc = paras.find((p) => p.textContent.includes(step.hint));

    // resolve body text + link (live when available, else verified fallback)
    let bodyText = step.body;
    let linkText = step.linkText;
    let linkHref = step.linkHref;
    if (desc) {
      bodyText = desc.textContent.replace(/\s+/g, ' ').trim();
      let item = desc.parentElement;
      for (let i = 0; i < 3 && item; i += 1) {
        if (item.querySelector('a[href]')) break;
        item = item.parentElement;
      }
      const link = item ? item.querySelector('a[href]') : null;
      if (link) {
        linkText = link.textContent.replace(/\s+/g, ' ').trim();
        linkHref = link.getAttribute('href');
      }
    }

    const titleCell = document.createElement('div');
    const t = document.createElement('p');
    t.textContent = step.title;
    titleCell.appendChild(t);

    const bodyCell = document.createElement('div');
    const b = document.createElement('p');
    b.textContent = bodyText;
    bodyCell.appendChild(b);
    if (linkHref) {
      const lp = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', linkHref);
      a.textContent = linkText || 'Learn more';
      lp.appendChild(a);
      bodyCell.appendChild(lp);
    }

    rows.push([titleCell, bodyCell]);
  });

  return rows;
}

function appendGedMetadata(main, document) {
  const cells = [
    ['Title', 'How to earn your GED — Positivus (Figma)'],
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

    // Fresh, clean page body — only the heading + Positivus Process block.
    const main = document.createElement('div');

    const liveHeading = [...document.querySelectorAll('main h2, main h1')]
      .find((h) => /How to earn/i.test(h.textContent));
    const h2 = document.createElement('h2');
    h2.textContent = liveHeading ? liveHeading.textContent.trim() : 'How to earn your GED certificate';
    main.appendChild(h2);

    const rows = extractSteps(document);
    if (rows.length) {
      const block = WebImporter.Blocks.createBlock(document, {
        name: 'accordion (positivus)',
        cells: rows,
      });
      main.appendChild(block);
    }

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
        blocks: ['accordion (positivus)'],
        stepCount: rows.length,
      },
    }];
  },
};
