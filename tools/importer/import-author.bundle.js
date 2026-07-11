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

  // tools/importer/import-author.js
  var import_author_exports = {};
  __export(import_author_exports, {
    default: () => import_author_default
  });

  // tools/importer/parsers/author-header.js
  function parse(element, { document }) {
    const image = element.querySelector(
      '.field--name-field-author-image img, span[class*="author-image"] img, .author_full img, img'
    );
    const nameEl = element.querySelector("h1.title#page-title, h1#page-title, h1.title, h1");
    const bioEl = element.querySelector(
      ".field--name-body p, .text-content p, .author_full .field--name-body, .author_full p"
    );
    const socialSelectors = {
      social_facebook: 'a.facebook_link, a[href*="facebook.com"], a[class*="facebook"]',
      social_twitter: 'a.twitter_link, a[href*="twitter.com"], a[href*="x.com"], a[class*="twitter"]',
      social_linkedin: 'a.linkedin_link, a[href*="linkedin.com"], a[class*="linkedin"]'
    };
    const socialRoot = element.querySelector(".author_social_links") || element;
    const socialLinks = {};
    Object.entries(socialSelectors).forEach(([field, sel]) => {
      const a = socialRoot.querySelector(sel);
      const href = a && a.getAttribute("href");
      if (href && href.trim() && href.trim() !== "#") {
        const link = document.createElement("a");
        link.href = href.trim();
        link.textContent = a.textContent.trim() || href.trim();
        socialLinks[field] = link;
      }
    });
    if (!nameEl && !image && !bioEl) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const hint = (fieldName) => document.createComment(` field:${fieldName} `);
    const cells = [];
    if (image) {
      const frag = document.createDocumentFragment();
      frag.appendChild(hint("image"));
      frag.appendChild(image);
      cells.push([frag]);
    } else {
      cells.push([""]);
    }
    if (nameEl) {
      const frag = document.createDocumentFragment();
      frag.appendChild(hint("name"));
      frag.appendChild(nameEl);
      cells.push([frag]);
    } else {
      cells.push([""]);
    }
    if (bioEl) {
      const frag = document.createDocumentFragment();
      frag.appendChild(hint("bio"));
      frag.appendChild(bioEl);
      cells.push([frag]);
    } else {
      cells.push([""]);
    }
    const socialFrag = document.createDocumentFragment();
    ["social_facebook", "social_twitter", "social_linkedin"].forEach((field) => {
      if (socialLinks[field]) {
        socialFrag.appendChild(hint(field));
        socialFrag.appendChild(socialLinks[field]);
      }
    });
    cells.push([socialFrag]);
    const block = WebImporter.Blocks.createBlock(document, { name: "author-header", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/article-list.js
  function parse2(element, { document }) {
    const PAGE_SIZE = "6";
    const hintedCell = (fieldName, value) => {
      const frag = document.createDocumentFragment();
      frag.appendChild(document.createComment(` field:${fieldName} `));
      const span = document.createElement("span");
      span.textContent = value;
      frag.appendChild(span);
      return frag;
    };
    let authorName = "";
    const h1 = document.querySelector("article.node--type-author h1.title#page-title, h1.title.replaced-title, h1#page-title");
    if (h1 && h1.textContent.trim()) {
      authorName = h1.textContent.trim();
    }
    if (!authorName) {
      const titleTextEl2 = document.querySelector("span.title_text");
      if (titleTextEl2) {
        const raw = titleTextEl2.textContent.replace(/\s+/g, " ").trim();
        authorName = raw.replace(/['’]s\s+Articles\s*$/i, "").trim();
      }
    }
    let authorFilter = "";
    const canonical = document.querySelector('link[rel="canonical"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    const urlStr = canonical && canonical.getAttribute("href") || ogUrl && ogUrl.getAttribute("content") || "";
    const pathMatch = urlStr.match(/\/magazine\/author\/[a-z0-9-]+/i);
    if (pathMatch) {
      authorFilter = pathMatch[0];
    }
    if (!authorFilter && authorName) {
      const slug = authorName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      authorFilter = slug ? `/magazine/author/${slug}` : authorName;
    }
    if (!authorFilter) authorFilter = authorName;
    let heading = "";
    const titleTextEl = document.querySelector("span.title_text");
    if (titleTextEl && titleTextEl.textContent.trim()) {
      heading = titleTextEl.textContent.replace(/\s+/g, " ").replace(/\s+(['’]s\b)/g, "$1").trim();
    } else if (authorName) {
      heading = `${authorName}'s Articles`;
    }
    if (!authorFilter && !heading) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push([hintedCell("heading", heading)]);
    cells.push([hintedCell("author", authorFilter)]);
    cells.push([hintedCell("pageSize", PAGE_SIZE)]);
    const block = WebImporter.Blocks.createBlock(document, { name: "article-list", cells });
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
        ".js-pager__items",
        // hidden Load More pager (block replicates it)
        "h2.title_tag",
        // view-header heading (article-list renders its own)
        ".block-page-title-block"
        // "{Author} 's Articles" page-title block (article-list has its own heading)
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

  // tools/importer/import-author.js
  var PAGE_TEMPLATE = {
    name: "author",
    description: "Author listing page: author-header identity banner (name, portrait, bio, social) followed by a query-driven article-list filtered by author with Load More.",
    urls: [
      "https://www.888poker.com/magazine/author/frederico-pereira"
    ],
    blocks: [
      {
        name: "author-header",
        instances: [".views-row > article.node--type-author"]
      },
      {
        name: "article-list",
        instances: [".view-articles.view-id-articles .view-content"]
      }
    ],
    sections: [
      {
        id: "author-header",
        name: "Author Header",
        selector: [".views-row > article.node--type-author"],
        style: null,
        blocks: ["author-header"],
        defaultContent: []
      },
      {
        id: "article-listing",
        name: "Article Listing",
        selector: [".view-articles.view-id-articles .view-content"],
        style: null,
        blocks: ["article-list"],
        defaultContent: []
      }
    ]
  };
  var parsers = {
    "author-header": parse,
    "article-list": parse2
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
  var import_author_default = {
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
  return __toCommonJS(import_author_exports);
})();
