/* eslint-disable */
/* global WebImporter */

/**
 * Parser: hero-pharma
 * Base block: hero
 * Source: https://www.linzess.com/
 * Selector: .image-text-v2.parbase > .hero-container
 * Generated: 2026-06-05
 *
 * UE Model fields:
 *   - image (reference): Background hero image
 *   - imageAlt (collapsed): Alt text for image
 *   - text (richtext): Combined text content (subheading, heading, description, CTA)
 */
export default function parse(element, { document }) {
  // Extract background image from picture element
  const picture = element.querySelector('.abbv-image-content-container-v2 picture');

  // Extract text content elements from the content container
  const contentContainer = element.querySelector('.abbv-image-text-content-v2 .abbv-image-text-display-v2 .abbv-stretched-card-body');

  // Build the text content cell with all text elements
  const textFrag = document.createDocumentFragment();
  textFrag.appendChild(document.createComment(' field:text '));

  if (contentContainer) {
    // Get all direct children (p, h1, a elements) preserving order
    const children = contentContainer.querySelectorAll(':scope > p, :scope > h1, :scope > h2, :scope > a');
    children.forEach((child) => {
      textFrag.appendChild(child);
    });
  }

  // Build the image cell with field hint
  const imageFrag = document.createDocumentFragment();
  imageFrag.appendChild(document.createComment(' field:image '));
  if (picture) {
    imageFrag.appendChild(picture);
  }

  // Build cells: 2 rows matching UE model (image, text)
  const cells = [
    [imageFrag],
    [textFrag],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-pharma', cells });
  element.replaceWith(block);
}
