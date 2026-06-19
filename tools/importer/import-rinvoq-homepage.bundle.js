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

  // tools/importer/import-rinvoq-homepage.js
  var import_rinvoq_homepage_exports = {};
  __export(import_rinvoq_homepage_exports, {
    default: () => import_rinvoq_homepage_default
  });

  // tools/importer/parsers/rinvoq-hero.js
  function extractBgUrl(element) {
    const display = element.querySelector(".abbv-background-container-display") || element;
    const img = display.querySelector("img");
    if (img) {
      const src = img.getAttribute("src") || img.getAttribute("data-src") || img.getAttribute("data-original") || "";
      if (src) return src;
    }
    const inline = display.getAttribute("style") || "";
    let m = inline.match(/background-image\s*:\s*url\((['"]?)(.*?)\1\)/i);
    if (m && m[2]) return m[2];
    try {
      const view = display.ownerDocument && display.ownerDocument.defaultView || window;
      const computed = view.getComputedStyle(display).backgroundImage || "";
      m = computed.match(/url\((['"]?)(.*?)\1\)/i);
      if (m && m[2] && m[2] !== "none") return m[2];
    } catch (e) {
    }
    return "";
  }
  function parse(element, { document }) {
    const imageFrag = document.createDocumentFragment();
    imageFrag.appendChild(document.createComment(" field:image "));
    const bgUrl = extractBgUrl(element);
    if (bgUrl) {
      const pic = document.createElement("picture");
      const img = document.createElement("img");
      img.src = bgUrl;
      img.alt = "";
      pic.appendChild(img);
      imageFrag.appendChild(pic);
    }
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(" field:text "));
    const cardBody = element.querySelector(".abbv-stretched-card-body");
    if (cardBody) {
      const bodyParas = cardBody.querySelectorAll(":scope > p");
      bodyParas.forEach((p) => {
        const np = document.createElement("p");
        np.innerHTML = p.innerHTML;
        textFrag.appendChild(np);
      });
    }
    const headingEl = element.querySelector(".abbv-background-container-content .rich-text h1, .abbv-background-container-content h1");
    if (headingEl) {
      const h1 = document.createElement("h1");
      h1.innerHTML = headingEl.innerHTML;
      textFrag.appendChild(h1);
    }
    const cells = [
      [imageFrag],
      [textFrag]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-pharma", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/rinvoq-conditions.js
  function parse2(element, { document }) {
    const tiles = element.querySelectorAll(":scope .abbv-flex-item");
    const cells = [];
    tiles.forEach((tile) => {
      if (tile.classList.contains("d-none")) return;
      const link = tile.querySelector("a.homepage-indication-selector-cta, a[href]");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      if (!href) return;
      let title = "";
      const nameSpan = link.querySelector("span.font-15px, span.d-block");
      if (nameSpan) {
        title = nameSpan.textContent.replace(/\s+/g, " ").trim();
      }
      if (!title) {
        title = link.textContent.replace(/\s+/g, " ").trim();
      }
      const linkLabel = link.textContent.replace(/\s+/g, " ").trim();
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(" field:image "));
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      if (title) {
        const h2 = document.createElement("h2");
        h2.textContent = title;
        textCell.appendChild(h2);
      }
      const a = document.createElement("a");
      a.setAttribute("href", href);
      a.textContent = linkLabel || title;
      textCell.appendChild(a);
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/rinvoq-savings.js
  function parse3(element, { document }) {
    const picture = element.querySelector(".abbv-image-text-v2 picture, picture, img");
    const cell1 = [document.createComment(" field:image ")];
    if (picture) {
      if (picture.tagName === "IMG") {
        const pic = document.createElement("picture");
        const img = document.createElement("img");
        img.src = picture.src || picture.getAttribute("src") || "";
        img.alt = picture.alt || picture.getAttribute("alt") || "";
        pic.appendChild(img);
        cell1.push(pic);
      } else {
        cell1.push(picture);
      }
    }
    const cell2 = [document.createComment(" field:text ")];
    const heading = element.querySelector(".abbv-title h2, .titles h2, h2");
    if (heading) {
      const h2 = document.createElement("h2");
      h2.innerHTML = heading.innerHTML;
      cell2.push(h2);
    }
    const richTexts = element.querySelectorAll(".rich-text .abbv-rich-text");
    richTexts.forEach((rt) => {
      rt.querySelectorAll(":scope > p").forEach((p) => {
        const onlyLink = p.querySelector("a");
        if (onlyLink && p.textContent.trim() === onlyLink.textContent.trim()) return;
        if (!p.textContent.trim()) return;
        const np = document.createElement("p");
        np.innerHTML = p.innerHTML;
        cell2.push(np);
      });
    });
    const cta = element.querySelector("a.abbv-button-primary, a.psa-primary-button");
    if (cta) {
      const a = document.createElement("a");
      a.setAttribute("href", cta.getAttribute("href") || "");
      a.textContent = cta.textContent.replace(/\s+/g, " ").trim();
      cell2.push(a);
    }
    const cells = [];
    cells.push([cell1]);
    cells.push([cell2]);
    const block = WebImporter.Blocks.createBlock(document, { name: "promo-tout", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/rinvoq-speak.js
  function extractBgUrl2(element) {
    const display = element.querySelector(".abbv-background-container-display") || element;
    const img = display.querySelector("img");
    if (img) {
      const src = img.getAttribute("src") || img.getAttribute("data-src") || img.getAttribute("data-original") || "";
      if (src) return src;
    }
    const inline = display.getAttribute("style") || "";
    let m = inline.match(/background-image\s*:\s*url\((['"]?)(.*?)\1\)/i);
    if (m && m[2]) return m[2];
    try {
      const view = display.ownerDocument && display.ownerDocument.defaultView || window;
      const computed = view.getComputedStyle(display).backgroundImage || "";
      m = computed.match(/url\((['"]?)(.*?)\1\)/i);
      if (m && m[2] && m[2] !== "none") return m[2];
    } catch (e) {
    }
    return "";
  }
  function parse4(element, { document }) {
    const cell1 = [document.createComment(" field:image ")];
    const bgUrl = extractBgUrl2(element);
    if (bgUrl) {
      const pic = document.createElement("picture");
      const img = document.createElement("img");
      img.src = bgUrl;
      img.alt = "";
      pic.appendChild(img);
      cell1.push(pic);
    }
    const cell2 = [document.createComment(" field:text ")];
    const content = element.querySelector(".abbv-background-container-content .abbv-rich-text");
    if (content) {
      const paras = content.querySelectorAll(":scope > p");
      paras.forEach((p) => {
        if (!p.textContent.trim()) return;
        const np = document.createElement("p");
        np.innerHTML = p.innerHTML;
        cell2.push(np);
      });
    }
    const cells = [];
    cells.push([cell1]);
    cells.push([cell2]);
    const block = WebImporter.Blocks.createBlock(document, { name: "promo-tout", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/rinvoq-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [".owl-item.cloned"]);
      const realSlides = element.querySelectorAll(".owl-item");
      realSlides.forEach((slide, i) => {
        if (i > 0) slide.remove();
      });
      WebImporter.DOMUtils.remove(element, [".owl-nav", ".owl-dots"]);
      WebImporter.DOMUtils.remove(element, ["#onetrust-consent-sdk"]);
      WebImporter.DOMUtils.remove(element, [".modal.parbase", ".abbv-modal"]);
      WebImporter.DOMUtils.remove(element, [".grecaptcha-badge"]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [".header-v2.parbase"]);
      WebImporter.DOMUtils.remove(element, ["header.abbv-header-v2"]);
      WebImporter.DOMUtils.remove(element, [".abbv-slimEyebrow"]);
      WebImporter.DOMUtils.remove(element, [".abbv-sticky-anchor"]);
      WebImporter.DOMUtils.remove(element, ["footer.abbv-footer"]);
      WebImporter.DOMUtils.remove(element, [".footer.parbase"]);
      WebImporter.DOMUtils.remove(element, [".abbv-container.global-footer"]);
      WebImporter.DOMUtils.remove(element, [".abbv-inline-use-isi"]);
      WebImporter.DOMUtils.remove(element, [".abbv-inline-use"]);
      WebImporter.DOMUtils.remove(element, [".abbv-inline-safety"]);
      WebImporter.DOMUtils.remove(element, [".abbv-inline-miscisi"]);
      WebImporter.DOMUtils.remove(element, [".abbv-safety-bar"]);
      WebImporter.DOMUtils.remove(element, [".safety-bar.parbase"]);
      WebImporter.DOMUtils.remove(element, [".abbv-dimmer"]);
      WebImporter.DOMUtils.remove(element, [".abbv-back-to-top"]);
      WebImporter.DOMUtils.remove(element, [".newpar.new.section"]);
      WebImporter.DOMUtils.remove(element, [".par.iparys_inherited"]);
      WebImporter.DOMUtils.remove(element, ["iframe"]);
      WebImporter.DOMUtils.remove(element, ["link", "noscript", "script", "style"]);
      const svgImgs = element.querySelectorAll('img[src^="data:image/svg+xml"]');
      svgImgs.forEach((img) => img.remove());
      WebImporter.DOMUtils.remove(element, [".abbv-social-copy", "textarea", "input"]);
      WebImporter.DOMUtils.remove(element, [".abbv-skip-to-main-content", "a.sr-only"]);
      const trackers = element.querySelectorAll('img[src*="bluecava"], img[src*="doubleclick"], img[src*="scorecardresearch"], img[src*="pulsepoint"], img[src*="/ds.png"], img[src*="sync."]');
      trackers.forEach((img) => img.remove());
      const emptyAnchors = element.querySelectorAll('a[href="#"], a[href=""]');
      emptyAnchors.forEach((a) => {
        const txt = (a.textContent || "").replace(/[\s_]+/g, "").trim();
        if (!txt && !a.querySelector("img, picture")) a.remove();
      });
    }
  }

  // tools/importer/transformers/rinvoq-sections.js
  var H2 = { before: "beforeTransform", after: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === H2.after) {
      const doc = element.ownerDocument || element.getRootNode();
      const sections = payload && payload.template && payload.template.sections;
      if (!sections || sections.length < 2) return;
      const reversedSections = [...sections].reverse();
      for (const section of reversedSections) {
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) continue;
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(sectionMetadata);
        }
        if (section.id !== sections[0].id) {
          const hr = doc.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-rinvoq-homepage.js
  var parsers = {
    "rinvoq-hero": parse,
    "rinvoq-conditions": parse2,
    "rinvoq-savings": parse3,
    "rinvoq-speak": parse4
  };
  var transformers = [
    transform,
    transform2
  ];
  var PAGE_TEMPLATE = {
    name: "rinvoq-homepage",
    description: "RINVOQ homepage with hero, Choose Your Condition grid, $0/month savings card, About RINVOQ, SPEAK network, and Important Safety Information",
    urls: [
      "https://www.rinvoq.com/"
    ],
    blocks: [
      {
        name: "rinvoq-hero",
        instances: [".abbv-background-container.home-hero.home-bg-upa"]
      },
      {
        name: "rinvoq-conditions",
        instances: [".abbv-flex-container.homepage-cta-flex-box.conditions.home-box"]
      },
      {
        name: "rinvoq-savings",
        instances: [".abbv-container.background-yellow"]
      },
      {
        name: "rinvoq-speak",
        instances: [".abbv-background-container.black-brushstroke.homepage-speak-network"]
      }
    ],
    sections: [
      {
        id: "section-hero",
        name: "Hero",
        selector: ".abbv-background-container.home-hero.home-bg-upa",
        style: null,
        blocks: ["hero-pharma"],
        defaultContent: []
      },
      {
        id: "section-conditions",
        name: "Choose Your Condition",
        selector: ".abbv-container.p-0.abv-custom-bgcolor-light-grey",
        style: "light-grey",
        blocks: ["cards-feature"],
        defaultContent: []
      },
      {
        id: "section-savings",
        name: "Savings Offer",
        selector: ".abbv-container.background-lg-yellow-white.psa-two-col-section.two-cols",
        style: "yellow",
        blocks: ["promo-tout"],
        defaultContent: []
      },
      {
        id: "section-speak",
        name: "SPEAK Network",
        selector: ".abbv-background-container.black-brushstroke.homepage-speak-network",
        style: "dark",
        blocks: ["promo-tout"],
        defaultContent: []
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
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
  var import_rinvoq_homepage_default = {
    transform: (payload) => {
      var _a;
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
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
      const isiBlock = WebImporter.Blocks.createBlock(document, {
        name: "isi",
        cells: [["/isi"]]
      });
      main.appendChild(isiBlock);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const getMeta = (sel) => {
        var _a2, _b;
        return ((_b = (_a2 = document.querySelector(sel)) == null ? void 0 : _a2.getAttribute("content")) == null ? void 0 : _b.trim()) || "";
      };
      const metaCells = {
        Title: (((_a = document.querySelector("title")) == null ? void 0 : _a.textContent) || "").trim(),
        Description: getMeta('meta[name="description"]') || getMeta('meta[property="og:description"]'),
        Image: getMeta('meta[property="og:image"]') || getMeta('meta[name="twitter:image"]'),
        brand: "rinvoq"
      };
      const metaBlock = WebImporter.Blocks.createBlock(document, {
        name: "Metadata",
        cells: metaCells
      });
      main.appendChild(metaBlock);
      const path = "/rinvoq/index";
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
  return __toCommonJS(import_rinvoq_homepage_exports);
})();
