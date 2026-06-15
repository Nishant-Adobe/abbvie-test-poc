/* eslint-disable */
/* global WebImporter */

/**
 * Parser: rinvoq-speak (maps to shared promo-tout block)
 * Base block: promo-tout (columns)
 * Source: https://www.rinvoq.com/
 * Selector (block instance): `.abbv-background-container.black-brushstroke.homepage-speak-network`
 *
 * SPEAK network callout: black brushstroke background image + white text
 * overlay (heading "Your story can help others" + email + phone).
 *
 * Source structure:
 *   .abbv-background-container-display img  (black brushstroke bg)
 *   .abbv-background-container-content .abbv-rich-text p... (heading + body + email + phone)
 *
 * promo-tout decorator expects TWO rows (image cell, then text/CTA cell).
 *   row 0 = background image
 *   row 1 = heading + paragraphs (email/phone links inline)
 */
/**
 * Resolve the background image URL (inner <img>, inline style, or computed CSS).
 */
function extractBgUrl(element) {
  const display = element.querySelector('.abbv-background-container-display') || element;

  const img = display.querySelector('img');
  if (img) {
    const src = img.getAttribute('src') || img.getAttribute('data-src')
      || img.getAttribute('data-original') || '';
    if (src) return src;
  }

  const inline = display.getAttribute('style') || '';
  let m = inline.match(/background-image\s*:\s*url\((['"]?)(.*?)\1\)/i);
  if (m && m[2]) return m[2];

  try {
    const view = (display.ownerDocument && display.ownerDocument.defaultView) || window;
    const computed = view.getComputedStyle(display).backgroundImage || '';
    m = computed.match(/url\((['"]?)(.*?)\1\)/i);
    if (m && m[2] && m[2] !== 'none') return m[2];
  } catch (e) {
    /* getComputedStyle unavailable */
  }
  return '';
}

export default function parse(element, { document }) {
  // 1) Background image (swap bg applied via CSS class — read computed bg).
  const cell1 = [document.createComment(' field:image ')];
  const bgUrl = extractBgUrl(element);
  if (bgUrl) {
    const pic = document.createElement('picture');
    const img = document.createElement('img');
    img.src = bgUrl;
    img.alt = '';
    pic.appendChild(img);
    cell1.push(pic);
  }

  // 2) Text overlay.
  const cell2 = [document.createComment(' field:text ')];
  const content = element.querySelector('.abbv-background-container-content .abbv-rich-text');
  if (content) {
    const paras = content.querySelectorAll(':scope > p');
    paras.forEach((p) => {
      if (!p.textContent.trim()) return;
      const np = document.createElement('p');
      np.innerHTML = p.innerHTML;
      cell2.push(np);
    });
  }

  const cells = [];
  cells.push([cell1]);
  cells.push([cell2]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'promo-tout', cells });
  element.replaceWith(block);
}
