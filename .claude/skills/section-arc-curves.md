# Section Arc Curves — Implementation Guide

## Overview

The Linzess site uses curved arc shapes between sections to create smooth visual transitions. These are implemented using CSS `::before` and `::after` pseudo-elements with `border-radius: 100%` to create elliptical curves.

## How It Works

Each section transition has a curve created by the NEXT section's `::before` pseudo-element extending UPWARD into the section above. The curve is the same color as the section it belongs to, creating the illusion that the previous section has a curved bottom edge.

**Key Principle:** The curve belongs to the section BELOW, not the section above. It extends upward via negative `top` positioning.

## Implementation Pattern

```css
main > .section.{style}::before {
  content: "";
  border-top-left-radius: 100%;
  border-top-right-radius: 100%;
  height: {curve-height};       /* How tall the curve is */
  width: 130%;                  /* Must be wider than viewport for smooth curve */
  position: absolute;
  top: -{overlap-amount};       /* How far it extends into the section above */
  left: 50%;
  transform: translateX(-50%);  /* Center the wider-than-viewport element */
  z-index: 2;                   /* Must be above the section above's content */
  background: {section-color};  /* Same color as THIS section's background */
}
```

## Current Section Arcs

### White section overlapping Hero (hero bottom curve)
```css
main > .section.white::before {
  height: 150px;
  top: -120px;
  background: white;
  z-index: 2;
}
```
- The white section has `margin-top: -140px` to overlap the hero
- The `::before` extends 120px above the white section
- Combined effect: white curve visible over the hero image bottom

### Dark-purple section arc
```css
main > .section.dark-purple::before {
  height: 75px;
  top: -60px;
  background: var(--linz-dark-purple);
  z-index: -5;
}
```

### Off-white section arc
```css
main > .section.off-white::before {
  height: 75px;
  top: -60px;
  background: var(--linz-off-white);
  z-index: 1;
}
```

### Footer arc
```css
footer::before {
  height: 255px;
  top: -60px;
  width: 130%;
  background: var(--linz-dark-purple);
  border-radius: 100% 100% 0 0;
  z-index: -1;
}
```

## Common Mistakes to Avoid

### DON'T: Add curve to the section ABOVE
```css
/* ❌ WRONG — breaks header, causes overflow issues */
main > .section.hero-pharma-container {
  overflow: hidden;
}
main > .section.hero-pharma-container::after {
  /* This breaks the header and overlaps content below */
}
```

### DO: Add curve to the section BELOW
```css
/* ✅ CORRECT — next section's ::before overlaps upward */
main > .section.white::before {
  top: -120px;  /* Extends UP into the hero */
  background: white;  /* Same as this section's bg */
}
```

### DON'T: Use `overflow: hidden` on sections
This clips the fixed header, sticky elements, and absolute-positioned children.

### DO: Use `z-index` to layer properly
- Hero section: `z-index: auto` (or no z-index)
- White section: `z-index: 1`, `position: relative`
- White `::before`: `z-index: 2` (above hero image)
- Content inside white section: `z-index: 2` via `::after` background

## Section Background Pattern

For sections that need a full background color behind their content (like `.section.white`), use `::after`:

```css
main > .section.white::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--linz-white);
  z-index: 0;  /* Behind content but fills the section */
}
```

Content wrappers inside need `position: relative; z-index: 2` to appear above the `::after` background.

## Applying to New Pages

When migrating a new page that has section transitions with arcs:

1. Identify which sections have curved transitions (check live site)
2. Add the appropriate `style` value in section-metadata (e.g., `white`, `dark-purple`, `off-white`)
3. The CSS rules in `linzess.css` will automatically apply the correct arc based on the class
4. If a new section style is needed, follow the pattern above

## Debugging Tips

- If curve isn't visible: check `z-index` — the `::before` must have higher z-index than the section above
- If curve overlaps content below: reduce `height` or adjust `top`
- If header breaks: NEVER use `overflow: hidden` on sections or their parents
- If content is hidden behind curve: ensure content wrappers have `position: relative; z-index: 2`
