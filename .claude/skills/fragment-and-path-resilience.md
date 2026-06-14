# Fragment Loading & Content Path Resilience

> Scope: every header / footer / ISI rendering failure and content-path mapping
> bug hit during the Linzess migration. Read this when the header logo/nav,
> footer logos, or ISI (inline + sticky bar) "don't load", or when pages resolve
> under an unexpected URL prefix (e.g. `/nishant-test/...`).

## Root Cause Behind Most "X Doesn't Render" Fragment Bugs

The AEM `.plain.html` pipeline (local dev AND deployed) **transforms fragment
content** when it serves nav/footer/isi:
1. **Flattens nested `<div>` wrappers** — inner structural divs collapse into the
   parent, so index-based reads (`navDivs[0]`, `:first-child`) break.
2. **Strips `<img>` that reference code-repo assets** (`/icons/...`) — logos
   vanish from the served fragment HTML entirely.
3. **Rewraps list items** — `<li><a>…<ul>` may become `<li><p><a></p><ul>`.

Therefore: **decorators must NOT depend on the authored DOM nesting or on
authored `<img>` survival.** Query semantically and supply code-repo assets from JS.

## Header Decorator Rules (`blocks/header/header.js`)

- **Logo image is stripped** — never read it from the fragment. Hardcode the brand
  asset with a code-base fallback:
  ```js
  img.src = logoImg?.getAttribute('src') || `${window.hlx?.codeBasePath || ''}/icons/linzess-logo-nav.png`;
  ```
- **Find nav parts semantically**, not by div index:
  ```js
  const logoLink = navSection.querySelector('a[href="/"], a[href]');
  const navItems = navSection.querySelector(':scope > ul') || navSection.querySelector('ul');
  ```
- **Match nav top-links through optional `<p>` wrap**:
  ```js
  const topLink = li.querySelector(':scope > a, :scope > p > a');
  ```

## Footer Decorator Rules (`blocks/footer/footer.js`)

- Footer logos are also stripped. Restore from code repo by matching the link
  href, with a source-order fallback for ambiguous links (e.g. Ironwood's `#`):
  ```js
  const brandLogos = [
    { match: 'abbvie', src: `${base}/icons/abbvie-logo.png`, alt: 'Abbvie logo' },
    { match: 'ironwood', src: `${base}/icons/ironwood-logo.png`, alt: 'Ironwood logo' },
  ];
  // if no <img>: fallback = brandLogos.find(l => href.includes(l.match)) || brandLogos[order]
  ```

## ISI Decorator Rules (`blocks/isi/isi.js`)

- **Inline + sticky content split must be resilient to flattening.** The original
  fragment had two child divs (USES, RISK); the pipeline flattens them into one
  div with content split by `<h3>`. Build uses/risk HTML defensively:
  ```js
  const childDivs = [...isiSection.querySelectorAll(':scope > div')];
  if (childDivs.length >= 2) { usesHtml = childDivs[0].innerHTML; riskHtml = childDivs.at(-1).innerHTML; }
  else { /* walk children, switch buckets at the "IMPORTANT RISK" <h3> */ }
  ```
- **ISI fragment reference path**: the block content authors an absolute path
  like `/isi`. Build the fetch URL as `${fragmentPath}.plain.html` — do NOT
  prefix `/content` (content root is mounted at the site root). A stale
  `/nishant-test/isi` reference → 404 → sticky bar never renders.
- The sticky bar CSS (`position: fixed; left:0; right:0; bottom:0`) is correct;
  a small measured width just means a small viewport, not a bug.

## Site-Root Fragment Paths (header / footer / isi)

nav/footer are **site-root fragments**. Resolve them root-relative so they work
at any page depth (the content root is mounted at the site root):
```js
const navPath = getMetadata('nav') ? new URL(navMeta, window.location).pathname : '/nav';
```
Do NOT compute the path from `window.location.pathname` slices
(`pathParts.slice(0, 3)`) — that produced `/why-linzess/nav` (404) on subpages
once the old `/content/site/` prefix was gone.

## Content Path Mapping (`paths.json` ↔ `.migration/project.json`)

These two files MUST agree on where content lives, or only the index resolves and
subpages get an unexpected prefix:
- `.migration/project.json` `aemSitePath` = where AEM author stores content
  (e.g. `/content/nishant-test`). This is where the importer pushes and AEM serves.
- `paths.json` mapping must strip that SAME prefix to `/`:
  `"/content/nishant-test/:/"`.

Symptom of a mismatch: index works but subpages resolve under `/nishant-test/...`.
That happens when `paths.json` maps `/content/:/` but content lives at
`/content/nishant-test/` — only the folder-root (index) collapses to `/`.

**Rule:** keep the repo's local `content/` directory structure, the `paths.json`
mapping prefix, and `project.json` `aemSitePath` all aligned to the same content
root. After changing the mapping, also fix any stale absolute references inside
content (e.g. `/nishant-test/isi` → `/isi`).

## Verification (always test a SUBPAGE, not just index)

After any fragment/path fix, verify on BOTH `/index` and a deep subpage
(e.g. `/why-linzess`) with `getComputedStyle`/DOM checks:
- header: logo `complete && naturalWidth > 0`, main-nav `<li>` count > 0
- footer: both brand logos present with correct `src`
- ISI: inline region `textContent.length` large, sticky bar `position === 'fixed'`
Index can pass while subpages fail (path-depth bugs), so subpage verification is mandatory.
