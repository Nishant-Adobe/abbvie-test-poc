import { getMetadata } from '../../scripts/aem.js';

async function fetchFragment(path) {
  const resp = await fetch(path);
  if (!resp.ok) return null;
  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body;
}

export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  let footerPath;
  if (footerMeta) {
    footerPath = new URL(footerMeta, window.location).pathname;
  } else {
    const dir = window.location.pathname.replace(/\/$/, '');
    footerPath = `${dir}/footer`;
  }
  const fragment = await fetchFragment(`${footerPath}.plain.html`);
  if (!fragment) return;

  const sections = [...fragment.children];
  const navSection = sections[0];
  const legalSection = sections[1];
  const logosSection = sections[2];

  // Build the exact original DOM
  const footer = document.createElement('footer');
  footer.className = 'abbv-footer linzess-footer';
  const footerContent = document.createElement('div');
  footerContent.className = 'abbv-footer-content';

  // Navigation columns
  const navRow = document.createElement('div');
  navRow.className = 'abbv-row abbv-row-flush';
  const navLists = navSection?.querySelectorAll('ul') || [];
  [...navLists].forEach((ul) => {
    const col = document.createElement('div');
    col.className = 'abbv-col abbv-col-3';
    const newUl = document.createElement('ul');
    newUl.className = 'abbv-footer-vertical';
    [...ul.children].forEach((li) => {
      const a = li.querySelector('a');
      if (!a) return;
      const newLi = document.createElement('li');
      const newA = document.createElement('a');
      newA.href = a.getAttribute('href');
      newA.innerHTML = a.innerHTML;
      if (a.querySelector('strong')) {
        newA.className = 'lato-extrabold';
      }
      newLi.appendChild(newA);
      newUl.appendChild(newLi);
    });
    col.appendChild(newUl);
    navRow.appendChild(col);
  });
  footerContent.appendChild(navRow);

  // Legal/bottom section
  const bottomDiv = document.createElement('div');
  bottomDiv.className = 'abbv-footer-bottom';

  // Separator
  bottomDiv.appendChild(document.createElement('hr'));

  // Legal links
  const legalLinks = legalSection?.querySelector('ul');
  if (legalLinks) {
    const legalUl = document.createElement('ul');
    legalUl.className = 'abbv-footer-legal-links';
    [...legalLinks.children].forEach((li) => {
      const a = li.querySelector('a');
      if (!a) return;
      const newLi = document.createElement('li');
      const newA = document.createElement('a');
      newA.href = a.getAttribute('href');
      newA.textContent = a.textContent;
      if (a.getAttribute('target')) newA.target = a.getAttribute('target');
      newLi.appendChild(newA);
      legalUl.appendChild(newLi);
    });
    bottomDiv.appendChild(legalUl);
  }

  // Trademark + disclaimer paragraphs
  const legalParagraphs = legalSection?.querySelectorAll('p') || [];
  [...legalParagraphs].forEach((p) => {
    const newP = document.createElement('p');
    newP.className = 'abbv-footer-trademark';
    newP.innerHTML = p.innerHTML;
    bottomDiv.appendChild(newP);
  });

  // Logos + copyright
  if (logosSection) {
    bottomDiv.appendChild(document.createElement('hr'));
    const logosUl = document.createElement('ul');
    logosUl.className = 'abbv-footer-logos';
    const logoParagraphs = logosSection.querySelectorAll('p');
    [...logoParagraphs].forEach((p) => {
      const li = document.createElement('li');
      const a = p.querySelector('a');
      const img = p.querySelector('img');
      if (a && img) {
        const newA = document.createElement('a');
        newA.href = a.getAttribute('href');
        const newImg = document.createElement('img');
        newImg.alt = img.getAttribute('alt') || '';
        newImg.src = img.getAttribute('src');
        newA.appendChild(newImg);
        li.appendChild(newA);
      } else {
        li.className = 'abbv-footer-copyright';
        li.innerHTML = p.innerHTML;
      }
      logosUl.appendChild(li);
    });
    bottomDiv.appendChild(logosUl);
  }

  footerContent.appendChild(bottomDiv);
  footer.appendChild(footerContent);

  block.textContent = '';
  block.appendChild(footer);
}
