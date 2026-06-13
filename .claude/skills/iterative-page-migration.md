# Iterative Page Migration & Visual Refinement

## Trigger
When user says: "migrate <page-name or url> iteratively <N>" or "fix <page-name> <N> iterations"

Examples:
- "migrate why-linzess iteratively 15"
- "migrate https://www.linzess.com/find-relief iteratively 10"
- "fix homepage 5 iterations"

## Purpose
Perform a complete page migration and visual refinement cycle using ALL available skills, iterating N times until pixel-perfect match is achieved against the live site. Each iteration uses Playwright to open BOTH pages, compare visually, identify issues down to padding/margin/icon/hover level, and fix them.

## Per-iteration order (MUST follow — converge to 90-95% in N iterations)

Run these three steps IN THIS ORDER every iteration, then repeat up to N times:

1. **PIXEL TOOL FIRST.** Run the page-critique / visual-comparator ("pixel tool")
   against the live page to get a ranked diff list + similarity score. Apply the
   high-impact CSS/DOM fixes until the score reaches **>= 90%**. This is the
   primary driver — do it before manual screenshotting.
2. **ZOOMED Playwright diffs.** With the local Playwright MCP, compare migrated vs
   live using small, zoomed, element-scoped captures (short viewport,
   `deviceScaleFactor: 2`, element refs) to catch the tiniest issues (2px spacing,
   off-white vs white, radius, weight, badge color, shadow). Fix each.
3. **FULL-PAGE diff.** Full-page screenshot of both; fix remaining section-level
   mismatches.

Then re-run the pixel tool to confirm the score rose, save iteration context, and
repeat until >= 90-95% with no visible diffs (or N iterations reached). Never stop
at a number while visible diffs remain.

## Core Principles

1. **Same DOM Structure** — Block decorators MUST produce identical element hierarchy as the original (same tags, nesting, class names)
2. **Same CSS Classes** — Use the original site's class names verbatim. Never rename or invent new classes
3. **Same Styling** — Extract exact computed styles from source and apply to migrated blocks
4. **Visual Proof** — Every fix must be verified with Playwright screenshot comparison
5. **Context Persistence** — Save iteration context to disk so next session can resume
6. **Micro-Level Detail** — Check padding, margins, icons, hover states, click states, video play buttons, icon visibility on interactions

## Context Persistence (Between Sessions)

After EACH iteration, save context to: `migration-work/iterations/<page-name>/iteration-<N>.json`

```json
{
  "page": "why-linzess",
  "iteration": 3,
  "timestamp": "2026-06-09T14:30:00Z",
  "originalUrl": "https://www.linzess.com/why-linzess",
  "migratedUrl": "http://localhost:3000/content/nishant-test/why-linzess",
  "viewport": "1440x900",
  "fixesApplied": [
    { "file": "blocks/tabs-navigation/tabs-navigation.js", "description": "Rebuilt as anchor link bar" },
    { "file": "styles/linzess.css", "description": "Added eyebrow 12px/heading 40px rules" }
  ],
  "remainingIssues": [
    "Patient Experiences video carousel layout differs from original",
    "Bottom CTA section needs two-column card layout"
  ],
  "similarityEstimate": "75%",
  "screenshotPaths": {
    "migrated": "migration-work/iterations/why-linzess/screenshots/migrated-iter3.png",
    "original": "migration-work/iterations/why-linzess/screenshots/original-iter3.png"
  }
}
```

When starting a NEW session for the same page, READ the latest iteration JSON to resume context.

## Playwright Comparison Workflow (Each Iteration)

### SCREENSHOT SIZING RULE (read first)

Take SMALL, ZOOMED screenshots — never large or full-page — so minute details
(border-radius, 2px spacing, off-white vs white, badge color, shadow, font-weight)
are legible. Large screenshots shrink everything and hide these differences.

- Use a SHORT viewport height (e.g. `height: 600`) so each capture covers less of the
  page and elements render larger.
- Prefer ELEMENT-SCOPED screenshots: `browser_take_screenshot({ element, ref })` on the
  specific block/card/button being compared, so it fills the frame at full resolution.
- Render at retina scale (`deviceScaleFactor: 2`) when available for crisp edges/radii.
- NEVER use `fullPage: true` for comparison — it is only a quick section-order sanity
  check, not valid for detecting styling differences.

### Step 1: Open Both Pages (small viewport for zoom)

```javascript
// Set a SHORT viewport so elements render larger (zoomed) in each capture
browser_resize({ width: 1440, height: 600 });

// Navigate to migrated page
browser_navigate({ url: 'http://localhost:3000/content/nishant-test/<page-name>' });

// Take a small viewport screenshot of migrated (NOT fullPage)
browser_take_screenshot({ filename: 'migrated-top.png' });

// Navigate to original
browser_navigate({ url: 'https://www.linzess.com/<page-name>' });

// Close cookie banner if present
// Take a small viewport screenshot of original
browser_take_screenshot({ filename: 'original-top.png' });
```

### Step 2: Scroll-Based Section Comparison (small steps)

Scroll in SMALL increments (≈500px, matching the short viewport) so each capture shows
a tightly-cropped, zoomed slice of the page. For each position:

```javascript
// Scroll to section on migrated page
browser_evaluate({ function: "() => { window.scrollTo(0, 500); return 'scrolled'; }" });
browser_take_screenshot({ filename: 'migrated-section2.png' });

// Same scroll position on original
browser_evaluate({ function: "() => { window.scrollTo(0, 500); return 'scrolled'; }" });
browser_take_screenshot({ filename: 'original-section2.png' });
```

### Step 2b: Element-scoped detail capture (REQUIRED for design checks)

When checking roundness, color, shadow, border, badge, icon, or button styling,
screenshot the SAME element on both pages by reference so it fills the frame:

```javascript
// Snapshot first to get the element ref, then capture just that element
browser_take_screenshot({ element: 'IBS-C card badge', ref: '<ref>', filename: 'mig-badge.png' });
```

### Step 3: Extract Computed Styles for EVERY Difference

For each visual difference found, extract EXACT values from original:

```javascript
browser_evaluate({
  function: `() => {
    const el = document.querySelector('<selector>');
    const s = window.getComputedStyle(el);
    return {
      // Layout
      display: s.display, position: s.position,
      width: el.getBoundingClientRect().width,
      height: el.getBoundingClientRect().height,
      // Spacing
      margin: s.margin, padding: s.padding, gap: s.gap,
      // Typography
      fontFamily: s.fontFamily, fontSize: s.fontSize,
      fontWeight: s.fontWeight, lineHeight: s.lineHeight,
      color: s.color, textAlign: s.textAlign,
      textTransform: s.textTransform,
      // Box
      backgroundColor: s.backgroundColor,
      borderRadius: s.borderRadius, border: s.border,
      boxShadow: s.boxShadow,
      // Flex/Grid
      flexDirection: s.flexDirection, alignItems: s.alignItems,
      justifyContent: s.justifyContent,
      // Position
      top: s.top, left: s.left, zIndex: s.zIndex
    };
  }`
});
```

### Step 4: Check Interactive States

```javascript
// Hover state on buttons
browser_hover({ element: "CTA button", ref: "e50" });
browser_take_screenshot({ filename: 'button-hover.png' });

// Check hover computed styles
browser_evaluate({
  function: `() => {
    const btn = document.querySelector('.abbv-button-primary:hover');
    return btn ? {
      backgroundColor: window.getComputedStyle(btn).backgroundColor,
      color: window.getComputedStyle(btn).color
    } : null;
  }`
});

// Click state on video play button
browser_click({ element: "Play Video button", ref: "e130" });
browser_take_screenshot({ filename: 'video-playing.png' });
// Check: play icon should hide, video should load
```

### Step 5: Check Micro Details

For EACH element on the page, verify:

**Icons:**
- [ ] Present and loading (naturalWidth > 0)
- [ ] Correct size (match original px)
- [ ] Correct color/filter
- [ ] On hover: any transform/scale change?
- [ ] On parent click: should icon hide? (e.g., play button disappears when video plays)

**Padding/Margins:**
- [ ] Extract from original with getComputedStyle
- [ ] Compare with migrated values
- [ ] Fix any difference > 2px

**Rounded Corners:**
- [ ] Every card, button, image container has correct border-radius
- [ ] Match original exactly (usually 16px for this site)

**Curved Sections:**
- [ ] ::before pseudo-element present with correct arc dimensions
- [ ] Arc height matches (75px or 150px)
- [ ] Arc width is 130% of viewport
- [ ] Background color matches section below/above

**Videos:**
- [ ] Poster image loads
- [ ] Play button positioned center
- [ ] On click: play button hides, video loads
- [ ] Title overlay visible at bottom of poster
- [ ] 16:9 aspect ratio maintained

**Buttons:**
- [ ] Background color matches
- [ ] Text color matches
- [ ] Padding matches exactly
- [ ] Border-radius 16px
- [ ] Chevron icon present (::before or ::after)
- [ ] Hover: background changes, text changes, transition 0.3s

## Skills Used (in order per iteration)

### 1. Page Critique = the PIXEL TOOL (run FIRST every iteration)
- **Skill:** `excat:excat-page-critique` (uses element-inspector + visual-comparator)
- **When:** Start of EVERY iteration — get the ranked diff list + similarity score,
  fix high-impact diffs to reach >= 90% before manual screenshotting.

### 2. Block Critique (per-block comparison)
- **Skill:** `excat:excat-block-critique`
- **When:** Pixel tool flags a specific block whose styling/structure is off.

### 3. Block Building (when blocks broken/missing)
- **Skill:** `edge-delivery-services:building-blocks`, `excat:excat-eds-developer`
- **When:** Block doesn't exist or renders wrong DOM — rebuild to emit same
  DOM + verbatim classes; use auto-blocking for complex/implicit structures
  (https://www.aem.live/developer/markup-sections-blocks).

### 4. Design Extraction (exact styles)
- **Skill:** `excat:excat-complete-design-expert`
- **When:** Need exact computed values from the original that can't be eyeballed.

### 5. Structural Validation
- **Skill:** (from `.claude/skills/validate-page-structure.md`)
- **When:** Verify header, footer, hero, ISI, containers present.

### 6. Page Analysis (only if structure is fundamentally wrong)
- **Skill:** `excat:excat-page-analysis`
- **When:** Blocks/sections are missing or mis-identified and need re-analysis.

## What To Fix (Priority Order)

1. **Missing components** — Header/footer not loading, blocks missing entirely
2. **Structural issues** — Wrong DOM hierarchy, missing elements, wrong class names
3. **Layout issues** — Wrong widths, heights, flex/grid, positioning
4. **Spacing issues** — Wrong padding, margins, gaps (extract exact px from original)
5. **Typography issues** — Wrong font-family, size, weight, line-height, color
6. **Color issues** — Wrong backgrounds, text colors, border colors
7. **Border/radius** — Missing rounded corners (16px for this site)
8. **Section arcs** — Curved transitions between sections (::before pseudo-elements)
9. **Icons/Images** — Missing, wrong size, wrong color, not loading
10. **Buttons/CTAs** — Wrong styling, missing chevron, wrong hover state
11. **Interactive states** — Hover effects, click behaviors, video play/pause
12. **Content alignment** — Center vs left, max-width constraints

## Iteration Output Format

After each iteration, output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ITERATION {N} COMPLETE — {page-name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fixes Applied: {count}
  ✅ {description of fix 1}
  ✅ {description of fix 2}
  ...

Remaining Issues: {count}
  ⚠️ {description of remaining issue 1}
  ⚠️ {description of remaining issue 2}

Similarity Estimate: {%}
Context saved to: migration-work/iterations/{page}/iteration-{N}.json
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Rules

- ALWAYS use Playwright to open BOTH pages and compare visually
- ALWAYS extract exact computed style values from the live site (never guess)
- ALWAYS use the original site's class names (never invent new ones)
- ALWAYS verify fixes with screenshot AFTER applying
- ALWAYS save iteration context JSON for session continuity
- ALWAYS check at 1440x900 viewport (desktop) first
- ALWAYS check interactive states (hover, click, video play)
- If a block needs rebuilding, produce same DOM structure as original
- If an SVG/image is cross-origin, download it locally
- Track progress with TodoWrite showing current iteration
- On each iteration: screenshot → identify → fix → verify → save context

## CRITICAL: Do NOT dismiss issues prematurely

- **NEVER report a similarity percentage and stop.** Always list what's still visibly different.
- **NEVER say "remaining are structural limitations" without first attempting JS DOM restructuring.**
  - If content is flat paragraphs but should be side-by-side cards → restructure with JS
  - If elements are missing → check if they can be added to the HTML content
  - If layout differs → write JS to wrap/rearrange elements into the correct structure
- **NEVER take a full-page screenshot and say "looks good."** Compare section-by-section.
- **When you take your own screenshots, identify EVERY issue** — font size, spacing, missing elements, wrong colors, wrong layout — just like you would if the user pointed them out.
- **Keep iterating** until the user tells you to stop or until you have genuinely exhausted all CSS + JS + HTML options for each visible difference.
- **Be specific about what cannot be fixed** and explain exactly why (e.g., "requires third-party Brightcove JS SDK which cannot be loaded in EDS environment").

## CRITICAL: Pixel-level comparison checklist

When comparing a screenshot of local vs original, check EACH element for:

1. **Background color** — white vs off-white vs light-purple vs transparent. EXACT match required.
2. **Border/shadow** — does the original have subtle borders or box-shadows? Add them.
3. **Badge/circle colors** — may differ between odd/even cards (e.g., purple badge on card 1, white badge on card 2).
4. **Text color** — dark-purple vs gray vs white on EVERY text element.
5. **Font weight** — bold vs normal on headings AND body text.
6. **Card spacing** — gaps between cards, internal padding, margin to adjacent sections.
7. **Icon colors** — checkmarks, arrows, play buttons — match the exact color.
8. **Button styling** — background, text color, border-radius, padding, chevron/arrow.
9. **Border-radius** — cards, badges, buttons all have specific rounded corners.
10. **Opacity/transparency** — semi-transparent overlays, faded backgrounds.

**DO NOT declare a section "matches" unless ALL 10 properties have been verified on every visible element.**

The user WILL catch differences you miss. If you see "off-white" and the original shows "white" — that IS a bug. Fix it. Don't rationalize it as "close enough."

Additional checks:
11. **Element overflow** — does an icon overflow OUTSIDE its container? Half-in half-out positioning with negative margins?
12. **Circular icon backgrounds** — colored circles behind icons that extend beyond card edges (use negative margin + overflow:visible)
13. **Card overflow:visible** — if icons need to extend outside, the card must have overflow:visible

## CRITICAL: Card-variant coverage (do NOT spot-check one row)

When a section contains repeated cards, NEVER screenshot only the first card/row
and assume the rest follow the same pattern. Alternating colors and differing
image positions are common and easy to miss this way.

**Why this rule exists:** On `/resources` the Community Resources cards use an
ALTERNATING color pattern (card 1 dark-purple with white text + white pill button,
card 2 light-purple with dark text + purple pill button). They were initially
rendered as flat stacked paragraphs because only the first article-card row was
screenshotted and the Community Resources block was never captured at all. The
user caught it. Different sections also mix layouts: article cards are image-top,
but the Community/tip cards are icon-top or icon-left.

**How to apply — enumerate every card programmatically, then screenshot each variant:**

```javascript
// On the ORIGINAL: list every card's real background + image position so you can
// see alternating colors and image-top vs side-by-side at a glance.
browser_evaluate({ function: `() => {
  const cards = [...document.querySelectorAll('.abbv-flex-item-v2, [class*="card"]')];
  return cards.map((c) => {
    // climb to the nearest ancestor with a non-transparent background
    let el = c, bg = getComputedStyle(c).backgroundColor;
    for (let i = 0; i < 4 && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') && el.parentElement; i++) {
      el = el.parentElement; bg = getComputedStyle(el).backgroundColor;
    }
    const img = c.querySelector('img'); const txt = c.querySelector('p,strong,h2,h3,h4');
    let layout = 'no-image';
    if (img && txt) { const ir = img.getBoundingClientRect(), tr = txt.getBoundingClientRect();
      layout = ir.bottom <= tr.top + 5 ? 'image-top' : (ir.right <= tr.left + 5 ? 'image-left' : 'overlap'); }
    return { title: (txt?.textContent || '').slice(0,24), bg, layout,
             w: Math.round(c.getBoundingClientRect().width) };
  });
}` });
```

Compare the FULL list (not just index 0). Then take an element-scoped screenshot
of EACH distinct variant. Specifically watch for:
- **Alternating / zebra card backgrounds** (odd vs even card color, and matching
  text + button color flips).
- **Image/icon position per section**: image-top vs image-beside-text vs icon-top
  vs icon-left (half-overhanging badge).
- **Layout density**: 2-up vs 3-up vs 5-up rows, and side-by-side vs stacked.
- **Per-variant button styling**: a pill that is white-on-dark in one card and
  dark-on-light in the next (ensure button text contrasts the BUTTON bg, not the
  card bg).

Do NOT mark a card section "matches" until every variant has been enumerated and
visually confirmed against the original.

## MANDATORY: Viewport-by-viewport comparison workflow

"Sections" for comparison means **viewport-sized screenshots scrolled through the full page** — NOT EDS content sections. Take screenshots at scroll positions 0, 600, 1200, 1800, etc. until the end of the page.

For EACH viewport screenshot:
1. Check EVERY visible element — not just "is it present?" but "is it correct?"
2. Check alignment of EVERY element (centered? left? right?)
3. Check position of buttons (centered below content? aligned to cards?)
4. Check spacing between ALL elements (gap between cards, margin above/below headings)
5. Check even the smallest details — a left-aligned button that should be centered IS a bug
6. Fix ALL issues found in that viewport BEFORE moving to the next scroll position
7. After fixing, re-screenshot to verify fixes worked
8. Only then scroll to next position

NOTHING should be skipped. If you can see it in the screenshot, you MUST verify it matches the original. Do not say "element is present" — say "element is present AND correctly positioned AND correctly styled AND correctly colored AND correctly sized."
