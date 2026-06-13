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
  // Section heading (40px Bebas, used for comparison table title)
  const sectionHeadingTexts = [
    'IBS-C & CIC Symptoms & Causes Comparison',
  ];
  // Sub-headings within sections (40px Bebas)
  const sectionSubHeadingTexts = [
    'The Difference Between', 'What Could Small',
    'Your constipation could be chronic',
    'Types of Treatments', 'Help Relieve Your Child',
    'How Do Doctors Diagnose',
    'LINZESS CAN HELP RELIEVE', 'How LINZESS Works',
    'When Can I Expect', 'Common Side Effects',
    'Hear From Real Patients',
    'HEAR THE CONSTIPATION CONVERSATION',
  ];
  // Smaller sub-sub-headings (24px bold Lato)
  const sectionSubSubTexts = [
    'How Does LINZESS Help', 'What is LINZESS',
    'Over-the-Counter Treatments', 'Prescription Medications',
    'Occasional Constipation', 'Chronic Constipation',
  ];
  main.querySelectorAll('.section.off-white .default-content-wrapper > p').forEach((p) => {
    const text = p.textContent.trim();
    if (headingTexts.some((h) => text.startsWith(h)) && text.length < 60) {
      p.classList.add('section-subheading');
    } else if (subHeadingTexts.some((h) => text.startsWith(h))) {
      p.classList.add('section-subsubheading');
    } else if (sectionHeadingTexts.some((h) => text === h)) {
      p.classList.add('section-heading');
    } else if (sectionSubHeadingTexts.some((h) => text.startsWith(h))) {
      p.classList.add('section-subheading');
    } else if (sectionSubSubTexts.some((h) => text.startsWith(h))) {
      p.classList.add('section-subsubheading');
    }
    if (text.startsWith('Actor') && text.includes('Portrayal')) {
      p.classList.add('actor-portrayal');
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
    if (sectionHeadingTexts.some((h) => text === h)) {
      p.classList.add('section-heading');
    } else if (sectionSubHeadingTexts.some((h) => text.startsWith(h))) {
      p.classList.add('section-subheading');
    } else if (sectionSubSubTexts.some((h) => text.startsWith(h))) {
      p.classList.add('section-subsubheading');
    }
  });
  const darkPurpleEyebrows = [
    'IBS-C & CIC', 'Constipation Treatment Options',
    'Pediatric Functional Constipation', 'How Linzess Works',
  ];
  main.querySelectorAll('.section.dark-purple .default-content-wrapper > p').forEach((p) => {
    const text = p.textContent.trim();
    if (darkPurpleEyebrows.some((h) => text === h) && p === p.parentElement.firstElementChild) {
      p.classList.add('section-eyebrow');
    } else if (sectionHeadingTexts.some((h) => text === h)) {
      p.classList.add('section-heading');
    } else if (sectionSubHeadingTexts.some((h) => text.startsWith(h))) {
      p.classList.add('section-subheading');
    } else if (sectionSubSubTexts.some((h) => text.startsWith(h))) {
      p.classList.add('section-subsubheading');
    }
    if (text.startsWith('Actor') && text.includes('Portrayal')) {
      p.classList.add('actor-portrayal');
    }
    if (text.startsWith('Could It Be More Than')) {
      p.classList.add('quiz-tout-heading');
      p.classList.remove('section-subheading');
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

// "Ready to Talk to Your Doctor?" tout: an image (Resources-Doctor-Tout) +
// "Actor Portrayal" caption + heading + body + CTA. The original renders this as
// a two-part card: full-bleed photo on the LEFT (with the "Actor Portrayal"
// caption overlaid bottom-left) and a white content panel on the RIGHT holding
// the heading, text, and a purple pill CTA. Runs independently of
// decorateContentCards so it fires on pages with no dark-purple section.
function decorateDoctorTout(main) {
  main.querySelectorAll(
    '.section.dark-purple .default-content-wrapper, .section.off-white .default-content-wrapper, .section.white .default-content-wrapper',
  ).forEach((wrapper) => {
    const imgP = [...wrapper.querySelectorAll(':scope > p')].find(
      (p) => p.querySelector('img[src*="Doctor-Tout"], img[src*="Resources-Doctor"]'),
    );
    if (!imgP || imgP.closest('.doctor-tout')) return;
    const card = document.createElement('div');
    card.className = 'doctor-tout';
    const imageSide = document.createElement('div');
    imageSide.className = 'doctor-tout-image';
    const contentSide = document.createElement('div');
    contentSide.className = 'doctor-tout-content';
    wrapper.insertBefore(card, imgP);
    imageSide.appendChild(imgP);
    let next = card.nextElementSibling;
    if (next && next.classList.contains('actor-portrayal')) {
      const cap = next; next = cap.nextElementSibling; imageSide.appendChild(cap);
    }
    card.appendChild(imageSide);
    card.appendChild(contentSide);
    next = card.nextElementSibling;
    while (next && next.tagName !== 'DIV' && next.tagName !== 'H2') {
      const current = next;
      next = current.nextElementSibling;
      const isCta = current.classList.contains('button-container') || current.querySelector('a');
      contentSide.appendChild(current);
      if (isCta) break;
    }
  });
}

// Savings sign-up methods: "Text" / "Call" / "Click" each = an icon paragraph
// (icon-text-msg / icon-daily-reminders / icon-web-click) + label + description +
// a CTA link. The original lays these three out as a side-by-side card row.
// Wrap each icon-led group into a .signup-card inside a .signup-cards row.
function decorateSignupCards(main) {
  main.querySelectorAll('.section.white .default-content-wrapper, .section.off-white .default-content-wrapper').forEach((wrapper) => {
    const iconParas = [...wrapper.querySelectorAll(':scope > p')].filter(
      (p) => p.querySelector('img[src*="icon-text-msg"], img[src*="icon-daily-reminders"], img[src*="icon-web-click"]'),
    );
    if (iconParas.length < 2) return;
    const row = document.createElement('div');
    row.className = 'signup-cards';
    wrapper.insertBefore(row, iconParas[0]);
    iconParas.forEach((iconP) => {
      const card = document.createElement('div');
      card.className = 'signup-card';
      card.appendChild(iconP);
      // Pull following paragraphs up to and including the first CTA link.
      let next = row.nextElementSibling;
      while (next && next.tagName === 'P' && !next.querySelector('img')) {
        const current = next;
        next = current.nextElementSibling;
        const hasLink = current.querySelector('a');
        card.appendChild(current);
        if (hasLink) break;
      }
      row.appendChild(card);
    });
  });
}

// Insurance cost table: flat paragraphs ("If You Have:" / "You Could Pay:" then
// alternating <strong> label paragraphs + description paragraphs) become a
// two-column table — dark-purple header row, then rows with a lavender label
// cell and a white description cell. Rebuilt in JS from the flat run.
function decorateCostTable(main) {
  main.querySelectorAll('.section.off-white .default-content-wrapper, .section.white .default-content-wrapper').forEach((wrapper) => {
    const kids = [...wrapper.children];
    const headIdx = kids.findIndex((p) => p.tagName === 'P' && p.textContent.trim() === 'If You Have:');
    if (headIdx < 0) return;
    const payIdx = headIdx + 1;
    if (!kids[payIdx] || kids[payIdx].textContent.trim() !== 'You Could Pay:') return;
    if (wrapper.querySelector(':scope > .cost-table')) return;
    const table = document.createElement('div');
    table.className = 'cost-table';
    wrapper.insertBefore(table, kids[headIdx]);
    // Header row.
    const headerRow = document.createElement('div');
    headerRow.className = 'cost-row cost-header';
    headerRow.appendChild(kids[headIdx]);
    headerRow.appendChild(kids[payIdx]);
    table.appendChild(headerRow);
    // A row label is a paragraph whose ONLY content is a <strong> (e.g.
    // "Commercial Insurance", "Medicaid"). The table has exactly these labels;
    // the run ends at the first footnote paragraph (leading <sup>) — everything
    // after that (footnotes, Insurance Coverage Support, MyAbbVie touts) stays
    // outside the table.
    const isLabel = (p) => p && p.tagName === 'P' && p.children.length === 1
      && p.firstElementChild.tagName === 'STRONG'
      && p.firstElementChild.textContent.trim() === p.textContent.trim();
    // A closing footnote is a <sup>-led paragraph with real prose after the
    // marker (length > 8); bare inline markers like "®" / "||" stay in the cell.
    const isFootnote = (p) => p && p.tagName === 'P' && p.firstElementChild
      && p.firstElementChild.tagName === 'SUP' && p.textContent.trim().length > 8;
    let node = table.nextElementSibling;
    while (node && isLabel(node)) {
      const row = document.createElement('div');
      row.className = 'cost-row';
      const labelCell = document.createElement('div');
      labelCell.className = 'cost-label';
      const descCell = document.createElement('div');
      descCell.className = 'cost-desc';
      let next = node.nextElementSibling;
      labelCell.appendChild(node);
      // Pull description paragraphs until the next label or a footnote.
      while (next && next.tagName === 'P' && !isLabel(next) && !isFootnote(next)) {
        const current = next;
        next = current.nextElementSibling;
        descCell.appendChild(current);
      }
      // Merge standalone inline-marker paragraphs (e.g. just "®" or "||") into
      // the preceding paragraph so they render inline as superscripts, not on
      // their own line.
      [...descCell.children].forEach((p) => {
        const isMarker = p.children.length === 1
          && p.firstElementChild.tagName === 'SUP'
          && p.textContent.trim().length <= 3;
        if (isMarker && p.previousElementSibling) {
          p.previousElementSibling.appendChild(p.firstElementChild);
          p.remove();
        }
      });
      row.appendChild(labelCell);
      row.appendChild(descCell);
      table.appendChild(row);
      node = table.nextElementSibling;
    }
  });
}

// Two-up icon cards with ALTERNATING backgrounds (first dark purple, second
// light purple): icon-led group = icon paragraph + title + description + CTA.
// Used by Community Resources (/resources) and the Insurance Coverage Support /
// MyAbbVie Assist pair (/savings-and-support). Runs standalone so it fires on
// pages without a dark-purple section.
function decorateCommunityCards(main) {
  const isCommunityIcon = (p) => !!(p && p.tagName === 'P' && p.querySelector('img[src*="icon-"]'));
  main.querySelectorAll('.section.off-white .default-content-wrapper').forEach((wrapper) => {
    if (wrapper.querySelector(':scope > .community-cards')) return;
    const iconParas = [...wrapper.querySelectorAll(':scope > p')].filter(isCommunityIcon);
    if (iconParas.length < 2) return;
    const row = document.createElement('div');
    row.className = 'community-cards';
    wrapper.insertBefore(row, iconParas[0]);
    iconParas.forEach((iconP, idx) => {
      const card = document.createElement('div');
      card.className = `community-card ${idx % 2 === 0 ? 'community-card-dark' : 'community-card-light'}`;
      card.appendChild(iconP);
      let next = row.nextElementSibling;
      while (next && next.tagName === 'P' && !isCommunityIcon(next)) {
        const current = next;
        next = current.nextElementSibling;
        const isButton = current.classList.contains('button-container') || current.querySelector('a');
        card.appendChild(current);
        if (isButton) break;
      }
      row.appendChild(card);
    });
  });
}

// "Program Terms, Conditions, and Eligibility Criteria" expandable accordion:
// a short title paragraph followed by the long legal text. Wrap into a clickable
// header + collapsible body (collapsed by default), matching the original.
function decorateSitemap(main) {
  if (!window.location.pathname.endsWith('/sitemap')) return;
  const wrapper = main.querySelector('.default-content-wrapper');
  if (!wrapper || wrapper.querySelector('.sitemap-grid')) return;
  const h2s = [...wrapper.children].filter((el) => el.tagName === 'H2');
  if (!h2s.length) return;
  // Group each <h2> + its following <p> links into a column section, then
  // place all groups into a grid that columnizes like the original sitemap.
  const grid = document.createElement('div');
  grid.className = 'sitemap-grid';
  const flow = [...wrapper.children].filter((el) => el.tagName === 'H2' || el.tagName === 'P');
  let current = null;
  flow.forEach((el) => {
    if (el.tagName === 'H2') {
      current = document.createElement('div');
      current.className = 'sitemap-group';
      grid.appendChild(current);
    }
    if (current) current.appendChild(el);
  });
  wrapper.appendChild(grid);
}

function decoratePageNotFound(main) {
  if (!window.location.pathname.endsWith('/page-not-found')) return;
  const wrapper = main.querySelector('.default-content-wrapper');
  if (!wrapper || wrapper.querySelector('.pnf-links-card')) return;
  // Wrap the "You might be able to find…" <h2> and its following link <p>s
  // into a rounded off-white card, matching the original layout.
  const h2 = [...wrapper.children].find((el) => el.tagName === 'H2');
  if (!h2) return;
  const card = document.createElement('div');
  card.className = 'pnf-links-card';
  h2.parentNode.insertBefore(card, h2);
  let node = h2;
  while (node && (node.tagName === 'H2' || node.tagName === 'P')) {
    const next = node.nextElementSibling;
    card.appendChild(node);
    node = next;
  }
}

function decorateFaqHero(main) {
  if (!window.location.pathname.endsWith('/faqs')) return;
  const wrapper = main.querySelector('.default-content-wrapper');
  if (!wrapper || wrapper.querySelector('.faq-hero')) return;
  // The first three nodes are: image <p>, "FAQs" eyebrow <p>, and the <h1>.
  // Wrap them into a full-width hero with the photo as background and the
  // eyebrow + orange divider + title overlaid at middle-left (matches original).
  const imgP = [...wrapper.children].find((el) => el.tagName === 'P' && el.querySelector('img'));
  const h1 = wrapper.querySelector('h1');
  if (!imgP || !h1) return;
  const eyebrow = [...wrapper.children].find((el) => el.tagName === 'P' && el.textContent.trim() === 'FAQs');
  const img = imgP.querySelector('img');
  const hero = document.createElement('div');
  hero.className = 'faq-hero';
  hero.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
  const inner = document.createElement('div');
  inner.className = 'faq-hero-content';
  hero.appendChild(inner);
  wrapper.insertBefore(hero, imgP);
  if (eyebrow) inner.appendChild(eyebrow);
  inner.appendChild(h1);
  imgP.remove();
}

function decorateTermsAccordion(main) {
  main.querySelectorAll('.default-content-wrapper > p').forEach((titleP) => {
    if (titleP.closest('.terms-accordion')) return;
    const text = titleP.textContent.trim();
    if (!/^Program Terms, Conditions,/.test(text)) return;
    const body = titleP.nextElementSibling;
    if (!body || body.tagName !== 'P') return;
    const acc = document.createElement('div');
    acc.className = 'terms-accordion';
    titleP.parentNode.insertBefore(acc, titleP);
    const header = document.createElement('button');
    header.className = 'terms-accordion-header';
    header.type = 'button';
    header.setAttribute('aria-expanded', 'false');
    header.innerHTML = `<span>${text}</span><span class="terms-accordion-icon" aria-hidden="true"></span>`;
    const panel = document.createElement('div');
    panel.className = 'terms-accordion-panel';
    titleP.remove();
    panel.appendChild(body);
    acc.appendChild(header);
    acc.appendChild(panel);
    header.addEventListener('click', () => {
      const open = acc.classList.toggle('open');
      header.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
}

function decorateContentCards(main) {
  // Stats cards: wrap map image + bold text pairs into side-by-side cards
  const darkSection = main.querySelector('.section.dark-purple > .default-content-wrapper');
  if (!darkSection) return;
  const mapImgs = darkSection.querySelectorAll(':scope > p > picture > img[alt*="million"]');
  if (mapImgs.length >= 2) {
    const statsRow = document.createElement('div');
    statsRow.className = 'stats-cards-row';
    const firstImg = mapImgs[0].closest('p');
    darkSection.insertBefore(statsRow, firstImg);
    mapImgs.forEach((img) => {
      const imgP = img.closest('p');
      const textP = imgP.nextElementSibling;
      const card = document.createElement('div');
      card.className = 'stats-card';
      card.appendChild(imgP);
      if (textP) card.appendChild(textP);
      statsRow.appendChild(card);
    });
  }

  // Video cards: wrap thumbnail + h3 + transcript into a card
  darkSection.querySelectorAll(':scope > p > picture > img[src*="boltdns"]').forEach((img) => {
    const imgP = img.closest('p');
    const card = document.createElement('div');
    card.className = 'video-card';
    darkSection.insertBefore(card, imgP);
    card.appendChild(imgP);
    // Grab the next h3 and the transcript link paragraph
    let next = card.nextElementSibling;
    if (next && next.tagName === 'H3') {
      card.appendChild(next);
      next = card.nextElementSibling;
    }
    // Quote paragraph
    if (next && next.tagName === 'P' && !next.querySelector('a[href*="transcript"]')) {
      card.appendChild(next);
      next = card.nextElementSibling;
    }
    // Transcript link
    if (next && next.tagName === 'P' && next.querySelector('a[href*="transcript"]')) {
      card.appendChild(next);
    }
  });

  // Quiz tout: wrap image + heading + text + CTA into a two-part card
  const quizImg = darkSection.querySelector(':scope > p > picture > img[src*="Quiz-Tout"]');
  if (quizImg) {
    const quizImgP = quizImg.closest('p');
    const card = document.createElement('div');
    card.className = 'quiz-tout-card';
    const imgSide = document.createElement('div');
    imgSide.className = 'quiz-tout-image';
    const textSide = document.createElement('div');
    textSide.className = 'quiz-tout-content';
    darkSection.insertBefore(card, quizImgP);
    imgSide.appendChild(quizImgP);
    card.appendChild(imgSide);
    card.appendChild(textSide);
    let next = card.nextElementSibling;
    while (next && !next.classList.contains('section-metadata')) {
      const current = next;
      next = next.nextElementSibling;
      textSide.appendChild(current);
    }
  }

  // Resources article cards: each article = an "Article-*.jpg" image paragraph
  // followed by title/description/"Read the article" link paragraphs. Group the
  // contiguous run of article images in a section into one .article-cards-row of
  // .article-card so the section renders as the original's lavender card grid
  // (3-up healthy routines, 5-up wellness tips) instead of full-width stacked
  // blocks. Runs before the off-white/white early-return guards below so it is
  // not skipped on pages (like /resources) that lack those sections. Icon SVGs
  // and touts are excluded by matching only "Article-*" image sources.
  const isArticleImg = (p) => !!(p && p.tagName === 'P' && p.querySelector('img[src*="Article-"]'));
  main.querySelectorAll(
    '.section.white .default-content-wrapper, .section.dark-purple .default-content-wrapper',
  ).forEach((wrapper) => {
    const imgParas = [...wrapper.querySelectorAll(':scope > p')].filter(isArticleImg);
    if (imgParas.length < 2) return;
    // Each wrapper holds exactly one contiguous article group, so collect every
    // article card into a single row inserted before the first article image.
    const row = document.createElement('div');
    row.className = 'article-cards-row';
    wrapper.insertBefore(row, imgParas[0]);
    imgParas.forEach((imgP) => {
      const card = document.createElement('div');
      card.className = 'article-card';
      card.appendChild(imgP);
      // Pull following paragraphs (title, desc, link) up to and including the
      // first link paragraph; stop early at the next image so adjacent touts
      // are never absorbed.
      let next = row.nextElementSibling;
      while (next && next.tagName === 'P' && !next.querySelector('img')) {
        const current = next;
        next = current.nextElementSibling;
        const hasLink = current.querySelector('a');
        card.appendChild(current);
        if (hasLink) break;
      }
      row.appendChild(card);
    });
  });

  // Wellness Tips "tip cards": each is an icon-*.svg paragraph followed by a
  // <strong> title paragraph and a bulleted <ul>. The original renders these as
  // full-width cards with a circular icon badge overhanging the left edge, in an
  // ALTERNATING color scheme: odd cards = lavender card + white badge, even
  // cards = off-white card + lavender badge. Wrap each icon-led group into a
  // .wellness-tip-card (with .tip-card-lavender / .tip-card-offwhite) and collect
  // the consecutive cards into a .wellness-tips-cards stack.
  const isTipIcon = (p) => !!(p && p.tagName === 'P' && p.querySelector('img[src*="icon-"]'));
  main.querySelectorAll('.section.dark-purple .default-content-wrapper').forEach((wrapper) => {
    const iconParas = [...wrapper.querySelectorAll(':scope > p')].filter(isTipIcon);
    if (iconParas.length < 2) return;
    const stack = document.createElement('div');
    stack.className = 'wellness-tips-cards';
    wrapper.insertBefore(stack, iconParas[0]);
    iconParas.forEach((iconP, idx) => {
      const card = document.createElement('div');
      card.className = `wellness-tip-card ${idx % 2 === 0 ? 'tip-card-lavender' : 'tip-card-offwhite'}`;
      card.appendChild(iconP);
      // Pull the following title paragraph and bulleted list into the card,
      // stopping at the next icon or any element after the list.
      let next = stack.nextElementSibling;
      while (next && next.tagName !== 'DIV' && !isTipIcon(next)) {
        const current = next;
        next = current.nextElementSibling;
        const isList = current.tagName === 'UL';
        card.appendChild(current);
        if (isList) break;
      }
      stack.appendChild(card);
    });
  });

  // Patient-story video: the import captured a Brightcove player and dumped its
  // entire control UI (Play, Mute, Playback Rate, Captions, modal dialog text…)
  // as a long run of plain paragraphs, plus a duplicate poster image. The
  // original shows only a poster thumbnail followed by the H3 title + View
  // Transcript link. Keep the first poster, then drop every sibling between it
  // and the real H3 title (all leaked player chrome), and remove the duplicate
  // poster image.
  main.querySelectorAll('.section.off-white .default-content-wrapper, .section.dark-purple .default-content-wrapper').forEach((wrapper) => {
    const posters = [...wrapper.querySelectorAll(':scope > p')].filter(
      (p) => p.querySelector('img[src*="boltdns"], img[src*="brightcove"]'),
    );
    if (!posters.length) return;
    const poster = posters[0];
    // Find the next H3 title after the poster — the real video card heading.
    let h3 = poster.nextElementSibling;
    while (h3 && h3.tagName !== 'H3') h3 = h3.nextElementSibling;
    if (!h3) return;
    // Remove everything strictly between the poster and the H3 (leaked controls
    // and duplicate posters).
    let node = poster.nextElementSibling;
    while (node && node !== h3) {
      const toRemove = node;
      node = node.nextElementSibling;
      toRemove.remove();
    }
    poster.classList.add('video-poster');
  });

  // Comparison table: restructure flat content into a two-column grid
  const compHeading = darkSection.querySelector(':scope > p.section-heading');
  if (compHeading && compHeading.textContent.includes('Symptoms & Causes')) {
    const table = document.createElement('div');
    table.className = 'comparison-table';
    darkSection.insertBefore(table, compHeading.nextElementSibling);
    // Collect all elements between the heading and the next section-subheading or video-card
    let el = table.nextElementSibling;
    const tableElements = [];
    while (el && !el.classList.contains('section-subheading') && !el.classList.contains('video-card') && el.tagName !== 'H2') {
      const current = el;
      el = el.nextElementSibling;
      tableElements.push(current);
    }
    // Parse structure: IBS-C header, CIC header, Symptoms row header,
    // IBS-C constipation list, abdominal list, CIC constipation list, Causes row, etc.
    // Header row
    const headerRow = document.createElement('div');
    headerRow.className = 'comp-header-row';
    const ibscHeader = tableElements.shift(); // <p><strong>IBS-C</strong></p>
    const cicHeader = tableElements.shift(); // <p><strong>CIC</strong></p>
    if (ibscHeader) headerRow.appendChild(ibscHeader);
    if (cicHeader) headerRow.appendChild(cicHeader);
    table.appendChild(headerRow);

    // Symptoms section
    const symptomsLabel = tableElements.shift(); // <p><strong>Symptoms</strong></p>
    if (symptomsLabel) {
      symptomsLabel.className = 'comp-row-label';
      table.appendChild(symptomsLabel);
    }

    // IBS-C symptoms (CONSTIPATION + list + ABDOMINAL + list)
    const sympRow = document.createElement('div');
    sympRow.className = 'comp-content-row';
    const ibscCol = document.createElement('div');
    ibscCol.className = 'comp-col';
    const cicCol = document.createElement('div');
    cicCol.className = 'comp-col';
    // First CONSTIPATION header + list = IBS-C
    let item = tableElements.shift();
    while (item && !(item.tagName === 'P' && item.textContent.trim() === 'CONSTIPATION' && ibscCol.children.length > 0)) {
      ibscCol.appendChild(item);
      item = tableElements.shift();
    }
    // Second CONSTIPATION header + list = CIC
    if (item) cicCol.appendChild(item);
    item = tableElements.shift();
    while (item && !(item.tagName === 'P' && item.querySelector('strong') && item.textContent.trim() === 'Causes')) {
      cicCol.appendChild(item);
      item = tableElements.shift();
    }
    sympRow.appendChild(ibscCol);
    sympRow.appendChild(cicCol);
    table.appendChild(sympRow);

    // Causes section
    if (item) {
      item.className = 'comp-row-label';
      table.appendChild(item);
    }
    const causesRow = document.createElement('div');
    causesRow.className = 'comp-content-row';
    const ibscCauses = document.createElement('div');
    ibscCauses.className = 'comp-col';
    const cicCauses = document.createElement('div');
    cicCauses.className = 'comp-col';
    // Split: IBS-C causes come first, CIC causes start with "Researchers believe"
    let inCIC = false;
    while (tableElements.length > 0) {
      item = tableElements.shift();
      if (!inCIC && item.tagName === 'P' && item.querySelector('strong')
        && item.textContent.includes('Researchers believe several factors may contribute to the development of CIC')) {
        inCIC = true;
      }
      if (inCIC) {
        cicCauses.appendChild(item);
      } else {
        ibscCauses.appendChild(item);
      }
    }
    causesRow.appendChild(ibscCauses);
    causesRow.appendChild(cicCauses);
    table.appendChild(causesRow);
  }

  // Treatment cards: wrap icon + title + content into two-column cards in off-white
  const offWhiteSection = main.querySelector('.section.off-white > .default-content-wrapper');
  if (!offWhiteSection) return;
  const treatmentIcons = offWhiteSection.querySelectorAll(':scope > p > picture > img[src*="icon-fiber-bottle"], :scope > p > picture > img[src*="icon-pill-bottle"]:not([src*="purple"])');
  if (treatmentIcons.length >= 2) {
    const treatRow = document.createElement('div');
    treatRow.className = 'treatment-cards-row';
    const firstIcon = treatmentIcons[0].closest('p');
    offWhiteSection.insertBefore(treatRow, firstIcon);
    treatmentIcons.forEach((icon) => {
      const iconP = icon.closest('p');
      const card = document.createElement('div');
      card.className = 'treatment-card';
      card.appendChild(iconP);
      let next = treatRow.nextElementSibling;
      while (next && !next.querySelector('picture > img[src*="icon-"]') && next.tagName !== 'DIV') {
        const current = next;
        next = treatRow.nextElementSibling;
        card.appendChild(current);
      }
      treatRow.appendChild(card);
    });
  }

  // Pediatric cards: two icon+title+list groups side-by-side
  const whiteSection = main.querySelector('.section.white.columns-promo-container > .default-content-wrapper');
  if (!whiteSection) return;
  const pedIcons = whiteSection.querySelectorAll(':scope > p > picture > img[src*="icon-calendar"], :scope > p > picture > img[src*="icon-pill-bottle-purple"]');
  if (pedIcons.length >= 2) {
    const pedRow = document.createElement('div');
    pedRow.className = 'treatment-cards-row pediatric-cards-row';
    const firstPedIcon = pedIcons[0].closest('p');
    whiteSection.insertBefore(pedRow, firstPedIcon);
    pedIcons.forEach((icon) => {
      const iconP = icon.closest('p');
      const card = document.createElement('div');
      card.className = 'treatment-card';
      card.appendChild(iconP);
      let next = pedRow.nextElementSibling;
      while (next && !next.querySelector('picture > img[src*="icon-"]')
        && next.tagName !== 'DIV' && !next.querySelector('strong')) {
        const current = next;
        next = pedRow.nextElementSibling;
        card.appendChild(current);
      }
      pedRow.appendChild(card);
    });
  }
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
  // restructure content cards for understanding-constipation
  decorateContentCards(main);
  // doctor tout — runs independently so it fires on pages without a dark section
  decorateDoctorTout(main);
  // savings sign-up method cards (Text/Call/Click)
  decorateSignupCards(main);
  // insurance cost table (If You Have / You Could Pay)
  decorateCostTable(main);
  // two-up alternating icon cards (Community Resources / support pair)
  decorateCommunityCards(main);
  // "Program Terms" expandable accordion
  decorateTermsAccordion(main);
  // sitemap multi-column section grid
  decorateSitemap(main);
  // 404 page "find these links" rounded card
  decoratePageNotFound(main);
  // FAQs full-width hero photo with overlaid eyebrow + title
  decorateFaqHero(main);
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
  // Patient video transcript pages share a single centered text layout.
  // Tag the body so transcript-scoped styles (centered column, white arch,
  // orange divider above the title) apply without per-page content edits.
  if (window.location.pathname.includes('/linzess-patient-experiences/')
    && window.location.pathname.endsWith('-transcripts')) {
    document.body.classList.add('transcript-page');
  }
  // 404 page: tag body so its plain underlined text links (not pill buttons)
  // and centered error layout apply without per-page content edits.
  if (window.location.pathname.endsWith('/page-not-found')) {
    document.body.classList.add('page-not-found-page');
  }
  // Sitemap: tag body so its multi-column section grid + plain underlined
  // links (not pill buttons) apply.
  if (window.location.pathname.endsWith('/sitemap')) {
    document.body.classList.add('sitemap-page');
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
