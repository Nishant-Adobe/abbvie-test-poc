/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-feature
 * Base block: cards
 * Source: https://www.linzess.com/
 * Selector: .abbv-flex-container-v2.flexbox-cards.margin-top-110
 * Generated: 2026-06-05
 *
 * UE Model (container block):
 *   Each card item has fields: image (reference), text (richtext)
 *   Each card = one row with two columns [image, text]
 */
export default function parse(element, { document }) {
  // Get all card items within the flex container
  const cardItems = element.querySelectorAll(':scope > .flexboxitem-v2');

  const cells = [];

  cardItems.forEach((card) => {
    // Extract image from the card
    const image = card.querySelector('.abbv-image-content-container-v2 img, .abbv-flex-item-v2 picture img, .abbv-flex-item-v2 img');

    // Extract heading (p.heading-2 inside the card body)
    const heading = card.querySelector('.abbv-stretched-card-body p.heading-2, .abbv-stretched-card-body h2, .abbv-flex-item-v2 p.heading-2');

    // Extract description (next paragraph after heading in the card body)
    const description = card.querySelector('.abbv-stretched-card-body p:not(.heading-2), .abbv-flex-item-v2 .abbv-image-text-content-v2 p:not(.heading-2)');

    // Extract CTA link
    const cta = card.querySelector('.cta.parbase a, .cta a, .abbv-flex-item-v2 a[href]');

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

    // Build text cell with field hint (heading + description + CTA combined as richtext)
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    if (heading) {
      const h2 = document.createElement('h2');
      h2.innerHTML = heading.innerHTML;
      textCell.appendChild(h2);
    }
    if (description) {
      const p = document.createElement('p');
      p.innerHTML = description.innerHTML;
      textCell.appendChild(p);
    }
    if (cta) {
      const link = document.createElement('a');
      link.href = cta.getAttribute('href') || '';
      link.textContent = cta.textContent.trim();
      textCell.appendChild(link);
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
  element.replaceWith(block);
}
