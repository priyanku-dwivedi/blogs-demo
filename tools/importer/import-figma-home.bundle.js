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
    description: 'Positivus (Figma) Process block, populated with the live GED "How to earn your GED certificate" steps.',
    urls: ["https://www.ged.com/en/"],
    blocks: [{ name: "accordion", instances: ["main"] }],
    sections: []
  };
  var STEP_HINTS = [
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
  function extractSteps(document) {
    const scope = document.querySelector("main") || document.body;
    const paras = [...scope.querySelectorAll("p")];
    const rows = [];
    STEP_HINTS.forEach((step) => {
      const desc = paras.find((p) => p.textContent.includes(step.hint));
      let bodyText = step.body;
      let linkText = step.linkText;
      let linkHref = step.linkHref;
      if (desc) {
        bodyText = desc.textContent.replace(/\s+/g, " ").trim();
        let item = desc.parentElement;
        for (let i = 0; i < 3 && item; i += 1) {
          if (item.querySelector("a[href]")) break;
          item = item.parentElement;
        }
        const link = item ? item.querySelector("a[href]") : null;
        if (link) {
          linkText = link.textContent.replace(/\s+/g, " ").trim();
          linkHref = link.getAttribute("href");
        }
      }
      const titleCell = document.createElement("div");
      const t = document.createElement("p");
      t.textContent = step.title;
      titleCell.appendChild(t);
      const bodyCell = document.createElement("div");
      const b = document.createElement("p");
      b.textContent = bodyText;
      bodyCell.appendChild(b);
      if (linkHref) {
        const lp = document.createElement("p");
        const a = document.createElement("a");
        a.setAttribute("href", linkHref);
        a.textContent = linkText || "Learn more";
        lp.appendChild(a);
        bodyCell.appendChild(lp);
      }
      rows.push([titleCell, bodyCell]);
    });
    return rows;
  }
  function appendGedMetadata(main, document) {
    const cells = [
      ["Title", "How to earn your GED \u2014 Positivus (Figma)"],
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
      const liveHeading = [...document.querySelectorAll("main h2, main h1")].find((h) => /How to earn/i.test(h.textContent));
      const h2 = document.createElement("h2");
      h2.textContent = liveHeading ? liveHeading.textContent.trim() : "How to earn your GED certificate";
      main.appendChild(h2);
      const rows = extractSteps(document);
      if (rows.length) {
        const block = WebImporter.Blocks.createBlock(document, {
          name: "accordion (positivus)",
          cells: rows
        });
        main.appendChild(block);
      }
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
          blocks: ["accordion (positivus)"],
          stepCount: rows.length
        }
      }];
    }
  };
  return __toCommonJS(import_figma_home_exports);
})();
