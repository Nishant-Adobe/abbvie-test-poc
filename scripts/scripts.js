import {
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  getMetadata,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

function autolinkModals(doc) {
  doc.addEventListener('click', async (e) => {
    const origin = e.target.closest('a');
    if (origin && origin.href && origin.href.includes('/modals/')) {
      e.preventDefault();
      const { openModal } = await import(`${window.hlx.codeBasePath}/blocks/modal/modal.js`);
      openModal(origin.href);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

function a11yLinks(main) {
  const links = main.querySelectorAll('a');
  links.forEach((link) => {
    let label = link.textContent;
    if (!label && link.querySelector('span.icon')) {
      const icon = link.querySelector('span.icon');
      label = icon ? icon.classList[1]?.split('-')[1] : label;
    }
    link.setAttribute('aria-label', label);
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
function decorateSubHeadings(main) {
  const headingTexts = [
    'Already Been', 'Need A Savings Card', 'Instructions For Adults',
    'HOW TO STORE',
  ];
  const subHeadingTexts = [
    'Prepare for Your Visit', 'Choose how you want', 'Take LINZESS',
  ];
  main.querySelectorAll('.section.off-white .default-content-wrapper > p').forEach((p) => {
    const text = p.textContent.trim();
    if (headingTexts.some((h) => text.startsWith(h)) && text.length < 60) {
      p.classList.add('section-subheading');
    } else if (subHeadingTexts.some((h) => text.startsWith(h))) {
      p.classList.add('section-subsubheading');
    }
  });
  main.querySelectorAll('.section.white .default-content-wrapper > p').forEach((p) => {
    const text = p.textContent.trim();
    if (text === 'Prepare for Your Visit With the Gut Check') {
      p.classList.add('section-subsubheading');
    }
    if (text.startsWith('Actor') && text.includes('Portrayal')) {
      p.classList.add('actor-portrayal');
    }
  });
  // Wrap dosage instruction groups into card containers
  main.querySelectorAll('.section.off-white .default-content-wrapper > p > picture > img[src*="-blue"]').forEach((img) => {
    const iconP = img.closest('p');
    const card = document.createElement('div');
    card.className = 'dosage-card';
    iconP.parentNode.insertBefore(card, iconP);
    card.appendChild(iconP);
    let next = card.nextElementSibling;
    while (next && next.tagName === 'P' && !next.querySelector('picture') && !next.classList.contains('section-subheading') && !next.classList.contains('section-subsubheading')) {
      const current = next;
      next = next.nextElementSibling;
      if (current.textContent.trim() === '') break;
      card.appendChild(current);
    }
  });
  // Wrap Instructions + tabs + dosage cards in a white card container
  main.querySelectorAll('.section.off-white .default-content-wrapper').forEach((wrapper) => {
    const instrHeading = Array.from(wrapper.querySelectorAll(':scope > p.section-subheading')).find(
      (p) => p.textContent.trim().startsWith('Instructions'),
    );
    if (!instrHeading) return;
    const storeHeading = Array.from(wrapper.querySelectorAll(':scope > p.section-subheading')).find(
      (p) => p.textContent.trim().startsWith('HOW TO STORE'),
    );
    if (!storeHeading) return;
    const whiteCard = document.createElement('div');
    whiteCard.className = 'instructions-card';
    wrapper.insertBefore(whiteCard, instrHeading);
    let el = instrHeading;
    while (el && el !== storeHeading) {
      const current = el;
      el = el.nextElementSibling;
      whiteCard.appendChild(current);
    }
  });
  // Tab switching for dosage instructions (Adults / Pediatric)
  main.querySelectorAll('.instructions-card').forEach((card) => {
    const allSubheadings = Array.from(card.querySelectorAll(':scope > p.section-subsubheading'))
      .filter((p) => p.textContent.trim() === 'Take LINZESS');
    if (allSubheadings.length < 2) return;

    // Group content into adult (before 2nd "Take LINZESS") and pediatric (from 2nd onwards)
    const adultElements = [];
    const pediatricElements = [];
    let isAdult = true;
    let passedFirstTake = false;
    Array.from(card.children).forEach((child) => {
      if (child.classList.contains('section-subsubheading')
        && child.textContent.trim() === 'Take LINZESS') {
        if (passedFirstTake) {
          isAdult = false;
        }
        passedFirstTake = true;
      }
      if (child.classList.contains('section-subheading')
        || child.classList.contains('button-container')) return;
      if (!isAdult) {
        pediatricElements.push(child);
        child.style.display = 'none';
      } else if (passedFirstTake) {
        adultElements.push(child);
      }
    });

    // Add click handlers to tab buttons
    const tabs = card.querySelectorAll(':scope > p.button-container');
    if (tabs.length < 2) return;
    const adultTab = tabs[0].querySelector('a');
    const pedTab = tabs[1].querySelector('a');

    function showAdult(e) {
      if (e) e.preventDefault();
      adultElements.forEach((el) => { el.style.display = ''; });
      pediatricElements.forEach((el) => { el.style.display = 'none'; });
      if (adultTab) {
        adultTab.style.backgroundColor = 'var(--linz-dark-purple, #422e83)';
        adultTab.style.color = '#fff';
      }
      if (pedTab) {
        pedTab.style.backgroundColor = 'var(--linz-light-purple, #d9d7f9)';
        pedTab.style.color = 'var(--linz-dark-purple, #422e83)';
      }
    }

    function showPediatric(e) {
      if (e) e.preventDefault();
      adultElements.forEach((el) => { el.style.display = 'none'; });
      pediatricElements.forEach((el) => { el.style.display = ''; });
      if (pedTab) {
        pedTab.style.backgroundColor = 'var(--linz-dark-purple, #422e83)';
        pedTab.style.color = '#fff';
      }
      if (adultTab) {
        adultTab.style.backgroundColor = 'var(--linz-light-purple, #d9d7f9)';
        adultTab.style.color = 'var(--linz-dark-purple, #422e83)';
      }
    }

    if (adultTab) adultTab.addEventListener('click', showAdult);
    if (pedTab) pedTab.addEventListener('click', showPediatric);

    // Default: show adult, hide pediatric
    showAdult(null);
  });
}

export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  // add aria-label to links
  a11yLinks(main);
  // style sub-section headings in content sections
  decorateSubHeadings(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    doc.body.dataset.breadcrumbs = true;
  }
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  autolinkModals(doc);

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
