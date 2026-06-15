/* eslint-disable */
/* global WebImporter */

/**
 * Parser: rinvoq-savings (maps to shared promo-tout block)
 * Base block: promo-tout (columns)
 * Source: https://www.rinvoq.com/
 * Selector (block instance): `.abbv-container.background-yellow`
 *   (the yellow "RINVOQ Complete / You could pay $0 a month" savings card)
 *
 * Source structure inside the yellow card:
 *   .image-text-v2 picture (RINVOQ Complete logo)
 *   .titles .abbv-title h2  ("You could pay $0 a month§ for RINVOQ")
 *   .rich-text p (body copy)
 *   .cta a.abbv-button-primary ("Discover ways to save and more")
 *   .rich-text.psa-footnote p (footnote)
 *
 * promo-tout decorator expects TWO rows (image cell, then text/CTA cell).
 * We emit:
 *   row 0 = image (Complete logo picture)
 *   row 1 = heading + body + footnote paragraphs + CTA link
 */
export default function parse(element, { document }) {
  // 1) Image: the Complete logo (first picture in an image-text-v2 block).
  const picture = element.querySelector('.abbv-image-text-v2 picture, picture, img');

  const cell1 = [document.createComment(' field:image ')];
  if (picture) {
    if (picture.tagName === 'IMG') {
      const pic = document.createElement('picture');
      const img = document.createElement('img');
      img.src = picture.src || picture.getAttribute('src') || '';
      img.alt = picture.alt || picture.getAttribute('alt') || '';
      pic.appendChild(img);
      cell1.push(pic);
    } else {
      cell1.push(picture);
    }
  }

  // 2) Text: heading + body + footnotes, then CTA(s).
  const cell2 = [document.createComment(' field:text ')];

  const heading = element.querySelector('.abbv-title h2, .titles h2, h2');
  if (heading) {
    const h2 = document.createElement('h2');
    h2.innerHTML = heading.innerHTML;
    cell2.push(h2);
  }

  // Body + footnote paragraphs (skip jump-link CTA paragraphs).
  const richTexts = element.querySelectorAll('.rich-text .abbv-rich-text');
  richTexts.forEach((rt) => {
    rt.querySelectorAll(':scope > p').forEach((p) => {
      // Skip paragraphs that are purely an anchor jump link CTA.
      const onlyLink = p.querySelector('a');
      if (onlyLink && p.textContent.trim() === onlyLink.textContent.trim()) return;
      if (!p.textContent.trim()) return;
      const np = document.createElement('p');
      np.innerHTML = p.innerHTML;
      cell2.push(np);
    });
  });

  // CTA: the primary savings button (exclude the "See full ISI" jump link).
  const cta = element.querySelector('a.abbv-button-primary, a.psa-primary-button');
  if (cta) {
    const a = document.createElement('a');
    a.setAttribute('href', cta.getAttribute('href') || '');
    a.textContent = cta.textContent.replace(/\s+/g, ' ').trim();
    cell2.push(a);
  }

  const cells = [];
  cells.push([cell1]);
  cells.push([cell2]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'promo-tout', cells });
  element.replaceWith(block);
}
