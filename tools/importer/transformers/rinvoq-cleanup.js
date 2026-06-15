/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: RINVOQ site-wide cleanup.
 * Removes non-authorable chrome (header, footer, inline ISI + sticky safety bar,
 * cookie consent, modals, carousel duplicate/extra slides, back-to-top, iframes,
 * scripts, tracking elements).
 * Selectors validated against captured DOM of https://www.rinvoq.com/
 * (migration-work/rinvoq/cleaned.html).
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Collapse the hero owl-carousel down to a SINGLE slide.
    // Remove cloned duplicate slides first.
    WebImporter.DOMUtils.remove(element, ['.owl-item.cloned']);

    // Keep only the first real slide; remove the remaining real slides so the
    // hero renders as a single static slide (hero-pharma is single-slide).
    const realSlides = element.querySelectorAll('.owl-item');
    realSlides.forEach((slide, i) => {
      if (i > 0) slide.remove();
    });

    // Remove carousel navigation chrome (prev/next arrows + dots).
    WebImporter.DOMUtils.remove(element, ['.owl-nav', '.owl-dots']);

    // Remove OneTrust cookie consent banner.
    WebImporter.DOMUtils.remove(element, ['#onetrust-consent-sdk']);

    // Remove modals that overlay content and may interfere with parsing.
    WebImporter.DOMUtils.remove(element, ['.modal.parbase', '.abbv-modal']);

    // Remove reCAPTCHA badge.
    WebImporter.DOMUtils.remove(element, ['.grecaptcha-badge']);
  }

  if (hookName === H.after) {
    // Header (charcoal nav v2).
    WebImporter.DOMUtils.remove(element, ['.header-v2.parbase']);
    WebImporter.DOMUtils.remove(element, ['header.abbv-header-v2']);

    // Top utility / slim eyebrow promotional strip.
    WebImporter.DOMUtils.remove(element, ['.abbv-slimEyebrow']);

    // Sticky anchors.
    WebImporter.DOMUtils.remove(element, ['.abbv-sticky-anchor']);

    // Footer (RINVOQ footer + parbase wrapper + global-footer container).
    WebImporter.DOMUtils.remove(element, ['footer.abbv-footer']);
    WebImporter.DOMUtils.remove(element, ['.footer.parbase']);
    WebImporter.DOMUtils.remove(element, ['.abbv-container.global-footer']);

    // Inline ISI use-statement region (#abbv_use_statement lives in .abbv-inline-use-isi).
    WebImporter.DOMUtils.remove(element, ['.abbv-inline-use-isi']);
    WebImporter.DOMUtils.remove(element, ['.abbv-inline-use']);
    WebImporter.DOMUtils.remove(element, ['.abbv-inline-safety']);
    WebImporter.DOMUtils.remove(element, ['.abbv-inline-miscisi']);

    // Sticky safety bar / ISI bar.
    WebImporter.DOMUtils.remove(element, ['.abbv-safety-bar']);
    WebImporter.DOMUtils.remove(element, ['.safety-bar.parbase']);

    // Dimmer overlay + back-to-top.
    WebImporter.DOMUtils.remove(element, ['.abbv-dimmer']);
    WebImporter.DOMUtils.remove(element, ['.abbv-back-to-top']);

    // Empty AEM paragraph containers.
    WebImporter.DOMUtils.remove(element, ['.newpar.new.section']);
    WebImporter.DOMUtils.remove(element, ['.par.iparys_inherited']);

    // Iframes (tracking pixels, reCAPTCHA frames).
    WebImporter.DOMUtils.remove(element, ['iframe']);

    // Link / noscript / script / style elements.
    WebImporter.DOMUtils.remove(element, ['link', 'noscript', 'script', 'style']);

    // Inline SVG data-URI imgs (gradient defs etc).
    const svgImgs = element.querySelectorAll('img[src^="data:image/svg+xml"]');
    svgImgs.forEach((img) => img.remove());

    // Misc form chrome.
    WebImporter.DOMUtils.remove(element, ['.abbv-social-copy', 'textarea', 'input']);

    // Skip-to-main-content / empty hash anchors.
    WebImporter.DOMUtils.remove(element, ['.abbv-skip-to-main-content', 'a.sr-only']);

    // Third-party tracking pixels (bluecava, doubleclick, scorecardresearch, etc.).
    const trackers = element.querySelectorAll('img[src*="bluecava"], img[src*="doubleclick"], img[src*="scorecardresearch"], img[src*="pulsepoint"], img[src*="/ds.png"], img[src*="sync."]');
    trackers.forEach((img) => img.remove());

    // Empty / placeholder hash anchors (e.g. <a href="#"></a> with no real content).
    const emptyAnchors = element.querySelectorAll('a[href="#"], a[href=""]');
    emptyAnchors.forEach((a) => {
      const txt = (a.textContent || '').replace(/[\s_]+/g, '').trim();
      if (!txt && !a.querySelector('img, picture')) a.remove();
    });
  }
}
