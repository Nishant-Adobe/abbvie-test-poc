/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroPharmaParser from './parsers/hero-pharma.js';
import columnsPromoParser from './parsers/columns-promo.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import cardsStatsParser from './parsers/cards-stats.js';
import cardsVideoParser from './parsers/cards-video.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/linzess-cleanup.js';
import sectionsTransformer from './transformers/linzess-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-pharma': heroPharmaParser,
  'columns-promo': columnsPromoParser,
  'cards-feature': cardsFeatureParser,
  'cards-stats': cardsStatsParser,
  'cards-video': cardsVideoParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  sectionsTransformer,
];

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Linzess homepage with hero banner, content cards, statistics, patient video testimonials, savings offer, and Important Safety Information',
  urls: [
    'https://www.linzess.com/',
  ],
  blocks: [
    {
      name: 'hero-pharma',
      instances: ['.image-text-v2.parbase > .hero-container'],
    },
    {
      name: 'columns-promo',
      instances: ['.abbv-row-container.eligible-tout', '.abbv-row-container.background-off-white.image-text-wrapper:not(.savings-card-tout)', '.abbv-row-container.savings-card-tout'],
    },
    {
      name: 'cards-feature',
      instances: ['.abbv-flex-container-v2.flexbox-cards.margin-top-110'],
    },
    {
      name: 'cards-stats',
      instances: ['.abbv-flex-container-v2.flexbox-cards.c-dark-purple.margin-top-80'],
    },
    {
      name: 'cards-video',
      instances: ['.abbv-flex-container-v2.flexbox-video-cards'],
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
      id: 'section-content-cards',
      name: 'Content Cards',
      selector: '.abbv-container.background-white.home-background-white-arc',
      style: 'white',
      blocks: ['columns-promo', 'cards-feature', 'columns-promo'],
      defaultContent: ['.abbv-rich-text.ibs-brief-section'],
    },
    {
      id: 'section-stats-experiences',
      name: 'Statistics and Patient Experiences',
      selector: '.abbv-container.background-dark-purple.background-dark-purple-arc',
      style: 'dark-purple',
      blocks: ['cards-stats', 'cards-video'],
      defaultContent: ['.abbv-rich-text.max-690.c-linz-white.mb20-m', '.abbv-rich-text.max-720.c-linz-white'],
    },
    {
      id: 'section-savings',
      name: 'Savings Offer',
      selector: '.abbv-container.background-white.background-white-arc.pb24-m',
      style: 'white',
      blocks: ['columns-promo'],
      defaultContent: ['.abbv-rich-text.max-690.c-linz-dark-purple', '.abbv-rich-text.footnote.max-auto'],
    },
  ],
};

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
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
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
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

    // 4. Execute afterTransform transformers (final cleanup + section breaks)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index',
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
