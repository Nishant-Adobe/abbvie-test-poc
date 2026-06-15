/* stylelint-disable */

/*
 * Forms Embed block — embeds an AbbVie Cloud AEM Adaptive Form.
 *
 * The original site (www.linzess.com) embeds adaptive forms with the AEM Forms
 * "forms-embed" core component: a <div class="cmp-formsembed-widget"
 * data-forms-url="/abbviecloud/content/forms/af/.../<form>.html"> placeholder
 * whose clientlib fetches the form HTML from data-forms-url and injects it,
 * then loads the form runtime clientlibs.
 *
 * The form lives on the AbbVie Cloud forms instance and is served under the
 * SAME ORIGIN via the /abbviecloud/* reverse-proxy prefix — that is why the
 * original has no CORS issue (markup, clientlibs, assets, and submission are
 * all same-origin). We reproduce that exact embed + same-origin fetch here.
 *
 * Authoring: the block's single cell holds the form path, e.g.
 *   /abbviecloud/content/forms/af/admp/linzess/.../<form>.html
 */

// The form's own runtime clientlibs, as DOMAIN-RELATIVE paths. The live form
// runtime page loads matching .css and .js for each clientlib; without the CSS
// the injected form renders unstyled, so load both. These paths are resolved
// against the authored "Forms Domain" so the clientlibs come from the same host
// as the form markup (default: current site origin).
const FORM_RUNTIME_CLIENTLIB_PATHS = [
  '/abbviecloud/etc.clientlibs/abbviecloudforms/clientlibs/clientlib-dependencies.min',
  '/abbviecloud/etc.clientlibs/abbviecloudforms/clientlibs/clientlib-base.min',
  '/abbviecloud/etc.clientlibs/abbviecloudforms/clientlibs/clientlib-site.min',
  '/abbviecloud/etc.clientlibs/abbviecloudforms/clientlibs/custom-forms-components-runtime-all.min',
];

function loadStyleOnce(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = href;
  document.head.append(l);
}

function loadScriptOnce(src) {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => resolve();
    document.head.append(s);
  });
}

function isAbsoluteUrl(s) {
  return /^https?:\/\//i.test(s);
}

// Resolve a form path/URL against the authored Forms Domain.
//  - An absolute http(s) value is used as-is (its own host wins).
//  - Otherwise the path is resolved against `domain` (the authored base
//    domain), or the current site origin when no domain is authored.
function resolveAgainstDomain(value, domain) {
  if (!value) return value;
  if (isAbsoluteUrl(value)) return value;
  const base = domain && isAbsoluteUrl(domain) ? domain : window.location.origin;
  try {
    return new URL(value, base).href;
  } catch (e) {
    return value;
  }
}

async function fetchFormMarkup(formsUrl) {
  // Same-origin paths keep first-party cookies/CSRF. Cross-origin absolute URLs
  // (e.g. fetched directly from www.linzess.com) are fetched without credentials
  // — handled by a browser CORS plugin in this setup.
  const crossOrigin = isAbsoluteUrl(formsUrl)
    && new URL(formsUrl).origin !== window.location.origin;
  const resp = await fetch(formsUrl, {
    credentials: crossOrigin ? 'omit' : 'same-origin',
  });
  if (!resp.ok) return null;
  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  // The adaptive form lives in the guideContainer of the rendered runtime page.
  return doc.querySelector('[data-cmp-is="adaptiveFormContainer"], .cmp-adaptiveform-container, #guideContainer, .guideContainer');
}

export default async function decorate(block) {
  // The model has two fields → two rows: [0] Adaptive Form URL, [1] Forms Domain.
  const rows = [...block.querySelectorAll(':scope > div')];
  const cellText = (row) => {
    if (!row) return '';
    const a = row.querySelector('a[href]');
    return (a?.getAttribute('href') || row.textContent || '').trim();
  };
  // Back-compat: a single-row block (legacy authoring) has only the form URL.
  const rawUrl = cellText(rows[0]);
  const formsDomain = rows.length > 1 ? cellText(rows[1]) : '';

  if (!rawUrl) {
    block.textContent = '';
    return;
  }

  // Resolve the form markup URL and the runtime clientlib URLs against the
  // authored Forms Domain so EVERYTHING is fetched from that single host.
  const formsUrl = resolveAgainstDomain(rawUrl, formsDomain);
  const clientlibUrls = FORM_RUNTIME_CLIENTLIB_PATHS.map(
    (p) => resolveAgainstDomain(p, formsDomain),
  );

  // Rebuild the original embed widget DOM exactly.
  block.textContent = '';
  const widget = document.createElement('div');
  widget.className = 'cmp-formsembed-widget';
  widget.setAttribute('data-forms-url', formsUrl);

  const loading = document.createElement('div');
  loading.className = 'cmp-adaptiveform-container-form-loading abbv-animation-loading';
  widget.appendChild(loading);

  const afsection = document.createElement('div');
  afsection.className = 'afsection';
  widget.appendChild(afsection);
  block.appendChild(widget);

  // Fetch the adaptive form markup (same-origin) and inject it.
  let formEl = null;
  try {
    formEl = await fetchFormMarkup(formsUrl);
  } catch (e) {
    formEl = null;
  }

  if (!formEl) {
    // Match the original's graceful failure message.
    loading.remove();
    afsection.innerHTML = '<p>Your request could not be processed. Please try again later.</p>';
    return;
  }

  // Load the form runtime CSS before injecting so the form isn't briefly
  // unstyled, then inject the markup, then load the JS to make it interactive.
  // Both come from the authored Forms Domain.
  clientlibUrls.forEach((base) => loadStyleOnce(`${base}.css`));

  afsection.appendChild(formEl);
  loading.remove();

  // The fetched adaptive-form container ships with an inline `display: none`
  // (the runtime normally reveals it after init). Reveal it now so the form is
  // visible once injected. Cover the container itself and any nested ones.
  const containers = [
    ...(formEl.matches('.cmp-adaptiveform-container') ? [formEl] : []),
    ...formEl.querySelectorAll('.cmp-adaptiveform-container'),
  ];
  containers.forEach((c) => { c.style.display = 'block'; });

  await Promise.all(clientlibUrls.map((base) => loadScriptOnce(`${base}.js`)));
}
