# Validate Page Structure Against Live Site

## Trigger
When user says: "validate <page-name>", "check page structure", "verify blocks match", or as part of iterative migration workflow.

## Purpose
Validate that a migrated page has ALL structural components matching the live site — header, footer, hero, ISI, blocks, and AbbVie framework containers (abbv-row-container, abbv-col, abbv-flex-container-v2, etc.).

## Validation Checklist

For every migrated page, verify these in order:

### 1. Header Validation
```
Original: .abbv-notification-bar + header > .abbv-utility-nav + .abbv-main-nav
Migrated: Must have same structure via header fragment (nav.plain.html)

Check:
- [ ] Savings banner bar present ("Learn how AbbVie and Ironwood can help you save")
- [ ] Utility nav links present (Prescribing Information, Medication Guide, En Español, FAQs, Sign Up)
- [ ] Logo present and links to /
- [ ] Main nav items present (Why LINZESS, Understanding Constipation, Find Relief, Resources, Savings & Support)
- [ ] "Check My Symptoms" CTA button present
- [ ] Home icon present
- [ ] Dropdown submenus work on hover (desktop)
- [ ] Mobile hamburger menu works (mobile)
```

### 2. Hero Validation
```
Original: .hero-container.Linzess-home-hero-belly-bnr .abbv-image-text-v2
Migrated: .hero-pharma block must produce same DOM

Check:
- [ ] Full-width background image present
- [ ] Image responsive (desktop/tablet/mobile sources)
- [ ] Eyebrow text present and styled (small, white, uppercase)
- [ ] H1 heading present with correct line breaks (Bebas Neue, white, drop-shadow)
- [ ] CTA button present (only if page has one on original)
- [ ] CTA button has orange bg, purple text, chevron icon
- [ ] Hero container uses position: relative + negative top offset
- [ ] Content overlay positioned correctly over image
```

### 3. ISI (Important Safety Information) Validation
```
Original: .abbv-isi-v3 (sticky bar) + .abbv-inline-use-isi (inline section)
Migrated: ISI block (fragment-based) + inline section

Check:
- [ ] Sticky ISI bar present at bottom of viewport
- [ ] Two-column layout in sticky bar (USES left, IMPORTANT RISK INFO right)
- [ ] Expand/collapse toggle button (+) present
- [ ] Inline ISI section (`.abbv-inline-use-isi`) present in normal page flow between content and footer — this is SEPARATE from the sticky bar and exists on EVERY page
- [ ] `<a id="abbv_use_statement">` anchor present inside the inline ISI region (scroll/jump target; the sticky bar auto-hides when it scrolls into view). Easy to miss — verify with `document.getElementById('abbv_use_statement')`.
- [ ] Inline region: white bg, h3 16px dark-purple, body p 14px gray (#555)
- [ ] USES heading styled (16px, uppercase, dark purple)
- [ ] IMPORTANT RISK INFORMATION heading styled
- [ ] Bullet lists properly formatted
- [ ] All links working (FDA, Prescribing Info, Medication Guide)
- [ ] ISI auto-hides when user scrolls to inline ISI content
```

### 4. Footer Validation
```
Original: footer > .abbv-footer-container with 6-column nav + legal links + logos
Migrated: footer block (fragment-based)

Check:
- [ ] 6 navigation columns present (WHY LINZESS, UNDERSTANDING CONSTIPATION, FIND RELIEF, RESOURCES, SAVINGS & SUPPORT, CHECK MY SYMPTOMS)
- [ ] All sub-links present under each column
- [ ] Horizontal rule separator present
- [ ] Legal links row with pipe dividers (Accessibility, Contact Us, Terms of Use, Privacy Notice, etc.)
- [ ] Trademark paragraph present (AbbVie®, Ironwood®, LINZESS®, From the Gut℠)
- [ ] Disclaimer paragraph present
- [ ] AbbVie logo (white) present and links to abbvie.com
- [ ] Ironwood logo (white) present
- [ ] Copyright text present (© 2026 AbbVie and Ironwood)
- [ ] US-LIN code present
- [ ] Dark purple background with arc top curve
```

### 5. Section Navigation Validation (content pages only)
```
Original: .abbv-section-navigation.abbv-sticky
Migrated: tabs-navigation block

Check:
- [ ] Purple horizontal bar present
- [ ] Position sticky (sticks to top on scroll)
- [ ] All section anchor links present
- [ ] Links scroll to correct sections
- [ ] White text, Lato 16px/800 weight
- [ ] 50px height
- [ ] z-index above content (100)
```

### 6. Block-Specific Validation

#### cards-feature (homepage)
```
Check:
- [ ] .abbv-flex-container-v2.flexbox-cards container present
- [ ] Two cards side-by-side on desktop
- [ ] First card: dark purple bg, white text
- [ ] Second card: light purple bg, dark text
- [ ] Icon images overflowing above cards (margin-top: -50px)
- [ ] .heading-2 class on card titles (24px, bold)
- [ ] CTA buttons with correct primary/secondary styling
- [ ] Cards have border-radius: 16px
- [ ] max-width: 998px centered
```

#### cards-checklist (why-linzess, find-relief)
```
Check:
- [ ] .abbv-flex-container-v2 container with margin-top: 80px
- [ ] Cards side-by-side on desktop (flex-direction: row)
- [ ] Circle badge present (136px, border-radius: 50%, light purple bg)
- [ ] Badge text centered (IBS-C / CIC)
- [ ] Checkmark list items with ✓ prefix
- [ ] First card: off-white bg (#f4f6fb)
- [ ] Second card: light purple bg (#d9d7f9)
- [ ] border-radius: 16px on cards
```

#### cards-icon (why-linzess, side effects)
```
Check:
- [ ] .icon-image-card.icon-image-card-left structure
- [ ] flex-direction: row, align-items: center
- [ ] Icon images 105x105px
- [ ] Text container has proper left padding (33px gap)
- [ ] max-width: 690px container centered
- [ ] Alternating card backgrounds (dark-purple/light-purple in off-white sections)
```

#### cards-video (homepage, why-linzess)
```
Check:
- [ ] .abbv-flex-container-v2.flexbox-video-cards container
- [ ] 3 cards in a row on desktop (max-width: 320px each)
- [ ] 16:9 video poster area with border-radius top corners
- [ ] Play button overlay (white circle, purple triangle)
- [ ] Title overlay at bottom of poster (purple bg, white text)
- [ ] Card content area below (light purple bg, rounded bottom corners)
- [ ] H3 title + "View Transcript" link in card content
```

#### cards-stats (homepage)
```
Check:
- [ ] Three stat circles in a row
- [ ] Circle with white border (3px solid)
- [ ] Large number (Bebas Neue, 40px+)
- [ ] "million" text below number
- [ ] Description text below each circle
```

#### columns-promo (homepage savings section)
```
Check:
- [ ] .abbv-row-container.image-text-wrapper structure
- [ ] Image on left, text content on right
- [ ] border-radius: 16px on container
- [ ] Correct background color per variant (light-purple, off-white)
- [ ] Proper max-width (802px for eligible-tout, wider for savings-card-tout)
```

### 7. AbbVie Framework Container Validation

These are the structural containers that define the grid/layout system. They MUST be present with correct classes for the framework CSS to apply:

```
Check for presence of these classes in rendered DOM:
- [ ] .abbv-row-container — max-width: 1220px, margin: auto (content width constraint)
- [ ] .abbv-row — padding: 0 20px (horizontal gutters)
- [ ] .abbv-col — float: left, margin-left: 2% (column system)
- [ ] .abbv-col-6 — width: 49% (half-width columns)
- [ ] .abbv-flex-container-v2 — display: flex (modern flex layout)
- [ ] .flexboxitem-v2 — flex: 1 1 0% (equal flex items)
- [ ] .abbv-flex-item-v2 — inner card container
- [ ] .abbv-image-text-v2 — image+text card component
- [ ] .abbv-image-content-container-v2 — image wrapper in card
- [ ] .abbv-image-text-content-container-v2 — text wrapper in card
- [ ] .abbv-image-text-display-v2 — text display area
- [ ] .abbv-stretched-card-body — flex grow body
- [ ] .abbv-stretched-link — stretched link overlay
```

### 8. Section Background & Arc Validation

```
Check:
- [ ] .section.white — white background with arc top (::before pseudo-element)
- [ ] .section.dark-purple — purple bg (#422e83), white text, arc top
- [ ] .section.off-white — off-white bg (#f4f6fb), arc top
- [ ] Arc dimensions: height 75-150px, width 130%, border-top-left-radius/right: 100%
- [ ] Arc positioned with negative top (-60px to -120px)
- [ ] Sections have correct z-index stacking
- [ ] Section padding matches original (60px 0 for standard, 60px 0 155px for before-arc sections)
```

### 9. Typography Validation

```
Check:
- [ ] Body: Lato, 14px, 400 weight, color #4d4d4f
- [ ] H1: Bebas Neue, 56px, 400 weight, line-height 50.4px
- [ ] H2: Bebas Neue, 32-40px, 400 weight
- [ ] H3: Lato, 14px, 700 weight, color #422e83
- [ ] .heading-2: Lato, 18px, 700 weight, color #422e83
- [ ] .eyebrow: 12px, uppercase
- [ ] .footnote: 12px, color #4d4d4f
- [ ] Buttons: Lato, 14.4px (0.9rem), 800 weight
```

### 10. Button Validation

```
Check:
- [ ] .abbv-button-primary — dark purple bg, white text, border-radius: 16px, padding: 16px 56px 16px 32px
- [ ] .abbv-button-primary:hover — off-white bg, dark purple text
- [ ] .abbv-button-secondary — white bg, dark purple text, border-radius: 16px
- [ ] .abbv-button-secondary:hover — light purple bg
- [ ] Hero CTA: orange bg (#faa633), dark purple text, inline-flex with chevron
- [ ] Chevron icon (::before or ::after) — border-right + border-top rotated 45deg
- [ ] Transition: 0.3s linear on background
```

## How To Run Validation

```javascript
// Navigate to migrated page
browser_navigate({ url: 'http://localhost:3000/content/nishant-test/<page-name>' });

// Check each validation item using browser_evaluate
browser_evaluate({
  function: `() => {
    const checks = {};
    
    // Header
    checks.header = {
      savingsBanner: !!document.querySelector('[class*="notification"], [class*="savings"]'),
      logo: !!document.querySelector('header img[alt*="LINZESS"], header img[alt*="logo"]'),
      mainNav: document.querySelectorAll('nav [role="menuitem"], header nav li').length >= 5,
      checkSymptoms: !!document.querySelector('[class*="check-my-symptoms"], a[href*="gutcheck"]')
    };
    
    // Hero
    checks.hero = {
      hasHero: !!document.querySelector('.hero-pharma, .hero-container'),
      hasImage: !!document.querySelector('.hero-pharma img, .hero-container img'),
      hasH1: !!document.querySelector('.hero-pharma h1, .hero-container h1')
    };
    
    // ISI
    checks.isi = {
      stickyBar: !!document.querySelector('.abbv-safety-bar, .isi [class*="safety"]'),
      expandBtn: !!document.querySelector('[class*="isi"] button, .isi button'),
      inlineRegion: !!document.querySelector('.abbv-inline-use-isi'),
      useStatementAnchor: !!document.getElementById('abbv_use_statement') // MUST exist on every page
    };
    
    // Footer
    checks.footer = {
      hasFooter: !!document.querySelector('footer .abbv-footer, footer'),
      navColumns: document.querySelectorAll('footer ul').length >= 6,
      logos: document.querySelectorAll('footer img').length >= 2,
      legalLinks: document.querySelectorAll('footer .abbv-footer-legal-links li, footer li a[href*="abbvie"]').length >= 5
    };
    
    // Framework containers
    checks.framework = {
      rowContainer: document.querySelectorAll('.abbv-row-container').length,
      flexContainer: document.querySelectorAll('.abbv-flex-container-v2').length,
      imageText: document.querySelectorAll('.abbv-image-text-v2').length
    };
    
    // Sections
    checks.sections = {
      total: document.querySelectorAll('main > .section').length,
      white: document.querySelectorAll('main > .section.white').length,
      darkPurple: document.querySelectorAll('main > .section.dark-purple').length,
      offWhite: document.querySelectorAll('main > .section.off-white').length
    };
    
    return checks;
  }`
});
```

## When Validation Fails

For each failed check:
1. Identify the root cause (missing block, wrong DOM, missing CSS class, wrong content)
2. Use appropriate skill to fix:
   - Missing block → `excat:excat-eds-developer` or `edge-delivery-services:building-blocks`
   - Wrong DOM → Rebuild block JS to produce correct structure
   - Missing class → Update block decorator to add the class
   - Wrong content → Update .plain.html content file
   - Missing fragment → Create nav/footer/isi fragment
3. Re-run validation to confirm fix
