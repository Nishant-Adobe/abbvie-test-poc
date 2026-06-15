/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import rinvoqHeroParser from './parsers/rinvoq-hero.js';
import rinvoqConditionsParser from './parsers/rinvoq-conditions.js';
import rinvoqSavingsParser from './parsers/rinvoq-savings.js';
import rinvoqSpeakParser from './parsers/rinvoq-speak.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/rinvoq-cleanup.js';
import sectionsTransformer from './transformers/rinvoq-sections.js';

// PARSER REGISTRY
// Note: multiple RINVOQ block instances map to the shared promo-tout decorator,
// but need different source parsers, so we key parsers by a synthetic block name
// and override the emitted block name inside each parser.
const parsers = {
  'rinvoq-hero': rinvoqHeroParser,
  'rinvoq-conditions': rinvoqConditionsParser,
  'rinvoq-savings': rinvoqSavingsParser,
  'rinvoq-speak': rinvoqSpeakParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  sectionsTransformer,
];

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'rinvoq-homepage',
  description: 'RINVOQ homepage with hero, Choose Your Condition grid, $0/month savings card, About RINVOQ, SPEAK network, and Important Safety Information',
  urls: [
    'https://www.rinvoq.com/',
  ],
  blocks: [
    {
      name: 'rinvoq-hero',
      instances: ['.abbv-background-container.home-hero.home-bg-upa'],
    },
    {
      name: 'rinvoq-conditions',
      instances: ['.abbv-flex-container.homepage-cta-flex-box.conditions.home-box'],
    },
    {
      name: 'rinvoq-savings',
      instances: ['.abbv-container.background-yellow'],
    },
    {
      name: 'rinvoq-speak',
      instances: ['.abbv-background-container.black-brushstroke.homepage-speak-network'],
    },
  ],
  sections: [
    {
      id: 'section-hero',
      name: 'Hero',
      selector: '.abbv-background-container.home-hero.home-bg-upa',
      style: null,
      blocks: ['hero-pharma'],
      defaultContent: [],
    },
    {
      id: 'section-conditions',
      name: 'Choose Your Condition',
      selector: '.abbv-container.p-0.abv-custom-bgcolor-light-grey',
      style: 'light-grey',
      blocks: ['cards-feature'],
      defaultContent: [],
    },
    {
      id: 'section-savings',
      name: 'Savings Offer',
      selector: '.abbv-container.background-lg-yellow-white.psa-two-col-section.two-cols',
      style: 'yellow',
      blocks: ['promo-tout'],
      defaultContent: [],
    },
    {
      id: 'section-speak',
      name: 'SPEAK Network',
      selector: '.abbv-background-container.black-brushstroke.homepage-speak-network',
      style: 'dark',
      blocks: ['promo-tout'],
      defaultContent: [],
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

    // 1. Execute beforeTransform transformers (initial cleanup + carousel collapse)
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

    // Author the ISI block referencing the /isi fragment (same pattern as the
    // Linzess homepage: <div class="isi">/isi</div>). The shared isi decorator
    // resolves /isi to the brand's fragment (/content/rinvoq/isi), rendering the
    // inline use-statement + sticky "Expand Safety Information" Boxed Warning.
    const isiBlock = WebImporter.Blocks.createBlock(document, {
      name: 'isi',
      cells: [['/isi']],
    });
    main.appendChild(isiBlock);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // Build the Metadata block MANUALLY (instead of WebImporter.rules.createMetadata)
    // so it includes a `brand` row. The runtime resolves brand=rinvoq from it
    // (loads styles/brands/rinvoq.css, brand-prefixed framework classes,
    // /icons/rinvoq logos). A multi-row block serializes as a proper markdown
    // table (a single-row metadata block flattens to <p> and loses its value).
    const getMeta = (sel) => document.querySelector(sel)?.getAttribute('content')?.trim() || '';
    const metaCells = {
      Title: (document.querySelector('title')?.textContent || '').trim(),
      Description: getMeta('meta[name="description"]') || getMeta('meta[property="og:description"]'),
      Image: getMeta('meta[property="og:image"]') || getMeta('meta[name="twitter:image"]'),
      brand: 'rinvoq',
    };
    const metaBlock = WebImporter.Blocks.createBlock(document, {
      name: 'Metadata',
      cells: metaCells,
    });
    main.appendChild(metaBlock);

    // 6. Force output under content/rinvoq/. run-bulk-import writes to
    //    `<workspace>/content/<path>.plain.html`, so return '/rinvoq/index'.
    const path = '/rinvoq/index';

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
