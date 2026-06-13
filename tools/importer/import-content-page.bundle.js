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

  // tools/importer/import-content-page.js
  var import_content_page_exports = {};
  __export(import_content_page_exports, {
    default: () => import_content_page_default
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

  // tools/importer/parsers/tabs-navigation.js
  function parse2(element, { document }) {
    const navLinks = element.querySelectorAll("ul.section-navigation-list > li > a, .section-navigation-list > li > a");
    const cells = [];
    navLinks.forEach((link) => {
      const linkText = link.textContent.trim();
      const linkHref = link.getAttribute("href") || "";
      if (!linkText) return;
      const titleCell = document.createDocumentFragment();
      titleCell.appendChild(document.createComment(" field:title "));
      const heading = document.createElement("h3");
      heading.textContent = linkText;
      titleCell.appendChild(heading);
      const contentCell = document.createDocumentFragment();
      contentCell.appendChild(document.createComment(" field:content_heading "));
      const contentHeading = document.createElement("h3");
      contentHeading.textContent = linkText;
      contentCell.appendChild(contentHeading);
      contentCell.appendChild(document.createComment(" field:content_richtext "));
      const anchor = document.createElement("a");
      anchor.href = linkHref;
      anchor.textContent = linkText;
      contentCell.appendChild(anchor);
      cells.push([titleCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-navigation", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-checklist.js
  function parse3(element, { document }) {
    const cardItems = element.querySelectorAll(":scope > .flexboxitem-v2");
    const cells = [];
    cardItems.forEach((card) => {
      const richText = card.querySelector(".abbv-rich-text");
      if (!richText) return;
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      const badge = richText.querySelector('p.circle, p[class*="circle"]');
      if (badge) {
        textFrag.appendChild(badge.cloneNode(true));
      }
      const checklist = richText.querySelector("ul");
      if (checklist) {
        textFrag.appendChild(checklist.cloneNode(true));
      }
      const paragraphs = richText.querySelectorAll(':scope > p:not(.circle):not([class*="circle"]):not(.footnote):not([class*="footnote"])');
      paragraphs.forEach((p) => {
        textFrag.appendChild(p.cloneNode(true));
      });
      const footnote = richText.querySelector('p.footnote, p[class*="footnote"]');
      if (footnote) {
        textFrag.appendChild(footnote.cloneNode(true));
      }
      const imageFrag = document.createDocumentFragment();
      cells.push([imageFrag, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-checklist", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon.js
  function parse4(element, { document }) {
    const cardItems = element.querySelectorAll(":scope > .flexboxitem-v2");
    const cells = [];
    cardItems.forEach((card) => {
      const image = card.querySelector(".abbv-image-content-container-v2 img");
      const cardBody = card.querySelector(".abbv-stretched-card-body");
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
      if (cardBody) {
        const children = cardBody.querySelectorAll(":scope > *");
        if (children.length > 0) {
          children.forEach((child) => {
            textCell.appendChild(child.cloneNode(true));
          });
        } else {
          const p = document.createElement("p");
          p.innerHTML = cardBody.innerHTML;
          textCell.appendChild(p);
        }
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-icon", cells });
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

  // tools/importer/parsers/video-playlist.js
  function parse6(element, { document }) {
    const videoJsEl = element.querySelector("video-js[data-account][data-player]");
    let videoUrl = "";
    if (videoJsEl) {
      const accountId = videoJsEl.getAttribute("data-account");
      const playerId = videoJsEl.getAttribute("data-player");
      const playlistId = videoJsEl.getAttribute("data-playlist-id");
      if (accountId && playerId && playlistId) {
        videoUrl = `https://players.brightcove.net/${accountId}/${playerId}_default/index.html?playlistId=${playlistId}`;
      } else if (accountId && playerId) {
        videoUrl = `https://players.brightcove.net/${accountId}/${playerId}_default/index.html`;
      }
    }
    if (!videoUrl) {
      const iframe = element.querySelector('iframe[src*="brightcove"], iframe[data-src*="brightcove"]');
      if (iframe) {
        videoUrl = iframe.getAttribute("src") || iframe.getAttribute("data-src") || "";
      }
    }
    let placeholderSrc = "";
    let placeholderAlt = "";
    if (videoJsEl) {
      const poster = videoJsEl.getAttribute("poster");
      if (poster) {
        placeholderSrc = poster;
      }
    }
    if (!placeholderSrc) {
      const firstThumb = element.querySelector(".vjs-playlist-item img[src]");
      if (firstThumb) {
        placeholderSrc = firstThumb.getAttribute("src").replace("/160x90/", "/1280x720/");
        placeholderAlt = firstThumb.getAttribute("alt") || "";
      }
    }
    if (!placeholderSrc) {
      const posterImg = element.querySelector('.vjs-poster img[src]:not([src=""])');
      if (posterImg) {
        placeholderSrc = posterImg.getAttribute("src");
        placeholderAlt = posterImg.getAttribute("alt") || "";
      }
    }
    const uriCell = document.createDocumentFragment();
    uriCell.appendChild(document.createComment(" field:uri "));
    if (videoUrl) {
      const link = document.createElement("a");
      link.href = videoUrl;
      link.textContent = videoUrl;
      uriCell.appendChild(link);
    }
    const cells = [[uriCell]];
    if (placeholderSrc) {
      const placeholderCell = document.createDocumentFragment();
      placeholderCell.appendChild(document.createComment(" field:placeholder_image "));
      const picture = document.createElement("picture");
      const img = document.createElement("img");
      img.src = placeholderSrc;
      img.alt = placeholderAlt;
      picture.appendChild(img);
      placeholderCell.appendChild(picture);
      cells.push([placeholderCell]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "video-playlist", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/video-single.js
  function parse7(element, { document }) {
    const videoJsEl = element.querySelector("video-js[data-video-id], [data-video-id]");
    const videoId = videoJsEl ? (videoJsEl.getAttribute("data-video-id") || "").trim() : "";
    let posterSrc = "";
    const posterEl = element.querySelector("[poster]");
    if (posterEl) posterSrc = posterEl.getAttribute("poster") || "";
    if (!posterSrc) {
      const img = element.querySelector(".vjs-poster img, img");
      if (img) posterSrc = img.getAttribute("src") || "";
    }
    const h3 = element.querySelector("h3");
    const transcriptLink = element.querySelector('a[href*="transcript"]');
    const imageFrag = document.createDocumentFragment();
    imageFrag.appendChild(document.createComment(" field:image "));
    if (posterSrc) {
      const picture = document.createElement("picture");
      const img = document.createElement("img");
      img.src = posterSrc;
      img.alt = videoId;
      picture.appendChild(img);
      imageFrag.appendChild(picture);
    }
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(" field:text "));
    if (h3) {
      const title = document.createElement("h3");
      title.textContent = h3.textContent.trim();
      textFrag.appendChild(title);
    }
    if (transcriptLink) {
      const link = document.createElement("a");
      link.href = transcriptLink.getAttribute("href");
      link.textContent = transcriptLink.textContent.trim();
      textFrag.appendChild(link);
    }
    const cells = [
      [imageFrag],
      [textFrag]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "video-single", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/promo-tout.js
  function parse8(element, { document }) {
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
      cell1.unshift(document.createComment(" field:image "));
      cell2.unshift(document.createComment(" field:text "));
      cells.push([cell1]);
      cells.push([cell2]);
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
      cell1.unshift(document.createComment(" field:image "));
      cell2.unshift(document.createComment(" field:text "));
      cells.push([cell1]);
      cells.push([cell2]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "promo-tout", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-cta.js
  function parse9(element, { document }) {
    const columnItems = element.querySelectorAll(":scope > .flexboxitem-v2");
    const cells = [];
    const row = [];
    columnItems.forEach((col) => {
      const cell = [];
      const heading = col.querySelector('.heading-2, .heading-3, h2, h3, [class*="heading"]');
      if (heading) {
        cell.push(heading);
      }
      const cta = col.querySelector('a.abbv-button-primary, a[class*="abbv-button"], .cta a');
      if (cta) {
        cell.push(cta);
      }
      row.push(cell);
    });
    if (row.length === 0) {
      const flexItems = element.querySelectorAll(".abbv-flex-item-v2");
      flexItems.forEach((item) => {
        const cell = [];
        const heading = item.querySelector('.heading-2, .heading-3, h2, h3, [class*="heading"]');
        if (heading) {
          cell.push(heading);
        }
        const cta = item.querySelector('a.abbv-button-primary, a[class*="abbv-button"], .cta a');
        if (cta) {
          cell.push(cta);
        }
        row.push(cell);
      });
    }
    if (row.length > 0) {
      cells.push(row);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-cta", cells });
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
        ".modal.parbase"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".grecaptcha-badge"
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [".header-v2.parbase"]);
      WebImporter.DOMUtils.remove(element, [".linzess-top-banner"]);
      WebImporter.DOMUtils.remove(element, [".abbv-sticky-anchor"]);
      WebImporter.DOMUtils.remove(element, ["footer.abbv-footer"]);
      WebImporter.DOMUtils.remove(element, [".footer.parbase"]);
      WebImporter.DOMUtils.remove(element, [".abbv-inline-use-isi"]);
      WebImporter.DOMUtils.remove(element, [".abbv-inline-safety"]);
      WebImporter.DOMUtils.remove(element, [".abbv-inline-miscisi"]);
      WebImporter.DOMUtils.remove(element, [".safety-bar.parbase"]);
      WebImporter.DOMUtils.remove(element, [".abbv-dimmer"]);
      WebImporter.DOMUtils.remove(element, [".abbv-back-to-top"]);
      WebImporter.DOMUtils.remove(element, [".newpar.new.section"]);
      WebImporter.DOMUtils.remove(element, [".par.iparys_inherited"]);
      WebImporter.DOMUtils.remove(element, ["iframe"]);
      WebImporter.DOMUtils.remove(element, ["link", "noscript"]);
      const svgImgs = element.querySelectorAll('img[src^="data:image/svg+xml"]');
      svgImgs.forEach((img) => img.remove());
      WebImporter.DOMUtils.remove(element, [".abbv-social-copy"]);
      WebImporter.DOMUtils.remove(element, ["textarea"]);
      const videoPlayers = element.querySelectorAll(".vjs-control-bar, .vjs-loading-spinner, .vjs-text-track-display, .vjs-modal-dialog, .vjs-error-display, .vjs-dock-text, .vjs-poster[tabindex]");
      videoPlayers.forEach((el) => el.remove());
      const vjsElements = element.querySelectorAll('[class*="vjs-"]:not(video-js):not(.vjs-poster):not(.vjs-tech)');
      vjsElements.forEach((el) => {
        if (el.closest("video-js") || el.closest(".abbv-video-player")) {
          if (!el.classList.contains("vjs-poster") && el.tagName !== "VIDEO") {
            el.remove();
          }
        }
      });
      WebImporter.DOMUtils.remove(element, ['script[src*="vjs"], script[src*="brightcove"], script[src*="videojs"]']);
    }
  }

  // tools/importer/transformers/linzess-sections.js
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

  // tools/importer/import-content-page.js
  var parsers = {
    "hero-pharma": parse,
    "tabs-navigation": parse2,
    "cards-checklist": parse3,
    "cards-icon": parse4,
    "cards-video": parse5,
    "video-playlist": parse6,
    "video-single": parse7,
    "promo-tout": parse8,
    "columns-cta": parse9
  };
  var transformers = [
    transform,
    transform2
  ];
  var PAGE_TEMPLATE = {
    name: "content-page",
    description: "Main section content pages with hero, multiple content sections, CTAs, and informational blocks",
    urls: [
      "https://www.linzess.com/why-linzess",
      "https://www.linzess.com/understanding-constipation",
      "https://www.linzess.com/find-relief",
      "https://www.linzess.com/resources",
      "https://www.linzess.com/savings-and-support"
    ],
    blocks: [
      {
        name: "hero-pharma",
        instances: [".hero-container.abbv-image-text-v2"]
      },
      {
        name: "tabs-navigation",
        instances: [".abbv-section-navigation.abbv-sticky"]
      },
      {
        name: "cards-checklist",
        instances: [
          ".abbv-flex-container-v2.flexbox-cards.c-dark-purple.margin-top-80.howlinz-flex",
          ".abbv-flex-container-v2.flexbox-cards.c-dark-purple.margin-top-40"
        ]
      },
      {
        name: "cards-icon",
        instances: [
          ".abbv-flex-container-v2.flexbox-column.max-690.how-linz-works",
          ".abbv-flex-container-v2.flexbox-column.why-linz-sideeffects.max-690"
        ]
      },
      {
        name: "cards-video",
        instances: [".abbv-flex-container-v2.flexbox-video-cards.why-linz-video-cards"]
      },
      {
        name: "video-playlist",
        instances: [".abbv-video-player.abbv-video-playlist.abbv-playlist-type-carousel"]
      },
      {
        name: "video-single",
        instances: [".abbv-flex-container-v2.flexbox-video-cards.flexbox-video-cards--single"]
      },
      {
        name: "promo-tout",
        instances: [".abbv-row-container.savings-card-tout"]
      },
      {
        name: "columns-cta",
        instances: [".abbv-container.background-dark-purple.bottom-nav .abbv-flex-container-v2"]
      },
      {
        name: "fragment",
        instances: [".isi-bar"]
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
        id: "section-navigation",
        name: "Section Navigation",
        selector: ".section-navigation.parbase",
        style: null,
        blocks: ["tabs-navigation"],
        defaultContent: []
      },
      {
        id: "section-how-can-help",
        name: "How LINZESS Can Help",
        selector: ".abbv-container.background-white.background-white-arc:first-of-type",
        style: "white",
        blocks: ["cards-checklist"],
        defaultContent: [".abbv-rich-text:has(.eyebrow)", ".button-container:has(a[href*='gutcheck'])"]
      },
      {
        id: "section-how-works",
        name: "How LINZESS Works",
        selector: ".abbv-container.background-dark-purple.background-dark-purple-arc:first-of-type",
        style: "dark-purple",
        blocks: ["cards-icon", "cards-checklist", "cards-video"],
        defaultContent: [".abbv-rich-text.c-linz-white"]
      },
      {
        id: "section-side-effects",
        name: "Side Effects",
        selector: ".abbv-container.background-off-white.background-off-white-arc",
        style: "off-white",
        blocks: ["cards-icon"],
        defaultContent: [".abbv-rich-text:has(.eyebrow)", ".abbv-rich-text:has(a[href*='fda.gov'])"]
      },
      {
        id: "section-patient-experiences",
        name: "Patient Experiences",
        selector: ".abbv-container.background-white.background-white-arc.text-align-center",
        style: "white",
        blocks: ["video-playlist", "promo-tout"],
        defaultContent: [".abbv-rich-text:has(.eyebrow)", ".abbv-rich-text.footnote"]
      },
      {
        id: "section-bottom-nav",
        name: "Bottom Navigation",
        selector: ".abbv-container.background-dark-purple.bottom-nav",
        style: "dark-purple",
        blocks: ["columns-cta"],
        defaultContent: []
      },
      {
        id: "section-isi",
        name: "ISI",
        selector: ".isi-bar",
        style: null,
        blocks: ["fragment"],
        defaultContent: []
      }
    ]
  };
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
    return pageBlocks;
  }
  var import_content_page_default = {
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
  return __toCommonJS(import_content_page_exports);
})();
