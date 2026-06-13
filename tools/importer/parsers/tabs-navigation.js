/* eslint-disable */
/* global WebImporter */

/**
 * Parser: tabs-navigation
 * Base block: tabs-navigation
 * Source: https://www.linzess.com/why-linzess
 * Selector: .abbv-section-navigation.abbv-sticky
 * Generated: 2026-06-08
 *
 * UE Model (container block - tabs-navigation-item):
 *   Each tab item row has fields:
 *     - title (text): Tab title - Column 1
 *     - content_heading (text): Heading in content panel
 *     - content_headingType (select): Heading level (collapsed - skipped)
 *     - content_image (reference): Image in content panel
 *     - content_richtext (richtext): Rich text in content panel
 *   Grouped: content_heading, content_image, content_richtext -> Column 2
 *
 * Source DOM: ul.section-navigation-list > li > a[href="#anchor"]
 * Each anchor link becomes a tab item row.
 * Column 1 (title): link text as heading
 * Column 2 (content): anchor link for section reference
 */
export default function parse(element, { document }) {
  // Extract navigation links from the section navigation list
  const navLinks = element.querySelectorAll('ul.section-navigation-list > li > a, .section-navigation-list > li > a');

  const cells = [];

  navLinks.forEach((link) => {
    const linkText = link.textContent.trim();
    const linkHref = link.getAttribute('href') || '';

    if (!linkText) return;

    // Column 1: title field - tab heading (shown as tab button label)
    const titleCell = document.createDocumentFragment();
    titleCell.appendChild(document.createComment(' field:title '));
    const heading = document.createElement('h3');
    heading.textContent = linkText;
    titleCell.appendChild(heading);

    // Column 2: content fields grouped (content_heading, content_image, content_richtext)
    // For section navigation, the content is the anchor link to the section
    const contentCell = document.createDocumentFragment();
    contentCell.appendChild(document.createComment(' field:content_heading '));
    const contentHeading = document.createElement('h3');
    contentHeading.textContent = linkText;
    contentCell.appendChild(contentHeading);
    contentCell.appendChild(document.createComment(' field:content_richtext '));
    const anchor = document.createElement('a');
    anchor.href = linkHref;
    anchor.textContent = linkText;
    contentCell.appendChild(anchor);

    cells.push([titleCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-navigation', cells });
  element.replaceWith(block);
}
