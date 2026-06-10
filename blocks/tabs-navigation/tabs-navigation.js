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

  container.appendChild(ul);
  nav.appendChild(container);

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
    const fixedHeader = document.querySelector('.abbv-header-v2');
    if (fixedHeader) {
      const rect = fixedHeader.getBoundingClientRect();
      const bottom = Math.max(0, rect.bottom);
      section.style.setProperty(
        '--tabs-sticky-top',
        `${bottom}px`,
      );
    }
  };

  window.addEventListener('scroll', updateStickyTop);
  window.addEventListener('resize', updateStickyTop);
  updateStickyTop();
}
