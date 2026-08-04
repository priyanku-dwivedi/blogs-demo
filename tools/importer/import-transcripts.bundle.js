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

  // tools/importer/import-transcripts.js
  var import_transcripts_exports = {};
  __export(import_transcripts_exports, {
    default: () => import_transcripts_default
  });

  // tools/importer/parsers/ged-cards.js
  function parse(element, { document }) {
    const cards = [...element.querySelectorAll("a[href]")].filter((a) => a.querySelector("h3"));
    if (cards.length === 0) {
      return;
    }
    const rows = cards.map((a) => {
      const href = a.getAttribute("href");
      const h3 = a.querySelector("h3");
      const desc = a.querySelector("p");
      const cell = document.createElement("div");
      if (h3) {
        const heading = document.createElement("h3");
        const link = document.createElement("a");
        link.setAttribute("href", href);
        link.textContent = h3.textContent.replace(/\s+/g, " ").trim();
        heading.appendChild(link);
        cell.appendChild(heading);
      }
      if (desc && desc.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = desc.textContent.replace(/\s+/g, " ").trim();
        cell.appendChild(p);
      }
      return [cell];
    });
    const block = WebImporter.Blocks.createBlock(document, {
      name: "cards (ged-options)",
      cells: rows
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

  // tools/importer/import-transcripts.js
  var PAGE_TEMPLATE = {
    name: "transcripts",
    description: 'GED "Request Transcripts" page: an H1 + subheading followed by a set of year-range option cards (each a single link) that route to the right transcript-request destination.',
    urls: [
      "https://www.ged.com/transcripts/international.html"
    ],
    blocks: [
      {
        name: "ged-cards",
        instances: ["section.column-control:has(a h3)"]
      }
    ],
    sections: []
  };
  var parsers = {
    "ged-cards": parse
  };
  var transformers = [
    transform
  ];
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
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      let matched = null;
      for (const selector of blockDef.instances) {
        const el = document.querySelector(selector);
        if (el) {
          matched = { selector, el };
          break;
        }
      }
      if (!matched) {
        console.warn(`Block "${blockDef.name}" selectors not found: ${blockDef.instances.join(", ")}`);
        return;
      }
      pageBlocks.push({
        name: blockDef.name,
        selector: matched.selector,
        element: matched.el,
        section: blockDef.section || null
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  function appendGedMetadata(main, document) {
    var _a;
    const h1 = document.querySelector("h1");
    const h1Text = h1 ? h1.textContent.replace(/\s+/g, " ").trim() : "";
    const title = h1Text ? h1Text.replace(/\b(\w)(\w*)/g, (m, a, b) => a + b.toLowerCase()) : (((_a = document.querySelector("title")) == null ? void 0 : _a.textContent) || "").replace(/\s*[-|]\s*GED.*$/i, "").replace(/\s+/g, " ").trim();
    const descMeta = document.querySelector('meta[name="description"]');
    const description = descMeta ? descMeta.getAttribute("content") : "";
    const cells = [
      ["Title", title ? `${title} \u2014 GED` : "Request Transcripts \u2014 GED"],
      ["Description", description || "Request your official GED transcript. Choose the option that matches when you earned your GED."],
      ["Template", "ged-poc"],
      ["Nav", "/ged-pages/nav"],
      ["Footer", "/ged-pages/footer"]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "metadata", cells });
    main.appendChild(block);
  }
  var import_transcripts_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
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
      executeTransformers("afterTransform", main, payload);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      appendGedMetadata(main, document);
      const slug = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "").split("/").filter(Boolean).join("-");
      const path = WebImporter.FileUtils.sanitizePath(`/ged-pages/${slug}`);
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
  return __toCommonJS(import_transcripts_exports);
})();
