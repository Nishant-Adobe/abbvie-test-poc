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

For each brand URL:
1. **Token extraction:** open the brand homepage, read `:root` + computed brand colors,
   fonts, radius, spacing. Write `brands/<brand>/tokens.css` (just the `:root` overrides)
   and a small `brands/<brand>/overrides.css` for the rare structural divergence.
2. **Confirm framework match:** assert the brand loads `common-elements`/`abbv-framework`
   and has `#abbv_use_statement` + header v2. If NOT (rare), flag for manual review — it may
   be off-framework.
3. **Scaffold:** point the brand at `abbv-base` blocks + its tokens. No new block code
   unless the differ later proves a brand-unique component.

Gate: brand homepage renders with correct brand colors using base blocks.

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
