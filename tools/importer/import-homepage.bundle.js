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

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-pharma.js
  function parse(element, { document }) {
    const picture = element.querySelector(".abbv-image-content-container-v2 picture");
    const contentContainer = element.querySelector(".abbv-image-text-content-v2 .abbv-image-text-display-v2 .abbv-stretched-card-body");
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(" field:text "));
    if (contentContainer) {
      const children = contentContainer.querySelectorAll(":scope > p, :scope > h1, :scope > h2, :scope > a");
      children.forEach((child) => {
        textFrag.appendChild(child);
      });
    }
    const imageFrag = document.createDocumentFragment();
    imageFrag.appendChild(document.createComment(" field:image "));
    if (picture) {
      imageFrag.appendChild(picture);
    }
    const cells = [
      [imageFrag],
      [textFrag]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-pharma", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-promo.js
  function parse2(element, { document }) {
    const columns = element.querySelectorAll(":scope .abbv-col");
    const cells = [];
    if (columns.length >= 2) {
      const imageCol = columns[0];
      const image = imageCol.querySelector("picture") || imageCol.querySelector("img");
      const cell1 = [];
      if (image) {
        cell1.push(image);
      }
      const textCol = columns[1];
      const cell2 = [];
      const heading = textCol.querySelector('.heading-2, .heading-3, h2, h3, [class*="heading"]');
      if (heading) {
        cell2.push(heading);
      }
      const descriptions = textCol.querySelectorAll('p:not([class*="heading"]):not(.heading-2):not(.heading-3)');
      descriptions.forEach((desc) => {
        if (desc.textContent.trim()) {
          cell2.push(desc);
        }
      });
      const ctas = textCol.querySelectorAll('a.abbv-button-primary, a.abbv-button-secondary, a[class*="abbv-button"], .cta a');
      ctas.forEach((cta) => {
        cell2.push(cta);
      });
      cells.push([cell1, cell2]);
    } else {
      const image = element.querySelector("picture") || element.querySelector("img");
      const heading = element.querySelector('.heading-2, .heading-3, h2, h3, [class*="heading"]');
      const ctas = element.querySelectorAll('a.abbv-button-primary, a.abbv-button-secondary, a[class*="abbv-button"], .cta a');
      const cell1 = [];
      if (image) {
        cell1.push(image);
      }
      const cell2 = [];
      if (heading) {
        cell2.push(heading);
      }
      ctas.forEach((cta) => {
        cell2.push(cta);
      });
      cells.push([cell1, cell2]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-feature.js
  function parse3(element, { document }) {
    const cardItems = element.querySelectorAll(":scope > .flexboxitem-v2");
    const cells = [];
    cardItems.forEach((card) => {
      const image = card.querySelector(".abbv-image-content-container-v2 img, .abbv-flex-item-v2 picture img, .abbv-flex-item-v2 img");
      const heading = card.querySelector(".abbv-stretched-card-body p.heading-2, .abbv-stretched-card-body h2, .abbv-flex-item-v2 p.heading-2");
      const description = card.querySelector(".abbv-stretched-card-body p:not(.heading-2), .abbv-flex-item-v2 .abbv-image-text-content-v2 p:not(.heading-2)");
      const cta = card.querySelector(".cta.parbase a, .cta a, .abbv-flex-item-v2 a[href]");
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(" field:image "));
      if (image) {
        const pic = document.createElement("picture");
        const img = document.createElement("img");
        img.src = image.src || image.getAttribute("src") || "";
        img.alt = image.alt || image.getAttribute("alt") || "";
        pic.appendChild(img);
        imageCell.appendChild(pic);
      }
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      if (heading) {
        const h2 = document.createElement("h2");
        h2.innerHTML = heading.innerHTML;
        textCell.appendChild(h2);
      }
      if (description) {
        const p = document.createElement("p");
        p.innerHTML = description.innerHTML;
        textCell.appendChild(p);
      }
      if (cta) {
        const link = document.createElement("a");
        link.href = cta.getAttribute("href") || "";
        link.textContent = cta.textContent.trim();
        textCell.appendChild(link);
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-stats.js
  function parse4(element, { document }) {
    const cardItems = element.querySelectorAll(":scope > .flexboxitem-v2 .abbv-flex-item-v2");
    const cells = [];
    cardItems.forEach((card) => {
      const richText = card.querySelector(".abbv-rich-text");
      if (!richText) return;
      const statParagraph = richText.querySelector('p.circle, p[class*="circle"]');
      const descParagraph = richText.querySelector('p.mb24-m, p:not(.circle):not([class*="circle"])');
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      if (statParagraph) {
        const statClone = statParagraph.cloneNode(true);
        textFrag.appendChild(statClone);
      }
      if (descParagraph) {
        const descClone = descParagraph.cloneNode(true);
        textFrag.appendChild(descClone);
      }
      cells.push(["", textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-stats", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-video.js
  function parse5(element, { document }) {
    const cardItems = element.querySelectorAll(":scope > .flexboxitem-v2");
    const cells = [];
    cardItems.forEach((cardItem) => {
      const posterImg = cardItem.querySelector('.vjs-poster img[src]:not([src=""])') || cardItem.querySelector('.abbv-video-container img[src]:not([src=""]):not(.vjs-thumbnail-image)') || cardItem.querySelector('video-js img[src]:not([src=""]):not(.vjs-thumbnail-image)');
      const videoEl = cardItem.querySelector("video[poster]");
      const videoJsEl = cardItem.querySelector("video-js[poster]");
      const contentArea = cardItem.querySelector(".abbv-video-content");
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(" field:image "));
      if (posterImg) {
        const img = document.createElement("img");
        img.src = posterImg.getAttribute("src") || "";
        img.alt = posterImg.getAttribute("alt") || "";
        imageCell.appendChild(img);
      } else if (videoEl && videoEl.getAttribute("poster")) {
        const img = document.createElement("img");
        img.src = videoEl.getAttribute("poster");
        img.alt = "";
        imageCell.appendChild(img);
      }
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      if (contentArea) {
        const heading = contentArea.querySelector("h3, h2, h4");
        if (heading) {
          const h = document.createElement(heading.tagName.toLowerCase());
          h.textContent = heading.textContent.trim();
          textCell.appendChild(h);
        }
        const paragraphs = contentArea.querySelectorAll("p");
        let deepestP = null;
        paragraphs.forEach((p) => {
          var _a;
          if (p.querySelector("span") || ((_a = p.childNodes[0]) == null ? void 0 : _a.nodeType) === 3) {
            deepestP = p;
          }
        });
        if (deepestP) {
          let quoteText = "";
          for (const node of deepestP.childNodes) {
            if (node.nodeType === 3) {
              quoteText += node.textContent;
            } else if (node.nodeName === "SPAN") {
              break;
            }
          }
          quoteText = quoteText.trim();
          if (quoteText) {
            const p = document.createElement("p");
            p.textContent = quoteText;
            textCell.appendChild(p);
          }
          const spans = deepestP.querySelectorAll(":scope > span");
          spans.forEach((span) => {
            const spanText = span.textContent.trim();
            if (spanText) {
              const p = document.createElement("p");
              p.textContent = spanText;
              textCell.appendChild(p);
            }
          });
        }
        const transcriptLink = contentArea.querySelector('a.transcript-link, a[href*="transcript"]');
        if (transcriptLink) {
          const a = document.createElement("a");
          a.href = transcriptLink.getAttribute("href") || "";
          a.textContent = transcriptLink.textContent.trim();
          textCell.appendChild(a);
        }
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/linzess-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".abbv-modal"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".grecaptcha-badge"
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, ["header.abbv-header-v2"]);
      WebImporter.DOMUtils.remove(element, [".linzess-top-banner"]);
      WebImporter.DOMUtils.remove(element, [".abbv-sticky-anchor"]);
      WebImporter.DOMUtils.remove(element, ["footer.abbv-footer"]);
      WebImporter.DOMUtils.remove(element, [".abbv-inline-use-isi"]);
      WebImporter.DOMUtils.remove(element, [".abbv-inline-miscisi"]);
      WebImporter.DOMUtils.remove(element, [".safety-bar.parbase"]);
      WebImporter.DOMUtils.remove(element, [".newpar.new.section"]);
      WebImporter.DOMUtils.remove(element, [".par.iparys_inherited"]);
      WebImporter.DOMUtils.remove(element, ["iframe"]);
      WebImporter.DOMUtils.remove(element, ["link", "noscript"]);
      const svgImgs = element.querySelectorAll('img[src^="data:image/svg+xml"]');
      svgImgs.forEach((img) => img.remove());
      WebImporter.DOMUtils.remove(element, [".abbv-social-copy"]);
      WebImporter.DOMUtils.remove(element, ["textarea"]);
      WebImporter.DOMUtils.remove(element, [".footer.parbase"]);
    }
  }

  // tools/importer/transformers/linzess-sections.js
  var H2 = { before: "beforeTransform", after: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === H2.after) {
      const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document: element.getRootNode() };
      const doc = document || element.ownerDocument || element.getRootNode();
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

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-pharma": parse,
    "columns-promo": parse2,
    "cards-feature": parse3,
    "cards-stats": parse4,
    "cards-video": parse5
  };
  var transformers = [
    transform,
    transform2
  ];
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Linzess homepage with hero banner, content cards, statistics, patient video testimonials, savings offer, and Important Safety Information",
    urls: [
      "https://www.linzess.com/"
    ],
    blocks: [
      {
        name: "hero-pharma",
        instances: [".image-text-v2.parbase > .hero-container"]
      },
      {
        name: "columns-promo",
        instances: [".abbv-row-container.eligible-tout", ".abbv-row-container.background-off-white.image-text-wrapper:not(.savings-card-tout)", ".abbv-row-container.savings-card-tout"]
      },
      {
        name: "cards-feature",
        instances: [".abbv-flex-container-v2.flexbox-cards.margin-top-110"]
      },
      {
        name: "cards-stats",
        instances: [".abbv-flex-container-v2.flexbox-cards.c-dark-purple.margin-top-80"]
      },
      {
        name: "cards-video",
        instances: [".abbv-flex-container-v2.flexbox-video-cards"]
      }
    ],
    sections: [
      {
        id: "section-hero",
        name: "Hero",
        selector: ".image-text-v2.parbase:first-of-type",
        style: null,
        blocks: ["hero-pharma"],
        defaultContent: []
      },
      {
        id: "section-content-cards",
        name: "Content Cards",
        selector: ".abbv-container.background-white.home-background-white-arc",
        style: "white",
        blocks: ["columns-promo", "cards-feature", "columns-promo"],
        defaultContent: [".abbv-rich-text.ibs-brief-section"]
      },
      {
        id: "section-stats-experiences",
        name: "Statistics and Patient Experiences",
        selector: ".abbv-container.background-dark-purple.background-dark-purple-arc",
        style: "dark-purple",
        blocks: ["cards-stats", "cards-video"],
        defaultContent: [".abbv-rich-text.max-690.c-linz-white.mb20-m", ".abbv-rich-text.max-720.c-linz-white"]
      },
      {
        id: "section-savings",
        name: "Savings Offer",
        selector: ".abbv-container.background-white.background-white-arc.pb24-m",
        style: "white",
        blocks: ["columns-promo"],
        defaultContent: [".abbv-rich-text.max-690.c-linz-dark-purple", ".abbv-rich-text.footnote.max-auto"]
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
  var import_homepage_default = {
    transform: (payload) => {
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
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
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
  return __toCommonJS(import_homepage_exports);
})();
