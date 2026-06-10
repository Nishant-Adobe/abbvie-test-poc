/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroPharmaParser from './parsers/hero-pharma.js';
import tabsNavigationParser from './parsers/tabs-navigation.js';
import cardsChecklistParser from './parsers/cards-checklist.js';
import cardsIconParser from './parsers/cards-icon.js';
import cardsVideoParser from './parsers/cards-video.js';
import videoPlaylistParser from './parsers/video-playlist.js';
import columnsPromoParser from './parsers/columns-promo.js';
import columnsCtaParser from './parsers/columns-cta.js';

// TRANSFORMER IMPORTS
import linzessCleanupTransformer from './transformers/linzess-cleanup.js';
import linzessSectionsTransformer from './transformers/linzess-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-pharma': heroPharmaParser,
  'tabs-navigation': tabsNavigationParser,
  'cards-checklist': cardsChecklistParser,
  'cards-icon': cardsIconParser,
  'cards-video': cardsVideoParser,
  'video-playlist': videoPlaylistParser,
  'columns-promo': columnsPromoParser,
  'columns-cta': columnsCtaParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  linzessCleanupTransformer,
  linzessSectionsTransformer,
];

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'content-page',
  description: 'Main section content pages with hero, multiple content sections, CTAs, and informational blocks',
  urls: [
    'https://www.linzess.com/why-linzess',
    'https://www.linzess.com/understanding-constipation',
    'https://www.linzess.com/find-relief',
    'https://www.linzess.com/resources',
    'https://www.linzess.com/savings-and-support',
  ],
  blocks: [
    {
      name: 'hero-pharma',
      instances: ['.hero-container.abbv-image-text-v2'],
    },
    {
      name: 'tabs-navigation',
      instances: ['.abbv-section-navigation.abbv-sticky'],
    },
    {
      name: 'cards-checklist',
      instances: [
        '.abbv-flex-container-v2.flexbox-cards.c-dark-purple.margin-top-80.howlinz-flex',
        '.abbv-flex-container-v2.flexbox-cards.c-dark-purple.margin-top-40',
      ],
    },
    {
      name: 'cards-icon',
      instances: [
        '.abbv-flex-container-v2.flexbox-column.max-690.how-linz-works',
        '.abbv-flex-container-v2.flexbox-column.why-linz-sideeffects.max-690',
      ],
    },
    {
      name: 'cards-video',
      instances: ['.abbv-flex-container-v2.flexbox-video-cards.why-linz-video-cards'],
    },
    {
      name: 'video-playlist',
      instances: ['.abbv-video-player.abbv-video-playlist.abbv-playlist-type-carousel'],
    },
    {
      name: 'columns-promo',
      instances: ['.abbv-row-container.savings-card-tout'],
    },
    {
      name: 'columns-cta',
      instances: ['.abbv-container.background-dark-purple.bottom-nav .abbv-flex-container-v2'],
    },
    {
      name: 'fragment',
      instances: ['.isi-bar'],
    },
  ],
  sections: [
    {
      id: 'section-hero',
      name: 'Hero',
      selector: '.image-text-v2.parbase:first-of-type',
      style: null,
      blocks: ['hero-pharma'],
      defaultContent: [],
    },
    {
      id: 'section-navigation',
      name: 'Section Navigation',
      selector: '.section-navigation.parbase',
      style: null,
      blocks: ['tabs-navigation'],
      defaultContent: [],
    },
    {
      id: 'section-how-can-help',
      name: 'How LINZESS Can Help',
      selector: '.abbv-container.background-white.background-white-arc:first-of-type',
      style: 'white',
      blocks: ['cards-checklist'],
      defaultContent: ['.abbv-rich-text:has(.eyebrow)', ".button-container:has(a[href*='gutcheck'])"],
    },
    {
      id: 'section-how-works',
      name: 'How LINZESS Works',
      selector: '.abbv-container.background-dark-purple.background-dark-purple-arc:first-of-type',
      style: 'dark-purple',
      blocks: ['cards-icon', 'cards-checklist', 'cards-video'],
      defaultContent: ['.abbv-rich-text.c-linz-white'],
    },
    {
      id: 'section-side-effects',
      name: 'Side Effects',
      selector: '.abbv-container.background-off-white.background-off-white-arc',
      style: 'off-white',
      blocks: ['cards-icon'],
      defaultContent: ['.abbv-rich-text:has(.eyebrow)', ".abbv-rich-text:has(a[href*='fda.gov'])"],
    },
    {
      id: 'section-patient-experiences',
      name: 'Patient Experiences',
      selector: '.abbv-container.background-white.background-white-arc.text-align-center',
      style: 'white',
      blocks: ['video-playlist', 'columns-promo'],
      defaultContent: ['.abbv-rich-text:has(.eyebrow)', '.abbv-rich-text.footnote'],
    },
    {
      id: 'section-bottom-nav',
      name: 'Bottom Navigation',
      selector: '.abbv-container.background-dark-purple.bottom-nav',
      style: 'dark-purple',
      blocks: ['columns-cta'],
      defaultContent: [],
    },
    {
      id: 'section-isi',
      name: 'ISI',
      selector: '.isi-bar',
      style: null,
      blocks: ['fragment'],
      defaultContent: [],
    },
  ],
};

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
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
          section: blockDef.section || null,
        });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    // 1. Execute beforeTransform transformers
    executeTransformers('beforeTransform', main, payload);

    // 2. Find and parse blocks
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

    // 3. Execute afterTransform transformers (section breaks + final cleanup)
    executeTransformers('afterTransform', main, payload);

    // 4. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 5. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
