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

  // tools/importer/import-listing.js
  var import_listing_exports = {};
  __export(import_listing_exports, {
    default: () => import_listing_default
  });

  // tools/importer/parsers/category-header.js
  function parse(element, { document }) {
    const titleEl = element.querySelector("h1.title.page-title, h1.page-title, h1.title, h1") || document.querySelector("#block-pagetitle h1.title.page-title, #block-pagetitle h1.page-title, #block-pagetitle h1, h1.page-title");
    const title = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
    const descEl = element.querySelector(
      ".field--name-description, .taxonomy-term-description, .term-description, .page-title-description"
    ) || document.querySelector(
      "#block-pagetitle .field--name-description, .region--content-top .field--name-description, .taxonomy-term-description"
    );
    const hasDescription = descEl && descEl.textContent.trim();
    if (!title && !hasDescription) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const hint = (fieldName) => document.createComment(` field:${fieldName} `);
    const cells = [];
    if (title) {
      const frag = document.createDocumentFragment();
      frag.appendChild(hint("title"));
      const span = document.createElement("span");
      span.textContent = title;
      frag.appendChild(span);
      cells.push([frag]);
    } else {
      cells.push([""]);
    }
    if (hasDescription) {
      const frag = document.createDocumentFragment();
      frag.appendChild(hint("description"));
      frag.appendChild(descEl);
      cells.push([frag]);
    } else {
      cells.push([""]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "category-header", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/article-list.js
  function parse2(element, { document }) {
    const PAGE_SIZE = "6";
    const resolveSourcePath = () => {
      const metaSelectors = [
        ['link[rel="canonical"]', "href"],
        ['meta[property="og:url"]', "content"],
        ['meta[name="twitter:url"]', "content"],
        ['link[rel="shortlink"]', "href"]
      ];
      for (const [sel, attr] of metaSelectors) {
        const el = document.querySelector(sel);
        const val = el && el.getAttribute(attr);
        if (val && val.trim()) {
          try {
            return new URL(val.trim(), "https://www.888poker.com").pathname.toLowerCase();
          } catch (e) {
            return val.trim().toLowerCase();
          }
        }
      }
      const crumbLinks = [...document.querySelectorAll(".breadcrumbs a[href], nav .breadcrumb a[href]")];
      const crumbHref = crumbLinks.length ? crumbLinks[crumbLinks.length - 1].getAttribute("href") : "";
      if (crumbHref && /\/magazine\//i.test(crumbHref)) {
        try {
          return new URL(crumbHref, "https://www.888poker.com").pathname.toLowerCase();
        } catch (e) {
        }
      }
      return "";
    };
    const detectPageType = (path) => {
      if (/\/magazine\/?(index)?\/?$/i.test(path)) return "home";
      if (/\/magazine\/author\//i.test(path)) return "author";
      if (/\/magazine\/tags?\//i.test(path)) return "tag";
      if (/\/magazine\/[^/]+\/?$/i.test(path)) return "category";
      if (document.querySelector(".view-display-id-block_hp_headline, .view-display-id-block_hp_categories_articles")) return "home";
      if (document.querySelector("article.node--type-author, .author_full")) return "author";
      if (document.querySelector(".view-display-id-page_category_articles, body.path-taxonomy") || document.body && document.body.classList.contains("path-taxonomy")) return "category";
      return "category";
    };
    const sourcePath = resolveSourcePath();
    const pageType = detectPageType(sourcePath);
    const readTitle = () => {
      const h1 = document.querySelector(
        "article.node--type-author h1.title#page-title, h1.title.replaced-title, #block-pagetitle h1.title.page-title, #block-pagetitle h1.page-title, h1#page-title, h1.page-title"
      );
      if (h1 && h1.textContent.trim()) return h1.textContent.replace(/\s+/g, " ").trim();
      const catHeader = document.querySelector(".category-header");
      if (catHeader && catHeader.textContent.trim()) {
        return catHeader.textContent.replace(/\s+/g, " ").trim();
      }
      const titleTextEl = document.querySelector("span.title_text");
      if (titleTextEl) {
        const raw = titleTextEl.textContent.replace(/\s+/g, " ").trim();
        return raw.replace(/\s+(['’]s\b)/g, "$1");
      }
      const crumbs = [...document.querySelectorAll(".breadcrumbs a, nav .breadcrumb a, .breadcrumb_line a")];
      if (crumbs.length) {
        const last = crumbs[crumbs.length - 1].textContent.replace(/\s+/g, " ").trim();
        if (last) return last;
      }
      return "";
    };
    const termTitle = readTitle();
    let filterAuthor = "";
    let filterCategory = "";
    let filterTag = "";
    if (pageType === "author") {
      const authorPathMatch = sourcePath.match(/\/magazine\/author\/[a-z0-9-]+/i);
      if (authorPathMatch) {
        filterAuthor = authorPathMatch[0];
      } else if (termTitle) {
        const name = termTitle.replace(/['’]s\s+Articles\s*$/i, "").trim();
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        filterAuthor = slug ? `/magazine/author/${slug}` : name;
      }
    } else if (pageType === "tag") {
      filterTag = termTitle && termTitle.replace(/['’]s\s+Articles\s*$/i, "").trim() || (sourcePath.match(/\/magazine\/tags?\/([a-z0-9-]+)/i) || [])[1] || "";
    } else if (pageType === "home") {
    } else {
      filterCategory = termTitle && termTitle.replace(/['’]s\s+Articles\s*$/i, "").trim() || (sourcePath.match(/\/magazine\/([^/]+)\/?$/i) || [])[1] || "";
    }
    let heading = "";
    if (pageType === "home") {
      heading = "Latest Articles";
    } else if (pageType === "author") {
      const titleTextEl = document.querySelector("span.title_text");
      if (titleTextEl && titleTextEl.textContent.trim()) {
        heading = titleTextEl.textContent.replace(/\s+/g, " ").replace(/\s+(['’]s\b)/g, "$1").trim();
      } else if (termTitle) {
        const name = termTitle.replace(/['’]s\s+Articles\s*$/i, "").trim();
        heading = name ? `${name}'s Articles` : "";
      }
    } else {
      const term = filterCategory || filterTag || termTitle;
      if (term) heading = `${term} Articles`;
      else heading = termTitle;
    }
    const anyFilter = filterAuthor || filterCategory || filterTag;
    if (!anyFilter && !heading) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const hint = (fieldName) => document.createComment(` field:${fieldName} `);
    const headingCell = (value) => {
      const frag = document.createDocumentFragment();
      frag.appendChild(hint("heading"));
      const span = document.createElement("span");
      span.textContent = value;
      frag.appendChild(span);
      return frag;
    };
    const buildFilterCell = () => {
      const frag = document.createDocumentFragment();
      [
        ["filter_author", filterAuthor],
        ["filter_category", filterCategory],
        ["filter_tag", filterTag]
      ].forEach(([field, value]) => {
        frag.appendChild(hint(field));
        const p = document.createElement("p");
        p.textContent = value || "";
        frag.appendChild(p);
      });
      return frag;
    };
    const cells = [];
    cells.push([headingCell(heading)]);
    cells.push([buildFilterCell()]);
    cells.push([(() => {
      const frag = document.createDocumentFragment();
      frag.appendChild(hint("pageSize"));
      const span = document.createElement("span");
      span.textContent = PAGE_SIZE;
      frag.appendChild(span);
      return frag;
    })()]);
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
        ".block-page-title-block",
        // "{Author} 's Articles" page-title block (article-list has its own heading)
        ".block-home-banner-slider",
        // homepage right-rail promo banner slider (utm_medium=slider)
        ".view-display-id-category_headline_block"
        // category-page "featured strip" (duplicates the main list)
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

  // tools/importer/import-listing.js
  var PAGE_TEMPLATE = {
    name: "listing",
    description: "Category or tag listing page: category-header (term title + optional description) followed by a query-driven article-list filtered by category or tag with Load More.",
    urls: [
      "https://www.888poker.com/magazine/poker-world",
      "https://www.888poker.com/magazine/tags/wsop"
    ],
    blocks: [
      // article-list is parsed FIRST: it reads the term title from #block-pagetitle,
      // which the category-header parser consumes/replaces. Order matters here.
      {
        name: "article-list",
        instances: [".view-display-id-page_category_articles .views-infinite-scroll-content-wrapper"]
      },
      {
        name: "category-header",
        instances: ["#block-pagetitle"]
      }
    ],
    sections: [
      {
        id: "listing-header",
        name: "Listing Header",
        selector: ["#block-pagetitle"],
        style: null,
        blocks: ["category-header"],
        defaultContent: []
      },
      {
        id: "article-listing",
        name: "Article Listing",
        selector: [".view-display-id-page_category_articles .views-infinite-scroll-content-wrapper"],
        style: null,
        blocks: ["article-list"],
        defaultContent: []
      }
    ]
  };
  var parsers = {
    "category-header": parse,
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
  var import_listing_default = {
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
  return __toCommonJS(import_listing_exports);
})();
