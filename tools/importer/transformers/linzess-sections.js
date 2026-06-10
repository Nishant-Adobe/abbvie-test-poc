/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Linzess section breaks and section metadata.
 * Inserts <hr> between sections and adds Section Metadata blocks for styled sections.
 * Data-driven from payload.template.sections — works for all templates.
 * All selectors validated against captured DOM of https://www.linzess.com/why-linzess
 *
 * Templates with sections:
 *   homepage (4 sections):
 *     1. Hero (.image-text-v2.parbase:first-of-type) - no style
 *     2. Content Cards (.abbv-container.background-white.home-background-white-arc) - style: white
 *     3. Statistics and Patient Experiences (.abbv-container.background-dark-purple.background-dark-purple-arc) - style: dark-purple
 *     4. Savings Offer (.abbv-container.background-white.background-white-arc.pb24-m) - style: white
 *
 *   content-page (8 sections):
 *     1. Hero (.image-text-v2.parbase:first-of-type) - no style
 *     2. Section Navigation (.section-navigation.parbase) - no style
 *     3. How LINZESS Can Help (.abbv-container.background-white.background-white-arc:first-of-type) - style: white
 *     4. How LINZESS Works (.abbv-container.background-dark-purple.background-dark-purple-arc:first-of-type) - style: dark-purple
 *     5. Side Effects (.abbv-container.background-off-white.background-off-white-arc) - style: off-white
 *     6. Patient Experiences (.abbv-container.background-white.background-white-arc.text-align-center) - style: white
 *     7. Bottom Navigation (.abbv-container.background-dark-purple.bottom-nav) - style: dark-purple
 *     8. ISI (.isi-bar) - no style
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.after) {
    const doc = element.ownerDocument || element.getRootNode();

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
