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

  // tools/importer/import-article.js
  var import_article_exports = {};
  __export(import_article_exports, {
    default: () => import_article_default
  });

  // tools/importer/parsers/article-hero.js
  function parse(element, { document }) {
    const title = element.querySelector('h1.block-title, h1, .block-title, [class*="title"] h1');
    const heroImg = element.querySelector(".article-image img, .col3 img, .article-image picture img");
    const dateEl = element.querySelector(".date time, .article_time_wrapper time, time");
    const readingEl = element.querySelector(".reading_time, .reading_time .silver");
    const authorImg = element.querySelector(".views-field-field-author-image img, .author_section img, .col4 img");
    const authorAnchor = element.querySelector('.views-field-field-author a[href*="/author/"], .views-field-field-author a') || Array.from(element.querySelectorAll('.author_section a[href*="/author/"], a[href*="/author/"]')).find((a) => a.textContent.replace(/\s+/g, " ").replace(/^\s*by\s+/i, "").trim().length > 0) || element.querySelector('.author_section a[href*="/author/"], a[href*="/author/"]');
    if (!title && !heroImg && !authorAnchor) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (heroImg) {
      const frag = document.createDocumentFragment();
      frag.appendChild(document.createComment(" field:image "));
      frag.appendChild(heroImg);
      cells.push([frag]);
    }
    if (title) {
      const frag = document.createDocumentFragment();
      frag.appendChild(document.createComment(" field:title "));
      frag.appendChild(title);
      cells.push([frag]);
    }
    {
      const frag = document.createDocumentFragment();
      let hasMeta = false;
      if (dateEl) {
        const p = document.createElement("p");
        p.textContent = dateEl.textContent.trim();
        frag.appendChild(document.createComment(" field:meta_publishDate "));
        frag.appendChild(p);
        hasMeta = true;
      }
      if (readingEl) {
        const p = document.createElement("p");
        p.textContent = readingEl.textContent.replace(/\s+/g, " ").trim();
        frag.appendChild(document.createComment(" field:meta_readingTime "));
        frag.appendChild(p);
        hasMeta = true;
      }
      if (hasMeta) cells.push([frag]);
    }
    {
      const frag = document.createDocumentFragment();
      let hasAuthor = false;
      if (authorImg) {
        frag.appendChild(document.createComment(" field:author_image "));
        frag.appendChild(authorImg);
        hasAuthor = true;
      }
      let name = "";
      if (authorAnchor) name = authorAnchor.textContent.replace(/^\s*by\s+/i, "").replace(/\s+/g, " ").trim();
      if (name) {
        const p = document.createElement("p");
        p.textContent = name;
        frag.appendChild(document.createComment(" field:author_name "));
        frag.appendChild(p);
        hasAuthor = true;
      }
      if (authorAnchor && authorAnchor.getAttribute("href")) {
        const a = document.createElement("a");
        const href = authorAnchor.getAttribute("href");
        a.setAttribute("href", href);
        a.textContent = name || href;
        frag.appendChild(document.createComment(" field:author_link "));
        frag.appendChild(a);
        hasAuthor = true;
      }
      if (hasAuthor) cells.push([frag]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "article-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/toc.js
  function parse2(element, { document }) {
    const titleEl = element.querySelector('.block__title, h2, h3, [class*="title"]');
    const list = element.querySelector(".block__content ul, ul");
    if (!titleEl && !list) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (titleEl) {
      const frag = document.createDocumentFragment();
      const p = document.createElement("p");
      p.textContent = titleEl.textContent.replace(/\s+/g, " ").trim();
      frag.appendChild(document.createComment(" field:title "));
      frag.appendChild(p);
      cells.push([frag]);
    }
    if (list) {
      const frag = document.createDocumentFragment();
      frag.appendChild(document.createComment(" field:links "));
      frag.appendChild(list);
      cells.push([frag]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "toc", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/embed.js
  function parse3(element, { document }) {
    let url = "";
    let label = "";
    const iframe = element.matches("iframe") ? element : element.querySelector("iframe");
    if (iframe) {
      const src = iframe.getAttribute("src") || "";
      const tweetMatch = src.match(/[?&]id=(\d+)/);
      if (/platform\.twitter\.com|twitter\.com\/embed|x\.com\/embed/i.test(src) && tweetMatch) {
        url = `https://twitter.com/i/status/${tweetMatch[1]}`;
        label = "View post on X";
      } else if (/platform\.twitter\.com|widgets\/widget_iframe|csxd\.contentsquare|rufous-sandbox|onetrust/i.test(src)) {
        element.replaceWith(...element.childNodes);
        return;
      } else {
        const yt = src.match(/youtube(?:-nocookie)?\.com\/embed\/([^?&/]+)/i);
        if (yt) {
          url = `https://www.youtube.com/watch?v=${yt[1]}`;
          label = "Watch on YouTube";
        } else {
          url = src;
        }
      }
    } else {
      const permalink = element.querySelector('a[href*="twitter.com/"], a[href*="x.com/"], a[href*="/status/"]');
      if (permalink && permalink.getAttribute("href")) {
        url = permalink.getAttribute("href");
        label = permalink.textContent.replace(/\s+/g, " ").trim() || "View post on X";
      } else {
        const inner = element.querySelector("iframe");
        const tid = inner && (inner.getAttribute("src") || "").match(/[?&]id=(\d+)/);
        if (tid) {
          url = `https://twitter.com/i/status/${tid[1]}`;
          label = "View post on X";
        }
      }
    }
    if (!url) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.textContent = label || url;
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createComment(" field:link "));
    frag.appendChild(a);
    const cells = [[frag]];
    const block = WebImporter.Blocks.createBlock(document, { name: "embed", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/author-bio.js
  function parse4(element, { document }) {
    let labelEl = element.querySelector(".author_title.first, .author_title_line .author_title.first, .author_title_line .author_title");
    if (!labelEl) {
      const scope = element.closest(".node__content, article, main, body") || document;
      labelEl = scope.querySelector(".author_title.first, .author_title_line .author_title");
    }
    const authorImg = element.querySelector(".field--name-field-author-image img, .node__content img, img");
    const nameAnchor = element.querySelector('.node__title a[href*="/author/"], h2 a[href*="/author/"], a[href*="/author/"]');
    const nameDiv = element.querySelector(".author_name");
    const bioEl = element.querySelector(".node__content .field--name-body, .col-grow-8 .field--name-body, .field--name-body");
    const hasCore = !!(authorImg || bioEl || nameAnchor && nameAnchor.getAttribute("href"));
    if (!hasCore) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (labelEl) {
      const frag = document.createDocumentFragment();
      const p = document.createElement("p");
      p.textContent = labelEl.textContent.replace(/\s+/g, " ").trim();
      frag.appendChild(document.createComment(" field:label "));
      frag.appendChild(p);
      cells.push([frag]);
    }
    if (authorImg) {
      const frag = document.createDocumentFragment();
      frag.appendChild(document.createComment(" field:image "));
      frag.appendChild(authorImg);
      cells.push([frag]);
    }
    {
      const frag = document.createDocumentFragment();
      let hasAuthor = false;
      let name = "";
      if (nameDiv) name = nameDiv.textContent.replace(/\s+/g, " ").trim();
      if (!name && nameAnchor) name = nameAnchor.textContent.replace(/^\s*by\s+/i, "").replace(/\s+/g, " ").trim();
      if (name) {
        const p = document.createElement("p");
        p.textContent = name;
        frag.appendChild(document.createComment(" field:author_name "));
        frag.appendChild(p);
        hasAuthor = true;
      }
      if (bioEl) {
        frag.appendChild(document.createComment(" field:author_text "));
        frag.appendChild(bioEl);
        hasAuthor = true;
      }
      if (nameAnchor && nameAnchor.getAttribute("href")) {
        const a = document.createElement("a");
        const href = nameAnchor.getAttribute("href");
        a.setAttribute("href", href);
        a.textContent = name || href;
        frag.appendChild(document.createComment(" field:author_link "));
        frag.appendChild(a);
        hasAuthor = true;
      }
      if (hasAuthor) cells.push([frag]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "author-bio", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/888poker-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-banner-sdk",
        // cleaned.html line 1138
        "#onetrust-consent-sdk",
        // OneTrust wrapper (belt-and-suspenders)
        ".cookie"
        // per excludedRegions selector
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.header",
        // cleaned.html line 6 — global site header
        "nav#menu",
        // cleaned.html line 54 — top nav wrapper
        "footer#footer.regular-footer"
        // cleaned.html line 599 — global site footer
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".breadcrumb_line"
        // cleaned.html line 252
      ]);
      WebImporter.DOMUtils.remove(element, [
        "#block-sidebarbannersliderblock",
        // cleaned.html line 515 — banner sliders / ads
        ".content-after-apps"
        // cleaned.html line 590 — empty apps container
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".fontsize-changer",
        // cleaned.html line 336 — font size control
        ".share-wrapper",
        // cleaned.html line 341 — social share widget
        ".messages-list"
        // cleaned.html line 284 — Drupal status messages
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".author_title_line",
        // "About the Author … See all Articles" divider line
        ".author_details_full_block"
        // bare author-name block (already in author-bio)
      ]);
      WebImporter.DOMUtils.remove(element, [
        "iframe",
        // handled by embed parser; strip stragglers
        "noscript",
        "link"
      ]);
    }
  }

  // tools/importer/transformers/888poker-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function findSectionAnchor(root, selectors) {
    if (!Array.isArray(selectors)) return null;
    for (const sel of selectors) {
      if (!sel) continue;
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) return;
    const template = payload && payload.template;
    const sections = template && Array.isArray(template.sections) ? template.sections : [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument;
    const anchors = sections.map((section) => findSectionAnchor(element, section.selector));
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const anchor = anchors[i];
      if (!anchor) continue;
      if (section.style) {
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        if (anchor.parentNode) {
          anchor.parentNode.insertBefore(metadataBlock, anchor.nextSibling);
        }
      }
      if (i > 0 && anchor.parentNode) {
        const hr = doc.createElement("hr");
        anchor.parentNode.insertBefore(hr, anchor);
      }
    }
  }

  // tools/importer/import-article.js
  var PAGE_TEMPLATE = {
    name: "article",
    description: "Poker blog article page: hero with title/date/reading-time/author, in-page table of contents, default-content rich body with inline video/social embeds, and an author bio.",
    urls: [
      "https://www.888poker.com/magazine/jason-koon-poker-net-worth"
    ],
    blocks: [
      {
        name: "article-hero",
        instances: [".region--content .grid-container-teaser"]
      },
      {
        name: "toc",
        instances: ["#block-tocforcontentarticlebody", ".block-table-of-contents"]
      },
      {
        name: "embed",
        instances: [".field--name-body iframe", ".field--name-body blockquote.twitter-tweet"]
      },
      {
        name: "author-bio",
        instances: [".field--name-field-author", ".author_details_full_block"]
      }
    ],
    sections: [
      {
        id: "hero",
        name: "Article Hero",
        selector: [".region--content .grid-container-teaser"],
        style: null,
        blocks: ["article-hero"],
        defaultContent: []
      },
      {
        id: "toc",
        name: "Table of Contents",
        selector: ["#block-tocforcontentarticlebody", ".block-table-of-contents"],
        style: "boxed",
        blocks: ["toc"],
        defaultContent: []
      },
      {
        id: "body",
        name: "Article Body",
        selector: [".field--name-body.field--type-text-with-summary"],
        style: null,
        blocks: ["embed"],
        defaultContent: [".field--name-body.field--type-text-with-summary"]
      },
      {
        id: "author",
        name: "Author Bio",
        selector: [".field--name-field-author", ".author_details_full_block"],
        style: "light",
        blocks: ["author-bio"],
        defaultContent: []
      }
    ]
  };
  var parsers = {
    "article-hero": parse,
    toc: parse2,
    embed: parse3,
    "author-bio": parse4
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_article_default = {
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
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
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
  return __toCommonJS(import_article_exports);
})();
