async function fetchFragment(path) {
  const resp = await fetch(path);
  if (!resp.ok) return null;
  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body;
}

export default async function decorate(block) {
  const dir = window.location.pathname.replace(/\/$/, '');
  const fragment = await fetchFragment(`${dir}/isi.plain.html`);
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

  // Content container (minimized view)
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

  // Render
  block.textContent = '';
  block.appendChild(isiBar);

  // Toggle expand/collapse
  let expanded = false;
  toggleBtn.addEventListener('click', () => {
    expanded = !expanded;
    isiBar.classList.toggle('abbv-safety-bar-minimized', !expanded);
    isiBar.classList.toggle('abbv-safety-bar-maximized', expanded);
    toggleBtn.setAttribute('aria-label', expanded ? 'Collapse Safety Information' : 'Expand Safety Information');
  });

  // Hide ISI when footer is in view
  function setupFooterObserver() {
    const footer = document.querySelector('footer, .footer-wrapper');
    if (!footer) {
      setTimeout(setupFooterObserver, 500);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isiBar.style.display = entry.isIntersecting ? 'none' : 'block';
      });
    }, { threshold: 0 });
    observer.observe(footer);
  }
  setupFooterObserver();
}
