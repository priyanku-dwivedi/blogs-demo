/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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

  // tools/importer/import-home-ged.js
  var import_home_ged_exports = {};
  __export(import_home_ged_exports, {
    default: () => import_home_ged_default
  });

  // tools/importer/parsers/ged-hero.js
  function parse(element, { document }) {
    const h1 = element.querySelector("h1");
    if (!h1) {
      return;
    }
    const sub = [...element.querySelectorAll("p")].find((p) => !p.querySelector("a") && p.textContent.trim());
    const cta = element.querySelector("a[href]");
    const cell = document.createElement("div");
    const heading = document.createElement("h1");
    heading.textContent = h1.textContent.replace(/\s+/g, " ").trim();
    cell.appendChild(heading);
    if (sub) {
      const p = document.createElement("p");
      p.textContent = sub.textContent.replace(/\s+/g, " ").trim();
      cell.appendChild(p);
    }
    if (cta) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.setAttribute("href", cta.getAttribute("href"));
      a.textContent = cta.textContent.replace(/\s+/g, " ").trim();
      p.appendChild(a);
      cell.appendChild(p);
    }
    const block = WebImporter.Blocks.createBlock(document, {
      name: "hero (ged-hero)",
      cells: [[cell]]
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/ged-steps.js
  var STEP_HINTS = ["Take a class", "Take the official", "Schedule and sit", "Pass all 4"];
  function parse2(element, { document }) {
    const rows = [];
    STEP_HINTS.forEach((hint) => {
      const desc = [...element.querySelectorAll("p")].find((p2) => p2.textContent.includes(hint));
      if (!desc) return;
      const card = desc.closest("div");
      const link = card ? card.querySelector("a[href]") : null;
      const cell = document.createElement("div");
      const p = document.createElement("p");
      p.textContent = desc.textContent.replace(/\s+/g, " ").trim();
      cell.appendChild(p);
      if (link) {
        const lp = document.createElement("p");
        const a = document.createElement("a");
        a.setAttribute("href", link.getAttribute("href"));
        a.textContent = link.textContent.replace(/\s+/g, " ").trim();
        lp.appendChild(a);
        cell.appendChild(lp);
      }
      rows.push([cell]);
    });
    if (rows.length === 0) {
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, {
      name: "cards (ged-steps)",
      cells: rows
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/ged-stories.js
  function parse3(element, { document }) {
    const h3s = [...element.querySelectorAll("h3")];
    if (h3s.length === 0) {
      return;
    }
    const rows = h3s.map((h3) => {
      const wrap = h3.closest("div");
      const quote = wrap ? [...wrap.querySelectorAll("p")].find((p) => !p.querySelector("a")) : null;
      const storyLink = wrap ? [...wrap.querySelectorAll("a[href]")].pop() : null;
      const cell = document.createElement("div");
      const heading = document.createElement("h3");
      heading.textContent = h3.textContent.replace(/\s+/g, " ").trim();
      cell.appendChild(heading);
      if (quote) {
        const p = document.createElement("p");
        p.textContent = quote.textContent.replace(/\s+/g, " ").trim();
        cell.appendChild(p);
      }
      if (storyLink) {
        const lp = document.createElement("p");
        const a = document.createElement("a");
        a.setAttribute("href", storyLink.getAttribute("href"));
        a.textContent = storyLink.textContent.replace(/\s+/g, " ").trim() || "View Story";
        lp.appendChild(a);
        cell.appendChild(lp);
      }
      return [cell];
    });
    const block = WebImporter.Blocks.createBlock(document, {
      name: "cards (ged-story)",
      cells: rows
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/ged-cta.js
  function parse4(element, { document }) {
    const h2 = element.querySelector("h2");
    if (!h2) {
      return;
    }
    const cta = element.querySelector("a[href]");
    const cell = document.createElement("div");
    const heading = document.createElement("h2");
    heading.textContent = h2.textContent.replace(/\s+/g, " ").trim();
    cell.appendChild(heading);
    if (cta) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.setAttribute("href", cta.getAttribute("href"));
      a.textContent = cta.textContent.replace(/\s+/g, " ").trim();
      p.appendChild(a);
      cell.appendChild(p);
    }
    const block = WebImporter.Blocks.createBlock(document, {
      name: "hero (ged-cta)",
      cells: [[cell]]
    });
    element.replaceWith(block);
  }

  // tools/importer/transformers/ged-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-banner-sdk",
        "#onetrust-consent-sdk",
        ".cookie",
        '[role="dialog"]'
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "nav",
        "footer"
      ]);
      WebImporter.DOMUtils.remove(element, [
        'a[href="#main-content-starts"]',
        // skip-to-content link
        ".to-top-button",
        // back-to-top control
        "a.to-top-button",
        "#arklex-chat-widget",
        // chat bot
        '[id*="chat"]'
        // chat widget stragglers
      ]);
      WebImporter.DOMUtils.remove(element, [
        "iframe",
        "noscript",
        "script",
        "style",
        "link"
      ]);
    }
  }

  // tools/importer/import-home-ged.js
  var PAGE_TEMPLATE = {
    name: "home-ged",
    description: 'GED home page: hero, several default-content feature sections, a "Why choose" list, a 4-step "How to earn" cards grid, graduate-story teaser cards, and a closing sign-up CTA band.',
    urls: [
      "https://www.ged.com/en/"
    ],
    blocks: [
      { name: "ged-hero", instances: ["main .column-control.flex-layout--vertically-centered"] },
      { name: "ged-steps", instances: ["main .row:has(p)"] },
      { name: "ged-stories", instances: ["main .row:has(h3)"] },
      { name: "ged-cta", instances: ["main .column-control.bgcolor--background-dark"] }
    ],
    sections: []
  };
  var parsers = {
    "ged-hero": parse,
    "ged-steps": parse2,
    "ged-stories": parse3,
    "ged-cta": parse4
  };
  var transformers = [transform];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document) {
    const found = [];
    const hero = document.querySelector("main .column-control.flex-layout--vertically-centered");
    if (hero) found.push({ name: "ged-hero", element: hero });
    const stepsRow = [...document.querySelectorAll("main .row")].find((row) => [...row.querySelectorAll("p")].some((p) => /Take a class|Pass all 4 exams/.test(p.textContent)));
    if (stepsRow) found.push({ name: "ged-steps", element: stepsRow });
    const storiesRow = [...document.querySelectorAll("main .row")].find((row) => row.querySelectorAll("h3").length >= 2 && /Atom|Bonus|Bosshy/.test(row.textContent));
    if (storiesRow) found.push({ name: "ged-stories", element: storiesRow });
    const cta = [...document.querySelectorAll("main .column-control.bgcolor--background-dark")].find((s) => s.querySelector("h2") && /Join the millions/.test(s.textContent));
    if (cta) found.push({ name: "ged-cta", element: cta });
    console.log(`Found ${found.length} block instances on page`);
    return found;
  }
  function appendGedMetadata(main, document) {
    const cells = [
      ["Title", "Home \u2014 GED"],
      ["Description", "The GED is the #1 most recognized higher secondary certificate worldwide, accepted by universities in over 100 countries."],
      ["Template", "ged-poc"],
      ["Nav", "/ged-pages/nav"],
      ["Footer", "/ged-pages/footer"]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "metadata", cells });
    main.appendChild(block);
  }
  var import_home_ged_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
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
      executeTransformers("afterTransform", main, payload);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      appendGedMetadata(main, document);
      const path = WebImporter.FileUtils.sanitizePath("/ged-pages/home");
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_home_ged_exports);
})();
