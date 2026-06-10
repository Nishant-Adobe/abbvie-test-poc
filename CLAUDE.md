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

When fixing visual issues:
1. Take screenshot of original site at the target breakpoint
2. Take screenshot of migrated page at same breakpoint
3. Identify SPECIFIC differences (not general descriptions)
4. Fix each difference with exact CSS values
5. Re-screenshot to verify the fix worked
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

## Quick Commands

- `migrate site <url> with proper planning` — Full site migration: discover URLs, create plan, migrate each page iteratively 15 times with Playwright comparison, save context between sessions, convert CSS images to base64
- `migrate <page-name or url> iteratively <N>` — Run full migration + N visual refinement iterations using all skills (page-analysis, building-blocks, eds-developer, complete-design-expert, block-critique, page-critique)
- `fix <page-name> <N> iterations` — Same as above but assumes page already migrated
- `validate <page-name>` — Run structural validation (header, footer, hero, ISI, blocks, abbv-containers, sections, arcs, typography, buttons)
