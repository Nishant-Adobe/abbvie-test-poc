/* eslint-disable */
/* global WebImporter */

/**
 * Import script: RINVOQ footer fragment.
 *
 * Produces content/rinvoq/footer.plain.html mirroring the Linzess footer
 * fragment (content/nishant-test/footer.plain.html) so the SHARED footer
 * decorator (blocks/footer/footer.js) decorates it unchanged.
 *
 * Target fragment structure (3 top-level sections, separated by <hr>):
 *   section[0] navSection  : one <ul> per footer column (condition links etc.).
 *                            The decorator wraps each <ul> as an abbv-col.
 *                            A <strong> in the first <li> renders bold (column heading).
 *   section[1] legalSection: a <ul> of legal/bottom links + trademark <p>(s).
 *   section[2] logosSection: <p><a><img></a></p> per co-brand logo (the
 *                            pipeline strips <img>; decorator restores by href —
 *                            abbvie -> /icons/abbvie-logo.png) + a bare <p>
 *                            copyright/legal-number.
 *
 * Source: https://www.rinvoq.com/  (footer `.abbv-footer`).
 * RINVOQ footer columns: "RINVOQ (upadacitinib)" condition links |
 * "Important Information for Patients" (ISI/Med Guide/Full PI) |
 * "Information from AbbVie" (HCP site, COVID-19, legal links). The AbbVie
 * info/legal links are reused as the bottom legal bar. Copyright is the
 * US-RNQ-... legal number + AbbVie corporate logo.
 */

function liLink(doc, href, text, target) {
  const li = doc.createElement('li');
  const a = doc.createElement('a');
  a.setAttribute('href', href);
  if (target) a.setAttribute('target', target);
  a.textContent = text;
  li.appendChild(a);
  return li;
}

function liHeadingLink(doc, href, text) {
  const li = doc.createElement('li');
  const a = doc.createElement('a');
  a.setAttribute('href', href);
  const strong = doc.createElement('strong');
  strong.textContent = text;
  a.appendChild(strong);
  li.appendChild(a);
  return li;
}

export default {
  transform: (payload) => {
    const { document } = payload;
    const main = document.createElement('div');

    const footer = document.querySelector('.abbv-footer');

    // ---- Section 0: navigation columns ----
    const navSection = document.createElement('div');
    const cols = footer ? [...footer.querySelectorAll('.abbv-footer-content .abbv-col')] : [];
    cols.forEach((col) => {
      const heading = (col.querySelector('h5')?.textContent || '').trim();
      const links = [...col.querySelectorAll('ul > li > a')];
      if (!links.length) return;
      const ul = document.createElement('ul');
      // First <li> is the bold column heading (mirrors Linzess <strong> heading).
      if (heading) {
        ul.appendChild(liHeadingLink(document, links[0].getAttribute('href') || '#', heading));
      }
      links.forEach((a) => {
        const href = a.getAttribute('href') || '#';
        const text = (a.textContent || '').trim();
        if (!text || href === 'javascript:void(0)') return;
        ul.appendChild(liLink(document, href, text, a.getAttribute('target')));
      });
      navSection.appendChild(ul);
    });
    main.appendChild(navSection);

    // ---- Section 1: legal links + disclaimer ----
    main.appendChild(document.createElement('hr'));
    const legalSection = document.createElement('div');
    const legalUl = document.createElement('ul');
    // Reuse the AbbVie corporate/legal links from the "Information from AbbVie"
    // column as the bottom legal bar (Accessibility, Contact, Terms, Privacy...).
    const legalCol = cols.find((c) => /Information from AbbVie/i.test(c.querySelector('h5')?.textContent || ''));
    const legalSourceLinks = legalCol
      ? [...legalCol.querySelectorAll('ul > li > a')]
      : [];
    legalSourceLinks.forEach((a) => {
      const href = a.getAttribute('href') || '#';
      const text = (a.textContent || '').trim();
      if (!text || href === '#' || href === 'javascript:void(0)') return;
      // Keep only the legal/corporate links (skip HCP/COVID content links).
      if (!/abbvie|privacy|abbv\.ie/i.test(href)) return;
      legalUl.appendChild(liLink(document, href, text, a.getAttribute('target')));
    });
    legalSection.appendChild(legalUl);

    const disclaimer = document.createElement('p');
    disclaimer.innerHTML = 'RINVOQ<sup>®</sup> and its design are trademarks of AbbVie Inc. '
      + 'The product information provided in this site is intended only for residents of the United States. '
      + 'The products discussed on this site may have different product labeling outside of the United States. '
      + 'The health information described in this site is provided for educational purposes only and is not '
      + 'intended to substitute for discussions with a healthcare provider.';
    legalSection.appendChild(disclaimer);
    main.appendChild(legalSection);

    // ---- Section 2: AbbVie logo + copyright/legal number ----
    main.appendChild(document.createElement('hr'));
    const logosSection = document.createElement('div');

    const logoP = document.createElement('p');
    const logoA = document.createElement('a');
    logoA.setAttribute('href', 'https://www.abbvie.com/');
    const logoImg = document.createElement('img');
    logoImg.setAttribute('src', '/icons/abbvie-logo.png');
    logoImg.setAttribute('alt', 'Abbvie logo');
    logoA.appendChild(logoImg);
    logoP.appendChild(logoA);
    logosSection.appendChild(logoP);

    const legalNum = (footer?.querySelector('.abbv-legal-number')?.textContent || 'US-RNQ-250471').trim();
    const copyP = document.createElement('p');
    copyP.textContent = `© 2025 AbbVie. All rights reserved. ${legalNum}`;
    logosSection.appendChild(copyP);
    main.appendChild(logosSection);

    return [{
      element: main,
      path: '/rinvoq/footer',
      report: { title: 'RINVOQ footer fragment', fragment: 'footer' },
    }];
  },
};
