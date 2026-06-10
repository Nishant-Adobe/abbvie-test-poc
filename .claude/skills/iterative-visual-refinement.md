# Iterative Visual Refinement Skill

## Purpose

Achieve TRUE 95%+ pixel-perfect match for each migrated page against the live site. This means:
- Every visible element matches in size, position, color, font, spacing
- Complex nested div structures produce identical visual output
- JS interactions work: hover states, scroll behaviors, ISI auto-hide on page end
- No content is missed — every section, card, tout, heading, paragraph must be present
- Both desktop (1440px) and mobile (375px) viewports must match

## Critical Requirements

### What "95% match" actually means:
1. **Same visual output** — screenshots should be near-identical
2. **Same DOM structure** — nested divs, class names, hierarchy must match original
3. **Same CSS styling** — computed styles on every element match the original
4. **Same JS behaviors** — hover effects, scroll-triggered animations, ISI dismiss at page bottom
5. **No missing content** — every paragraph, image, link, heading, footnote present
6. **Same responsive behavior** — breakpoints produce same layout shifts

### What is NOT acceptable:
- Missing sections or blocks
- Wrong font sizes, weights, or families on any element  
- Wrong background colors on any section or card
- Missing hover states on buttons/links
- ISI bar not dismissing when user scrolls to inline ISI content
- Wrong max-width, padding, or margin on any container
- Missing images or wrong image aspect ratios
- Links with wrong href values
- Missing footnote/disclaimer text

## Hybrid Approach (CSS + JS)

### CSS Strategy:
- Load original `abbv-framework.css` and `linzess-global.css` for base framework styles
- Use `styles/linzess.css` for Linzess-specific overrides
- Block CSS files handle block-specific styling differences from EDS defaults

### JS Strategy (rebuild key interactions in block decorators):
- **ISI behavior**: Auto-hide sticky bar when user scrolls to inline ISI content
- **Hover states**: Buttons change color on hover (purple ↔ light purple)
- **Scroll behaviors**: Section navigation becomes sticky on scroll
- **Video player**: Brightcove poster click-to-play
- **Accordion/expand**: ISI expand/collapse toggle

## Verification Methodology

### Per-Element Comparison (not just screenshots):

For each page section, compare these properties between original and migrated:

```javascript
// For EVERY visible element, check:
const properties = [
  'font-family', 'font-size', 'font-weight', 'line-height', 'color',
  'background-color', 'background-image',
  'width', 'height', 'max-width', 'min-height',
  'margin', 'padding',
  'border', 'border-radius',
  'display', 'flex-direction', 'align-items', 'justify-content', 'gap',
  'position', 'top', 'bottom', 'left', 'right', 'z-index',
  'overflow', 'text-align', 'text-transform', 'text-decoration',
  'box-shadow', 'opacity', 'transform'
];
```

### Content Completeness Check:

For each page, verify:
1. Count of `<p>` elements matches original
2. Count of `<h1>`, `<h2>`, `<h3>` elements matches
3. Count of `<a>` links matches (with correct href values)
4. Count of `<img>` elements matches (with correct src)
5. All `<sup>`, `<strong>`, `<em>` formatting preserved
6. All list items present (`<ul>`, `<li>` counts match)
7. Section-metadata produces correct class names on sections

### JS Behavior Verification:

1. **ISI sticky bar**:
   - Shows on page load (fixed bottom)
   - Expand button toggles full ISI content visible
   - Auto-hides when inline ISI section scrolls into viewport
   - Re-shows when scrolling back up

2. **Button hover states**:
   - Primary buttons: purple bg → off-white bg on hover
   - Secondary buttons: white bg → light purple bg on hover
   - All transitions: 0.3s linear

3. **Navigation hover**:
   - Menu items show dropdown on hover (if submenus exist)
   - Active state indicated

4. **Video cards**:
   - Poster images display
   - Click triggers Brightcove player load

## Pixel Comparison Tool (Automated)

### Location
`tools/pixel-compare/scripts/generate-fix-report.js`

### Setup
```bash
# Start comparison server (port 4173) if not running
cd tools/pixel-compare && node src/server.js &
```

### Usage
```bash
cd tools/pixel-compare
node scripts/generate-fix-report.js \
  "https://www.linzess.com/<page>" \
  "http://localhost:3000/content/nishant-test/<page>" \
  desktop
```

### Output Format
```json
{
  "summary": { "matchedWithDiffs": 83, "missingOnMigrated": 37 },
  "issues": [
    {
      "rank": 1,
      "element": "element text content",
      "selector": "CSS selector path",
      "pageY": 4568,
      "diffs": ["fontSize: 40px -> should be 24px", "height: 72px -> should be 36px"]
    }
  ],
  "missing": [{ "element": "text", "tag": "h2", "pageY": 1678 }]
}
```

### Fixing Issues from Report
1. Group issues by root cause (same CSS property on similar elements = one fix)
2. Fix top-priority issues first (rank 1-5 = highest visual impact)
3. After each batch of fixes, re-run the report to verify improvement
4. Target: `matchedWithDiffs` < 20

### Common Fix Patterns
| Report Pattern | Root Cause | Fix Location |
|---|---|---|
| Multiple elements same `width` diff | Container max-width wrong | `styles/linzess.css` wrapper rule |
| `fontSize: X -> should be Y` | Wrong CSS specificity | Add more specific selector |
| `lineHeight: normal -> should be 36px` | Heading has padding-top | Set explicit `line-height: 1` |
| Element in "missing" list | Content not in HTML or block JS skips it | `content/*.plain.html` or `blocks/*/block.js` |
| ISI elements all same width issue | ISI wrapper constrained | `blocks/isi/isi.css` max-width |

### Viewports
Run at multiple viewports to catch responsive issues:
```bash
node scripts/generate-fix-report.js <left> <right> desktop  # 1440x900
node scripts/generate-fix-report.js <left> <right> tablet   # 834x1112
node scripts/generate-fix-report.js <left> <right> mobile   # 390x844
```

---

## Workflow (Per Page)

### Phase 1: Automated DOM Comparison (USE THIS FIRST)

1. Run `generate-fix-report.js` for desktop viewport
2. Analyze the `issues` array — group by root cause
3. Fix top 5 priority issues
4. Re-run report to verify
5. Repeat until `matchedWithDiffs` < 20

### Phase 1b: Deep DOM Comparison (Manual fallback)

1. Navigate to original page
2. Extract FULL page DOM structure (all elements with classes)
3. Count all content elements (paragraphs, headings, images, links)
4. Extract computed styles for key layout elements
5. Navigate to migrated page
6. Perform same extraction
7. DIFF the two — identify every missing/different element

### Phase 2: Fix Content Gaps

For each missing element:
1. Determine if it's a content issue (missing from .plain.html)
2. Or a decorator issue (block JS not generating proper DOM)
3. Fix the source (.plain.html or block JS/CSS)
4. Verify the element now renders correctly

### Phase 3: Fix Visual Differences

For each CSS property mismatch:
1. Identify the selector that targets the element
2. Add/modify CSS rule in appropriate file
3. Verify computed style now matches
4. Check for regressions on other elements

### Phase 4: Fix JS Behaviors

For each missing interaction:
1. Identify the trigger (hover, scroll, click)
2. Implement in the appropriate block decorator
3. Test the behavior works
4. Verify it doesn't conflict with EDS framework

### Phase 5: Re-verify

1. Take full-page screenshot at both viewports
2. Compare against original — identify remaining gaps
3. If gaps exist, return to Phase 2
4. Continue until no visible differences remain

## Content Structure Requirements

### Nested div structures MUST be preserved:

The original site uses deeply nested structures for:
- `.abbv-row-container > .abbv-row > .abbv-col > content`
- `.abbv-flex-container-v2 > .flexboxitem-v2 > .abbv-flex-item-v2 > content`
- `.abbv-image-text-v2 > .abbv-image-text-content-container-v2 > .abbv-image-text-content-v2 > content`

Block decorators MUST produce these exact hierarchies. If a decorator outputs a flat structure, the original CSS won't apply correctly.

### Section metadata MUST produce correct classes:

Each section on the original has specific background treatments:
- `background-white background-white-arc` → white section with arc top
- `background-dark-purple background-dark-purple-arc` → purple section with arc top
- `background-off-white` → light grey section

Section-metadata in .plain.html must map to these classes on the rendered `.section` element.

## Files That Control Visual Output

| File | Controls |
|------|----------|
| `styles/styles.css` | EDS base variables, heading sizes, body font |
| `styles/linzess.css` | All Linzess-specific CSS (buttons, arcs, colors, layout) |
| `styles/abbv-framework.css` | Original AbbVie framework grid, utilities |
| `blocks/*/block.css` | Per-block styling |
| `blocks/*/block.js` | DOM structure generation + behaviors |
| `scripts/abbv-plugins.js` | jQuery + AbbVie plugin behaviors |
| `content/nishant-test/*.plain.html` | Content structure |

## Scoring (Honest Assessment)

Score each area independently:

| Area | Weight | What to check |
|------|--------|---------------|
| Layout structure | 25% | Section widths, card sizing, grid alignment |
| Typography | 20% | Font family/size/weight/color on every text element |
| Colors & backgrounds | 15% | Section bgs, card bgs, button colors |
| Spacing | 15% | Margins, paddings, gaps between elements |
| Images | 10% | Correct images, aspect ratios, placement |
| Interactions | 10% | Hover, scroll, expand/collapse behaviors |
| Content completeness | 5% | All text, links, footnotes present |

Only claim 95% when ALL areas score ≥90%.
