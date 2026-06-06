/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Linzess site-wide cleanup.
 * Removes non-authorable content (header, footer, ISI, cookie consent, modals, safety bar, tracking).
 * All selectors validated against captured DOM of https://www.linzess.com/
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove OneTrust cookie consent banner (line 3416 in captured DOM)
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
    ]);

    // Remove modals that overlay content and may interfere with parsing
    // Found at lines 2143, 2192, 2325, 2404, 2449, 2494, 2935, 3062 in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '.abbv-modal',
    ]);

    // Remove reCAPTCHA badge (line 3405 in captured DOM)
    WebImporter.DOMUtils.remove(element, [
      '.grecaptcha-badge',
    ]);
  }

  if (hookName === H.after) {
    // Remove header (line 17 in captured DOM: <header class="abbv-header-v2 linzess-header ...">)
    WebImporter.DOMUtils.remove(element, ['header.abbv-header-v2']);

    // Remove top promotional banner (line 10: <div class="abbv-rich-text linzess-top-banner ...">)
    WebImporter.DOMUtils.remove(element, ['.linzess-top-banner']);

    // Remove sticky anchor (line 226: <div class="abbv-sticky-anchor">)
    WebImporter.DOMUtils.remove(element, ['.abbv-sticky-anchor']);

    // Remove footer (line 1946: <footer class="abbv-footer linzess-footer">)
    WebImporter.DOMUtils.remove(element, ['footer.abbv-footer']);

    // Remove ISI section - inline use/ISI (line 1864: <div class="abbv-inline-use-isi">)
    WebImporter.DOMUtils.remove(element, ['.abbv-inline-use-isi']);

    // Remove inline misc ISI (line 1940: <div class="abbv-inline-miscisi">)
    WebImporter.DOMUtils.remove(element, ['.abbv-inline-miscisi']);

    // Remove safety bar / sticky ISI (line 3209: <div class="safety-bar parbase">)
    WebImporter.DOMUtils.remove(element, ['.safety-bar.parbase']);

    // Remove empty AEM paragraph containers (lines 3, 229, 2126, 3204, 3394)
    WebImporter.DOMUtils.remove(element, ['.newpar.new.section']);

    // Remove inherited paragraph containers (lines 5, 231, 3206, 3396)
    WebImporter.DOMUtils.remove(element, ['.par.iparys_inherited']);

    // Remove iframes (tracking pixels, reCAPTCHA frames)
    WebImporter.DOMUtils.remove(element, ['iframe']);

    // Remove link elements and noscript
    WebImporter.DOMUtils.remove(element, ['link', 'noscript']);

    // Remove SVG gradient definitions (line 3398 - inline SVG as data URI img)
    const svgImgs = element.querySelectorAll('img[src^="data:image/svg+xml"]');
    svgImgs.forEach((img) => img.remove());

    // Remove social copy input (line 3400: <input class="abbv-social-copy">)
    WebImporter.DOMUtils.remove(element, ['.abbv-social-copy']);

    // Remove textarea elements (g-recaptcha-response, line 3412)
    WebImporter.DOMUtils.remove(element, ['textarea']);

    // Remove footer parbase wrapper (line 1944: <div class="footer parbase">)
    WebImporter.DOMUtils.remove(element, ['.footer.parbase']);
  }
}
