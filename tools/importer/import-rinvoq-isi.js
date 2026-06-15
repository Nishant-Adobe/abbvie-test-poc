/* eslint-disable */
/* global WebImporter */

/**
 * Import script: RINVOQ ISI fragment.
 *
 * Produces content/rinvoq/isi.plain.html mirroring the Linzess ISI fragment
 * (content/nishant-test/isi.plain.html) so the SHARED isi decorator
 * (blocks/isi/isi.js) decorates it unchanged (inline use-statement + sticky
 * safety bar).
 *
 * Target fragment structure (one top-level section with two child <div>s):
 *   <div>
 *     <div><h3>USES</h3> ...uses content... </div>
 *     <div><h3>IMPORTANT RISK INFORMATION</h3> ...boxed warning + risk... </div>
 *   </div>
 * The .plain.html pipeline flattens the inner <div>s; the decorator then splits
 * the flattened content at the <h3> whose text matches /important risk/i. So we
 * use the heading "IMPORTANT RISK INFORMATION" (matching Linzess) even though
 * the RINVOQ source labels it "IMPORTANT SAFETY INFORMATION...", to drive the
 * decorator's split correctly. The original RINVOQ safety subheading is kept as
 * the first bolded line of the risk body so no content is lost.
 *
 * Source: https://www.rinvoq.com/  (#abbv_use_statement region:
 * `.abbv-inline-use` USES + `.abbv-inline-safety` IMPORTANT SAFETY INFORMATION).
 */

export default {
  transform: (payload) => {
    const { document } = payload;
    const main = document.createElement('div');
    const isiSection = document.createElement('div');

    const useRegion = document.querySelector('.abbv-inline-use .abbv-rich-text')
      || document.querySelector('.abbv-inline-use');
    const safetyRegion = document.querySelector('.abbv-inline-safety .abbv-rich-text')
      || document.querySelector('.abbv-inline-safety');

    // ---- USES div ----
    const usesDiv = document.createElement('div');
    const usesH3 = document.createElement('h3');
    usesH3.textContent = 'USES';
    usesDiv.appendChild(usesH3);
    if (useRegion) {
      // Copy every element after the source <h3>USES</h3> (paragraphs + lists).
      const srcH3 = useRegion.querySelector('h3');
      let started = !srcH3; // if no h3, take everything
      [...useRegion.children].forEach((child) => {
        if (child === srcH3) { started = true; return; }
        if (!started) return;
        usesDiv.appendChild(child.cloneNode(true));
      });
    }
    isiSection.appendChild(usesDiv);

    // ---- IMPORTANT RISK INFORMATION div ----
    const riskDiv = document.createElement('div');
    const riskH3 = document.createElement('h3');
    riskH3.textContent = 'IMPORTANT RISK INFORMATION';
    riskDiv.appendChild(riskH3);
    if (safetyRegion) {
      // The safety region nests an inner wrapper; grab its content container.
      const safetyBody = safetyRegion.querySelector('.abbv-inline-safety-only')
        || safetyRegion;
      [...safetyBody.children].forEach((child) => {
        riskDiv.appendChild(child.cloneNode(true));
      });
    }
    isiSection.appendChild(riskDiv);

    main.appendChild(isiSection);

    return [{
      element: main,
      path: '/rinvoq/isi',
      report: { title: 'RINVOQ ISI fragment', fragment: 'isi' },
    }];
  },
};
