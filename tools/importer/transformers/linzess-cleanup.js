/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Linzess site-wide cleanup.
 * Removes non-authorable content (header, footer, ISI, cookie consent, modals, safety bar,
 * back-to-top, dimmer overlay, tracking elements).
 * All selectors validated against captured DOM of https://www.linzess.com/why-linzess
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove OneTrust cookie consent banner
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
    ]);

    // Remove modals that overlay content and may interfere with parsing
    // (line 2727+: <div class="modal parbase"> wrapping <div class="abbv-modal ...">)
    WebImporter.DOMUtils.remove(element, [
      '.modal.parbase',
    ]);

    // Remove reCAPTCHA badge
    WebImporter.DOMUtils.remove(element, [
      '.grecaptcha-badge',
    ]);
  }

  if (hookName === H.after) {
    // Remove header wrapper (line 19: <div class="header-v2 parbase">)
    WebImporter.DOMUtils.remove(element, ['.header-v2.parbase']);

    // Remove top promotional banner (line 13: <div class="abbv-rich-text linzess-top-banner ...">)
    WebImporter.DOMUtils.remove(element, ['.linzess-top-banner']);

    // Remove sticky anchors (lines 229, 265: <div class="abbv-sticky-anchor">)
    WebImporter.DOMUtils.remove(element, ['.abbv-sticky-anchor']);

    // Remove footer (line 2532: <footer class="abbv-footer linzess-footer">)
    WebImporter.DOMUtils.remove(element, ['footer.abbv-footer']);

    // Remove footer parbase wrapper (line 2530: <div class="footer parbase">)
    WebImporter.DOMUtils.remove(element, ['.footer.parbase']);

    // Remove ISI section - inline use/ISI (line 2447: <div class="abbv-inline-use-isi">)
    WebImporter.DOMUtils.remove(element, ['.abbv-inline-use-isi']);

    // Remove inline safety information (line 2463: <div class="abbv-inline-safety ">)
    WebImporter.DOMUtils.remove(element, ['.abbv-inline-safety']);

    // Remove inline misc ISI (line 2523: <div class="abbv-inline-miscisi">)
    WebImporter.DOMUtils.remove(element, ['.abbv-inline-miscisi']);

    // Remove safety bar / sticky ISI (line 3795: <div class="safety-bar parbase">)
    WebImporter.DOMUtils.remove(element, ['.safety-bar.parbase']);

    // Remove dimmer overlay (line 2714: <div class="abbv-dimmer">)
    WebImporter.DOMUtils.remove(element, ['.abbv-dimmer']);

    // Remove back-to-top button (line 2717: <button class="abbv-back-to-top ...">)
    WebImporter.DOMUtils.remove(element, ['.abbv-back-to-top']);

    // Remove empty AEM paragraph containers (lines 3, 9, 2724)
    WebImporter.DOMUtils.remove(element, ['.newpar.new.section']);

    // Remove inherited paragraph containers (lines 5, 11, 2726)
    WebImporter.DOMUtils.remove(element, ['.par.iparys_inherited']);

    // Remove iframes (tracking pixels, reCAPTCHA frames)
    WebImporter.DOMUtils.remove(element, ['iframe']);

    // Remove link elements and noscript
    WebImporter.DOMUtils.remove(element, ['link', 'noscript']);

    // Remove SVG gradient definitions (inline SVG as data URI img)
    const svgImgs = element.querySelectorAll('img[src^="data:image/svg+xml"]');
    svgImgs.forEach((img) => img.remove());

    // Remove social copy input (<input class="abbv-social-copy">)
    WebImporter.DOMUtils.remove(element, ['.abbv-social-copy']);

    // Remove textarea elements (g-recaptcha-response)
    WebImporter.DOMUtils.remove(element, ['textarea']);

    // Remove Brightcove video player internal chrome elements
    // Keep only the video-js element or poster, strip all player controls/UI
    const videoPlayers = element.querySelectorAll('.vjs-control-bar, .vjs-loading-spinner, .vjs-text-track-display, .vjs-modal-dialog, .vjs-error-display, .vjs-dock-text, .vjs-poster[tabindex]');
    videoPlayers.forEach((el) => el.remove());

    // Remove all elements with class containing 'vjs-' except the main video-js container and poster
    const vjsElements = element.querySelectorAll('[class*="vjs-"]:not(video-js):not(.vjs-poster):not(.vjs-tech)');
    vjsElements.forEach((el) => {
      // Only remove if it's inside a video-js or abbv-video-player container
      if (el.closest('video-js') || el.closest('.abbv-video-player')) {
        // Don't remove the poster or the main container
        if (!el.classList.contains('vjs-poster') && el.tagName !== 'VIDEO') {
          el.remove();
        }
      }
    });

    // Remove script tags injected by video player
    WebImporter.DOMUtils.remove(element, ['script[src*="vjs"], script[src*="brightcove"], script[src*="videojs"]']);
  }
}
