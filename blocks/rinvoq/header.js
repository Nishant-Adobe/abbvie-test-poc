import { getMetadata } from '../../scripts/aem.js';
import { getBrand, brandIcon } from '../../scripts/scripts.js';

/*
 * Brand JS override — RINVOQ · header (REPLACE mode).
 *
 * Registered in blocks/block-brand-overrides.json -> jsOverrides.header = ["rinvoq"].
 * When listed, scripts/aem.js loadBlock() runs THIS decorator INSTEAD of the base
 * blocks/header/header.js for the rinvoq brand (the base does NOT run). Linzess and
 * every other brand keep running the base decorator unchanged.
 *
 * Why an override is needed (the base cannot produce RINVOQ's desktop chrome):
 *   1. The base right region only builds a mobile hamburger. RINVOQ's desktop header
 *      has an inline right cluster — a 3-item link list (call / Cost & Savings /
 *      Sign up) followed by a SEARCH icon, with the hamburger reserved for mobile.
 *      That DOM does not exist in the base, so CSS alone can't create it.
 *   2. The eyebrow (magenta strip) text in content/rinvoq/nav.plain.html is the wrong
 *      copy ("Questions about RINVOQ? Call 1-800-2RINVOQ"). The original strip reads
 *      "Learn how AbbVie could help you save. 1-800-2RINVOQ" with two links. Header
 *      chrome copy is supplied here as static brand markup (the cleaner of the two
 *      options the brief allowed) so the visual matches now without a re-import.
 *   3. The utility nav must lead with a home-icon "All Conditions Home" then show only
 *      ISI / Full PI & Patient Info / HCP Site (the fragment also carries Full PI
 *      English + Medication Guide, which the original utility row does not show).
 *
 * abbv-* class names are kept verbatim so the shared abbv-framework.css continues to
 * apply, and brand styling lives alongside in blocks/rinvoq/header.css.
 */

async function fetchFragment(path) {
  const resp = await fetch(path);
  if (!resp.ok) return null;
  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body;
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const brand = getBrand();
  const defaultNavPath = brand && brand !== 'linzess'
    ? `/content/${brand}/nav`
    : '/nav';
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : defaultNavPath;
  const fragment = await fetchFragment(`${navPath}.plain.html`);
  if (!fragment) return;

  const sections = [...fragment.children];
  const navSection = sections[0];
  const utilitySection = sections[2];

  // Logo: the .plain.html pipeline strips the authored <img>, so fall back to the
  // brand logo in the code repo.
  const logoImg = navSection.querySelector('img');
  const logoLink = navSection.querySelector('a[href="/"], a[href]');
  const logoHref = logoLink?.getAttribute('href') || '/';

  // The primary condition nav (first top-level <ul>) — RINVOQ keeps this behind the
  // mobile MENU flyout, never inline at desktop.
  const navItems = navSection.querySelector(':scope > ul') || navSection.querySelector('ul');

  // ---- Build the header --------------------------------------------------------
  const header = document.createElement('header');
  header.className = `abbv-header-v2 ${brand}-header ${brand}-header-classic abbv-sticky search-box-classic`;

  // Skip link
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.className = 'abbv-skip-to-main-content sr-only';
  skipLink.textContent = 'Skip to Main content';
  header.appendChild(skipLink);

  // ---- 1. Magenta eyebrow strip (brand chrome copy) ----------------------------
  // Original: "Learn how AbbVie could help you save. 1-800-2RINVOQ" (2 underlined
  // links), centered white text on the #90124a band.
  const eyebrow = document.createElement('div');
  eyebrow.className = 'abbv-eyebrow';
  eyebrow.setAttribute('data-enabled', 'true');
  eyebrow.setAttribute('data-visible', 'true');
  const eyebrowP = document.createElement('p');
  eyebrowP.className = 'abbv-eyebrow-large';
  const learnA = document.createElement('a');
  learnA.href = '/cost';
  learnA.textContent = 'Learn how';
  const callA = document.createElement('a');
  callA.href = 'tel:1-800-274-6867';
  callA.textContent = '1-800-2RINVOQ';
  eyebrowP.append(learnA, ' AbbVie could help you save. ', callA);
  eyebrow.appendChild(eyebrowP);
  header.appendChild(eyebrow);

  // ---- 2. Utility navigation (light-grey row) ----------------------------------
  // Lead with a home-icon "All Conditions Home", then the three plum items the
  // original row shows. We pull hrefs from the fragment's utility list where
  // available, and fall back to known targets otherwise.
  const fragUtil = {};
  [...(utilitySection?.querySelectorAll('li a') || [])].forEach((a) => {
    fragUtil[a.textContent.trim()] = a.getAttribute('href');
  });
  const utilSpec = [
    { label: 'All Conditions Home', href: fragUtil['All Conditions Home'] || '/', home: true },
    { label: 'Important Safety Information', href: fragUtil['Important Safety Information'] || '#abbv_use_statement' },
    { label: 'Full Prescribing Information & Patient Information', href: fragUtil['Full Prescribing Information & Patient Information'] || '#', caret: true },
    { label: 'Healthcare Professionals Site', href: fragUtil['Healthcare Professionals Site'] || '#' },
  ];

  const utilNav = document.createElement('div');
  utilNav.className = 'abbv-header-v2-utility-navigation abbv-navigation';
  const utilNavEl = document.createElement('nav');
  utilNavEl.setAttribute('aria-label', 'Utility Navigation');
  const utilUl = document.createElement('ul');
  utilUl.setAttribute('role', 'menubar');
  utilSpec.forEach((item) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'none');
    const a = document.createElement('a');
    a.setAttribute('role', 'menuitem');
    a.className = `i-b nav-tier1 sm-display${item.home ? ' home-condition-link' : ''}${item.caret ? ' has-caret' : ''}`;
    a.href = item.href;
    a.textContent = item.label;
    li.appendChild(a);
    utilUl.appendChild(li);
  });
  utilNavEl.appendChild(utilUl);
  utilNav.appendChild(utilNavEl);
  header.appendChild(utilNav);

  // ---- 3. Charcoal content bar: logo (left) + right cluster --------------------
  const contentContainer = document.createElement('div');
  contentContainer.className = 'abbv-header-content-container';
  const content = document.createElement('div');
  content.className = 'abbv-header-v2-content';

  // Logo (left)
  const left = document.createElement('div');
  left.className = 'abbv-header-v2-left';
  const logoA = document.createElement('a');
  logoA.href = logoHref;
  const img = document.createElement('img');
  img.src = logoImg?.getAttribute('src') || brandIcon('logo-nav.png');
  img.alt = logoImg?.getAttribute('alt') || `${brand} logo`;
  img.title = `${brand} logo`;
  img.width = 185;
  img.height = 64;
  logoA.appendChild(img);
  left.appendChild(logoA);
  content.appendChild(left);

  // Right region: link-list cluster + search + (mobile-only) hamburger
  const right = document.createElement('div');
  right.className = 'abbv-header-v2-right';

  // 3a. Inline link list — call / Cost & Savings / Sign up (white labels, plum
  // underlined links, "•" separators added in CSS).
  const linkList = document.createElement('div');
  linkList.className = 'abbv-link-list horizontal';
  const linkUl = document.createElement('ul');
  const clusterSpec = [
    { label: 'For savings & support, call 1-800-2RINVOQ', href: 'tel:1-800-274-6867', cls: 'abbv-link-call-support' },
    { label: 'Cost & Savings', href: '/cost', cls: 'abbv-link-sign-up' },
    { label: 'Sign up for RINVOQ updates', href: '/sign-up', cls: 'abbv-link-sign-up' },
  ];
  clusterSpec.forEach((item) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = item.cls;
    a.href = item.href;
    a.textContent = item.label;
    li.appendChild(a);
    linkUl.appendChild(li);
  });
  linkList.appendChild(linkUl);
  right.appendChild(linkList);

  // 3b. Util icons container: search toggle + mobile hamburger
  const utilIcons = document.createElement('div');
  utilIcons.className = 'util-icons-container';

  const searchUtil = document.createElement('div');
  searchUtil.className = 'abbv-header-util abbv-header-search';
  const searchToggle = document.createElement('span');
  searchToggle.className = 'abbv-search-toggle';
  searchToggle.setAttribute('role', 'button');
  searchToggle.setAttribute('tabindex', '0');
  searchToggle.setAttribute('aria-label', 'Search');
  const searchIcon = document.createElement('i');
  searchIcon.className = 'abbv-icon-search i-a';
  searchIcon.setAttribute('aria-hidden', 'true');
  searchToggle.appendChild(searchIcon);
  searchUtil.appendChild(searchToggle);
  utilIcons.appendChild(searchUtil);

  const menuToggleDiv = document.createElement('div');
  menuToggleDiv.className = 'abbv-header-util';
  menuToggleDiv.id = 'abbv-menu-toggle';
  const hamburger = document.createElement('div');
  hamburger.className = 'abbv-header-v2-mobile-primary-navigation';
  hamburger.tabIndex = 0;
  hamburger.setAttribute('aria-label', 'navigation menu');
  hamburger.setAttribute('role', 'button');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = '<span class="line"></span><span class="line"></span><span class="line"></span>';
  menuToggleDiv.appendChild(hamburger);
  utilIcons.appendChild(menuToggleDiv);

  right.appendChild(utilIcons);
  content.appendChild(right);
  contentContainer.appendChild(content);

  // ---- Primary condition navigation (mobile flyout only) -----------------------
  const primaryNav = document.createElement('div');
  primaryNav.className = 'abbv-header-v2-primary-navigation abbv-navigation';
  const mainNav = document.createElement('nav');
  mainNav.setAttribute('aria-label', 'Main Navigation');
  const mainUl = document.createElement('ul');
  mainUl.setAttribute('role', 'menu');
  if (navItems) {
    [...navItems.children].forEach((li) => {
      const topLink = li.querySelector(':scope > a, :scope > p > a');
      if (!topLink) return;
      const newLi = document.createElement('li');
      newLi.setAttribute('role', 'none');
      const newA = document.createElement('a');
      newA.setAttribute('role', 'menuitem');
      newA.href = topLink.getAttribute('href') || '#';
      newA.target = '_self';
      newA.textContent = topLink.textContent;
      newLi.appendChild(newA);
      mainUl.appendChild(newLi);
    });
  }
  mainNav.appendChild(mainUl);
  primaryNav.appendChild(mainNav);
  contentContainer.appendChild(primaryNav);

  header.appendChild(contentContainer);

  // ---- Render ------------------------------------------------------------------
  block.textContent = '';
  block.appendChild(header);

  // ---- Interactivity -----------------------------------------------------------
  // Mobile hamburger toggles the condition-nav flyout.
  const menuToggle = header.querySelector('.abbv-header-v2-mobile-primary-navigation');
  const primaryNavEl = header.querySelector('.abbv-header-v2-primary-navigation');
  if (menuToggle && primaryNavEl) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      header.classList.toggle('abbv-menu-open', !expanded);
      primaryNavEl.classList.toggle('abbv-submenu-open', !expanded);
    });
  }

  // Sticky header on scroll — hide the eyebrow on scroll down (matches base).
  const eyebrowEl = header.querySelector('.abbv-eyebrow');
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 100) {
      header.classList.add('abbv-fixed');
      if (eyebrowEl) eyebrowEl.style.display = 'none';
    } else {
      header.classList.remove('abbv-fixed');
      if (eyebrowEl) eyebrowEl.style.display = '';
    }
  }, { passive: true });
}
