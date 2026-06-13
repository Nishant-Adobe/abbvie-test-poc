/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-icon
 * Base block: cards
 * Source: https://www.linzess.com/why-linzess
 * Selectors: .abbv-flex-container-v2.flexbox-column.max-690.how-linz-works,
 *            .abbv-flex-container-v2.flexbox-column.why-linz-sideeffects.max-690
 * Generated: 2026-06-08
 *
 * UE Model (container block):
 *   Each card item has fields: image (reference), text (richtext)
 *   Each card = one row with two columns [image, text]
 *
 * Source DOM structure:
 *   .abbv-flex-container-v2.flexbox-column
 *     > .flexboxitem-v2.parbase (one per card)
 *       > .abbv-flex-item-v2 (card wrapper with background color)
 *         > .image-text-v2.parbase
 *           > .abbv-image-text-v2 (flex row with icon + text)
 *             > .abbv-image-content-container-v2 > img (icon)
 *             > .abbv-image-text-content-container-v2
 *               > .abbv-image-text-content-v2
 *                 > .abbv-image-text-display-v2
 *                   > .abbv-stretched-card-body (text content: p, b, etc.)
 */
export default function parse(element, { document }) {
  // Get all card items within the flex column container
  const cardItems = element.querySelectorAll(':scope > .flexboxitem-v2');

  const cells = [];

  cardItems.forEach((card) => {
    // Extract icon image from the card
    const image = card.querySelector('.abbv-image-content-container-v2 img');

    // Extract text content from the card body
    const cardBody = card.querySelector('.abbv-stretched-card-body');

    // Build image cell with field hint
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    if (image) {
      const pic = document.createElement('picture');
      const img = document.createElement('img');
      img.src = image.src || image.getAttribute('src') || '';
      img.alt = image.alt || image.getAttribute('alt') || '';
      pic.appendChild(img);
      imageCell.appendChild(pic);
    }

    // Build text cell with field hint (all content from card body as richtext)
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    if (cardBody) {
      // Clone all child elements from the card body to preserve richtext structure
      const children = cardBody.querySelectorAll(':scope > *');
      if (children.length > 0) {
        children.forEach((child) => {
          textCell.appendChild(child.cloneNode(true));
        });
      } else {
        // Fallback: if no child elements, use the text content directly
        const p = document.createElement('p');
        p.innerHTML = cardBody.innerHTML;
        textCell.appendChild(p);
      }
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon', cells });
  element.replaceWith(block);
}
