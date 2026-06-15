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

// Path prefixes the AEM Forms runtime requests at execution time using BARE
// site-absolute paths (built inside the minified bundle, so they can't be
// rewritten in the DOM). On this EDS site they'd resolve against the current
// origin and 404 — they must go to the Forms Domain instead.
const FORMS_RUNTIME_PATH_PREFIXES = [
  '/adobe/forms/af/', // model variants, custom functions, DoR, submit
  '/abbviecloud/', // clientlibs, csrf token, libs
  '/etc.clientlibs/', // core forms i18n + component clientlibs
  '/content/dam/', // form images
  '/content/forms/', // form assets
];

function shouldRedirectFormPath(pathname) {
  return FORMS_RUNTIME_PATH_PREFIXES.some((p) => pathname.startsWith(p));
}

// Install a one-time fetch + XHR shim that reroutes the form runtime's
// same-origin requests for the above paths to `formOrigin`. Idempotent and
// scoped to those path prefixes, so it never touches normal EDS requests.
function installFormsRequestRerouter(formOrigin) {
  if (!formOrigin || window.formsEmbedRerouterOrigin === formOrigin) return;
  window.formsEmbedRerouterOrigin = formOrigin;

  const reroute = (url) => {
    try {
      const u = new URL(url, window.location.origin);
      if (u.origin === window.location.origin && shouldRedirectFormPath(u.pathname)) {
        return formOrigin + u.pathname + u.search + u.hash;
      }
    } catch (e) { /* leave url as-is */ }
    return url;
  };

  const origFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (typeof input === 'string') return origFetch(reroute(input), init);
    if (input instanceof Request) {
      const next = reroute(input.url);
      if (next !== input.url) return origFetch(new Request(next, input), init);
    }
    return origFetch(input, init);
  };

  const OrigOpen = window.XMLHttpRequest.prototype.open;
  window.XMLHttpRequest.prototype.open = function open(method, url, ...rest) {
    return OrigOpen.call(this, method, reroute(url), ...rest);
  };
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

async function fetchFormDoc(formsUrl) {
  // Same-origin paths keep first-party cookies/CSRF. Cross-origin absolute URLs
  // (e.g. fetched directly from www.linzess.com) are fetched without credentials
  // — handled by a browser CORS plugin in this setup.
  const crossOrigin = isAbsoluteUrl(formsUrl)
    && new URL(formsUrl).origin !== window.location.origin;
  try {
    const resp = await fetch(formsUrl, {
      credentials: crossOrigin ? 'omit' : 'same-origin',
    });
    if (!resp.ok) {
      // eslint-disable-next-line no-console
      console.warn(`[forms-embed] fetch ${formsUrl} returned HTTP ${resp.status}`);
      return null;
    }
    const html = await resp.text();
    return new DOMParser().parseFromString(html, 'text/html');
  } catch (err) {
    // A TypeError here on a cross-origin URL is almost always a CORS block:
    // www.linzess.com sends NO Access-Control-Allow-Origin, so even a CORS
    // browser plugin must be configured to rewrite headers for THIS request
    // (and the form's CSS/JS/font requests). Log the exact URL to diagnose.
    // eslint-disable-next-line no-console
    console.error(`[forms-embed] fetch FAILED for ${formsUrl} (likely CORS — `
      + 'the response has no Access-Control-Allow-Origin). Original error:', err);
    return null;
  }
}

// Collect every stylesheet href and script src the form runtime page declares,
// in document order, resolved as absolute URLs against the form's own base.
// This avoids a brittle hardcoded clientlib list (the form pulls jQuery,
// dompurify, CSRF, container/accordion/wizard commons, theme.js, etc.).
function collectFormAssets(doc, formsUrl) {
  const base = formsUrl;
  const toAbs = (v) => {
    try { return new URL(v, base).href; } catch (e) { return null; }
  };
  // Match any <link> whose rel TOKEN list includes "stylesheet" — the form's
  // theme is linked as rel="preload stylesheet", which an exact
  // [rel="stylesheet"] selector would miss (that theme carries the actual
  // AbbVie/Linzess form styling, so missing it leaves the form unstyled).
  const styles = [...doc.querySelectorAll('link[href]')]
    .filter((l) => (l.getAttribute('rel') || '')
      .split(/\s+/)
      .includes('stylesheet'))
    .map((l) => toAbs(l.getAttribute('href')))
    .filter(Boolean);
  const scripts = [...doc.querySelectorAll('script[src]')]
    .map((s) => toAbs(s.getAttribute('src')))
    .filter(Boolean);
  return { styles, scripts };
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

  // Resolve the form markup URL against the authored Forms Domain so the form
  // AND every asset it declares are fetched from that single host.
  const formsUrl = resolveAgainstDomain(rawUrl, formsDomain);

  // Install the request rerouter BEFORE any runtime script runs, so the form's
  // execution-time fetches (custom functions, i18n, model variants, submit,
  // images, CSRF) for bare site-absolute paths go to the Forms Domain.
  const formsOrigin = isAbsoluteUrl(formsUrl) ? new URL(formsUrl).origin : '';
  if (formsOrigin && formsOrigin !== window.location.origin) {
    installFormsRequestRerouter(formsOrigin);
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

  // Fetch the rendered form runtime page, then pull out both the form markup and
  // the exact CSS/JS assets it declares.
  let doc = null;
  try {
    doc = await fetchFormDoc(formsUrl);
  } catch (e) {
    doc = null;
  }

  const formEl = doc && doc.querySelector(
    '[data-cmp-is="adaptiveFormContainer"], .cmp-adaptiveform-container, #guideContainer, .guideContainer',
  );

  if (!formEl) {
    // Match the original's graceful failure message.
    loading.remove();
    afsection.innerHTML = '<p>Your request could not be processed. Please try again later.</p>';
    return;
  }

  const { styles, scripts } = collectFormAssets(doc, formsUrl);

  // The form runtime JS reads site-absolute paths from the markup (e.g.
  // data-cmp-path / data-cmp-adaptiveformcontainer-path) and fetches
  // `${path}.model.json`, recaptcha images, etc. Those paths start with
  // `/abbviecloud` or `/content` and would otherwise resolve against THIS origin
  // (the aem.page site) and 404. Rewrite every such absolute path/attribute in
  // the injected form to the Forms Domain origin so the runtime's follow-up
  // fetches go to www.linzess.com (where the CORS plugin allows them).
  const formOrigin = isAbsoluteUrl(formsUrl) ? new URL(formsUrl).origin : '';
  if (formOrigin) {
    const PATH_ATTRS = ['data-cmp-path', 'data-cmp-adaptiveformcontainer-path', 'src', 'href', 'action', 'data-action'];
    const rewriteEl = (el) => {
      PATH_ATTRS.forEach((attr) => {
        const v = el.getAttribute && el.getAttribute(attr);
        // Site-absolute path (starts with a single slash, not "//") → prefix host.
        if (v && /^\/(?!\/)/.test(v)) {
          el.setAttribute(attr, formOrigin + v);
        }
      });
    };
    rewriteEl(formEl);
    formEl.querySelectorAll('*').forEach(rewriteEl);
  }

  // Load the form's own stylesheets BEFORE injecting so it isn't briefly
  // unstyled. These are the exact <link>s the runtime page ships (clientlibs +
  // theme), resolved against the Forms Domain.
  styles.forEach((href) => loadStyleOnce(href));

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

  // Load every script the form runtime page declares, IN ORDER (jQuery and
  // other deps must run before the components that depend on them).
  // eslint-disable-next-line no-restricted-syntax
  for (const src of scripts) {
    // eslint-disable-next-line no-await-in-loop
    await loadScriptOnce(src);
  }
}
