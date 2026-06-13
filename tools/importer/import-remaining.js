/* eslint-disable */
/* global WebImporter */

// TRANSFORMER IMPORTS
import linzessCleanupTransformer from './transformers/linzess-cleanup.js';

// TRANSFORMER REGISTRY
const transformers = [
  linzessCleanupTransformer,
];

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'patient-transcript',
  description: 'Video transcript pages with text transcript content',
  urls: [
    'https://www.linzess.com/why-linzess/linzess-patient-experiences/dian-transcripts',
    'https://www.linzess.com/why-linzess/linzess-patient-experiences/nan-transcripts',
    'https://www.linzess.com/why-linzess/linzess-patient-experiences/julie-transcripts',
    'https://www.linzess.com/why-linzess/linzess-patient-experiences/getting-on-same-page-transcripts',
    'https://www.linzess.com/why-linzess/linzess-patient-experiences/setting-expectations-transcripts',
    'https://www.linzess.com/why-linzess/linzess-patient-experiences/could-it-be-transcripts',
    'https://www.linzess.com/why-linzess/linzess-patient-experiences/dr-lucak-transcripts',
    'https://www.linzess.com/why-linzess/linzess-patient-experiences/finding-relief-transcripts',
    'https://www.linzess.com/why-linzess/linzess-patient-experiences/seeking-the-right-treatment-transcripts',
  ],
  blocks: [],
  sections: [],
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

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    // 1. Execute beforeTransform transformers
    executeTransformers('beforeTransform', main, payload);

    // 2. No blocks to parse - these are default content pages

    // 3. Execute afterTransform transformers
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
        blocks: [],
      },
    }];
  },
};
