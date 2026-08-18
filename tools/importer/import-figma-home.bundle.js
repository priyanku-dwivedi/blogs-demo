/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-figma-home.js
  var import_figma_home_exports = {};
  __export(import_figma_home_exports, {
    default: () => import_figma_home_default
  });
  var PAGE_TEMPLATE = {
    name: "figma-home",
    description: "GED home content mapped onto Positivus (Figma) hero, services cards, and process accordion.",
    urls: ["https://www.ged.com/en/"],
    blocks: [
      { name: "hero", instances: ["main"] },
      { name: "cards", instances: ["main"] },
      { name: "accordion", instances: ["main"] }
    ],
    sections: []
  };
  var HERO = {
    heading: "Go to a university. Anywhere.",
    sub: "#1 most recognized higher secondary certificate worldwide.",
    ctaText: "Create a free account",
    ctaHref: "https://app.ged.com/signup?language=ENU&locale=OC"
  };
  var FEATURES = [
    {
      hint: "only higher secondary certificate available",
      title: "Internationally recognized",
      body: "The GED program is the only higher secondary certificate available in over 100 countries and accepted by nearly all universities in the U.S. and many across the world.",
      linkText: "See universities",
      linkHref: "https://www.ged.com/en/university-acceptance.html"
    },
    {
      hint: "American alternative to the A-level",
      title: "Alternative higher secondary certificate",
      body: "The GED is the American alternative to the A-level test, HSC, New Zealand\u2019s NCEA, the International Baccalaureate Diploma Programme and other higher secondary credentials.",
      linkText: "View curriculum",
      linkHref: "https://www.ged.com/en/about-test.html"
    },
    {
      hint: "taken anytime throughout the year",
      title: "Flexibility to test on your schedule",
      body: "The GED exam can be taken anytime throughout the year, so you don\u2019t have to wait months for specific exam dates. Schedule your exam when you and your teacher know you are ready.",
      linkText: "See where I can test",
      linkHref: "https://wsr.pearsonvue.com/testtaker/find/testcenter/GEDTS?locale=en_US"
    },
    {
      hint: "same day scoring",
      title: "Faster scores and transcripts",
      body: "With same day scoring and transcripts available within days of passing, the GED allows you to go to a university sooner.",
      linkText: "Request your transcript",
      linkHref: "https://www.ged.com/transcripts/international.html"
    }
  ];
  var STEPS = [
    {
      hint: "Take a class",
      title: "Take a class or study on your own",
      body: "Take a class or study on your own.",
      linkText: "Find a prep center",
      linkHref: "https://www.ged.com/en/prep-centers.html"
    },
    {
      hint: "practice test",
      title: "Take the official practice test online",
      body: "Take the official practice test online.",
      linkText: "Learn more",
      linkHref: "https://www.ged.com/en/how-to-graduate/ged-ready.html"
    },
    {
      hint: "Schedule and sit",
      title: "Schedule and sit for your exams",
      body: "Schedule and sit for your exams.",
      linkText: "Log in to schedule",
      linkHref: "https://app.ged.com/login?language=ENU&locale=OC"
    },
    {
      hint: "Pass all 4",
      title: "Pass all 4 exams and get your transcript",
      body: "Pass all 4 exams and get your transcript.",
      linkText: "Request your transcript",
      linkHref: "https://www.ged.com/transcripts/international.html"
    }
  ];
  function resolve(document, item) {
    const scope = document.querySelector("main") || document.body;
    const desc = [...scope.querySelectorAll("p, li")].find((p) => p.textContent.includes(item.hint));
    let { body, linkText, linkHref } = item;
    if (desc) {
      body = desc.textContent.replace(/\s+/g, " ").trim();
      let host = desc.parentElement;
      for (let i = 0; i < 3 && host; i += 1) {
        if (host.querySelector("a[href]")) break;
        host = host.parentElement;
      }
      const link = host ? host.querySelector("a[href]") : null;
      if (link) {
        linkText = link.textContent.replace(/\s+/g, " ").trim();
        linkHref = link.getAttribute("href");
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
    const cell = document.createElement("div");
    cell.appendChild(el(document, "h1", HERO.heading));
    cell.appendChild(el(document, "p", HERO.sub));
    const p = document.createElement("p");
    const a = document.createElement("a");
    a.setAttribute("href", HERO.ctaHref);
    a.textContent = HERO.ctaText;
    p.appendChild(a);
    cell.appendChild(p);
    return WebImporter.Blocks.createBlock(document, { name: "hero (positivus)", cells: [[cell]] });
  }
  function buildCards(document) {
    const rows = FEATURES.map((f) => {
      const r = resolve(document, f);
      const body = document.createElement("div");
      body.appendChild(el(document, "h3", f.title));
      body.appendChild(el(document, "p", r.body));
      if (r.linkHref) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.setAttribute("href", r.linkHref);
        a.textContent = r.linkText || "Learn more";
        p.appendChild(a);
        body.appendChild(p);
      }
      return [body];
    });
    return WebImporter.Blocks.createBlock(document, { name: "cards (positivus)", cells: rows });
  }
  function buildAccordion(document) {
    const rows = STEPS.map((s) => {
      const r = resolve(document, s);
      const title = document.createElement("div");
      title.appendChild(el(document, "p", s.title));
      const body = document.createElement("div");
      body.appendChild(el(document, "p", r.body));
      if (r.linkHref) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.setAttribute("href", r.linkHref);
        a.textContent = r.linkText || "Learn more";
        p.appendChild(a);
        body.appendChild(p);
      }
      return [title, body];
    });
    return WebImporter.Blocks.createBlock(document, { name: "accordion (positivus)", cells: rows });
  }
  function appendGedMetadata(main, document) {
    const cells = [
      ["Title", "GED Home \u2014 Positivus (Figma)"],
      ["Description", "The GED is the #1 most recognized higher secondary certificate worldwide, accepted by universities in over 100 countries."],
      ["Template", "figma-home"],
      ["Nav", "/ged-pages/nav"],
      ["Footer", "/ged-pages/footer"]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "metadata", cells });
    main.appendChild(block);
  }
  var import_figma_home_default = {
    transform: (payload) => {
      const { document } = payload;
      const main = document.createElement("div");
      main.appendChild(buildHero(document));
      main.appendChild(el(document, "h2", "Why the GED"));
      main.appendChild(buildCards(document));
      const stepHeading = [...document.querySelectorAll("main h2, main h1")].find((h) => /How to earn/i.test(h.textContent));
      main.appendChild(el(document, "h2", stepHeading ? stepHeading.textContent.trim() : "How to earn your GED certificate"));
      main.appendChild(buildAccordion(document));
      const hr = document.createElement("hr");
      main.appendChild(hr);
      appendGedMetadata(main, document);
      const path = WebImporter.FileUtils.sanitizePath("/ged-pages/figma-home");
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: ["hero (positivus)", "cards (positivus)", "accordion (positivus)"]
        }
      }];
    }
  };
  return __toCommonJS(import_figma_home_exports);
})();
