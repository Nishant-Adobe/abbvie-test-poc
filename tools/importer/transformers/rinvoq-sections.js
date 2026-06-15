/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: RINVOQ section breaks and section metadata.
 * Inserts <hr> between sections and adds Section Metadata blocks for styled sections.
 * Data-driven from payload.template.sections — mirrors linzess-sections.js.
 * Selectors validated against captured DOM of https://www.rinvoq.com/
 * (migration-work/rinvoq/cleaned.html).
 *
 * RINVOQ homepage styled sections:
 *   1. Hero (.abbv-background-container.home-hero.home-bg-upa) - no style
 *   2. Choose Your Condition (.abbv-container.abv-custom-bgcolor-light-grey) - style: light-grey
 *   3. Savings ($0 a month) (.abbv-container.psa-two-col-section.two-cols) - style: yellow
 *   4. SPEAK network (.abbv-background-container.black-brushstroke.homepage-speak-network) - style: dark
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.after) {
    const doc = element.ownerDocument || element.getRootNode();

    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;

    // Process sections in reverse order to avoid offset issues when inserting.
    const reversedSections = [...sections].reverse();

    for (const section of reversedSections) {
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue;

      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(sectionMetadata);
      }

      if (section.id !== sections[0].id) {
        const hr = doc.createElement('hr');
        sectionEl.before(hr);
      }
    }
  }
}
