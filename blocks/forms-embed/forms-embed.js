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

// The form's own runtime clientlibs (served under the same /abbviecloud proxy).
// The live form runtime page loads matching .css and .js for each clientlib;
// without the CSS the injected form renders unstyled, so load both.
const FORM_RUNTIME_CLIENTLIBS = [
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

async function fetchFormMarkup(formsUrl) {
  // Same-origin fetch (the /abbviecloud/* path is reverse-proxied onto this
  // origin), so no CORS preflight and submission cookies/CSRF stay first-party.
  const resp = await fetch(formsUrl, { credentials: 'same-origin' });
  if (!resp.ok) return null;
  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  // The adaptive form lives in the guideContainer of the rendered runtime page.
  return doc.querySelector('[data-cmp-is="adaptiveFormContainer"], .cmp-adaptiveform-container, #guideContainer, .guideContainer');
}

export default async function decorate(block) {
  // Resolve the form path from the authored cell (text or link).
  const link = block.querySelector('a[href]');
  const raw = (link?.getAttribute('href') || block.textContent || '').trim();
  if (!raw) {
    block.textContent = '';
    return;
  }
  // Normalize to a same-origin absolute path under /abbviecloud.
  let formsUrl = raw;
  try {
    formsUrl = new URL(raw, window.location.origin).pathname
      + (raw.includes('?') ? raw.slice(raw.indexOf('?')) : '');
  } catch (e) {
    // keep raw if URL parsing fails
  }

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
  FORM_RUNTIME_CLIENTLIBS.forEach((base) => loadStyleOnce(`${base}.css`));

  afsection.appendChild(formEl);
  loading.remove();

  await Promise.all(FORM_RUNTIME_CLIENTLIBS.map((base) => loadScriptOnce(`${base}.js`)));
}
