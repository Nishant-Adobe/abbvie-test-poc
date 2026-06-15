/* eslint-disable */
/* global WebImporter */

/**
 * Parser: rinvoq-hero (maps to shared hero-pharma block)
 * Base block: hero-pharma
 * Source: https://www.rinvoq.com/
 * Selector (block instance): the FIRST real owl-carousel slide
 *   `.owl-item:not(.cloned) .abbv-background-container.home-hero.home-bg-upa`
 *
 * RINVOQ hero DOM differs from Linzess:
 *   - Background image lives in `.abbv-background-container-display.abbv-background-container-image-swap-bg img`
 *   - Foreground text is split:
 *       * `.abbv-stretched-card-body` p's  -> eyebrow ("RINVOQ" / "with a ONCE-DAILY PILL")
 *       * sibling `.rich-text .abbv-rich-text h1` -> heading ("See how RINVOQ helps tame symptoms...")
 *   - No CTA button on the hero.
 *
 * hero-pharma decorator expects TWO rows:
 *   row 0 = image cell (background picture)
 *   row 1 = text cell: paragraphs[0] = eyebrow/subheading, h1 = heading,
 *           paragraphs[1] = description (optional), optional <a> = CTA.
 */
/**
 * Resolve the background image URL for an abbv background container.
 * The bg image may come from an inner <img src>, an inline style, or a CSS
 * class that sets `background-image` on `.abbv-background-container-display`.
 */
function extractBgUrl(element) {
  const display = element.querySelector('.abbv-background-container-display') || element;

  // 1) Inner <img> (lazy attrs included).
  const img = display.querySelector('img');
  if (img) {
    const src = img.getAttribute('src') || img.getAttribute('data-src')
      || img.getAttribute('data-original') || '';
    if (src) return src;
  }

  // 2) Inline style background-image.
  const inline = display.getAttribute('style') || '';
  let m = inline.match(/background-image\s*:\s*url\((['"]?)(.*?)\1\)/i);
  if (m && m[2]) return m[2];

  // 3) Computed style (CSS class applies the bg).
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
  // element is the `.abbv-background-container.home-hero.home-bg-upa` for the first slide.

  // 1) Background image (swap bg). The image is applied via a CSS class
  //    `background-image` on `.abbv-background-container-display` (no <img>),
  //    so read the computed/inline background-image URL.
  const imageFrag = document.createDocumentFragment();
  imageFrag.appendChild(document.createComment(' field:image '));
  const bgUrl = extractBgUrl(element);
  if (bgUrl) {
    const pic = document.createElement('picture');
    const img = document.createElement('img');
    img.src = bgUrl;
    img.alt = '';
    pic.appendChild(img);
    imageFrag.appendChild(pic);
  }

  // 2) Text content.
  const textFrag = document.createDocumentFragment();
  textFrag.appendChild(document.createComment(' field:text '));

  // Eyebrow / subheading: combine the .abbv-stretched-card-body paragraphs into one <p>.
  const cardBody = element.querySelector('.abbv-stretched-card-body');
  if (cardBody) {
    const bodyParas = cardBody.querySelectorAll(':scope > p');
    bodyParas.forEach((p) => {
      const np = document.createElement('p');
      np.innerHTML = p.innerHTML;
      textFrag.appendChild(np);
    });
  }

  // Heading: the h1 inside the sibling .rich-text region.
  const headingEl = element.querySelector('.abbv-background-container-content .rich-text h1, .abbv-background-container-content h1');
  if (headingEl) {
    const h1 = document.createElement('h1');
    h1.innerHTML = headingEl.innerHTML;
    textFrag.appendChild(h1);
  }

  const cells = [
    [imageFrag],
    [textFrag],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-pharma', cells });
  element.replaceWith(block);
}
