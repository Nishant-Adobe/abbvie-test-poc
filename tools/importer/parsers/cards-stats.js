/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-stats
 * Base block: cards
 * Source: https://www.linzess.com/
 * Generated: 2026-06-05
 *
 * Description: Cards block (stats variant) - Grid of statistics display cards
 * featuring large numbers with descriptive text. Used for presenting key metrics
 * or data points in a visually impactful grid.
 *
 * UE Model: Container block with card items (image + text fields per card).
 * Stats cards have no image, so image cell is empty; text cell contains stat + description.
 *
 * Source structure:
 *   .abbv-flex-container-v2.flexbox-cards.c-dark-purple.margin-top-80
 *     > .flexboxitem-v2.parbase
 *       > .abbv-flex-item-v2
 *         > .rich-text > .abbv-rich-text
 *           > p.circle (stat number: span.font-size-xl + unit)
 *           > p.mb24-m (description)
 */
export default function parse(element, { document }) {
  // Select all card items within the flex container
  const cardItems = element.querySelectorAll(':scope > .flexboxitem-v2 .abbv-flex-item-v2');

  const cells = [];

  cardItems.forEach((card) => {
    const richText = card.querySelector('.abbv-rich-text');
    if (!richText) return;

    // Extract stat paragraph (p.circle contains the number + unit)
    const statParagraph = richText.querySelector('p.circle, p[class*="circle"]');
    // Extract description paragraph
    const descParagraph = richText.querySelector('p.mb24-m, p:not(.circle):not([class*="circle"])');

    // Build the text content cell with field hint
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));

    if (statParagraph) {
      // Clone the stat paragraph to preserve its bold/span structure
      const statClone = statParagraph.cloneNode(true);
      textFrag.appendChild(statClone);
    }

    if (descParagraph) {
      const descClone = descParagraph.cloneNode(true);
      textFrag.appendChild(descClone);
    }

    // Each card is one row: [image (empty), text]
    // Image cell is empty since stat cards have no images
    cells.push(['', textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-stats', cells });
  element.replaceWith(block);
}
