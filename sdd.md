# AbbVie AEM to Adobe Edge Delivery Services (EDS)
# Solution Design Document

**Prepared by:** Adobe Global Delivery Services  
**Version:** 1.0  
**Date:** June 2026  
**Status:** Draft  
**Classification:** Adobe Confidential — Do Not Distribute

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Scope](#2-project-scope)
3. [Architecture Overview](#3-architecture-overview)
4. [Multi-Brand Repository Architecture](#4-multi-brand-repository-architecture)
5. [EDS Block Library](#5-eds-block-library)
6. [Page Structure & Templates](#6-page-structure--templates)
7. [Scripts Architecture](#7-scripts-architecture)
8. [Styling Architecture](#8-styling-architecture)
9. [Integrations Architecture](#9-integrations-architecture)
10. [Analytics Implementation](#10-analytics-implementation)
11. [Modal & Warn on Departure/Arrival Features](#11-modal--warn-on-departurearrival-features)
12. [Assets & Dynamic Media Strategy](#12-assets--dynamic-media-strategy)
13. [Universal Editor & Authoring Model](#13-universal-editor--authoring-model)
14. [Multi-Locale & Multilingual Strategy](#14-multi-locale--multilingual-strategy)
15. [Performance Strategy](#15-performance-strategy)
16. [Migration Strategy (Hybrid Approach)](#16-migration-strategy-hybrid-approach)
17. [AbbVie's Scope & Responsibilities](#17-abbvies-scope--responsibilities)
18. [Risks & Mitigations](#18-risks--mitigations)
19. [Appendix — Block Reference](#19-appendix--block-reference)

---

## 1. Executive Summary

This document defines the end-to-end solution architecture for migrating AbbVie's AEM Sites platform to Adobe Edge Delivery Services (EDS). The migration covers **171 total sites** (53 Corporate + 118 Commercial), approximately **6,567 pages**, and the development of **164 EDS blocks**.

The EDS platform replaces the traditional AEM publish-tier delivery model with a CDN-first architecture where content is served directly from the edge. Pages are authored in the Universal Editor (xWalk), published to the EDS content bus, and delivered via `aem.live` (production) and `aem.page` (preview) CDN endpoints.

The repository (`abbvie-nextgen-eds`) is a **multi-brand, multi-locale monorepo** supporting the AbbVie Corporate brand and multiple Commercial brands (Rinvoq, Botox, Skyrizi, and others). Brand-specific styling, block overrides, and configuration are isolated per-brand while sharing a common block library and script infrastructure.

**Recommended Migration Strategy:** Option 3 — Hybrid Approach (ExMod-first for Corporate, parallel Commercial block build for ~25 Commercial-specific components).

---

## 2. Project Scope

### 2.1 Adobe's Scope

| Parameter | Corporate | Commercial |
|---|---|---|
| Sites in Scope | Up to 53 sites (abbvie.com + 45 regional + 7 others) | Up to 118 sites |
| Total Pages | ~3,814 pages | ~2,753 pages |
| Duration | ~6 to 7 months | ~18 weeks (parallel) |
| EDS Blocks | Up to 94 (66 Small, 23 Medium, 5 Complex) | Up to 70 (60 Small, 8 Medium, 2 Complex) |
| Workflows | Up to 29 | Up to 16 |
| Servlets / Backend Services | Up to 10 | Up to 5 |
| Web SDK Data Layers | Up to 10 | Up to 4 |

**Block Classification:**
- **Small blocks:** Boilerplate or minor functional/style modifications
- **Medium blocks:** Collection blocks or moderate functional modifications
- **Complex blocks:** Block party or complex code changes

### 2.2 Integrations In Scope

| Category | Integration |
|---|---|
| Monitoring & Analytics | Splunk (log routing), New Relic (monitoring), GTM (tag management) |
| Identity & Personalization | PingFed (SSO/IMS), Okta (identity), OneTrust (consent) |
| Content & Media | AEM Assets (native), Brightcove (video), YouTube (video), Veeva (content reference) |
| Search | Coveo |
| Data APIs | HCP site APIs |

> **Explicitly Out of Scope:** Adobe Analytics, Adobe Launch, Adobe Target implementation; Cloudflare infrastructure configuration; A/B experimentation; ISA and internal gated sites; GDPR/regulatory workflow changes; new EDS Forms beyond 6 custom components; Performance and security testing.

### 2.3 AbbVie's Scope

- All asset migration from AMS to Unified Cloud platform
- Manual content authoring for EDS Fragments, Content Fragments, EDS Pages, and associated assets
- All QA activities including automated functional, visual UI, content, and regression testing
- UAT ownership and formal sign-off prior to each site go-live
- Content freeze communication and coordination per site migration window
- DNS cutover and go-live launch execution (Adobe provides readiness support only)
- Forms migration to Unified Cloud (via separate partner — not Adobe's responsibility)

---

## 3. Architecture Overview

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              AEM as a Cloud Service (Author)                      │
│  ┌──────────────────────┐    ┌──────────────────────────────┐   │
│  │   Universal Editor   │    │  AEM Assets (Dynamic Media)  │   │
│  │   (xWalk / JCR)      │    │  Smart Crop Profiles         │   │
│  └──────────┬───────────┘    └───────────────┬──────────────┘   │
│             │ Publish                         │ Asset delivery   │
└─────────────┼───────────────────────────────-┼──────────────────┘
              │                                 │
              ▼                                 ▼
 ┌────────────────────────┐     ┌────────────────────────────┐
 │   EDS Content Bus      │     │   Dynamic Media CDN        │
 │  (Pages + Metadata +   │     │   scene7.com endpoints     │
 │   Fragments + Config)  │     │   Smart Crop renditions    │
 └───────────┬────────────┘     └────────────────────────────┘
             │
             ▼
 ┌───────────────────────────────────────────────────────────┐
 │            EDS CDN  (aem.live / aem.page)                 │
 │  Pages (.plain.html) │ Fragments │ Metadata.json          │
 │  Config (ab-config.json) │ Analytics mapping JSON         │
 └───────────┬───────────────────────────────────────────────┘
             │
             ▼
 ┌───────────────────────────────────────────────────────────┐
 │   Browser — Vanilla JS + CSS Block Architecture           │
 │   scripts.js: loadEager → loadLazy → loadDelayed          │
 │   44 blocks: header, footer, hero, carousel, cards, ...   │
 └───────────┬───────────────────────────────────────────────┘
             │ API calls (CORS-restricted or key-protected)
             ▼
 ┌───────────────────────────────────────────────────────────┐
 │   Cloudflare Edge Workers (6 Workers)                     │
 │   form-gateway  │  coveo-search-proxy  │  stock-ticker    │
 │   recaptcha-verify  │  rss-proxy  │  oembed-proxy         │
 └───────────────────────────────────────────────────────────┘
```

### 3.2 Deployment Environments

| Environment | URL Pattern | Purpose |
|---|---|---|
| Local Development | `localhost:3000` | Developer iteration |
| EDS Preview | `main--abbvie-nextgen-eds--{repo}.aem.page` | Content preview / QA |
| EDS Production | `*.aem.live` / `www.abbvie.com` | Live production |
| Universal Editor (Author) | `author-p157365-e*.adobeaemcloud.com` | Content authoring |

### 3.3 Content Delivery Model

In EDS, the delivery pipeline differs fundamentally from classic AEM:

1. Content authored in Universal Editor is stored in the AEM Author JCR repository
2. On publish, content is pushed to the **EDS content bus** — NOT to AEM Publish tier
3. The EDS CDN (`aem.live` for production, `aem.page` for preview) serves pages directly from the content bus
4. Page metadata, fragment `.plain.html` endpoints, and all assets are served from the CDN edge
5. Configuration is managed via EDS spreadsheets (`ab-config.json`) published to the content bus and served as JSON
6. Cache invalidation is triggered automatically by the EDS content bus on publish events — no dispatcher flush required

---

## 4. Multi-Brand Repository Architecture

### 4.1 Brand Configuration

The repository is a single multi-brand monorepo. Currently configured brands in `brand-config.json`:

```json
{
  "brands": ["rinvoq", "botox", "abbvie"],
  "themes": []
}
```

Additional Commercial brand content directories exist in the repository:
- `skyrizi-complete/` — Skyrizi Complete brand content
- `amdd/` — AMDD content
- `atopic-dermatitis/` — Atopic Dermatitis content
- `previously-untreated-cll/` — Previously Untreated CLL content

### 4.2 Brand Detection & Theme Loading

Brand detection is performed at runtime by reading the `brand` page metadata property via `multi-theme.js`:

```javascript
export function getBrandCode() {
  return getMetadata('brand') || '';  // e.g. 'rinvoq', 'botox', '' (abbvie corporate)
}
```

When a brand is detected:
1. `document.body.classList.add(brandCode)` — adds brand class to body
2. Brand-specific CSS is loaded for each block via path override:

```
/blocks/{blockName}/{brandPath}/{blockName}.css
  ↳ e.g. /blocks/header/rinvoq/header.css   (Rinvoq brand override)
  ↳ e.g. /blocks/header/header.css           (global fallback — no brand)
```

### 4.3 Repository Directory Structure

```
abbvie-nextgen-eds/
├── blocks/                    # 44 EDS blocks (shared across all brands)
│   ├── {block-name}/
│   │   ├── {block-name}.js    # Block JavaScript decorator
│   │   ├── {block-name}.css   # Global block CSS
│   │   ├── abbvie/            # Corporate brand CSS override
│   │   ├── rinvoq/            # Rinvoq brand CSS override
│   │   └── botox/             # Botox brand CSS override
├── scripts/                   # Shared scripts infrastructure
│   ├── aem.js                 # EDS boilerplate
│   ├── scripts.js             # Page orchestrator (3-phase load)
│   ├── multi-theme.js         # Brand/theme detection & block loader
│   ├── config.js              # ab-config.json fetcher
│   ├── utils.js               # Shared utility functions
│   ├── delayed.js             # GTM, RTE styles, link rewriter
│   ├── placeholders.js        # i18n placeholder lookup
│   ├── index-utils.js         # AEM content index utilities
│   ├── cfUtil.js              # Content Fragment / AEM Headless
│   ├── warn-on-departure/     # Warn on Departure feature modules
│   └── warn-on-arrival/       # Warn on Arrival feature modules
├── styles/                    # Global and brand-specific styles
│   ├── tokens.css             # Global design tokens
│   ├── styles.css             # Base styles
│   ├── fonts.css              # Font face declarations
│   ├── lazy-styles.css        # Lazy-loaded styles
│   ├── section.css            # Section-level styles
│   ├── width-styles.css       # Width/container utilities
│   ├── abbvie/blocks/         # Corporate block CSS overrides (44 blocks)
│   ├── rinvoq/blocks/         # Rinvoq block CSS overrides
│   └── botox/blocks/          # Botox block CSS overrides
├── models/                    # Universal Editor component models
├── rules/                     # Validation/business rules
├── icons/                     # SVG icon library
├── fonts/                     # Web font files
├── theme-tools/               # Brand scaffolding tools
├── tools/                     # Utility tools (importer, etc.)
├── head.html                  # Global HTML head template
├── brand-config.json          # Brand registry
├── component-models.json      # xWalk UE component model definitions
├── component-definition.json  # xWalk UE component definitions
├── component-filters.json     # xWalk UE component filters
├── xwalk.json                 # xWalk feature flags
├── helix-sitemap.yaml         # Sitemap configuration
└── Docs/                      # Solution documentation
```

### 4.4 Block Config Merge Pattern

For blocks with complex multi-variant behaviour, `multi-theme.js` merges global and brand-specific `block-config.js` files:

```javascript
// Merge rules (brand > global):
// flags:               shallow merge (brand overrides global)
// variations:          concatenated (global first, then brand)
// decorations:         brand overrides global (beforeDecorate, decorate, afterDecorate)
// cacheResetHandlers:  concatenated
const mergedConfig = mergeConfig(globalConfig, brandConfig);
```

This enables blocks to have brand-specific variations and decoration logic without duplicating the entire block implementation.

---

## 5. EDS Block Library

### 5.1 Complete Block Inventory (44 Blocks)

#### Layout & Structure Blocks (Small — 5 blocks)

| Block | AEM Equivalent | Description | Key Technical Features |
|---|---|---|---|
| `columns` | Columns component | Multi-column responsive layout | Grid/flex layout, brand CSS overrides |
| `inner-grid` | Layout container | CSS grid container | `cols-X-Y-Z` variant for column spans; `col-N` class assigns child to column; `collectInnerGridBlocks()` post-load restructuring |
| `separator` | Horizontal rule | Visual divider | Simple `<hr>`-based component |
| `text-container` | Text component | Rich text wrapper | Scoped RTE content, brand-specific typography |
| `eyebrow-text` | Eyebrow/tag line | Pre-headline label | Branded overline text styling |

#### Navigation Blocks (Medium — 6 blocks)

| Block | AEM Equivalent | Description | Key Technical Features |
|---|---|---|---|
| `header` | Header component | Global site header | Fragment-based nav load (`/nav.plain.html`), mega menu, hamburger, search form, skip link, desktop backdrop, external link decoration, `IndexUtils` for dynamic nav data, language links, `navigation-content` sub-blocks |
| `footer` | Footer component | Global site footer | Fragment-based footer load, brand-specific styling |
| `breadcrumb` | Breadcrumb | Navigation trail | URL-path derived or hero-integrated |
| `navigation-content` | Navigation component | Nav content block | `data-type` driven: `logo`, `navigation-content`, `language-links`, `search`; mega menu building; CF-based card data |
| `pipeline-utility-nav` | Pipeline nav | Drug pipeline utility bar | Multi-step pipeline navigation |
| `tag-utility-nav` | Tag nav | Tag/filter navigation | Tag-based content filter navigation |

#### Content Display Blocks (Small to Medium — 12 blocks)

| Block | AEM Equivalent | Description | Key Technical Features |
|---|---|---|---|
| `hero` | Hero component | Page hero | Background image/video, breadcrumbs, section-type metadata (`data-section-type="hero"`) |
| `hero-container` | Hero container | Hero wrapper | Contains hero and overlapping blocks; negative-margin positioning |
| `cards` | Card list | Card grid | Video card support (Brightcove + YouTube inline play), story card variant, `resolveImageReference()` for author-mode image links |
| `carousel` | Carousel | Carousel/slider | Static + dynamic (RSS) modes, autoplay with hover pause, dot/arrow navigation, looping, center-active, `bypassCarouselOnMobile`, starting slide index, RSS JSON transform via `fetchRssFeed`/`parseRssFeed` |
| `teaser` | Teaser | Image + headline + CTA | Responsive teaser layout with brand styling |
| `cta` | Button/CTA | Call-to-action | Primary/secondary/tertiary variants, external link handling |
| `custom-image` | Image component | Image with metadata | DM smart crop, alt text, lazy/eager loading |
| `custom-title` | Title component | Heading element | Configurable h1–h6, brand typography |
| `custom-embed` | Custom embed | Flexible embed | Container for arbitrary embed content |
| `embed` | Embed | oEmbed/URL embed | YouTube, Vimeo, oEmbed resolver via `oembed-proxy` Edge Worker |
| `embed-form` | Form embed | External form embed | Embed external form iFrame |
| `quote` | Quote component | Pull quote display | Static mode (authored text) + CF mode (AEM Headless GraphQL fetch by `./fragmentPath`) |

#### Interactive Blocks (Medium — 6 blocks)

| Block | AEM Equivalent | Description | Key Technical Features |
|---|---|---|---|
| `accordion` | Accordion | Expandable sections | Expand/collapse all, custom font icons + image icons, 13-row config header, WCAG 2.1 AA ARIA |
| `tabs` | Tabs | Tabbed content | `role="tablist"`/`role="tabpanel"`, click activation, multiple tab blocks per page (global counter), `moveInstrumentation()` |
| `modal` | Modal dialog | `<dialog>` overlay | Fragment-based content (`/modals/` path auto-trigger), focus trap, `data-modal-action="confirm"` for gated flows, departure/arrival modal reuse |
| `fragment` | Experience Fragment | Content inclusion | `fetch({path}.plain.html)`, `decorateMain()` + `loadSections()` re-application, `addGridSectionsWrapper()` support, `moveInstrumentation()` |
| `table` | Table component | Data table | Accessible HTML table |
| `linklist` | Link list | Link list display | AEM Headless CF fetch (LinkList + Facts fragment types) |

#### Media Blocks (Medium — 3 blocks)

| Block | AEM Equivalent | Description | Key Technical Features |
|---|---|---|---|
| `brightcove-video` | Brightcove Video | Brightcove video player | Direct Brightcove Player SDK, Account ID + Player ID + Video ID authored in dialog |
| `brightcove-podcast-player` | Brightcove Podcast | Brightcove audio/podcast | Brightcove Podcast Player SDK embed |
| `video` | Video component | Generic video player | YouTube + Brightcove support, autoplay (viewport-triggered), captions, fullscreen, player controls, transcript locale fallback |

#### Data & Feed Blocks (Complex — 8 blocks)

| Block | AEM Equivalent | Description | Key Technical Features |
|---|---|---|---|
| `stock-ticker` | Stock Ticker component | Real-time stock quote | `ab-config.json` `stock-ticker-url` config, site key derivation from URL path + page metadata, price split rendering (integer + decimal), `stock-ticker-cron` Edge Worker (KV cache, 15-min cron), analytics tracking via `window.adobeDataLayer` |
| `news-feed` | News Feed | RSS news articles | `fetchFeed()` → XML parse → max 3 items, CORS-safe via `rss-proxy` Edge Worker |
| `search` | Search component | Search orchestration | Search form wrapper, delegates to search-input |
| `search-input` | Search input | Search field | Input + validation, error messaging via placeholders |
| `search-results` | Search Results 2.0 | Coveo-powered results | `coveo-search-proxy` Edge Worker (API key protection), query caching by hash, pagination |
| `product-listing` | Product listing | Product/drug listing | Product-filtered content list |
| `editorial-feed` | Editorial feed | Curated content | Editorial content aggregation |
| `press-releases` | Press releases | Press release list | Press release content feed |

#### Story & Specialty Blocks (Medium — 5 blocks)

| Block | AEM Equivalent | Description | Key Technical Features |
|---|---|---|---|
| `story-card` | Story Card | Single story card | Date, tag, eyebrow, title, description, CTA — `decorateStoryCard()` semantic restructuring |
| `story-cards` | Story Cards List | Story cards grid | Multiple story cards, index-based data loading |
| `fact-card` | Fact/Stats card | Statistics display | AEM Headless CF fetch (Facts fragment), `cfUtil.js` integration |
| `flip-card` | Flip card | Interactive flip card | CSS 3D transform flip reveal (front/back) |
| `chart` | Chart component | Data visualization | Chart rendering |
| `social-media` | Social Media | Social links | Social icon links with brand styling |
| `audience-mode-toggle` | HCP toggle | Audience switcher | HCP/Patient mode toggle, cookie/storage persistence |

#### Form Block (Complex — 1 block with multiple sub-components)

| Block | AEM Equivalent | Description | Key Technical Features |
|---|---|---|---|
| `form` | AEM Adaptive Forms | EDS Adaptive Form | Complete AF engine ported: `RuleEngine.js`, `RuleCompiler.js`, `TreeInterpreter.js`, component mappings (`mappings.js`), field types (text, textarea, select, radio, checkbox, file, rating, password, repeatable), `GoogleReCaptcha` integration (`recaptcha-verify` Worker), `handleSubmit()` with `form-gateway` Edge Worker routing, `DocBasedFormToAF` transform, form modal wrapper |

### 5.2 Block Anatomy & File Convention

```
blocks/{block-name}/
├── {block-name}.js            # export default decorate(block) — required
├── {block-name}.css           # Global block styles — required
├── block-config.js            # Optional: variations/decorations config (global)
├── abbvie/
│   ├── {block-name}.css       # Corporate brand CSS override
│   └── block-config.js        # Corporate brand block config override
├── rinvoq/
│   ├── {block-name}.css       # Rinvoq brand CSS override
│   └── block-config.js        # Rinvoq brand block config override
└── botox/
    └── {block-name}.css       # Botox brand CSS override
```

### 5.3 Common Block Props Pattern

All authored blocks support standardized properties via `applyCommonProps(block, startIndex)`:

| Property | Dialog Field | Applied As |
|---|---|---|
| Block ID | `blockId` | `block.id` attribute |
| Language | `language` | `block.lang` attribute |
| Analytics ID | `analytics_id` | `block.dataset.analyticsId` |
| Custom Class | `classes_commonCustomClass` | CSS class (framework-handled) |
| Dynamic Class | `classes_customDynamicClass` | CSS class from picklist |

The `startIndex` parameter identifies the first row that contains these standard properties (varies per block).

---

## 6. Page Structure & Templates

### 6.1 Page Loading Lifecycle

```
loadPage()
  ├── loadEager()   ← LCP-critical: blocks above the fold
  │     ├── loadCSS(section.css)
  │     ├── decorateTemplateAndTheme()
  │     ├── decorateMain(main)
  │     │     ├── decorateButtons(main)        — Button/CTA wrapping
  │     │     ├── decorateIcons(main)           — Icon sprite injection
  │     │     ├── decorateSections(main)        — Section div structure
  │     │     ├── decorateSectionBackgrounds()  — Background image CSS rules
  │     │     ├── decorateBlocks(main)          — Block class/data attributes
  │     │     ├── decorateFragmentRotation()    — Hero fragment rotation
  │     │     └── a11yLinks(main)               — aria-label on all anchors
  │     ├── loadSection(first section, waitForFirstImage)
  │     └── addClientSideMetadata()             — OG/Twitter/itemprop meta
  │
  ├── loadLazy()    ← Below-fold: non-blocking
  │     ├── autolinkModals()                   — /modals/ + external link handlers
  │     ├── importWarnOnArrival() (if metadata) — Page arrival modal
  │     ├── loadSections(remaining sections)
  │     ├── addGridSectionsWrapper(main)        — Grid container wrapping
  │     ├── collectInnerGridBlocks(main)        — inner-grid column assembly
  │     ├── loadHeader(header)
  │     ├── loadFooter(footer)
  │     └── loadCSS(lazy-styles.css)
  │
  └── loadDelayed() ← 3-second delay: analytics, tooling
        ├── loadGTM(gtmId)         — Corporate only (brand === 'abbvie')
        ├── decorateRTEStyles()    — //[class] text // pattern transform
        ├── registerUEExtensions() — If in Universal Editor
        └── initLinkRewriter()     — Transitional .html extension appender
```

### 6.2 Section Architecture & Metadata

Each EDS section (`<div class="section">`) supports these metadata-driven attributes:

| Metadata Property | Applied As | Description |
|---|---|---|
| `data-background` | `background-image` CSS + `<style>` rule | Section background image (URL or DM path) |
| `data-section-type` | `data-section-type` attribute | Enables special behaviours (e.g., `hero` → fragment rotation) |
| `data-language` | `lang` attribute | Language for section-level ARIA |
| `data-blockId` | `id` attribute | Anchor/scroll target ID |
| `data-analytics_id` | `data-analytics-id` attribute | Analytics interaction tracking ID |

### 6.3 Image Reference Resolution

On AEM Author, component "reference" fields render as `<a href>` links instead of `<img>` tags. The `resolveImageReference(container)` function detects image-like links and replaces them with `<img>` elements so downstream block code finds images normally. Detection patterns:
- Image file extensions: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`, `.avif`
- Scene7 paths: `scene7.com`, `/is/image/`
- DAM paths: `/content/dam/`, `media_` prefix

---

## 7. Scripts Architecture

### 7.1 Core Script Files

| Script | Responsibility | Load Timing |
|---|---|---|
| `scripts/aem.js` | EDS core boilerplate: `decorateBlocks`, `decorateButtons`, `decorateIcons`, `loadCSS`, `getMetadata`, `createOptimizedPicture`, `buildBlock`, `loadSection`, `loadSections`, `waitForFirstImage` | Synchronous `<head>` |
| `scripts/scripts.js` | Page orchestrator: three-phase load pipeline, `decorateMain()`, section backgrounds, fragment rotation, modal auto-linking, warn-on-arrival wiring | Synchronous `<head>` |
| `scripts/multi-theme.js` | Brand/theme system: brand detection, path override, `loadBlock()` with brand CSS, `renderBlock()` with config merge, `loadBlockConfig()`, `loadHeader()`, `loadFooter()` | Imported by scripts.js |
| `scripts/config.js` | Config loader: fetches `ab-config.json` from EDS CDN (or xWalk resource path in UE), caches in `sessionStorage`; `getConfigValue(key)` API | Imported as needed |
| `scripts/utils.js` | Utility library: `isExternalLink()`, `isImageHref()`, `applyCommonProps()`, `isUniversalEditor()`, `isUEEditMode()`, `shouldRunOutsideAuthorEdit()`, `addGridSectionsWrapper()`, `fetchRssFeed()`, `parseRssFeed()`, `decorateExternalLinksUtility()` | Imported by many modules |
| `scripts/delayed.js` | Delayed execution: GTM injection, `decorateRTEStyles()`, link rewriter IIFE, UE extension registration | 3-second `setTimeout` |
| `scripts/placeholders.js` | i18n text fetches from `/placeholders.json` | Imported as needed |
| `scripts/index-utils.js` | AEM content index (query-index.json) utilities for navigation and page data lookups | Imported by header block |
| `scripts/cfUtil.js` | Content Fragment / AEM Headless API fetch utilities, `fetchDashboardCardData()` | Imported by header, fact-card |
| `scripts/aem-bootstrap.js` | AEM initialization bootstrap | Initialization |

### 7.2 Configuration System (`ab-config.json`)

Global site configuration is stored as an EDS spreadsheet published to the content bus and served as `ab-config.json`:

```
GET /ab-config.json
{
  "data": [
    { "key": "gtm-id",           "value": "GTM-XXXXXXXX" },
    { "key": "stock-ticker-url", "value": "https://api.example.com/stock" },
    { "key": "coveo-org-id",     "value": "abbvieXXXXX" }
  ]
}
```

Access pattern:
```javascript
const gtmId = await getConfigValue('gtm-id');
```

In Universal Editor, the config URL resolves relative to the current page path:  
`{currentPath}.resource/ab-config.json`

### 7.3 Warn on Departure System

```
scripts/warn-on-departure/
├── warn-on-departure.js   — Orchestrator
├── domain-config.js       — Spreadsheet fetch + shouldShowModal() logic
└── modal-resolver.js      — 3-tier modal path resolution
```

**Flow:**
1. `autolinkModals()` adds click event delegation on `document`
2. On external link click (`isExternalLink(href)` or `data-warn-on-departure="true"`), dynamically imports `warn-on-departure.js`
3. Loads domain config from `/config/warn-departure/{country}-{lang}.json` (sessionStorage cached)
4. Evaluates `shouldShowModal(href, config)` with `reverseMapping` logic
5. If modal required: resolves fragment path via 3-tier hierarchy, opens `modal.js` departure modal
6. If no modal: navigates directly

**3-Tier Modal Path Resolution:**
| Tier | Source | How Read |
|---|---|---|
| 1 (highest) | Block-level | `[data-warn-departure-modal-path]` data attribute on ancestor block |
| 2 | Page-level | `warndeparturemodalpath` page metadata (`getMetadata()`) |
| 3 (fallback) | Site root | `/{locale}/metadata.json` fetched from CDN |

### 7.4 Warn on Arrival System

```
scripts/warn-on-arrival/
└── warn-on-arrival.js    — Orchestrator: frequency check, 2-tier resolution, modal render
```

**Flow:**
1. Lazily imported in `loadLazy()` only if `warnarrivalmodalpath` page metadata is set
2. Non-blocking (`.then()` chain) — does not delay header/footer/section loads
3. Not loaded in Universal Editor (prevents modal interference during authoring)
4. Reads `warnarrivalfrequency` (`session` | `once` | `always`) from page/root metadata
5. Checks `sessionStorage`/`localStorage` for dismiss flag `warn-arrival-dismissed-{country}-{lang}`
6. If not dismissed: resolves modal fragment path, fetches `.plain.html`, renders via shared `modal-renderer.js`
7. On user acknowledgment: sets dismiss flag in appropriate storage

**2-Tier Modal Path Resolution:**
| Tier | Source |
|---|---|
| 1 (highest) | `warnarrivalmodalpath` current page metadata |
| 2 (fallback) | Site root `warnarrivalmodalpath` from `/{locale}/metadata.json` |

---

## 8. Styling Architecture

### 8.1 CSS Custom Properties (Design Tokens)

`styles/tokens.css` defines the complete design token set as CSS custom properties. Corporate token naming convention uses `--corp-*` prefix:

```css
/* Typography */
--corp-font-size-30 | --corp-font-size-28 | --corp-font-size-26 ...
--corp-font-weight-extrabold
--corp-typography-lineheight-relaxed-xl | -lg | -md | -sm
--corp-typography-lineheight-body-lg

/* Colors */
--color-surface-default
--corp-color-text-default

/* Spacing */
--corp-spacing-24
```

Each brand overrides these tokens in its `styles/{brand}/` directory. Body receives the brand class (`class="rinvoq"`) enabling CSS cascade-based token overrides per brand.

### 8.2 Styling Load Order

| Order | File | Phase | Purpose |
|---|---|---|---|
| 1 | `styles/tokens.css` | Eager — `<head>` | Design tokens (CSS custom properties) |
| 2 | `styles/styles.css` | Eager — `<head>` | Base typography, body, heading styles |
| 3 | `styles/width-styles.css` | Eager — `<head>` | Container width utilities |
| 4 | `styles/section.css` | loadEager | Section-level layout |
| 5 | `blocks/{block}/{brand}/{block}.css` | Per block in loadSection | Block + brand styles |
| 6 | `styles/lazy-styles.css` | loadLazy | Deferred/below-fold styles |
| 7 | `styles/fonts.css` | loadFonts | Web fonts (desktop-first or sessionStorage flag) |
| 8 | `styles/abbvie/rte-styles.css` | loadDelayed | RTE rich text style classes |

### 8.3 Multi-Brand Block CSS Override Pattern

The `multi-theme.js` `loadBlock()` constructs the CSS path using the `brandPath` variable:

```javascript
// brandPath = 'rinvoq/'  (or '' for corporate/no-brand)
loadCSS(`/blocks/${blockName}/${brandPath}${blockName}.css`);
```

If the brand CSS file does not exist, EDS returns a 404 which is silently ignored — the global block CSS remains in effect. This graceful fallback means blocks only need brand overrides where visual differences exist.

### 8.4 Theme Tools (`theme-tools/`)

The `theme-tools/` directory provides brand scaffolding utilities:

| Tool | Purpose |
|---|---|
| `generate-css.js` | Generates CSS token files from design system source |
| `initiate-brand.js` | Scaffolds a new brand's directory structure and config |
| `remove-brand.js` | Removes a brand's directory structure |
| `plopfile.mjs` + `plop-templates/` | Plop.js code generators for new blocks and brands |

---

## 9. Integrations Architecture

### 9.1 Edge Worker Decision Framework

Six criteria determine whether a component requires a Cloudflare Edge Worker:

| # | Criterion | When Edge Worker is Required |
|---|---|---|
| 1 | API Key/Secret | Private key must not be exposed in client-side JavaScript |
| 2 | CORS Restriction | Third-party API blocks browser cross-origin requests |
| 3 | Server-side Verification | Security validation (e.g., reCAPTCHA) must happen server-side |
| 4 | Protocol/Format Transform | Upstream returns XML/RSS — Worker transforms to JSON |
| 5 | Multi-backend Routing | Form POSTs routed to different backends based on business logic |
| 6 | Scheduled/Background Fetch | Data refreshed on cron schedule, cached in KV |

### 9.2 Edge Workers Required (6)

| Priority | Worker Name | Serves | Trigger | Secrets / KV |
|---|---|---|---|---|
| 1 | `form-gateway` | Form Container (all form actions) | HTTP POST | Kana key, HCP key, DockCheck URL, email routing |
| 2 | `coveo-search-proxy` | Search Results 2.0 (Coveo) | HTTP GET | `COVEO_API_KEY` secret |
| 3 | `stock-ticker-cron` | Card – Stock Ticker | Cron (every 15 min) | `GCS_API_URL` secret; KV: `stock:abbvie` (TTL 15 min) |
| 4 | `recaptcha-verify` | reCAPTCHA form field | HTTP POST | `RECAPTCHA_SECRET` key |
| 5 | `rss-proxy` | News Feed + Carousel (dynamic) | HTTP GET | KV cache only (no secrets); shared by both blocks |
| 6 | `oembed-proxy` | Embed 2.0 (oEmbed URLs) | HTTP GET | KV cache by URL hash (no secrets) |

### 9.3 Direct Integrations (No Edge Worker — 7 components)

| Component | Integration Approach | Rationale |
|---|---|---|
| Brightcove Video | Brightcove Player JS SDK — authored Account ID, Player ID, Video ID | No secrets; Brightcove CDN is CORS-open |
| Brightcove Podcast | Brightcove Podcast Player SDK — same pattern | No secrets; Brightcove CDN CORS-open |
| Content Fragment | `fetch()` to AEM Headless API (`/api/graphql` or JSON path) | Public, CORS-enabled AEM Headless endpoint |
| Dashboardcards | AEM Headless API — LinkList + Facts CF types, DM image modifiers | Public AEM Headless endpoint |
| Profile | AEM Headless API — profile CF by path + variation | Public AEM Headless endpoint |
| Quote (CF mode) | AEM Headless API — conditional fetch only when `quoteType=CF` | Public AEM Headless endpoint |
| YouTube embeds | Native `<iframe>` embed — no proxy needed | YouTube iframe embeds natively; no credentials |

### 9.4 GTM Integration

Google Tag Manager is loaded in `loadDelayed()` **only for Corporate sites** (where `getBrandCode()` returns `'abbvie'` or empty):

```javascript
// delayed.js
if (!brand || brand === CORPORATE_BRAND) {
  const gtmId = await getConfigValue('gtm-id');
  if (gtmId) loadGTM(gtmId);
}
```

This prevents GTM from loading on Commercial brand pages that manage their own tag strategy.

### 9.5 OneTrust Consent Management

OneTrust is integrated for cookie consent management across all sites. The implementation respects:
- Consent signal before loading analytics/tracking scripts
- Per-locale consent configuration
- GDPR compliance for European markets (Note: GDPR workflow changes are out of scope)

### 9.6 PingFed / Okta SSO Integration

Identity integration for HCP-gated content:
- PingFed integration with IMS via Admin Console setup
- Okta for identity management
- `audience-mode-toggle` block handles HCP/Patient surface switching
- HCP site APIs integration for personalized content delivery

---

## 10. Analytics Implementation

### 10.1 Architecture Overview

The analytics implementation uses a **two-layer data model** to minimize HTML payload and Core Web Vitals impact:

| Layer | What | How | When |
|---|---|---|---|
| Page Context | `window.digitalData.page` | Inline `<script>` from xWalk page properties | Instant — zero network calls |
| Interaction Context | Per-CTA click payload | `/config/analytics-mapping.json` worksheet fetch + JS map lookup | At click time (lazy) |

### 10.2 Page-Level Data Layer

Page metadata properties (authored in UE via the **Analytics tab** in `component-models.json`) are emitted as `<meta>` tags by EDS and read by `scripts/analytics.js` on page load:

```javascript
window.digitalData = {
  page: {
    pageInfo:   { domain, url, path, pageName, title },
    category:   { primaryCategory, subCategory1, subCategory2 },
    attributes: { country, language, promoMatsNumber, globalISI, type },
    product:    { name, brand, indication, division, franchise },
    site:       { type, experience, audience },
    journey:    { content, patient, messageBucket },
  },
  user: [],
};
```

This object is built from `<meta>` tags — **no fetch, no render blocking**.

### 10.3 Block/Interaction-Level Analytics

Each CTA is tagged with an opaque `data-analytics-id` attribute in content documents:

```html
<a href="/en-us/atopic-dermatitis" data-analytics-id="rte-515718936-0">
  Moderate to Severe Eczema
</a>
```

The analytics-id maps to a row in the `/config/analytics-mapping.json` worksheet (authored spreadsheet):

| Field | Example |
|---|---|
| `analytics-id` | `rte-515718936-0` |
| `link-name` | `atopic dermatitis` |
| `display-title` | `Moderate to Severe Eczema...` |
| `type` | `internal` |
| `link-url` | `/en-us/atopic-dermatitis` |
| `component-name` | `RTE` |
| `component-pos` | `content` |
| `mva-tier` | `tier-1` |

### 10.4 Click Event Handler

```javascript
// analytics-links.js
document.addEventListener('click', (event) => {
  const anchor = event.target.closest('a[data-analytics-id]');
  if (!anchor) return;
  const id = anchor.dataset.analyticsId;
  const payload = resolveAnalytics(id, anchor, analyticsConfig);
  window.alloy('sendEvent', { xdm: { /* merged page + interaction data */ } });
});
```

The handler uses event delegation (single listener) and `requestIdleCallback` initialization — zero INP impact.

### 10.5 Analytics Page Properties (component-models.json)

The `page-metadata` model includes an **Analytics tab** with these fields:

| Field | Type | Purpose |
|---|---|---|
| `domain` | text | Brand domain (e.g., `rinvoq`) |
| `country` | text | Country code (e.g., `us`) |
| `lang` | text | Language code (e.g., `en`) |
| `pageType` | select | Homepage / Condition / HCP |
| `productBrand` | text | Product brand name |
| `productIndication` | text | Product indication |
| `siteAudience` | select | Patient / HCP |
| `promoMatsNumber` | text | Regulatory materials number |
| `globalISI` | text | Global ISI identifier |
| `analytics_id` | text (readOnly) | Block-level analytics ID (auto-generated) |

### 10.6 Performance Requirements

| Requirement | Status |
|---|---|
| `window.digitalData` set from inline script (no fetch) | Required |
| Web SDK (`alloy`) loaded with `async` attribute | Required |
| Analytics config fetch triggered after `window.load` | Required |
| No `JSON.stringify`/`JSON.parse` at block decoration time | Required |
| Click handler uses event delegation (single listener on document) | Required |
| `initAnalyticsLinks()` wrapped in `requestIdleCallback` | Required |
| No analytics script in `<head>` without async/defer | Blocking requirement |

---

## 11. Modal & Warn on Departure/Arrival Features

### 11.1 Modal Block (`blocks/modal/`)

The `modal` block is a shared infrastructure component used by three distinct features:

| Use Case | Trigger | Modal Type |
|---|---|---|
| Content modals | Click on `/modals/` path links | `undefined` (generic) |
| Warn on Departure | Click on external link | `departure` |
| Warn on Arrival | Page load (if configured) | `arrival` |

**Technical implementation:**
- Uses native `<dialog>` HTML element
- Fragment content loaded via `fetch({path}.plain.html)` on demand
- `data-modal-action="confirm"` on controls enables gated navigation flows
- WCAG 2.1 AA: focus trap, `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, Escape key close, backdrop click close
- `focusOnClose` option returns focus to the triggering element after close

### 11.2 Warn on Departure — Standard vs Reverse Mode

| Aspect | Standard Mode (`reverseMapping=false`) | Reverse Mode (`reverseMapping=true`) |
|---|---|---|
| Domain list acts as | Blocklist — these domains trigger modal | Allowlist — these domains are SAFE |
| Modal shown when | Clicked domain IS in the list | Clicked domain is NOT in the list |
| Use case | Small set of known external domains | Large external link surface; short allowlist |

**Domain config spreadsheet** (`/config/warn-departure/{country}-{lang}.json`):
```json
{
  "data": [
    { "allowedDomains": "humira.com", "Allow Reverse Mapping": "false" },
    { "allowedDomains": "skyrizi.com", "Allow Reverse Mapping": "" }
  ]
}
```

### 11.3 Warn on Arrival — Frequency Modes

| Mode | Storage | Behaviour |
|---|---|---|
| `session` | `sessionStorage` | Shows once per browser session |
| `once` | `localStorage` | Shows once ever (persists across sessions) |
| `always` | No storage | Shows on every page load |

Storage key format: `warn-arrival-dismissed-{country}-{lang}` (locale-scoped to prevent cross-locale conflicts).

### 11.4 Shared Modal Infrastructure

Both Warn on Departure and Arrival share:
- `modal-renderer.js` — DOM injection, focus trap, backdrop, close animation, ARIA
- Fragment authoring pattern — EDS fragment page via Universal Editor
- `warn-departure-modal.css` — Shared overlay/dialog/button styles

---

## 12. Assets & Dynamic Media Strategy

### 12.1 Dynamic Media Integration

AEM Dynamic Media (Scene7) is used for all production image delivery. The integration provides:

- **Smart Crop** renditions per profile (Feature 840×470, Hero 2880×1660, Square 1060×854, Tall 840×1010, VideoThumbnail 1440×810)
- **Image presets** (basic presets configured per brand)
- **On-the-fly transformations** via Scene7 URL parameters (`?fmt=webp&wid=800`)

### 12.2 Smart Crop Setup Process

Per the Assets Processing Steps documentation:

1. Navigate to AEM Tools > Assets > Image Profiles
2. Confirm `Abbvie-Corporate-Smart-Crop` profile is assigned to relevant DAM folders
3. Select assets/folders and run **Reprocess Assets → Full Process**
4. Validate renditions in the asset detail view under **Renditions > Dynamic**

### 12.3 Asset URL Patterns

| Asset Type | URL Pattern |
|---|---|
| DM image with preset | `https://{dm-host}/is/image/{company}/{asset}?$preset$` |
| DM image with smart crop | `https://{dm-host}/is/image/{company}/{asset}?crop=auto&size=840,470` |
| DAM path (EDS) | `/content/dam/{path}/asset.jpg` |
| EDS optimized picture | `createOptimizedPicture()` — auto-generates `<picture>` with WebP + breakpoints |

### 12.4 Image Reference Resolution in EDS

A key difference from AEM: in Universal Editor, image "reference" fields output `<a href="/content/dam/...">` links instead of `<img>` tags. The `resolveImageReference(container)` utility in `scripts.js` automatically converts these to `<img>` elements so all block code works consistently across author and delivery surfaces.

### 12.5 AbbVie Asset Migration Responsibility

- AbbVie owns all asset migration from AMS to Unified Cloud (Dynamic Media) — this is NOT Adobe's responsibility
- Dynamic Media entitlement must be in place before migration commences
- Assets should be migrated in batches, prioritized by site migration wave
- Smart Crop profiles must be applied and validated before each site goes live

---

## 13. Universal Editor & Authoring Model

### 13.1 xWalk / Universal Editor Architecture

The Universal Editor (UE) uses the **xWalk** pattern — content is authored in the AEM JCR repository but delivered via EDS. Key characteristics:

- Authors work in a familiar AEM-like editor at `author-*.adobeaemcloud.com`
- Pages are stored as JCR nodes with structured properties
- On publish, JCR content is serialized and pushed to the EDS content bus
- Preview available at `*.aem.page` — no AEM Publish tier involved
- `xwalk.json` enables multi-field support: `{ "xwalk": { "multi-field": { "enabled": true } } }`

### 13.2 Component Models (`component-models.json`)

Every authorable block is defined in `component-models.json`. Each model specifies:

| Field Type | Usage |
|---|---|
| `text` | Single-line text inputs |
| `textarea` / `richtext` | Multi-line / rich text editing |
| `select` | Dropdown options |
| `boolean` | Checkbox |
| `number` | Numeric input |
| `reference` | DAM asset picker |
| `aem-content` | AEM content path picker (for fragments) |
| `aem-tag` | AEM tag picker |
| `tab` | UI tab grouping (not a data field) |
| `ngaem:dynamic-picklist` | Dynamic picklist from AEM node config |
| `custom-asset-namespace:custom-asset` | Custom asset selector with config URL |

### 13.3 Page Metadata Model

The `page-metadata` model defines all page-level properties organized into tabs:

| Tab | Key Fields |
|---|---|
| **Basic** | Title, Nav Title, Description, Keywords, Tags, OG Image, hideFromNavigation, navigationalOrder |
| **Card Story** | eyebrowText, cardTitle, cardDescription, cardImage, cardImageAlt, ctaText, publicationDate, storyReadTime, storyWatchTime |
| **Modal Config** | warndeparturemodalpath, warnarrivalmodalpath |
| **Analytics** | Domain, country, language, pageType, productBrand, productIndication, siteAudience, promoMatsNumber, globalISI |

### 13.4 Universal Editor Data Instrumentation

Blocks output `data-aue-*` attributes for UE editability:

```html
<div data-aue-resource="urn:aemconnection:/content/site/page/jcr:content/root/container/block"
     data-aue-type="component"
     data-aue-model="carousel">
  <div data-aue-prop="title" data-aue-type="text">Carousel Title</div>
  <div data-aue-prop="image" data-aue-type="reference">...</div>
</div>
```

The `moveInstrumentation(from, to)` utility in `scripts.js` moves `data-aue-*` and `data-richtext-*` attributes from source elements to new DOM elements created during block decoration — ensuring UE editability is preserved after JS transformation.

### 13.5 UE Extensions

Up to 6 Universal Editor extensions are in scope. Extensions are registered in `scripts/ue-extensions.js` (loaded in `loadDelayed()` when in UE context). The customer technical team can create additional extensions independently after initial setup.

### 13.6 Author vs Delivery Surface Detection

| Function | Returns `true` when |
|---|---|
| `isUniversalEditor()` | Author origin, `data-aue-resource` on `<html>`, or `?aue` param |
| `isUEEditMode()` | `adobe-ue-edit` class on `<html>` |
| `isUEPreviewMode()` | `adobe-ue-preview` class on `<html>` |
| `shouldRunOutsideAuthorEdit()` | NOT in UE edit mode (runs on preview + live) |
| `isInUniversalEditor()` | `window.self !== window.top` (iframe detection) |

---

## 14. Multi-Locale & Multilingual Strategy

### 14.1 Content Tree Structure

Content is organized in a locale-based hierarchy under the AEM content root:

```
/content/abbvie-nextgen-eds/
├── abbvie-com/
│   ├── us/en/           # US English — AbbVie Corporate
│   ├── gb/en/           # UK English
│   ├── be/fr/           # Belgium French
│   ├── be/nl/           # Belgium Dutch
│   └── {country}/{lang}/
├── rinvoq/
│   └── {country}/{lang}/
└── botox/
    └── {country}/{lang}/
```

### 14.2 Locale Detection at Runtime

Scripts derive locale from the URL path (no cookie or language selector):

```javascript
const pathSegments = window.location.pathname.split('/').filter(Boolean);
const country = getMetadata('country') || pathSegments[0];
const language = getMetadata('language') || 'en';
```

This locale is the single source of truth for:
- Domain config spreadsheet fetch: `/config/warn-departure/{country}-{lang}.json`
- Site root metadata fetch: `/{locale}/metadata.json`
- Warn-on-arrival dismiss storage key: `warn-arrival-dismissed-{country}-{lang}`
- Stock ticker site key: `abbvie-{country}`

### 14.3 Multi-Language Market Support (Belgium Reference Model)

For markets with multiple official languages (e.g., Belgium: FR + NL):

| Artifact | Belgium FR | Belgium NL |
|---|---|---|
| Locale root | `/content/.../be/fr` | `/content/.../be/nl` |
| Modal fragment | `/be/fr/fragments/warn-departure-modal` | `/be/nl/fragments/warn-departure-modal` |
| Domain config | `/config/warn-departure/be-fr.json` | `/config/warn-departure/be-nl.json` |
| Site root metadata | `/be/fr/metadata.json` | `/be/nl/metadata.json` |
| reverseMapping | Can differ per language | Can differ per language |

All JavaScript modules are **language-agnostic** — locale-specific content comes entirely from CDN resources at runtime. Adding a new language requires zero code changes — only content authoring and spreadsheet creation.

### 14.4 Navigation Localization

The header block reads the `nav` page metadata property to determine the navigation fragment path:

```javascript
const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
```

This allows each locale to have its own navigation content (`/us/en/nav`, `/gb/en/nav`, etc.) while sharing the same header block JavaScript.

### 14.5 Placeholders / i18n

UI text strings (button labels, error messages, ARIA labels) are loaded from locale-specific `/placeholders.json`:

```javascript
// scripts/placeholders.js
const placeholders = await fetchPlaceholders();
const searchLabel = placeholders?.searchInputError || 'Please enter a valid search term';
```

---

## 15. Performance Strategy

### 15.1 Core Web Vitals Targets

EDS achieves Lighthouse 100 by default. The implementation must not degrade this baseline:

| Metric | Target | Key Risk |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | Above-fold image loading strategy |
| CLS (Cumulative Layout Shift) | < 0.1 | Modal overlays, lazy-loaded images |
| INP (Interaction to Next Paint) | < 200ms | Click handlers, analytics processing |
| FCP (First Contentful Paint) | < 1.8s | Critical CSS load order |

### 15.2 Performance Patterns in Use

| Pattern | Implementation |
|---|---|
| **Three-phase loading** | `loadEager` → `loadLazy` → `loadDelayed` (3s) isolates critical from non-critical work |
| **Font loading** | `fonts.css` loaded conditionally: desktop (`innerWidth >= 900`) or `sessionStorage` flag |
| **Section-background CSS rule** | `<style>` tag injection instead of inline styles — survives UE resets |
| **Above-fold image priority** | First 2 sections: `loading="eager"`, `fetchPriority="high"`; rest: `loading="lazy"` |
| **Event delegation** | Single click listener on `document` for modals and analytics — never per-element |
| **requestIdleCallback** | Analytics initialization, link rewriter initial pass — yields to user interactions |
| **Module code-splitting** | Warn on Departure, Warn on Arrival, modal — dynamically imported only when needed |
| **sessionStorage caching** | `ab-config.json`, domain config, fonts-loaded flag, placeholders — one fetch per session |
| **Fragment caching** | Modal fragment `.plain.html` cached in memory after first fetch per page session |
| **MutationObserver + rAF batching** | Link rewriter observes dynamically added anchors, batches with `requestAnimationFrame` |

### 15.3 Analytics Performance

- `window.digitalData` set from inline `<script>` — zero network overhead
- AEP Web SDK (`alloy`) loaded with `async` attribute — never blocks HTML parsing
- Analytics config fetch triggered after `window.load` (post-LCP)
- `requestIdleCallback` wrapper for analytics initialization
- Analytics mapping JSON served with long-lived `Cache-Control` header

### 15.4 GTM Loading (Corporate Only)

GTM is injected via `loadDelayed()` (minimum 3-second delay after page interactive). The `loadGTM()` function uses `async: true` on the GTM script element. This ensures GTM never contributes to TBT or LCP degradation.

---

## 16. Migration Strategy (Hybrid Approach)

### 16.1 Recommended Approach: Option 3 — Hybrid

The recommended migration strategy combines the speed of ExMod-First (Option 1) for Corporate with proactive Commercial block preparation:

| Track | Approach | Timeline |
|---|---|---|
| Corporate Sites | ExMod-First — incremental migration in waves | 6–7 months |
| Commercial Blocks | Manual development of ~25 Commercial-specific components (parallel to Corporate) | During Corporate waves |
| Commercial Sites | ExMod migration with complete pre-built block library | After Corporate completion |

### 16.2 Migration Wave Plan

| Wave | Sites | Approach | Key Deliverable |
|---|---|---|---|
| Wave 1 (Pilot) | abbvie.com + 2 regional Corporate sites | ExMod + manual fix | Validated migration pattern, ExMod fix-prompt library |
| Wave 2 | Remaining Corporate sites (50) + 20 Commercial sites | ExMod parallel | Full Corporate block library, ~25 Commercial-specific blocks |
| Wave 3 | All remaining Commercial sites (78) | ExMod with pre-built blocks | Complete Commercial migration |

### 16.3 ExMod Tool (Experience Catalyst / EMA)

ExMod automates content and code migration with approximately **60% automation coverage**. The development team:
1. Reviews ExMod output and applies fix-prompts for known issues
2. Manually implements complex block logic the tool cannot generate
3. Documents fix-prompts as mandatory deliverables (reused for Commercial waves)

### 16.4 Shared Block Library Governance

To prevent Corporate/Commercial divergence:

| Governance Item | Owner | Mechanism |
|---|---|---|
| Block Library Owner | Adobe + AbbVie technical leads | Named role — approves all shared component changes |
| Weekly cross-track sync | Project Manager | Corporate migration team + Commercial block dev team |
| Fix-prompt documentation | Corporate migration team | Required deliverable after each Corporate wave |
| Commercial block scope freeze | Change Management Process | Any additions require formal CR |
| Naming conventions | Block Library Owner | Enforced in PR review |

### 16.5 Content Freeze Requirements

A content freeze is required per site during its migration window. AbbVie must:
- Communicate freeze dates to all agencies, internal teams, and partners
- Coordinate the freeze across all AEM authoring groups
- Resume authoring on the new EDS platform post-migration

### 16.6 Key Success Conditions

1. Conduct formal component overlap analysis before committing to the ~25 Commercial-specific block estimate
2. Appoint dedicated EDS Block Library Owner with cross-platform authority
3. Hold weekly cross-track sync between Corporate migration and Commercial block teams
4. Freeze Commercial-specific block scope before development begins
5. Establish ExMod fix-prompt documentation as a mandatory sprint deliverable
6. Ensure AbbVie technical leads are actively engaged across both tracks

---

## 17. AbbVie's Scope & Responsibilities

### 17.1 Content & Assets

| Responsibility | Detail |
|---|---|
| Asset migration | All assets from AMS to Unified Cloud; execute in batches by site priority |
| Dynamic Media entitlement | Must be in place BEFORE migration commences |
| Manual content authoring | EDS Fragments, Content Fragments, EDS Pages, preview structure updates |
| Content freeze | Freeze AEM content for each site within its migration window |

### 17.2 Testing & Quality Assurance

| Responsibility | Detail |
|---|---|
| QA ownership | All automated functional, visual UI, content, and regression testing |
| UAT | Business user UAT with formal sign-off before each go-live |
| Acceptance timeline | Complete within 10 business days of Adobe delivery notification |
| Collaboration | QA engineers work closely with Adobe team to validate pages and blocks |

### 17.3 Resources & Governance

| Role | Responsibility |
|---|---|
| Customer Project Manager | Single POC, scheduling, dependency tracking |
| Customer Senior Project Sponsor | Escalation for scope/schedule/budget decisions |
| 2 x Dedicated Technical Leads | Architectural alignment, integration decisions, enterprise security |
| Content Authors | Manual QA fixes, new content authoring on EDS |
| Steering Committee | Regular attendance, timely decisions |

### 17.4 Items Exclusively Owned by AbbVie

- Forms migration to Unified Cloud (separate partner engagement)
- Any new forms beyond the 6 custom form components in scope
- Additional Web SDK data layers beyond contracted limits
- Additional backend services beyond contracted limits
- Additional UI Extensions beyond the 6 in scope
- DNS cutover and final go-live execution
- Change management planning and internal stakeholder communications
- Performance, security, and vulnerability testing

---

## 18. Risks & Mi

## 18. Risks & Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | ExMod fix effort underestimated — some pages near-total manual rework | Medium | High | Fix-prompt library from Wave 1; budget 40% manual effort per wave |
| 2 | ~25 Commercial block estimate is wrong | Medium | High | Formal component overlap analysis as Discovery Phase 1 deliverable |
| 3 | Corporate and Commercial blocks diverge in naming/structure | Low | Medium | Block Library Owner + weekly cross-track sync + PR review |
| 4 | Content freeze not enforced by AbbVie | Medium | High | AbbVie PM communicates freeze to all agencies; change management plan |
| 5 | Asset migration delays site go-live | Medium | High | Assets migrated per site wave; DM entitlement confirmed before start |
| 6 | AEM Headless cache staleness after CF publish | Medium | Low | TTL-based cache (1-hour max-age) + publish webhook cache purge |
| 7 | Brightcove SDK API changes break video components | Low | Medium | Pin SDK version; monitor changelog; graceful error fallback |
| 8 | rss-proxy Worker failure affects News Feed + Carousel | Low | Medium | Cloudflare SLA covers Workers; Worker is stateless — auto-restarts |
| 9 | Coveo API key rotation requires Worker update | Low | Low | Use Cloudflare secret bindings — update without redeploy |
| 10 | reverseMapping=true with empty domain list fires modal on every link | Medium | High | Validate non-empty list before enabling reverse mode; warn in config fetch |
| 11 | Modal fragment fetch fails — user cannot proceed | Low | Medium | 3-second fetch timeout; graceful fallback — allow navigation without modal |
| 12 | UAT not completed within 10 business days | Medium | Medium | Auto-acceptance rule applies per SOW; Adobe not required to redeliver |
| 13 | Link rewriter appends .html to incorrectly structured URLs | Low | Medium | Strict exclusion paths; `data-link-rewritten` guard; remove after full migration |
| 14 | Brand CSS override 404s on non-existent brand file | Low | None | EDS gracefully ignores 404 CSS loads; global block CSS remains active |
| 15 | Analytics worksheet fetch causes LCP delay | Low | Medium | Fetch triggered post-window.load; cached in sessionStorage after first load |

---

## 19. Appendix — Block Reference

### 19.1 Complete Block List with Classification

| Block | Category | Classification | Edge Worker | AEM Headless | Brand Overrides |
|---|---|---|---|---|---|
| `accordion` | Interactive | Medium | No | No | abbvie, rinvoq |
| `audience-mode-toggle` | Specialty | Medium | No | No | abbvie |
| `breadcrumb` | Navigation | Small | No | No | abbvie, rinvoq |
| `brightcove-podcast-player` | Media | Medium | No | No | abbvie, rinvoq |
| `brightcove-video` | Media | Medium | No | No | abbvie, rinvoq |
| `cards` | Content | Small–Medium | No | No | abbvie, rinvoq |
| `carousel` | Content | Medium | rss-proxy (dynamic mode) | No | abbvie, rinvoq |
| `chart` | Specialty | Medium | No | No | abbvie |
| `columns` | Layout | Small | No | No | abbvie, rinvoq |
| `cta` | Content | Small | No | No | abbvie, rinvoq |
| `custom-embed` | Content | Small | No | No | abbvie, rinvoq |
| `custom-image` | Content | Small | No | No | abbvie, rinvoq |
| `custom-title` | Content | Small | No | No | abbvie, rinvoq |
| `editorial-feed` | Feed | Medium | No | No | abbvie |
| `embed` | Content | Medium | oembed-proxy | No | abbvie, rinvoq |
| `embed-form` | Form | Small | No | No | abbvie |
| `eyebrow-text` | Layout | Small | No | No | abbvie, rinvoq |
| `fact-card` | Specialty | Medium | No | Yes | abbvie, rinvoq |
| `flip-card` | Specialty | Medium | No | No | abbvie |
| `footer` | Navigation | Medium | No | No | abbvie, rinvoq |
| `form` | Form | Complex | form-gateway, recaptcha-verify | No | abbvie, rinvoq |
| `fragment` | Interactive | Small | No | No | abbvie, rinvoq |
| `header` | Navigation | Medium | No | No | abbvie, rinvoq |
| `hero` | Content | Small–Medium | No | No | abbvie, rinvoq |
| `hero-container` | Layout | Small | No | No | abbvie, rinvoq |
| `inner-grid` | Layout | Small | No | No | abbvie, rinvoq |
| `linklist` | Interactive | Medium | No | Yes | abbvie, rinvoq |
| `modal` | Interactive | Medium | No | No | abbvie, rinvoq |
| `navigation-content` | Navigation | Medium | No | No | abbvie, rinvoq |
| `news-feed` | Feed | Medium | rss-proxy | No | abbvie, rinvoq |
| `pipeline` | Specialty | Medium | No | No | abbvie |
| `pipeline-utility-nav` | Navigation | Medium | No | No | abbvie |
| `press-releases` | Feed | Medium | No | No | abbvie, rinvoq |
| `product-listing` | Feed | Medium | No | No | abbvie |
| `quote` | Content | Small–Medium | No | Yes (CF mode) | abbvie, rinvoq |
| `search` | Search | Medium | No | No | abbvie, rinvoq |
| `search-input` | Search | Small | No | No | abbvie, rinvoq |
| `search-results` | Search | Complex | coveo-search-proxy | No | abbvie, rinvoq |
| `separator` | Layout | Small | No | No | abbvie, rinvoq |
| `social-media` | Specialty | Small | No | No | abbvie, rinvoq |
| `stock-ticker` | Data | Complex | stock-ticker-cron | No | abbvie, rinvoq |
| `story-card` | Content | Medium | No | No | abbvie, rinvoq |
| `story-cards` | Content | Medium | No | No | abbvie, rinvoq |
| `table` | Interactive | Small | No | No | abbvie, rinvoq |
| `tabs` | Interactive | Medium | No | No | abbvie, rinvoq |
| `tag-utility-nav` | Navigation | Medium | No | No | abbvie |
| `teaser` | Content | Small–Medium | No | No | abbvie, rinvoq |
| `text-container` | Layout | Small | No | No | abbvie, rinvoq |
| `video` | Media | Medium | No | No | abbvie, rinvoq |

### 19.2 Key Configuration Files

| File | Purpose | Location |
|---|---|---|
| `brand-config.json` | Brand registry | Repository root |
| `component-models.json` | UE block model definitions | Repository root |
| `component-definition.json` | UE component registration | Repository root |
| `component-filters.json` | UE component filter rules | Repository root |
| `xwalk.json` | xWalk feature flags (`multi-field`) | Repository root |
| `head.html` | HTML head template (CSS/JS loading) | Repository root |
| `helix-sitemap.yaml` | Sitemap generation config | Repository root |
| `ab-config.json` | Runtime site config (GTM ID, API URLs) | EDS spreadsheet → CDN |
| `/placeholders.json` | i18n UI strings | EDS spreadsheet per locale → CDN |
| `/config/warn-departure/{locale}.json` | Modal domain config | EDS spreadsheet → CDN |
| `/config/analytics-mapping.json` | CTA analytics mapping | EDS spreadsheet → CDN |

### 19.3 Acceptance & Rejection Rules Summary

| Scenario | Rule |
|---|---|
| Testing not complete within 10 business days | Deliverable automatically accepted |
| Deliverable used in production before formal acceptance | Automatically accepted on first production use |
| Major Non-conformance (blocks functionality) | Adobe fixes at own cost and redelivers |
| Minor Non-conformance (doesn't block core functionality) | Adobe uses reasonable efforts; does not block acceptance |
| Adobe fails to remedy Major Non-conformance after 3 attempts or 2 months | Parties meet; customer's sole remedy is rejection + pro-rata refund |

---

*Document prepared by Adobe Global Delivery Services — Version 1.0 — June 2026*  
*Adobe Confidential — Do Not Distribute*
