# Live Website to EDS Migration Skill

## Purpose
Migrate a live AEM website to Adobe Edge Delivery Services (EDS) with pixel-perfect visual fidelity. The output must match the original site exactly — same DOM structure, same CSS class names, same styling — across all breakpoints.

## Core Rules

1. **Same DOM Structure** — Block decorators MUST produce identical element hierarchy as the original site (same tags, same nesting depth, same class names, same attributes)
2. **Same CSS Styling** — Copy the original site's CSS verbatim. Use the exact class names. Never rename, abbreviate, or invent new classes
3. **Same JS Frameworks** — Load the original site's JavaScript frameworks as-is (jQuery, plugins, video players). Do not rewrite them
4. **No Hardcoded Content** — All text, links, images, and configuration must come from authorable sources (fragments, page metadata, block table cells)
5. **Visual Comparison Loop** — Compare local EDS vs live site at least 10 times, fix issues each iteration, across desktop (1440px), tablet (768px), and mobile (375px) breakpoints
6. **No User Input Required** — The comparison output becomes the input for fixing. Iterate autonomously until match is achieved

## Migration Flow

```
AEM Site
   │
   ├─ Inventory Pages (discover all URLs, group by template)
   ├─ Inventory Components (identify all blocks/components on each page)
   ├─ Inventory Templates (group pages by layout pattern)
   │
   ▼
Component Rationalization
   │ - Map source components to EDS blocks
   │ - Identify reusable vs page-specific blocks
   │ - Define block variants
   │
   ▼
Create EDS Block Library
   │ - For each block:
   │   1. Extract exact DOM from original (document.querySelector().outerHTML)
   │   2. Extract exact CSS (getComputedStyle + stylesheet rules)
   │   3. Write block JS that rebuilds identical DOM from authored content
   │   4. Write block CSS with verbatim rules from original
   │   5. Download and serve original CSS/JS frameworks locally
   │
   ▼
Automated Content Transformation
   │ - Generate import scripts (parsers + transformers)
   │ - Run content import to produce .plain.html files
   │ - Create nav/footer/ISI as authorable fragments
   │
   ▼
Visual Comparison & Iteration (10+ rounds)
   │ - Screenshot original at 1440px, 768px, 375px
   │ - Screenshot migrated at same breakpoints
   │ - Identify ALL visual differences (position, color, font, spacing, size)
   │ - Fix each difference in CSS/JS
   │ - Re-screenshot and verify fix worked
   │ - Repeat until no visible differences remain
   │
   ▼
Universal Editor Readiness
   │ - Register blocks in component-definition.json
   │ - Register models in component-models.json
   │ - Register filters in component-filters.json
   │ - Validate md2jcr conversion works without errors
   │
   ▼
EDS Delivery Layer
   │ - Verify all pages render at localhost:3000
   │ - Verify header/footer load from fragments
   │ - Verify ISI/safety bar functionality
   │ - Verify video players load and play
   │ - Verify responsive breakpoints
   │
   ▼
Lighthouse Optimization
   │ - Run Lighthouse audit
   │ - Fix performance issues (lazy loading, image optimization)
   │ - Fix accessibility issues (alt text, ARIA, focus management)
   │ - Fix SEO issues (meta tags, structured data)
   │ - Target: Performance 90+, Accessibility 90+, SEO 90+
   │
   ▼
Go Live (Production Ready)
   │ - All pages migrated and visually verified
   │ - All blocks authorable via Universal Editor
   │ - All content fragments editable
   │ - Lighthouse scores passing
   │ - Cross-browser testing complete
```

## Visual Comparison Process (Detailed)

### Screenshot sizing: SMALL + ZOOMED, never full-page

Large/full-page screenshots shrink elements so minute differences (roundness, 2px
spacing, off-white vs white, badge color, shadow, font-weight) disappear. Always:
- Use a SHORT viewport height (e.g. 600px) so each capture shows a zoomed slice.
- Prefer element-scoped screenshots (`browser_take_screenshot({ element, ref })`) on
  the specific block/card/button being compared.
- Render at `deviceScaleFactor: 2` when available.
- Do NOT use `fullPage: true` for comparison — only as a quick section-order check.

For EACH iteration:

1. **Navigate to original** at target breakpoint (short viewport, e.g. 1440x600)
2. **Take a small viewport (or element-scoped) screenshot** of original — never fullPage
3. **Navigate to migrated** at same breakpoint
4. **Take a small viewport (or element-scoped) screenshot** of migrated — never fullPage
5. **Compare visually** — identify every difference:
   - Element position (top, left, width, height)
   - Colors (background, text, border)
   - Typography (font-family, size, weight, line-height)
   - Spacing (margin, padding, gap)
   - Layout (flex direction, alignment, wrapping)
   - Borders (radius, width, color)
   - Shadows and effects
   - Images (size, cropping, aspect ratio)
   - Interactive states (hover, focus, active)
6. **Fix each difference** — modify CSS/JS to match original computed values
7. **Re-verify** — take new screenshot and confirm fix didn't break anything else
8. **Record** — log what was fixed and current similarity score

## Key Technical Principles

### DOM Structure
```
ORIGINAL: <div class="hero-container Linzess-home-hero-belly-bnr abbv-image-text-v2">
EDS MUST: Create the EXACT same element with the EXACT same classes
```

### CSS Loading
```
Load original CSS files verbatim:
- Framework CSS (abbv-framework.css)
- Brand CSS (linzess-global.css)
- Page CSS (linzess.css)
- Icon font (abbv_iconFont.woff)
```

### JS Frameworks
```
Load original JS as-is:
- jQuery (bundled in plugins)
- Framework plugins (abbv-plugins.js)
- Video players (Brightcove SDK)
```

### EDS Wrapper Neutralization
```css
/* Every block MUST neutralize EDS wrappers */
.block-name { display: contents; }
.block-name-wrapper { max-width: none !important; padding: 0 !important; }
main .block-name a.button:any-link { all: unset; }
```

### Fragment-Based Authoring
```
Header → nav.plain.html (fragment loaded by header block)
Footer → footer.plain.html (fragment loaded by footer block)
ISI → isi.plain.html (fragment loaded by ISI block)
```

## Error Prevention

- NEVER add custom class names — use only what exists on the original
- NEVER approximate CSS values — extract exact computed values
- NEVER hardcode text content — read from authored HTML
- NEVER skip breakpoint testing — check 1440px, 768px, 375px
- NEVER declare "done" without visual comparison screenshot
- ALWAYS fix lint errors immediately after each change
- ALWAYS verify JSON files are valid after modifications
- ALWAYS check that blocks are registered in component-*.json files
