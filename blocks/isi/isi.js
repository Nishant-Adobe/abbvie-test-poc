async function fetchFragment(path) {
  const resp = await fetch(path);
  if (!resp.ok) return null;
  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body;
}

export default async function decorate(block) {
  const linkEl = block.querySelector('a[href], div');
  const fragmentPath = linkEl?.textContent?.trim() || '';
  let isiUrl;
  if (fragmentPath.startsWith('/')) {
    isiUrl = `/content${fragmentPath}.plain.html`;
  } else {
    const dir = window.location.pathname.replace(/\/$/, '');
    isiUrl = `${dir}/isi.plain.html`;
  }
  const fragment = await fetchFragment(isiUrl);
  if (!fragment) return;

  const sections = [...fragment.children];
  const isiSection = sections[0];
  const usesDiv = isiSection?.querySelector(':scope > div:first-child');
  const riskDiv = isiSection?.querySelector(':scope > div:last-child');

  // Build ISI sticky bar DOM matching original
  const isiBar = document.createElement('div');
  isiBar.className = 'abbv-safety-bar abbv-safety-bar-minimized linzess-safety-bar';

  // Toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'abbv-safety-bar-toggle';
  toggleBtn.setAttribute('aria-label', 'Expand Safety Information');
  toggleBtn.innerHTML = '<span class="abbv-safety-bar-toggle-icon"></span>';
  isiBar.appendChild(toggleBtn);

  // Content container
  const contentMin = document.createElement('div');
  contentMin.className = 'abbv-safety-bar-content abbv-safety-bar-content-minimized';

  // Uses column
  const usesCol = document.createElement('div');
  usesCol.className = 'abbv-safety-bar-uses';
  if (usesDiv) usesCol.innerHTML = usesDiv.innerHTML;
  contentMin.appendChild(usesCol);

  // Risk column
  const riskCol = document.createElement('div');
  riskCol.className = 'abbv-safety-bar-risk';
  if (riskDiv) riskCol.innerHTML = riskDiv.innerHTML;
  contentMin.appendChild(riskCol);

  isiBar.appendChild(contentMin);

  // Build the INLINE use/ISI region that sits in normal page flow at the bottom
  // of the page (original: <div class="abbv-inline-use-isi"> with the
  // <a id="abbv_use_statement"> anchor + full USES and Important Risk Information).
  // This is separate from the sticky bar and is present on every page.
  const inlineIsiRegion = document.createElement('div');
  inlineIsiRegion.className = 'abbv-inline-use-isi';
  inlineIsiRegion.setAttribute('role', 'region');
  inlineIsiRegion.setAttribute('aria-label', 'Important Safety Information');

  const useAnchor = document.createElement('a');
  useAnchor.id = 'abbv_use_statement';
  useAnchor.setAttribute('aria-hidden', 'true');
  inlineIsiRegion.appendChild(useAnchor);

  const inlineContent = document.createElement('div');
  inlineContent.className = 'abbv-inline-use linzess-use-statement abbv-rich-text-common';
  if (usesDiv) {
    const usesBlock = document.createElement('div');
    usesBlock.className = 'abbv-inline-use-uses';
    usesBlock.innerHTML = usesDiv.innerHTML;
    inlineContent.appendChild(usesBlock);
  }
  if (riskDiv) {
    const riskBlock = document.createElement('div');
    riskBlock.className = 'abbv-inline-use-risk';
    riskBlock.innerHTML = riskDiv.innerHTML;
    inlineContent.appendChild(riskBlock);
  }
  inlineIsiRegion.appendChild(inlineContent);

  // Render
  block.textContent = '';
  block.appendChild(inlineIsiRegion);
  block.appendChild(isiBar);

  // Toggle expand/collapse
  let expanded = false;
  toggleBtn.addEventListener('click', () => {
    expanded = !expanded;
    isiBar.classList.toggle('abbv-safety-bar-minimized', !expanded);
    isiBar.classList.toggle('abbv-safety-bar-maximized', expanded);
    toggleBtn.setAttribute('aria-label', expanded ? 'Collapse Safety Information' : 'Expand Safety Information');
  });

  // Hide ISI sticky bar when user scrolls to inline ISI content, footer, or page bottom
  function checkVisibility() {
    const isiSectionEl = block.closest('.section');
    const footer = document.querySelector('footer');
    const windowHeight = window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;
    const scrollPos = window.scrollY + windowHeight;

    // Find inline ISI content section (has USES h3 but is NOT the isi-container)
    const allSections = document.querySelectorAll('main > .section');
    let inlineIsi = null;
    allSections.forEach((s) => {
      const h3 = s.querySelector('h3');
      if (h3 && h3.textContent === 'USES' && !s.classList.contains('isi-container')) {
        inlineIsi = s;
      }
    });

    // Hide if inline ISI section is in viewport
    if (inlineIsi) {
      const inlineTop = inlineIsi.getBoundingClientRect().top;
      if (inlineTop < windowHeight) {
        isiBar.style.display = 'none';
        return;
      }
    }

    // Hide if ISI block section is in viewport
    if (isiSectionEl) {
      const isiTop = isiSectionEl.getBoundingClientRect().top;
      if (isiTop < windowHeight) {
        isiBar.style.display = 'none';
        return;
      }
    }

    // Hide if footer is in viewport
    if (footer) {
      const footerTop = footer.getBoundingClientRect().top;
      if (footerTop < windowHeight) {
        isiBar.style.display = 'none';
        return;
      }
    }

    // Hide if at bottom of page
    if (scrollPos >= pageHeight - 50) {
      isiBar.style.display = 'none';
      return;
    }

    isiBar.style.display = '';
  }

  window.addEventListener('scroll', checkVisibility, { passive: true });
  window.addEventListener('resize', checkVisibility, { passive: true });
  setTimeout(checkVisibility, 1000);
}
