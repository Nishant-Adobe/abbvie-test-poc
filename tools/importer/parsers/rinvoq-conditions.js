/* eslint-disable */
/* global WebImporter */

/**
 * Parser: rinvoq-conditions (maps to shared cards-feature block)
 * Base block: cards-feature
 * Source: https://www.rinvoq.com/
 * Selector (block instance): `.abbv-flex-container.homepage-cta-flex-box.conditions`
 *
 * Each condition is a link-only tile:
 *   `.abbv-flex-item.flex-col-6 a.homepage-indication-selector-cta`
 * containing nested <span> lines (qualifier + condition name + parenthetical).
 *
 * cards-feature decorator iterates block rows; for each row it reads
 *   cells[0] = image cell (we leave empty — conditions have no per-tile image)
 *   cells[1] = text cell: headings (h2/h3) become the card title,
 *              a paragraph whose entire text == its single link becomes the CTA.
 *
 * We emit one row per condition tile: empty image cell + text cell with an
 * <h2> (the primary condition name) and a CTA <a> (the full link, href preserved).
 * Hidden tiles (d-none) and empty spacer items are skipped.
 */
export default function parse(element, { document }) {
  const tiles = element.querySelectorAll(':scope .abbv-flex-item');

  const cells = [];

  tiles.forEach((tile) => {
    // Skip hidden / spacer tiles.
    if (tile.classList.contains('d-none')) return;
    const link = tile.querySelector('a.homepage-indication-selector-cta, a[href]');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    if (!href) return;

    // Primary condition name: the largest span (font-15px) or the link's own text.
    let title = '';
    const nameSpan = link.querySelector('span.font-15px, span.d-block');
    if (nameSpan) {
      title = nameSpan.textContent.replace(/\s+/g, ' ').trim();
    }
    if (!title) {
      title = link.textContent.replace(/\s+/g, ' ').trim();
    }

    // Full link label (all span text combined), used as the CTA text.
    const linkLabel = link.textContent.replace(/\s+/g, ' ').trim();

    // Empty image cell (cards-feature tolerates a missing picture).
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));

    // Text cell: heading + CTA link.
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));

    if (title) {
      const h2 = document.createElement('h2');
      h2.textContent = title;
      textCell.appendChild(h2);
    }

    const a = document.createElement('a');
    a.setAttribute('href', href);
    a.textContent = linkLabel || title;
    textCell.appendChild(a);

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
  element.replaceWith(block);
}
