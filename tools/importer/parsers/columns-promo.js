/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-promo
 * Base block: columns
 * Source: https://www.linzess.com/
 * Selectors: .abbv-row-container.eligible-tout,
 *            .abbv-row-container.background-off-white.image-text-wrapper:not(.savings-card-tout),
 *            .abbv-row-container.savings-card-tout
 * Generated: 2026-06-05
 *
 * Target structure (from library example):
 *   | Columns |
 *   | image | heading + description + CTA |
 *
 * Columns blocks do NOT require field hint comments (xwalk exception).
 */
export default function parse(element, { document }) {
  // Extract columns - source has .abbv-col elements (typically 2 columns: image + text/CTA)
  const columns = element.querySelectorAll(':scope .abbv-col');

  const cells = [];

  if (columns.length >= 2) {
    // Column 1: Image column
    const imageCol = columns[0];
    const image = imageCol.querySelector('picture') || imageCol.querySelector('img');
    const cell1 = [];
    if (image) {
      cell1.push(image);
    }

    // Column 2: Text + CTA column
    const textCol = columns[1];
    const cell2 = [];

    // Extract heading - source uses p.heading-2 or similar heading classes
    const heading = textCol.querySelector('.heading-2, .heading-3, h2, h3, [class*="heading"]');
    if (heading) {
      cell2.push(heading);
    }

    // Extract description paragraphs (not headings)
    const descriptions = textCol.querySelectorAll('p:not([class*="heading"]):not(.heading-2):not(.heading-3)');
    descriptions.forEach((desc) => {
      if (desc.textContent.trim()) {
        cell2.push(desc);
      }
    });

    // Extract CTA links
    const ctas = textCol.querySelectorAll('a.abbv-button-primary, a.abbv-button-secondary, a[class*="abbv-button"], .cta a');
    ctas.forEach((cta) => {
      cell2.push(cta);
    });

    cells.push([cell1, cell2]);
  } else {
    // Fallback: single column or unexpected structure
    // Try to find image and text content anywhere in element
    const image = element.querySelector('picture') || element.querySelector('img');
    const heading = element.querySelector('.heading-2, .heading-3, h2, h3, [class*="heading"]');
    const ctas = element.querySelectorAll('a.abbv-button-primary, a.abbv-button-secondary, a[class*="abbv-button"], .cta a');

    const cell1 = [];
    if (image) {
      cell1.push(image);
    }

    const cell2 = [];
    if (heading) {
      cell2.push(heading);
    }
    ctas.forEach((cta) => {
      cell2.push(cta);
    });

    cells.push([cell1, cell2]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-promo', cells });
  element.replaceWith(block);
}
