/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Linzess section breaks and section metadata.
 * Inserts <hr> between sections and adds Section Metadata blocks for styled sections.
 * All selectors validated against captured DOM of https://www.linzess.com/
 *
 * Sections from page-templates.json:
 *   1. Hero (.image-text-v2.parbase:first-of-type) - no style
 *   2. Content Cards (.abbv-container.background-white.home-background-white-arc) - style: white
 *   3. Statistics and Patient Experiences (.abbv-container.background-dark-purple.background-dark-purple-arc) - style: dark-purple
 *   4. Savings Offer (.abbv-container.background-white.background-white-arc.pb24-m) - style: white
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.after) {
    const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document: element.getRootNode() };
    const doc = document || element.ownerDocument || element.getRootNode();

    // Get sections from template payload
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;

    // Process sections in reverse order to avoid offset issues when inserting elements
    const reversedSections = [...sections].reverse();

    for (const section of reversedSections) {
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue;

      // Add Section Metadata block if section has a style
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        // Insert section metadata after the section element content
        sectionEl.after(sectionMetadata);
      }

      // Insert <hr> before each section that is not the first
      if (section.id !== sections[0].id) {
        const hr = doc.createElement('hr');
        sectionEl.before(hr);
      }
    }
  }
}
