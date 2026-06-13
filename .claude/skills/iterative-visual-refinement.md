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
- Wrong card background color (e.g., off-white instead of white)
- Missing or wrong border/shadow on cards
- Wrong badge/circle colors (e.g., purple badge when it should be white)
- Missing hover states on buttons/links
- ISI bar not dismissing when user scrolls to inline ISI content
- Wrong max-width, padding, or margin on any container
- Missing images or wrong image aspect ratios
- Links with wrong href values
- Missing footnote/disclaimer text

### How to ACTUALLY compare screenshots (not just glance):
When you take a screenshot of the local page, check EACH of these for EVERY visible element:
1. **Background color** — is it white, off-white, light-purple, dark-purple, or transparent? Match EXACTLY.
2. **Border** — does the original have a border or shadow? Add it if missing.
3. **Border-radius** — rounded corners on cards, buttons, badges? Match the radius.
4. **Shadow** — does the original card have a subtle box-shadow? Add it.
5. **Badge/icon colors** — circle badges may have DIFFERENT colors on odd vs even cards.
6. **Text color** — dark purple vs gray vs white? Check on EVERY text element.
7. **Font weight** — bold vs normal? Check headings AND body text.
8. **Spacing** — gaps between cards, padding inside cards, margins between sections.
9. **Icon style** — filled vs outlined? Color? Size?
10. **Button style** — background, text color, border-radius, padding, chevron icon?
11. **Element overflow/position** — does an icon/badge overflow OUTSIDE its card container? Is it half-in half-out? Negative margins? Absolute positioning that makes elements overlap?
12. **Icon circular backgrounds** — does the icon have a colored circle BEHIND it that extends beyond the card edge? (e.g., light purple circle behind pill icon that's half outside the card)
13. **Card overflow** — is the card set to overflow:visible so child elements can extend beyond it?
14. **Layout consequences** — when you add negative margins or positioning changes, check ALL adjacent elements. Does the change cause overlapping? Does text need compensating margin to avoid being covered by a repositioned icon?

DO NOT say "looks good" or "matches well" after taking a screenshot unless you have verified ALL 13 properties above on every visible element in that screenshot.

15. **Card-variant coverage** — when a section repeats cards, inspect EVERY card, not just the first. Watch for ALTERNATING backgrounds (odd card dark / even card light, with text + button colors flipping to match) and for differing image positions across sections (image-top vs image-beside-text vs icon-top vs icon-left). Enumerate every card's real background-color and image-vs-text bounding-box position programmatically on the original, compare the FULL list, and screenshot each distinct variant. Reason this is listed: a flat-stacked Community Resources section with a missed dark/light alternating pattern shipped because only the first article row was screenshotted and that block was never captured.

### MANDATORY: Take SMALL, ZOOMED screenshots — never large/full-page

Large screenshots (full-page, or wide 1440px viewports) shrink every element so
minute differences (border-radius, 2px spacing, off-white vs white, badge color,
shadow, font-weight) become invisible. ALWAYS capture small/zoomed views so each
element renders large and its details are legible:

1. **Prefer element-scoped screenshots.** Use `browser_take_screenshot({ element, ref })`
   on the specific block/card/button you are comparing, so the screenshot contains
   only that element at full resolution — this is the zoom effect that surfaces
   roundness, borders, color, and spacing.
2. **Use a SMALL viewport height** so each scroll capture covers less of the page and
   elements appear larger: `browser_resize({ width: 1440, height: 600 })` for desktop
   layout, or narrower widths (e.g. 768, 600, 390) when inspecting a single column/card.
3. **Crank up device scale factor for detail.** When the harness allows, render at
   `deviceScaleFactor: 2` (retina) so edges, radii, and thin borders are crisp.
4. **NEVER use `fullPage: true` for comparison.** A full-page screenshot is only ever
   a quick sanity check of overall section order — it is NOT valid for detecting
   styling differences. The user explicitly called this out.
5. **One element/one card per screenshot when checking design details** (roundness,
   color, shadow, badge, icon, button). Capture the SAME element on original and
   migrated, both element-scoped, and compare side by side at full resolution.
6. After identifying the region of interest, zoom in further: scroll so the element
   fills the viewport, or screenshot the element by `ref`, rather than capturing a
   wide overview.

### MANDATORY: Fix ALL issues before moving to next screenshot

- "Sections" for comparison means **small viewport-sized screenshots** scrolled through the full page (e.g., scroll 0, 600, 1200, 1800...), NOT EDS content sections — and prefer element-scoped captures for detail checks
- For EACH screenshot viewport, check EVERY visible element — headings, body text, buttons, cards, icons, images, links, spacing
- Check alignment: is it centered, left-aligned, right-aligned? Match the original EXACTLY
- Check button position: centered below cards? Left-aligned? Match it.
- Check EVERY minute detail — even a button that's left instead of centered IS a bug
- Do NOT move to the next scroll position until ALL issues in the current viewport are fixed and verified
- After fixing, re-take the screenshot to confirm — then move on
- Nothing should be skipped. If you can see it, you must verify it matches.

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

### CRITICAL: Section-by-Section Visual Comparison

**DO NOT rely solely on the pixel comparison tool percentages.** After every change:

1. Take a viewport screenshot of the MIGRATED page at a specific section
2. Take a viewport screenshot of the ORIGINAL page at the same section
3. **List EVERY visible difference** between the two screenshots:
   - Wrong font size/weight/family
   - Wrong background color
   - Missing card layouts or wrong card structure
   - Missing icons, images, or decorative elements
   - Wrong spacing/padding/margin
   - Missing interactive elements (buttons, links)
   - Wrong text color
   - Wrong border/border-radius
4. Fix ALL identified differences before moving to the next section
5. Do NOT dismiss issues as "structural ceiling" — attempt JS DOM restructuring first

### What to NEVER do:
- Report a percentage and stop ("72% similarity, remaining are structural")
- Take a full-page screenshot and say "looks good" without detailed comparison
- Skip sections because "the tool says they match"
- Declare done when there are still visible differences you haven't attempted to fix

### Phase 1: Section-by-Section Screenshot Comparison

For each major section of the page (hero, content sections, cards, footer):

1. Scroll to the section on BOTH pages (original + migrated)
2. Take viewport screenshots of both at the same scroll position
3. Compare visually and list SPECIFIC issues (not general descriptions)
4. Fix each issue with exact CSS values or JS DOM restructuring
5. Re-screenshot to verify the fix worked
6. Move to next section only when current section matches

### Phase 2: Automated DOM Comparison (supplementary)

1. Run `generate-fix-report.js` for desktop viewport
2. Analyze the `issues` array — group by root cause
3. Fix top 5 priority issues
4. Re-run report to verify
5. Repeat until `matchedWithDiffs` < 20

### Phase 3: Fix Content Gaps

For each missing element:
1. Determine if it's a content issue (missing from .plain.html)
2. Or a decorator issue (block JS not generating proper DOM)
3. Fix the source (.plain.html or block JS/CSS)
4. Verify the element now renders correctly

### Phase 4: Fix Visual Differences with JS Restructuring

For layout differences that CSS alone can't fix:
1. Identify the structural difference (e.g., flat paragraphs vs. card layout)
2. Write JS in `decorateContentCards()` or similar to restructure DOM
3. Add CSS for the new container classes
4. Verify the layout now matches the original

### Phase 5: Fix JS Behaviors

For each missing interaction:
1. Identify the trigger (hover, scroll, click)
2. Implement in the appropriate block decorator
3. Test the behavior works
4. Verify it doesn't conflict with EDS framework

### Phase 6: Final Re-verify (MANDATORY)

1. Take section-by-section viewport screenshots of BOTH pages
2. For each section, list any remaining differences
3. If ANY visible differences remain, go back and fix them
4. Only declare done when NO visible differences remain that you haven't genuinely attempted to fix
5. Be explicit about what you could NOT fix and why (e.g., "Brightcove video player requires third-party JS that can't be loaded in EDS")

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
