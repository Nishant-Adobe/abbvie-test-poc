import { getMetadata } from '../../scripts/aem.js';

async function fetchFragment(path) {
  const resp = await fetch(path);
  if (!resp.ok) return null;
  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body;
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  // nav is a site-root fragment; default to /nav so it resolves on every page
  // regardless of depth (the content root is mounted at the site root).
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await fetchFragment(`${navPath}.plain.html`);
  if (!fragment) return;

  const sections = [...fragment.children];
  const navSection = sections[0];
  const eyebrowSection = sections[1];
  const utilitySection = sections[2];

  // Parse authored content
  const navDivs = [...navSection.querySelectorAll(':scope > div')];
  const logoDiv = navDivs[0];
  const linksDiv = navDivs[1];
  const ctaDiv = navDivs[2];

  const logoImg = logoDiv?.querySelector('img');
  const logoHref = logoDiv?.querySelector('a')?.getAttribute('href') || '/';
  const navItems = linksDiv?.querySelector('ul');
  const ctaLink = ctaDiv?.querySelector('a');

  const eyebrowText = eyebrowSection?.querySelector('p')?.textContent || '';
  const eyebrowLink = eyebrowSection?.querySelectorAll('p')?.[1]?.querySelector('a');

  const utilityLinks = utilitySection?.querySelectorAll('li') || [];

  // Build the exact original DOM
  const header = document.createElement('header');
  header.className = 'abbv-header-v2 linzess-header linzess-header-classic abbv-sticky search-box-classic';

  // Skip nav link
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.className = 'abbv-skip-to-main-content sr-only';
  skipLink.textContent = 'Skip to Main content';
  header.appendChild(skipLink);

  // Eyebrow
  const eyebrow = document.createElement('div');
  eyebrow.className = 'abbv-eyebrow';
  eyebrow.setAttribute('data-enabled', 'true');
  eyebrow.setAttribute('data-visible', 'true');
  eyebrow.style.display = 'block';
  const eyebrowLarge = document.createElement('span');
  eyebrowLarge.className = 'abbv-eyebrow-large';
  eyebrowLarge.textContent = ` ${eyebrowText}`;
  eyebrow.appendChild(eyebrowLarge);
  const eyebrowMedium = document.createElement('span');
  eyebrowMedium.className = 'abbv-eyebrow-medium';
  eyebrowMedium.textContent = eyebrowText;
  eyebrow.appendChild(eyebrowMedium);
  const eyebrowSmall = document.createElement('span');
  eyebrowSmall.className = 'abbv-eyebrow-small';
  eyebrowSmall.textContent = eyebrowText;
  eyebrow.appendChild(eyebrowSmall);
  if (eyebrowLink) {
    const eLink = document.createElement('a');
    eLink.role = 'link';
    eLink.href = eyebrowLink.getAttribute('href');
    eLink.textContent = eyebrowLink.textContent;
    eLink.setAttribute('aria-label', eyebrowLink.textContent);
    eyebrow.appendChild(eLink);
  }
  header.appendChild(eyebrow);

  // Utility Navigation
  const utilNav = document.createElement('div');
  utilNav.className = 'abbv-header-v2-utility-navigation abbv-navigation';
  const utilNavEl = document.createElement('nav');
  utilNavEl.setAttribute('aria-label', 'Utility Navigation');
  const utilUl = document.createElement('ul');
  utilUl.setAttribute('role', 'menubar');
  [...utilityLinks].forEach((li) => {
    const a = li.querySelector('a');
    if (!a) return;
    const newLi = document.createElement('li');
    newLi.setAttribute('role', 'none');
    const newA = document.createElement('a');
    newA.setAttribute('role', 'menuitem');
    newA.className = 'i-b nav-tier1 sm-display';
    newA.href = a.getAttribute('href');
    newA.textContent = a.textContent;
    if (a.getAttribute('target')) newA.target = a.getAttribute('target');
    newLi.appendChild(newA);
    utilUl.appendChild(newLi);
  });
  utilNavEl.appendChild(utilUl);
  utilNav.appendChild(utilNavEl);
  header.appendChild(utilNav);

  // Content Container (logo + nav + CTA)
  const contentContainer = document.createElement('div');
  contentContainer.className = 'abbv-header-content-container';
  const content = document.createElement('div');
  content.className = 'abbv-header-v2-content';

  // Logo (left)
  const left = document.createElement('div');
  left.className = 'abbv-header-v2-left';
  const logoA = document.createElement('a');
  logoA.href = logoHref;
  if (logoImg) {
    const img = document.createElement('img');
    img.src = logoImg.getAttribute('src');
    img.alt = logoImg.getAttribute('alt') || 'LINZESS logo';
    img.title = 'Linzess logo';
    img.width = 253;
    img.height = 126;
    logoA.appendChild(img);
  }
  left.appendChild(logoA);
  content.appendChild(left);

  // Right section (mobile hamburger only — CTA goes in nav list)
  const right = document.createElement('div');
  right.className = 'abbv-header-v2-right';

  const utilIcons = document.createElement('div');
  utilIcons.className = 'util-icons-container';
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

  // Primary Navigation
  const primaryNav = document.createElement('div');
  primaryNav.className = 'abbv-header-v2-primary-navigation abbv-navigation';
  const mainNav = document.createElement('nav');
  mainNav.setAttribute('aria-label', 'Main Navigation');
  const mainUl = document.createElement('ul');
  mainUl.setAttribute('role', 'menu');

  if (navItems) {
    [...navItems.children].forEach((li) => {
      const topLink = li.querySelector(':scope > a');
      const subUl = li.querySelector(':scope > ul');

      const newLi = document.createElement('li');
      newLi.setAttribute('role', 'none');

      const newA = document.createElement('a');
      newA.setAttribute('role', 'menuitem');
      newA.href = topLink?.getAttribute('href') || '#';
      newA.target = '_self';
      newA.textContent = topLink?.textContent || '';
      if (subUl) {
        newA.className = 'abbv-has-submenu';
        newA.setAttribute('aria-expanded', 'false');
      }
      newLi.appendChild(newA);

      if (subUl) {
        const chevron = document.createElement('span');
        chevron.setAttribute('aria-hidden', 'true');
        chevron.innerHTML = '<i></i>';
        newLi.appendChild(chevron);

        const submenuDiv = document.createElement('div');
        submenuDiv.className = 'abbv-header-primary-navigation-submenu abbv-submenu';
        const subMenuUl = document.createElement('ul');
        subMenuUl.setAttribute('role', 'menu');
        [...subUl.children].forEach((subLi) => {
          const subA = subLi.querySelector('a');
          if (!subA) return;
          const newSubLi = document.createElement('li');
          newSubLi.setAttribute('role', 'none');
          const newSubA = document.createElement('a');
          newSubA.setAttribute('role', 'menuitem');
          newSubA.href = subA.getAttribute('href');
          newSubA.textContent = subA.textContent;
          newSubLi.appendChild(newSubA);
          subMenuUl.appendChild(newSubLi);
        });
        submenuDiv.appendChild(subMenuUl);
        newLi.appendChild(submenuDiv);
      }

      mainUl.appendChild(newLi);
    });
  }

  // Add home icon nav item (original site has this before CTA)
  const homeLi = document.createElement('li');
  homeLi.setAttribute('role', 'none');
  const homeA = document.createElement('a');
  homeA.setAttribute('role', 'menuitem');
  homeA.setAttribute('rel', 'nofollow');
  homeA.className = 'home-icon';
  homeA.href = '/';
  homeA.target = '_self';
  homeA.textContent = 'home';
  homeLi.appendChild(homeA);
  mainUl.appendChild(homeLi);

  // Add "Check My Symptoms" as last nav item (original site has it here)
  if (ctaLink) {
    const ctaNavLi = document.createElement('li');
    ctaNavLi.setAttribute('role', 'none');
    const ctaNavA = document.createElement('a');
    ctaNavA.setAttribute('role', 'menuitem');
    ctaNavA.setAttribute('rel', 'nofollow');
    ctaNavA.className = 'abbv-icon-keyboard_arrow_right i-b check-my-symptoms abbv-button-tertiary';
    ctaNavA.href = ctaLink.getAttribute('href');
    ctaNavA.target = '_self';
    ctaNavA.textContent = ctaLink.textContent;
    ctaNavLi.appendChild(ctaNavA);
    mainUl.appendChild(ctaNavLi);
  }

  mainNav.appendChild(mainUl);
  primaryNav.appendChild(mainNav);
  contentContainer.appendChild(primaryNav);

  header.appendChild(contentContainer);

  // Render
  block.textContent = '';
  block.appendChild(header);

  // Add interactivity
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

  // Desktop dropdown hover
  const navLinks = header.querySelectorAll('.abbv-has-submenu');
  navLinks.forEach((link) => {
    const li = link.closest('li');
    const submenu = li.querySelector('.abbv-submenu');
    if (!submenu) return;

    li.addEventListener('mouseenter', () => {
      navLinks.forEach((other) => {
        const otherLi = other.closest('li');
        const otherSub = otherLi.querySelector('.abbv-submenu');
        if (otherSub && otherLi !== li) {
          other.setAttribute('aria-expanded', 'false');
          otherSub.classList.remove('abbv-submenu-open');
        }
      });
      link.setAttribute('aria-expanded', 'true');
      submenu.classList.add('abbv-submenu-open');
    });

    li.addEventListener('mouseleave', () => {
      link.setAttribute('aria-expanded', 'false');
      submenu.classList.remove('abbv-submenu-open');
    });
  });

  // Sticky header on scroll — only hide eyebrow on scroll down
  // Utility nav (Prescribing Info, Medication Guide...) stays visible always
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
