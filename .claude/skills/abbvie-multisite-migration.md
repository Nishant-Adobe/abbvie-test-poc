# AbbVie Multi-Site Migration (Fleet / 118 brand sites)

## Trigger
- "migrate abbvie site <url>" — onboard one new AbbVie brand fast (reuse shared base)
- "migrate abbvie fleet" / "migrate all abbvie sites" — run the batch orchestrator across many brands
- "onboard brand <url>" — token-extract + scaffold a single brand

Examples: rinvoq.com, rinvoqhcp.com, mavyret.com, skyrizi.com, skyrizihcp.com, botox.com (~118 total).

## Why this skill exists (the speed thesis)
These are NOT 118 independent migrations. Audited 2026-06-12: rinvoq, skyrizi, and the
already-migrated linzess all run the **same AbbVie design system** — same
`common-elements` clientlib + `abbv-framework.js` (~119 `abbv-*` classes), same header v2,
same footer, same inline ISI (`#abbv_use_statement`) + "Expand Safety Information" sticky
bar, same components (hero, tabs-navigation, cards, columns, forms-embed, Brightcove video,
arches). HCP variants are the same framework behind a gate.

**Therefore: build the shared foundation ONCE; each brand = design-token swap + content
import; each page = minutes.** Target ≥70% similarity on the first automated pass, 90–95%
after 1–2 refinement iterations.

Do NOT re-derive blocks/CSS per site. Reuse the `abbv-base` library. See
[[abbvie-multisite-migration]] memory.

---

## ARCHITECTURE — One repo, per-brand content folders + shared base (CHOSEN)

ONE GitHub/EDS repo serves all 118 brands. Brand isolation comes from per-brand
**content folders** + a single per-brand **token CSS file** — never from forked code.

```
repo (shared code for ALL brands)
├── blocks/                      ← SHARED, brand-agnostic (one copy, reviewed once)
├── scripts/                     ← SHARED (brand derived at runtime, see below)
├── styles/
│   ├── styles.css               ← SHARED base + generic :root DEFAULT tokens
│   ├── abbv-framework.css       ← SHARED (verbatim AbbVie framework)
│   └── brands/
│       ├── linzess.css          ← ONLY :root token overrides (+ rare brand quirk)
│       ├── rinvoq.css           ← ONLY :root token overrides
│       └── <brand>.css          ← one small file per brand
└── content/
    ├── linzess/ …               ← brand content (isolated folder)
    ├── rinvoq/  …
    └── <brand>/ …
```

In the AEM **Config Service**, each brand = a separate "site" pointing the SAME
code repo at its own content root (`/content/<brand>/`) + its own domain +
`paths.json` mapping `/content/<brand>/:/`.

Why this model:
- **Isolation**: a brand owns only `content/<brand>/` + `styles/brands/<brand>.css`.
  Editing `rinvoq.css` cannot affect linzess. No brand can break another.
- **Shared fixes propagate**: one block/framework fix → every brand benefits
  (all the md2jcr/fragment/ISI fixes become permanent shared wins).
- **Speed**: a new brand = site config + token file + content import. Zero new
  block code.

### Brand delta is ONLY tokens (verified)
Audited rinvoq/skyrizi/mavyret/botox: all share `abbv-framework`/`common-elements`,
`abbv-header` v2, ISI `#abbv_use_statement` + "Expand Safety Information" sticky bar,
same `abbv-*` vocabulary. They differ ONLY in `:root` tokens:
- Linzess: Bebas/Lato, purple `#422e83`, lavender `#d9d7f9`, orange `#faa633`.
- RINVOQ: Neue Haas/Helvetica, magenta `#90124a` CTAs, 129 `:root` tokens.
Same blocks, same DOM, different paint → a token swap is the whole brand difference.

### PREREQUISITE — De-brand the shared code ONCE (before onboarding brand #2)
The repo starts Linzess-coupled. Make code brand-agnostic so brands differ by
tokens only. De-branding checklist (run `tools/style-diff` / grep to find each):
1. **Generic token layer** in `styles/styles.css :root`: define brand-neutral names
   with Linzess defaults, e.g.
   `--brand-primary`, `--brand-primary-contrast`, `--brand-secondary`,
   `--brand-accent`, `--brand-surface`, `--brand-bg`, `--brand-text`,
   `--brand-heading-font`, `--brand-body-font`, `--brand-radius`.
   Keep legacy `--linz-*` as aliases (`--linz-dark-purple: var(--brand-primary)`)
   so existing rules keep working during transition.
2. **Block CSS**: replace every hardcoded brand hex (`#422e83`, `#d9d7f9`, …) with
   `var(--brand-*, <linzess-fallback>)`. (Was 65 occurrences across 14 block CSS.)
3. **Block JS / scripts.js**: remove brand literals (`linzess`, logo paths,
   body-class names, brand selectors). Derive brand from `getMetadata('brand')`
   or the site root; load brand logos/icons via the `brandIcon(name)` helper
   (resolves `/icons/<brand>/<name>`), with the authored src as first choice.
   (Was brand literals in 7 block JS files + scripts.js.)
4. **head.html**: stop hardcoding `linzess.css`. Load
   `styles/brands/<brand>.css` from a `<meta name="brand">` (set per content
   tree) so each site pulls only its own token file.
5. **Per-brand token file**: move all `--linz-*` definitions out of the shared
   CSS into `styles/brands/linzess.css` (the first brand's override file).

Gate: after de-branding, Linzess must render byte-for-byte unchanged
(`tools/style-diff` vs the live site or pre-refactor screenshots).

---

## Multi-brand capability reference (FAQ)

1. **Different header/footer per page** — YES. `header.js`/`footer.js` read `nav`
   / `footer` metadata and default to `/nav` and `/footer`. Set a page's `nav` or
   `footer` metadata to another fragment (e.g. `/hcp-nav`) for HCP sections,
   campaigns, or sub-brands. No code change.
2. **Hardcoded values in block CSS** — split by intent (VERIFIED: brands DO
   differ here, e.g. Linzess pill/rounded buttons + soft shadows vs SKYRIZI
   square buttons + no shadow):
   - **Brand-identity values → tokens**: colors (`--brand-primary/-accent/`
     `-surface/-bg-muted/-text`), fonts, AND **shape**: `--brand-button-radius`,
     `--brand-card-radius`, `--brand-shadow`, `--brand-card-shadow`,
     `--brand-radius`. All wired as `var(--brand-*, <linzess-fallback>)`.
   - **Structural values → stay literal**: card-to-card gaps, section padding,
     flex `gap`, breakpoints, neutral greys (`#333`/`#fff`), icon sizes. These
     follow the shared DOM, so they're the same across brands. Do NOT tokenize
     all ~128 paddings — that's mostly no-op churn.
   - **When a brand genuinely diverges structurally** (rare), pick the tier:
     - **Tier 2 — global per-brand file**: small tweaks → override in
       `styles/brands/<brand>.css` scoped by `body.brand-<brand>` (never edit the
       shared block). e.g. `body.brand-skyrizi { --brand-button-radius: 0; }` or
       `body.brand-skyrizi .cards-feature { gap: 32px; }`.
     - **Tier 3 — per-block brand CSS**: when ONE block diverges heavily for ONE
       brand, ship `blocks/<brand>/<block>.css` (a brand-named folder holding
       per-block overrides) and register it under `cssOverrides` in
       `blocks/block-brand-overrides.json`
       (`{ "cssOverrides": { "hero-pharma": ["skyrizi"] } }` → loads
       `blocks/skyrizi/hero-pharma.css`). `loadBlock()` loads it AFTER the base
       block CSS (so it wins the cascade) and ONLY when the manifest lists it
       (absent files never 404). All of a brand's per-block overrides live
       together in `blocks/<brand>/`. Use sparingly — tokens (Tier 1) + the global
       per-brand file (Tier 2) handle the vast majority.
     - **Tier 4 — per-block brand JS (REPLACE)**: when a complex block needs a
       structurally different DECORATOR for one brand (header, footer, isi, hero
       with a different DOM/behavior), ship `blocks/<brand>/<block>.js` and
       register it under `jsOverrides`
       (`{ "jsOverrides": { "header": ["skyrizi"] } }` → loads
       `blocks/skyrizi/header.js`). When listed, `loadBlock()` tries the brand
       module FIRST and runs it INSTEAD of the base `blocks/<block>/<block>.js`
       (full replace; the base decorator does NOT run). If the brand file is
       absent, the import fails and `loadBlock()` falls back to the base decorator
       (a one-time 404 for the missing brand file is the accepted cost of
       file-presence resolution). When NOT listed, the base runs directly with no
       extra request. The brand JS is a complete decorator (copy the base, then
       change what's needed). `loadHeader`/`loadFooter` go through `loadBlock`, so
       header/footer are covered too. Use this only for true behavioral/DOM
       divergence — styling differences belong in Tiers 1–3.
   - **Viewports/breakpoints are shared**: all AbbVie brands use
     `<meta viewport width=device-width>` + the same `abbv-framework` breakpoints
     (verified rinvoq/skyrizi/linzess). Only the VALUES at a breakpoint may differ
     → handled by tokens or a per-brand override.
3. **Core migrate rule still applies per brand** — same DOM + verbatim `abbv-*`
   classes + original framework CSS + auto-blocking for complex DOM. Brands differ
   ONLY by tokens + brand-prefixed wrapper classes. Differ + pitfall checklist
   still drive accuracy.
4. **Page-specific CSS** — set `template` (or `theme`) metadata; `aem.js`
   `decorateTemplateAndTheme()` adds it as a body class. Scope CSS to
   `body.<template> …` (as with `transcript-page`, `page-not-found-page`,
   `sitemap-page`). Per-template CSS *files* can be lazy-loaded if a type needs a
   lot of CSS.
5. **Brand targeting hooks** — the brand is exposed THREE ways for fixes:
   `<html data-brand="x">`, `<body class="brand-x">`, and the loaded
   `styles/brands/x.css`. Target brand-specific overrides via
   `body.brand-rinvoq .foo { … }` or `html[data-brand="rinvoq"] …`.
6. **New-brand impact = ZERO on existing brands.** A new brand only adds
   `content/<brand>/`, `styles/brands/<brand>.css`, fonts in `/fonts/`, brand
   icons/logos in `/icons/<brand>/`, and a site config — it touches no shared code
   or other brand content. **Icons are brand-specific**: brand logos/marks live in
   `/icons/<brand>/` (resolved by `brandIcon()`); only framework-generic UI icons
   (home, search, the universal AbbVie corporate logo) stay flat in `/icons/`.
   **Brand-specific blocks**: create a normally-named block and gate it by
   `body.brand-<brand>` / `html[data-brand="<brand>"]` in CSS, and/or only author
   it in that brand's content. Keep shared blocks brand-agnostic; never fork a
   shared block per brand (override via tokens/brand-class instead).

## PHASE 0 — Build the shared `abbv-base` library (ONE TIME, ~1 day)

Promote the Linzess work into a brand-agnostic base, kept verbatim so the original CSS
applies on every brand:
- **Framework CSS** loaded as-is: `abbv-framework.css`, `abbv-*-global.css` equivalents.
- **Blocks** (same DOM + verbatim `abbv-*` classes): header, footer, isi, hero-pharma,
  tabs-navigation, columns-promo, columns-cta, cards-* , video-single, video-playlist,
  forms-embed.
- **Auto-blocks** in `scripts.js` `decorateContentCards()` — all proven on Linzess and
  AbbVie-generic: article card rows, Wellness-style icon tip-cards (ALTERNATING colors),
  community side-by-side cards (alternating dark/light), two-part doctor/promo tout,
  Brightcove control-chrome stripper, dosage/treatment cards.
- **Design tokens** live ONLY in `:root` (`styles/styles.css`) — never hard-code brand
  colors in blocks; always `var(--token, fallback)`.

Gate: base library renders Linzess unchanged.

---

## PHASE 1 — Deterministic style-differ (ONE TIME, ~1 day) — the accuracy engine

**Replace the vision/visual-comparator as the PRIMARY driver** — it hallucinated repeatedly
on Linzess (said cards were white when lavender, twice). Build a script that compares ACTUAL
computed styles, not pixels-by-guess. See [[verify-comparator-output]].

Tool: `tools/style-diff/compare.js`
```
node tools/style-diff/compare.js <originalUrl> <migratedUrl> [viewport]
```
Algorithm:
1. Open both pages (Playwright), same viewport (desktop 1440 first, then 390 mobile).
2. Match elements by text content + DOM position + role (not vision).
3. For each matched pair, diff `getComputedStyle`: backgroundColor, color, fontSize,
   fontWeight, fontFamily, lineHeight, margin, padding, borderRadius, border, boxShadow,
   textAlign, display, flex props, plus `getBoundingClientRect` (w/h/x/y).
4. Emit `report.json`: overall similarity %, and a ranked list of EXACT fixes
   (`selector { prop: actualValue }`), grouped by root cause.
5. Run the **AbbVie pitfall checklist** (below) as hard assertions.

This is what reliably moves a page ≥70% first pass → 90–95% on iterate.

### AbbVie pitfall checklist (auto-asserted every page)
- **Alternating card colors** — odd/even cards differ (lavender↔off-white, dark↔light);
  never render a repeated-card group uniformly. [[card-variant-coverage]]
- **CTA contrast** — purple pill ⇒ white text; white pill ⇒ purple text. Match button bg
  AND text together; use `!important` to beat framework `.button`. [[cta-contrast-and-overlap]]
- **Negative-margin overhang** — icon badges overhang card left edge; arches use negative
  margin-top. Don't render flush.
- **Framework `!important` overrides** — `abbv-framework` rules are high-specificity; block
  rules often need `!important` on bg/color/font-size.
- **ISI use statement** — every page has inline `#abbv_use_statement` region + sticky bar.
  [[isi-use-statement]]
- **Don't skip touts/promos** — enumerate EVERY section block, not just repeated rows.
- **Leaked Brightcove chrome** — strip player control text runs; keep one poster.

---

## PHASE 2 — Per-brand onboarding (~hours/brand)

For each brand URL (after the one-time de-branding above):
1. **Token extraction:** open the brand homepage, dump `:root` custom props +
   computed brand surfaces (header bg, h1 color/font, primary CTA bg+text, link
   color, body/heading font, radius). Map them onto the generic `--brand-*`
   token names and write `styles/brands/<brand>.css` — ONLY `:root` overrides:
   ```css
   :root {
     --brand-primary: #90124a;          /* RINVOQ magenta */
     --brand-primary-contrast: #fff;
     --brand-heading-font: "Neue Haas Grotesk Disp W0595Bl", Arial, sans-serif;
     --brand-body-font: "Helvetica Neue LT W05_55 Roman", Arial, sans-serif;
     /* …only the values that differ from the generic defaults… */
   }
   ```
   Add a tiny `overrides.css` block ONLY for a proven structural divergence.
   **DOWNLOAD the brand's font files into `/fonts/` — never reference them
   cross-origin.** Fonts are BRAND-SPECIFIC: each brand's `@font-face src` points at
   its own live domain/clientlibs, which blocks fonts with a CORS error (no
   `Access-Control-Allow-Origin`) and 404s at runtime. For each brand: grep the
   brand/framework CSS for `@font-face`, `curl` each file into `/fonts/` (keep the
   original filenames), rewrite every `src` to a root-relative `/fonts/<file>` path,
   and verify in preview (`document.fonts.check()` true + `fetch('/fonts/<file>')`
   200, no font CORS/404). Don't assume brands share text faces — only the shared
   `abbv_iconFont.woff` is common across AbbVie brands; each brand brings its own
   text typefaces.
   **DOWNLOAD the brand's icons/logos into `/icons/<brand>/`** (nav logo, partner
   co-brand marks, any brand-unique glyphs). Reference them in block JS via
   `brandIcon('<name>')` (resolves `/icons/<brand>/<name>`). Only framework-generic
   UI icons (home, search) and the universal AbbVie corporate logo stay flat in
   `/icons/` and are shared across brands.
2. **Register the site** in Config Service: content root `/content/<brand>/`,
   brand domain, and `paths.json` mapping `/content/<brand>/:/`.
   Keep `paths.json` ↔ `.migration/project.json` `aemSitePath` aligned (see
   [[fragment-and-path-resilience]]).
   **Set the `brand` metadata** so the code resolves the brand at runtime
   (loads `styles/brands/<brand>.css`, sets brand-prefixed framework classes,
   logo paths). Two ways, use BOTH for safety:
   - **Bulk sheet**: a `metadata.json` at the content root with
     `{ "data": [{ "URL": "/**", "brand": "<brand>" }], ":type": "sheet" }`.
     Applied by the production pipeline to every page.
   - **Per-page metadata block**: add a `brand` row to each page's trailing
     `metadata` block (`<div><div>brand</div><div><brand></div></div>`). The
     importer/transformer should emit this automatically.
   The code defaults to `linzess` when no `brand` metadata is present, but make
   it EXPLICIT for every brand so none is the implicit default.
   NOTE: the local dev server does NOT inject the metadata block into `<head>`;
   `scripts.js` `extractInlineMetadata()` promotes the trailing `metadata` block
   to `<meta>` tags client-side (and removes it so it never renders as content)
   so `getMetadata('brand')` resolves in every environment. Without that, a bare
   `metadata` block leaks as visible text and 404s loading a metadata module.
3. **Confirm framework match:** assert the brand loads `common-elements`/`abbv-framework`
   and has `#abbv_use_statement` + header v2. If NOT (rare), flag for manual review — it may
   be off-framework.
4. **Scaffold:** point the brand at the shared blocks + its tokens. No new block code
   unless the differ later proves a brand-unique component.

Gate: brand homepage renders with correct brand colors using shared blocks, and
Linzess (and every other already-onboarded brand) is unchanged.

### Worked example — onboard `skyrizi` with a custom `header.js`

Most brands need only Tier 1 (a token file). This example also needs a Tier-4 JS
override because SKYRIZI's header has a structurally different DOM (extra utility
nav). Copy-paste template:

1. **Token file** `styles/brands/skyrizi.css` (Tier 1 — the only required file):
   ```css
   :root {
     --brand-primary: #4b2067;          /* SKYRIZI purple */
     --brand-primary-contrast: #fff;
     --brand-accent: #e6a01e;
     --brand-button-radius: 0;           /* SKYRIZI uses square CTAs */
     --brand-shadow: none;
     /* …only values that differ from the generic defaults… */
   }
   ```

2. **Brand metadata** so the runtime resolves `brand=skyrizi`:
   - Bulk sheet `content/skyrizi/metadata.json`:
     `{ "data": [{ "URL": "/**", "brand": "skyrizi" }], ":type": "sheet" }`
   - Per-page `metadata` block `brand` row (emitted by the importer).

3. **Custom decorator** `blocks/skyrizi/header.js` (Tier 4 — ONLY because the DOM
   truly diverges). Start from the base `blocks/header/header.js`, then change what
   differs. It must be a COMPLETE decorator (it replaces the base — base does NOT
   run for skyrizi):
   ```js
   export default async function decorate(block) {
     // copy of base header decorate(), plus SKYRIZI's extra utility nav…
   }
   ```

4. **Register the override** in `blocks/block-brand-overrides.json`:
   ```json
   {
     "cssOverrides": { },
     "jsOverrides": { "header": ["skyrizi"] }
   }
   ```
   Now `loadBlock()` (and `loadHeader`, which routes through it) imports
   `blocks/skyrizi/header.js` instead of the base for skyrizi pages. If you ever
   remove the file but leave the manifest entry, it falls back to the base (one
   404). For pure styling tweaks DON'T do this — add a `body.brand-skyrizi` rule
   in step 1's file instead.

Result: skyrizi renders with its own colors + custom header, and linzess (and every
other brand) is byte-for-byte unchanged because nothing shared was edited.

---

## PHASE 3 — Batch orchestrator (run across pages/brands)

Per brand, then per page (parallelize pages):
1. **URL discovery + triage** (reuse full-site-migration phase 1): drop 404s, redirects,
   cross-domain, duplicates.
2. **Import** content via the bundled import pipeline + `run-bulk-import.js` (never
   hand-write content HTML).
3. **Score** each page with `tools/style-diff/compare.js` → record similarity in
   `migration-work/<brand>/progress.json`.
4. **Gate:** every page ≥70%. Pages <70% get one structural pass (auto-block/section fix),
   then re-score.
5. Hand brands that pass to the per-page refinement loop (iterative-page-migration.md) only
   where 90–95% is required.

Parallelism: run page imports + scoring concurrently (subagents) to keep throughput high.
HCP sites: same as patient sites + handle the interstitial gate once, reuse for all HCP.

Output per brand: `migration-work/<brand>/progress.json` with per-page similarity + the
ranked remaining fixes. No extra markdown reports.

---

## Throughput expectation
- Phase 0 + 1: ~2 days one-time.
- Each new brand: hours (token swap + import + score).
- Each page: minutes (shared blocks; differ-driven fixes).
118 sites in days is achievable BECAUSE of the shared framework — reuse, don't re-derive.

## Rules
- Reuse `abbv-base`; never re-derive blocks/CSS per brand.
- Brand differences live in `:root` tokens + a tiny per-brand override file ONLY.
- Differ (computed styles) is the source of truth for diffs, not vision. Verify any
  vision/comparator claim in-browser before acting.
- Same DOM + verbatim `abbv-*` classes + same CSS — the core migration rule still holds.
- Always run the AbbVie pitfall checklist before declaring a page done.
