# Project: Linzess.com Migration to AEM Edge Delivery Services

## Overview
This project migrates https://www.linzess.com/ (an AbbVie pharmaceutical website) from AEM Classic to AEM Edge Delivery Services (EDS) with XWalk authoring.

## Migration Approach: Same DOM + Same CSS

The fundamental rule for this migration:
1. **Same DOM structure** — Block decorators produce identical HTML element hierarchy as the original site
2. **Same CSS class names** — Use the original site's class names verbatim (no renaming)
3. **Same CSS styling** — Load the original site's CSS files as-is
4. **Same JS frameworks** — Load jQuery + AbbVie plugins for interactive behaviors

## Project Structure

```
/blocks/           — EDS block decorators (JS + CSS per block)
/styles/           — Global styles + original framework CSS
  styles.css       — EDS base with Linzess brand overrides
  linzess.css      — Additional brand rules
  abbv-framework.css — Original AbbVie framework (verbatim)
  linzess-global.css — Original Linzess brand CSS (verbatim)
/scripts/          — EDS scripts + jQuery plugins
  abbv-plugins.js  — Original jQuery + AbbVie plugins (90KB)
/content/          — Authored content (.plain.html files)
  nishant-test/    — Migrated homepage
    index.plain.html   — Page content
    nav.plain.html     — Header fragment (authorable)
    footer.plain.html  — Footer fragment (authorable)
    isi.plain.html     — ISI safety bar fragment (authorable)
/fonts/            — Icon font (abbv_iconFont.woff)
/icons/            — Logo images and SVG icons
/tools/importer/   — Import infrastructure (parsers, transformers)
```

## Blocks

| Block | Purpose | Instances |
|-------|---------|-----------|
| hero-pharma | Full-width hero with background image + text overlay | 1 |
| columns-promo | Two-column card (image + text/CTA) | 3 |
| cards-feature | Feature cards with icon overflow | 1 |
| cards-stats | Statistics circles with numbers | 1 |
| cards-video | Brightcove video testimonial cards | 1 |
| header | Navigation (fragment-based) | 1 |
| footer | Footer links (fragment-based) | 1 |
| isi | Sticky ISI safety bar (fragment-based) | 1 |

## Key Design Tokens

```css
--linz-dark-purple: #422e83
--linz-light-purple: #d9d7f9
--linz-orange: #faa633
--linz-off-white: #f4f6fb
--linz-white: #fff
--linz-rounded-corner: 16px
--body-font-family: Lato, sans-serif
--heading-font-family: "Bebas Neue", sans-serif
```

## Visual Comparison Workflow

**Take SMALL, ZOOMED screenshots — never large/full-page.** Large screenshots shrink
elements so minute details (border-radius, 2px spacing, off-white vs white, badge color,
shadow, font-weight) become invisible. Always:
- Use a SHORT viewport height (e.g. `browser_resize({ width: 1440, height: 600 })`) so
  each capture is a zoomed slice with larger, legible elements.
- Prefer ELEMENT-SCOPED captures (`browser_take_screenshot({ element, ref })`) on the
  specific block/card/button/badge when checking design details (roundness, color,
  shadow, border, icon, button).
- Render at `deviceScaleFactor: 2` (retina) when available for crisp edges/radii.
- NEVER use `fullPage: true` for comparison — it only sanity-checks section order.

When fixing visual issues:
1. Take a SMALL viewport (or element-scoped) screenshot of original at the target breakpoint
2. Take a SMALL viewport (or element-scoped) screenshot of migrated at same scroll/element
3. Identify SPECIFIC differences (not general descriptions)
4. Fix each difference with exact CSS values
5. Re-screenshot (small/zoomed) to verify the fix worked
6. Never declare done without visual proof

## Common Pitfalls

- EDS adds `.section`, `-wrapper`, `.default-content-wrapper` divs that add unwanted spacing/max-width
- Fix: Use `display: contents` on block element, `max-width: none !important` on wrappers
- EDS auto-styles `<a>` tags as `.button` with pill styling
- Fix: Use `all: unset` on `main .block-name a.button:any-link`
- EDS `a:any-link { color: var(--link-color) }` overrides button text colors
- Fix: Use `!important` on block-specific button color rules

## Skills

See `.claude/skills/live-site-migration.md` for the complete migration methodology.
See `.claude/skills/iterative-page-migration.md` for iterative visual refinement workflow.
See `.claude/skills/iterative-visual-refinement.md` for per-element comparison methodology.
See `.claude/skills/validate-page-structure.md` for structural validation (header, footer, hero, ISI, blocks, abbv-containers).
See `.claude/skills/full-site-migration.md` for complete site migration (URL discovery → page-by-page migration → cross-page verification).
See `.claude/skills/abbvie-multisite-migration.md` for the FLEET workflow (118 AbbVie brand sites share one framework → shared `abbv-base` library + per-brand token swap + deterministic style-differ + batch orchestrator).

## Quick Commands

- `migrate abbvie fleet` / `onboard brand <url>` — Multi-site AbbVie migration (see abbvie-multisite-migration.md). All ~118 AbbVie brand sites (rinvoq, skyrizi, mavyret, botox, HCP variants…) share ONE design system (common-elements clientlib, abbv-framework, header v2, ISI use-statement + safety bar, same blocks). Build shared `abbv-base` ONCE, then each brand = `:root` token swap + content import; each page = minutes. Uses a deterministic computed-style differ (`tools/style-diff/compare.js`) — NOT the hallucination-prone visual comparator — to hit ≥70% first pass and 90–95% on iterate, with the AbbVie pitfall checklist (alternating card colors, CTA contrast, negative-margin overhang, framework !important, ISI, touts) auto-asserted.
- `migrate site <url> with proper planning` — Full site migration orchestrator (see full-site-migration.md). Strict gated phases: (1) URL discovery + triage — drop 404s/redirects/cross-domain/duplicates, (2) block inventory + functionality audit (APIs, adaptive forms, video, carousels), (3) extract design tokens FIRST, (4) build global fragments + all blocks (new blocks + auto-blocking for complex DOM, same DOM + verbatim CSS classes), (5) import pages, (6) validate every page (structure + block + page critique), (7) hand off to per-page refinement. Saves context between sessions; converts CSS images to base64.
- `migrate <page-name or url> iteratively <N>` — Per-page refinement loop (see iterative-page-migration.md). Each iteration: pixel tool first (page-critique) → fix to ≥90% → zoomed element-scoped Playwright diffs → full-page diff → repeat up to N times until 90–95% with no visible diffs.
- `fix <page-name> <N> iterations` — Same as above but assumes page already migrated
- `validate <page-name>` — Run structural validation (header, footer, hero, ISI, blocks, abbv-containers, sections, arcs, typography, buttons)
