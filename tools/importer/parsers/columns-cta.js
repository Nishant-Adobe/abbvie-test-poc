/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-cta
 * Base block: columns
 * Source: https://www.linzess.com/why-linzess
 * Selector: .abbv-container.background-dark-purple.bottom-nav .abbv-flex-container-v2
 * Generated: 2026-06-08
 *
 * Target structure:
 *   | columns-cta |         |
 *   | heading + CTA | heading + CTA |
 *
 * Each column: centered heading (p.heading-2) + primary CTA button link.
 * Two columns side-by-side on dark purple background for bottom-of-page navigation.
 *
 * Columns blocks do NOT require field hint comments (xwalk exception).
 */
export default function parse(element, { document }) {
  // Each column is a .flexboxitem-v2 containing heading + CTA
  const columnItems = element.querySelectorAll(':scope > .flexboxitem-v2');

  const cells = [];
  const row = [];

  columnItems.forEach((col) => {
    const cell = [];

    // Extract heading - source uses p.heading-2 inside .abbv-rich-text
    const heading = col.querySelector('.heading-2, .heading-3, h2, h3, [class*="heading"]');
    if (heading) {
      cell.push(heading);
    }

    // Extract CTA link - source uses a.abbv-button-primary inside .cta div
    const cta = col.querySelector('a.abbv-button-primary, a[class*="abbv-button"], .cta a');
    if (cta) {
      cell.push(cta);
    }

    row.push(cell);
  });

  // Fallback: if no .flexboxitem-v2 found, try broader selectors
  if (row.length === 0) {
    const flexItems = element.querySelectorAll('.abbv-flex-item-v2');
    flexItems.forEach((item) => {
      const cell = [];
      const heading = item.querySelector('.heading-2, .heading-3, h2, h3, [class*="heading"]');
      if (heading) {
        cell.push(heading);
      }
      const cta = item.querySelector('a.abbv-button-primary, a[class*="abbv-button"], .cta a');
      if (cta) {
        cell.push(cta);
      }
      row.push(cell);
    });
  }

  if (row.length > 0) {
    cells.push(row);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-cta', cells });
  element.replaceWith(block);
}
