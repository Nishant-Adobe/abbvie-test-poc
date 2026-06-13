export default function decorate(block) {
  const nav = document.createElement('div');
  nav.className = 'abbv-section-navigation abbv-sticky';

  const container = document.createElement('div');
  container.className = 'abbv-section-navigation-container';

  const ul = document.createElement('ul');
  ul.className = 'section-navigation-list';

  [...block.children].forEach((row) => {
    const titleCell = row.firstElementChild;
    const contentCell = row.children[1];

    const h3 = titleCell?.querySelector('h3');
    const link = contentCell?.querySelector('a');
    const href = link?.getAttribute('href') || '';
    const text = h3?.textContent || titleCell?.textContent || '';

    if (text) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = href || `#${text.toLowerCase().replace(/\s+/g, '')}`;
      a.textContent = text;
      li.appendChild(a);
      ul.appendChild(li);
    }
  });

  // "JUMP TO:" dropdown toggle bar
  const currentPos = document.createElement('div');
  currentPos.className = 'current-pos';
  const firstLink = ul.querySelector('a');
  currentPos.innerHTML = '<span class="jump-label">JUMP TO:</span>'
    + ` <span class="jump-text">${firstLink?.textContent || ''}`
    + '</span>'
    + '<button class="abbv-button-plain"'
    + ' aria-label="Toggle navigation"></button>';

  container.appendChild(currentPos);
  container.appendChild(ul);
  nav.appendChild(container);

  // Toggle dropdown on click
  currentPos.addEventListener('click', () => {
    ul.classList.toggle('abbv-active');
    currentPos.classList.toggle('abbv-active');
  });

  // Update "JUMP TO" text on link click
  ul.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      const jumpText = currentPos.querySelector('.jump-text');
      if (jumpText) jumpText.textContent = a.textContent;
      ul.classList.remove('abbv-active');
      currentPos.classList.remove('abbv-active');
    });
  });

  block.textContent = '';
  block.appendChild(nav);

  // Smooth scroll on click — attach directly to each link
  ul.querySelectorAll('a').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const targetId = anchor.getAttribute('href')?.replace('#', '');
      if (!targetId) return;

      const sectionTexts = {
        talktoadoctor: 'Talk to a Doctor',
        howtotake: 'How to Take',
      };
      const searchText = sectionTexts[targetId] || targetId;
      let target = document.getElementById(targetId);

      if (!target) {
        document.querySelectorAll('main .section').forEach((s) => {
          const firstP = s.querySelector(
            '.default-content-wrapper > p:first-child',
          );
          if (
            firstP
            && firstP.textContent.trim().startsWith(searchText)
          ) {
            target = s;
          }
        });
      }

      if (target) {
        const headerH = document.querySelector('header')?.offsetHeight || 0;
        const top = target.getBoundingClientRect().top
          + window.scrollY - headerH - 60;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // Dynamically position below the fixed header
  const section = block.closest('.section');
  if (!section) return;

  const updateStickyTop = () => {
    // Only a fixed/sticky header occupies viewport space the tab bar must clear.
    // A relative (scroll-away) header does not, so we leave the CSS default in place.
    const fixedHeader = document.querySelector('.abbv-header-v2');
    if (fixedHeader) {
      const pos = getComputedStyle(fixedHeader).position;
      if (pos === 'fixed' || pos === 'sticky') {
        // Park the bar at header height + half the tab bar's own height so the
        // bar sits fully visible just below the header.
        const tabHeight = block.offsetHeight || section.offsetHeight || 0;
        const stickyTop = Math.round(fixedHeader.offsetHeight + tabHeight / 2);
        section.style.setProperty('--tabs-sticky-top', `${stickyTop}px`);
      } else {
        section.style.removeProperty('--tabs-sticky-top');
      }
    }
  };

  window.addEventListener('resize', updateStickyTop);
  updateStickyTop();
}
