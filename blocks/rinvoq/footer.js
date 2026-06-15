import { getMetadata } from '../../scripts/aem.js';
import { getBrand } from '../../scripts/scripts.js';

/*
 * RINVOQ footer JS override (REPLACE mode).
 *
 * Diverges from the shared base footer (blocks/footer/footer.js) because the
 * rinvoq.com footer renders each column's first list item as an <h5> column
 * HEADING (grey, bold) above a list of plum links — the base decorator instead
 * renders that first <li> as the first link. RINVOQ also omits the base's
 * duplicate legal-links bar (those links already live in column 3) and shows a
 * grey AbbVie corporate logo + trademark text + copyright code at the bottom.
 *
 * Fragment (content/rinvoq/footer.plain.html) sections:
 *   0: nav — 3 <ul> columns; each column's FIRST <li> (a <strong> link) is the
 *      column heading, remaining <li> are links.
 *   1: legal — a legal-links <ul> (skipped for rinvoq) + trademark <p>.
 *   2: logos — AbbVie logo <a><img> + copyright <p> (© 2025 … US-RNQ-…).
 */

async function fetchFragment(path) {
  const resp = await fetch(path);
  if (!resp.ok) return null;
  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body;
}

export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const brandForFragment = getBrand();
  const defaultFooterPath = brandForFragment && brandForFragment !== 'linzess'
    ? `/content/${brandForFragment}/footer`
    : '/footer';
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : defaultFooterPath;
  const fragment = await fetchFragment(`${footerPath}.plain.html`);
  if (!fragment) return;

  const sections = [...fragment.children];
  const navSection = sections[0];
  const legalSection = sections[1];
  const logosSection = sections[2];

  const footer = document.createElement('footer');
  footer.className = `abbv-footer ${getBrand()}-footer`;
  const footerContent = document.createElement('div');
  footerContent.className = 'abbv-footer-content';

  // Navigation columns: each <ul>'s first <li> becomes the column <h5> heading,
  // the rest become the plum link list. Heading and links stay together inside
  // one column so they pair correctly when the columns stack on mobile.
  //
  // The original's SINGLE continuous separator line beneath the row of headings
  // (spanning all three columns + gutters) is reproduced on desktop via a CSS
  // grid: the row is a 3-column grid with the headings on grid-row 1 and the
  // link lists on grid-row 2, and a full-width row-level ::after draws the one
  // continuous rule. Per-column borders cannot span the gutters.
  const navRow = document.createElement('div');
  navRow.className = 'abbv-row abbv-row-flush abbv-footer-nav-row';

  const navLists = navSection?.querySelectorAll('ul') || [];
  [...navLists].forEach((ul) => {
    const col = document.createElement('div');
    col.className = 'abbv-col abbv-col-4';

    const items = [...ul.children];
    const headingLi = items.shift();
    const headingA = headingLi?.querySelector('a');
    const h5 = document.createElement('h5');
    h5.className = 'abbv-footer-heading';
    h5.textContent = headingA ? headingA.textContent : '';
    col.appendChild(h5);

    const newUl = document.createElement('ul');
    newUl.className = 'abbv-footer-vertical';
    items.forEach((li) => {
      const a = li.querySelector('a');
      if (!a) return;
      const newLi = document.createElement('li');
      const newA = document.createElement('a');
      newA.href = a.getAttribute('href');
      newA.innerHTML = a.innerHTML;
      newLi.appendChild(newA);
      newUl.appendChild(newLi);
    });
    col.appendChild(newUl);
    navRow.appendChild(col);
  });
  footerContent.appendChild(navRow);

  // Bottom band: AbbVie logo + trademark text + copyright code.
  const bottomDiv = document.createElement('div');
  bottomDiv.className = 'abbv-footer-bottom';

  // AbbVie corporate logo (shared mark; .plain.html may strip the <img>).
  const logoUl = document.createElement('ul');
  logoUl.className = 'abbv-footer-logos';
  const base = window.hlx?.codeBasePath || '';
  if (logosSection) {
    const logoP = [...logosSection.querySelectorAll('p')].find((p) => p.querySelector('a'));
    const a = logoP?.querySelector('a');
    if (a) {
      const li = document.createElement('li');
      const newA = document.createElement('a');
      newA.href = a.getAttribute('href') || 'https://www.abbvie.com';
      const img = a.querySelector('img');
      const newImg = document.createElement('img');
      newImg.src = img?.getAttribute('src') || `${base}/icons/abbvie-logo.png`;
      newImg.alt = img?.getAttribute('alt') || 'AbbVie logo';
      newA.appendChild(newImg);
      li.appendChild(newA);
      logoUl.appendChild(li);
    }
  }

  // Trademark disclaimer + copyright code, rendered next to the logo.
  const legalText = document.createElement('div');
  legalText.className = 'abbv-footer-legal-text';
  const trademarkP = legalSection?.querySelector('p');
  if (trademarkP) {
    const newP = document.createElement('p');
    newP.className = 'abbv-footer-trademark';
    newP.innerHTML = trademarkP.innerHTML;
    legalText.appendChild(newP);
  }
  if (logosSection) {
    const copyP = [...logosSection.querySelectorAll('p')].find((p) => !p.querySelector('a'));
    if (copyP) {
      const newP = document.createElement('p');
      newP.className = 'abbv-footer-copyright';
      newP.innerHTML = copyP.innerHTML;
      legalText.appendChild(newP);
    }
  }

  bottomDiv.appendChild(logoUl);
  bottomDiv.appendChild(legalText);

  footerContent.appendChild(bottomDiv);
  footer.appendChild(footerContent);

  block.textContent = '';
  block.appendChild(footer);
}
