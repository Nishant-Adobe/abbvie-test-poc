/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-checklist
 * Base block: cards
 * Source: https://www.linzess.com/why-linzess
 * Selector: .abbv-flex-container-v2.flexbox-cards.c-dark-purple.margin-top-80.howlinz-flex,
 *           .abbv-flex-container-v2.flexbox-cards.c-dark-purple.margin-top-40
 * Generated: 2026-06-08
 *
 * UE Model (container block):
 *   Each child "card" item has:
 *     - image (reference) — card image column (empty for checklist cards)
 *     - text (richtext) — card body with badge, checklist items, footnote
 *
 * Source structure:
 *   .abbv-flex-container-v2 > .flexboxitem-v2 (per card)
 *     > .abbv-flex-item-v2 > .rich-text > .abbv-rich-text
 *       > p.circle (badge text e.g. "IBS-C", "CIC")
 *       > ul (checklist items with checkmark styling)
 *       > p.footnote (optional footnote)
 */
export default function parse(element, { document }) {
  // Find all card items within the flex container
  const cardItems = element.querySelectorAll(':scope > .flexboxitem-v2');

  const cells = [];

  cardItems.forEach((card) => {
    // Find the rich text content area within each card
    const richText = card.querySelector('.abbv-rich-text');
    if (!richText) return;

    // Build the text cell content with field hint
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));

    // Extract badge (circle paragraph with condition name)
    const badge = richText.querySelector('p.circle, p[class*="circle"]');
    if (badge) {
      textFrag.appendChild(badge.cloneNode(true));
    }

    // Extract checklist items (ul with li elements)
    const checklist = richText.querySelector('ul');
    if (checklist) {
      textFrag.appendChild(checklist.cloneNode(true));
    }

    // Extract any standalone paragraphs that are not badge or footnote
    // (handles second instance which may have paragraph content instead of lists)
    const paragraphs = richText.querySelectorAll(':scope > p:not(.circle):not([class*="circle"]):not(.footnote):not([class*="footnote"])');
    paragraphs.forEach((p) => {
      textFrag.appendChild(p.cloneNode(true));
    });

    // Extract footnote if present
    const footnote = richText.querySelector('p.footnote, p[class*="footnote"]');
    if (footnote) {
      textFrag.appendChild(footnote.cloneNode(true));
    }

    // Image cell is empty for checklist cards (no images in source)
    // but the cell must exist per the UE model structure
    const imageFrag = document.createDocumentFragment();

    // Each card is one row with two columns: [image, text]
    cells.push([imageFrag, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-checklist', cells });
  element.replaceWith(block);
}
