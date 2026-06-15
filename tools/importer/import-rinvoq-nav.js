/* eslint-disable */
/* global WebImporter */

/**
 * Import script: RINVOQ header (nav) fragment.
 *
 * Produces content/rinvoq/nav.plain.html mirroring the Linzess nav fragment
 * (content/nishant-test/nav.plain.html) so the SHARED header decorator
 * (blocks/header/header.js) decorates it unchanged.
 *
 * Target fragment structure (3 top-level sections, separated by <hr> so the
 * markdown round-trip emits 3 sibling <div>s):
 *   section[0] navSection   : logo <p><a href="/"><img></a></p>, then nav <ul>
 *                             (each <li> = top link + optional nested <ul>),
 *                             then CTA <p><a></p>.
 *   section[1] eyebrowSection: <p>eyebrow text</p> + <p><a>eyebrow link</a></p>.
 *   section[2] utilitySection: utility nav <ul> of <li><a></li>.
 *
 * Source: https://www.rinvoq.com/  (header `.abbv-header-v2.global-header`).
 * RINVOQ's primary nav is a flat list of condition links (no submenus); the
 * utility nav has the ISI jump link, Full PI/Med Guide (submenu), HCP site,
 * and All Conditions Home. The runtime supplies the brand logo from the code
 * repo (/icons/rinvoq/logo-nav.png) since the .plain.html pipeline strips the
 * authored <img>; we still emit a logo <img> for structure parity.
 */

function el(doc, tag, attrs, html) {
  const node = doc.createElement(tag);
  if (attrs) Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  if (html != null) node.innerHTML = html;
  return node;
}

function liLink(doc, href, text, target) {
  const li = doc.createElement('li');
  const a = el(doc, 'a', target ? { href, target } : { href });
  a.textContent = text;
  li.appendChild(a);
  return li;
}

export default {
  transform: (payload) => {
    const { document } = payload;
    const main = document.createElement('div');

    const header = document.querySelector('.abbv-header-v2.global-header')
      || document.querySelector('.abbv-header-v2');

    // ---- Section 0: logo + primary nav + CTA ----
    const navSection = document.createElement('div');

    // Logo (left). Use the brand logo from the code repo (the live-site DAM URL
    // won't resolve in the EDS environment); header.js also falls back to this.
    const logoP = document.createElement('p');
    const logoA = el(document, 'a', { href: '/' });
    const logoImg = el(document, 'img', {
      src: '/icons/rinvoq/logo-nav.png',
      alt: 'RINVOQ upadacitinib',
    });
    logoA.appendChild(logoImg);
    logoP.appendChild(logoA);
    navSection.appendChild(logoP);

    // Primary nav: RINVOQ condition links (flat, no submenus). Pull the real
    // condition links from the primary navigation, dropping footnote/info-text
    // links (no real href) and the call/cost/sign-up utility links that the
    // header renders separately.
    const navUl = document.createElement('ul');
    const primaryLinks = header
      ? [...header.querySelectorAll('.abbv-header-v2-primary-navigation nav > ul > li > a')]
      : [];
    const skipClasses = ['nav-info-text', 'abbv-link-call-support', 'cost-and-savings-link', 'sign-up-nav-link'];
    primaryLinks.forEach((a) => {
      const href = a.getAttribute('href') || '';
      const cls = a.getAttribute('class') || '';
      const text = (a.textContent || '').trim();
      if (!href || href === '#') return;
      if (skipClasses.some((c) => cls.includes(c))) return;
      if (!text) return;
      navUl.appendChild(liLink(document, href, text));
    });
    navSection.appendChild(navUl);

    // CTA: Cost & Savings (RINVOQ's standalone right-side link).
    const ctaP = document.createElement('p');
    const ctaA = el(document, 'a', { href: '/cost' });
    ctaA.textContent = 'Cost & Savings';
    ctaP.appendChild(ctaA);
    navSection.appendChild(ctaP);

    main.appendChild(navSection);

    // ---- Section 1: eyebrow (RINVOQ has none; emit a benign support eyebrow) ----
    main.appendChild(document.createElement('hr'));
    const eyebrowSection = document.createElement('div');
    const eyebrowText = document.createElement('p');
    eyebrowText.textContent = 'Questions about RINVOQ? Call 1-800-2RINVOQ';
    eyebrowSection.appendChild(eyebrowText);
    const eyebrowLinkP = document.createElement('p');
    const eyebrowA = el(document, 'a', { href: 'tel:1-800-274-6867' });
    eyebrowA.textContent = '1-800-2RINVOQ';
    eyebrowLinkP.appendChild(eyebrowA);
    eyebrowSection.appendChild(eyebrowLinkP);
    main.appendChild(eyebrowSection);

    // ---- Section 2: utility nav ----
    main.appendChild(document.createElement('hr'));
    const utilitySection = document.createElement('div');
    const utilUl = document.createElement('ul');
    const utilLinks = header
      ? [...header.querySelectorAll('.abbv-header-v2-utility-navigation nav > ul > li')]
      : [];
    utilLinks.forEach((li) => {
      // Top-level utility link.
      const topA = li.querySelector(':scope > a');
      if (topA) {
        const href = topA.getAttribute('href') || '#';
        const text = (topA.textContent || '').trim();
        const target = topA.getAttribute('target');
        if (text) utilUl.appendChild(liLink(document, href, text, target));
      }
      // Flatten any submenu links (Full PI / Medication Guide) into the list.
      li.querySelectorAll(':scope > div ul > li > a').forEach((subA) => {
        const href = subA.getAttribute('href') || '#';
        const text = (subA.textContent || '').trim();
        if (text && href && href !== '#') {
          utilUl.appendChild(liLink(document, href, text, subA.getAttribute('target')));
        }
      });
    });
    utilitySection.appendChild(utilUl);
    main.appendChild(utilitySection);

    return [{
      element: main,
      path: '/rinvoq/nav',
      report: { title: 'RINVOQ nav fragment', fragment: 'nav' },
    }];
  },
};
