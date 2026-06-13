# Full Site Migration (Orchestrator)

## Trigger
When the user says: "migrate site <url>", "migrate site <url> with proper planning", "full site migration <url>".

Examples:
- "migrate site https://www.linzess.com with proper planning"
- "migrate site https://www.linzess.com"

## Purpose
TOP-LEVEL orchestrator that migrates an entire website to AEM Edge Delivery
Services. It runs a **strictly ordered, gated** sequence. Each phase has an exit
gate — do NOT start a phase until the previous phase's gate passes. The user
provides only the site URL; everything else is derived.

## The Prime Directive (applies to EVERY phase)
**Same DOM + Same CSS classes + Same CSS + Same behavior.**
- Block decorators MUST emit the SAME element hierarchy, tag names, and **verbatim
  CSS class names** as the live site. Never rename or invent classes.
- Load/replicate the original CSS so styling matches.
- Replicate behavior (external calls, APIs, adaptive forms, video, carousels).
- When the EDS default block set can't reproduce the DOM/classes, **create a new
  block** whose decorator outputs that exact DOM + classes.

---

## PHASE 0 — Intake (gate: site URL captured)
1. Capture the site URL from the user.
2. Create `migration-work/` if missing. Create the TodoWrite list for all phases
   below. **This orchestrator OWNS the todo list** — re-assert it after any
   sub-skill/sub-agent runs.

---

## PHASE 1 — URL Discovery & Triage (gate: clean migrate-list saved)

### 1.1 Discover every URL
- **Skill:** `excat:excat-url-discovery` (sitemap.xml first, then crawl).
- Output: `migration-work/site-urls.json` with ALL discovered URLs.

### 1.2 Triage EVERY URL (critical — do not skip)
For each URL, classify with a real check (curl for status, browser for JS
redirects/soft-404s — AEM SPA sites return 200 on soft-404s and redirect
client-side, so HTTP status alone is NOT enough):

| Verdict | Test | Action |
|---|---|---|
| **MIGRATE** | 200 + distinct title/content | keep |
| **SKIP — hard 404** | status 404 OR "THIS PAGE MAY HAVE MOVED"/"Page Not Found" body | drop |
| **SKIP — redirect to anchor/alias** | final URL differs (e.g. `/x/y` -> `/x#y`) or title == parent's | drop, note canonical |
| **SKIP — cross-domain redirect** | final URL is a different domain | drop |
| **SKIP — duplicate** | resolves to an already-listed canonical URL | drop, note canonical |

Record the verdict + canonical target per URL in `site-urls.json`. Present a
short summary table to the user (migrate count vs skip reasons).

**Gate:** a de-duplicated **migrate-list** of real, distinct, same-domain pages.

---

## PHASE 2 — Structure, Block & Functionality Analysis (gate: block inventory + functionality map)

### 2.1 Group pages by template
- **Skill:** `excat:excat-site-catalog` -> template groups (homepage, content,
  sub-page, article, form, utility...). Pick one representative per template.

### 2.2 Analyze each representative for DOM + blocks
- **Skill:** `excat:excat-page-analysis` on each representative.
- For each repeating structure, capture the **exact outerHTML + the full class
  list** of the original. Decide: does an existing block reproduce this DOM+classes?
  If not -> mark "NEW BLOCK NEEDED" with the target DOM/classes.
- Produce `migration-work/block-inventory.json`: every block, which template/pages
  use it, exists-vs-new, and the verbatim class names it must emit.

### 2.3 Functionality audit (MANDATORY — do this before building)
Scan every representative (and form/interactive pages) for behavior that static
HTML can't capture. For EACH, record the mechanism + how to reproduce:
- **Adaptive Forms** (AEM Forms): look for `cmp-formsembed-widget` /
  `data-forms-url` / `/content/forms/af/`. Reproduce with a `forms-embed`-style
  block that loads the form same-origin (note any reverse-proxy prefix to avoid CORS).
- **External APIs / data fetches** (e.g. Brightcove playlist, search): note
  endpoint, params, auth/policy keys.
- **Video** (Brightcove/YouTube), **carousels**, **modals**, **accordions**,
  **sticky bars (ISI)**, **nav dropdowns**.
Output: `migration-work/functionality-map.json`.

**Gate:** `block-inventory.json` + `functionality-map.json` complete; user sees
the list of NEW blocks to be created and the functional pieces to reproduce.

---

## PHASE 3 — Design System / Tokens FIRST (gate: tokens + global CSS in place)

**Extract the design system BEFORE building any block** — blocks depend on tokens.
- **Skill:** `excat:excat-complete-design-expert` (Site Design Only mode) on the
  homepage + 1-2 representatives.
- Extract: color tokens, typography (families/sizes/weights/line-heights),
  spacing scale, section padding, content max-width, nav heights, button variants
  + hover states, section arc/curve values, border-radius.
- Write tokens to `styles/styles.css` (`:root`), load the original framework CSS
  verbatim (e.g. `abbv-framework.css`, brand global CSS) so class-based styling works.

**Gate:** `:root` tokens defined and global/framework CSS loaded; a token sanity
check renders correct fonts/colors on a blank section.

---

## PHASE 4 — Global Fragments + Block Build (gate: all blocks emit correct DOM/classes)

### 4.1 Global fragments first (every page needs them)
Migrate header (nav), footer, and any sticky ISI/safety fragment as authorable
fragments before page content.

### 4.2 Build every block from the inventory
- **Skills:** `edge-delivery-services:building-blocks`, `excat:excat-eds-developer`.
- For EACH block: write `block.js` that emits the SAME DOM + verbatim classes,
  and `block.css` with the extracted computed styles. Reproduce functional blocks
  per `functionality-map.json` (forms-embed, video, carousel, search, ...).

### 4.3 Auto-blocking for complex/implicit structures
Use **auto-blocking** (build synthetic blocks in JS during decoration) when the
authored markdown/sections don't map 1:1 to a component — see
https://www.aem.live/developer/markup-sections-blocks. Use it to assemble
multi-part structures (e.g. cards built from flat content, hero from
section-metadata) so the rendered DOM matches the original without hand-authoring.
When auto-blocking repeated cards, replicate per-variant differences from the
original: **alternating backgrounds** (odd card dark / even card light, with text
and button colors flipping to match) and **image position** (image-top vs
image-beside-text vs icon-top vs icon-left). Emit a variant class per card (e.g.
`card-dark` / `card-light`) so CSS can target the alternation — do NOT render every
card identically.

**Gate:** every inventory block exists and, in isolation, emits the target
DOM + classes (spot-check with the block-critique tool).

---

## PHASE 5 — Page Migration (gate: every migrate-list page renders)

For each page in the migrate-list (homepage first, then by template priority):
- Import content via the project's bundled import script + `run-bulk-import.js`
  (never hand-write content HTML). Ensure pages use the built blocks and carry the
  header/footer/ISI fragments.
- Convert external CSS `url()` refs to base64 / local where needed; download SVG/icons.

**Gate:** all migrate-list pages return 200 locally and contain their expected
blocks (no dead/soft-404 snapshots, no duplicate ISI, no stray redirect pages).

---

## PHASE 6 — Validation, one page at a time (gate: each page structurally sound + baseline critique)

For EACH migrated page:
1. **Structure validation:** `.claude/skills/validate-page-structure.md`
   (header, footer, hero, ISI, blocks, abbv-containers, sections, arcs,
   typography, buttons).
2. **Block-level critique:** `excat:excat-block-critique` on each block instance.
3. **Page-level critique:** `excat:excat-page-critique` (full-page baseline score).
4. **Card-variant coverage:** for every section with repeated cards, enumerate ALL
   cards on the original (not just the first row) — programmatically capture each
   card's real background-color and image-vs-text position — and confirm the
   migrated page reproduces any alternating colors and per-section image positions.
   Do not pass a card section on a single-row spot-check.

Record a baseline similarity per page in
`migration-work/site-migration-progress.json`.

**Gate:** every page validated structurally and has a baseline critique score.
The site is now ready for the user-driven per-page refinement loop.

---

## PHASE 7 — Per-Page Iterative Refinement (USER-DRIVEN)

After Phase 6, the user drives refinement page-by-page:

> "migrate <page-url> iteratively 20"  (or "fix <page> 20 iterations")

When you receive that command, run **`.claude/skills/iterative-page-migration.md`**
for that page with this exact per-iteration order (it must converge to **90-95%**
within the requested iterations, ideally 1-2 prompts):

1. **Pixel tool first.** Run the page-critique / visual-comparator (the "pixel
   tool") against the live page to get a ranked list of ALL diffs + a similarity
   score. Fix the high-impact diffs until the score reaches **>= 90%**.
2. **Zoomed Playwright diffs.** Using the local Playwright MCP, compare migrated
   vs live with **small, zoomed, element-scoped** screenshots (short viewport,
   `deviceScaleFactor: 2`, element refs) to catch the very minute issues
   (2px spacing, off-white vs white, radius, weight, badge color, shadow). Fix each.
3. **Full-page diff.** Take a full-page screenshot of both, find remaining
   section-level mismatches, fix them.
4. **Repeat** steps 1-3 up to N times (N = the number the user gave, e.g. 20),
   verifying each fix with a re-screenshot, until >= 90-95% and no visible diffs
   remain. Save iteration context each loop.

Do NOT stop at a percentage with visible diffs remaining; do NOT dismiss diffs as
"structural" without trying JS DOM restructuring / auto-blocking first.

---

## Context & Resume
- Save progress after each page to `migration-work/site-migration-progress.json`
  (per-page: status, baseline %, latest iteration %, iterations run).
- Save per-iteration context to `migration-work/iterations/<page>/iteration-<N>.json`.
- On a new session: read the progress file, determine the current phase/page, and
  resume from the exact point — no work is repeated or lost.
- If context fills up: save all state, summarize, output the resume command, stop cleanly.

## Hard Rules
- ALWAYS run phases in order; never skip a gate.
- ALWAYS triage URLs (404 / redirect / cross-domain / duplicate) and migrate ONLY
  real, distinct, same-domain pages.
- ALWAYS extract design tokens BEFORE building blocks.
- ALWAYS reproduce same DOM + verbatim CSS classes; create a new block when needed.
- ALWAYS audit + reproduce functionality (APIs, adaptive forms, video, carousels).
- ALWAYS use auto-blocking for complex/implicit structures.
- ALWAYS validate every page (structure + block + page critique) before the user
  refinement loop.
- In the refinement loop: pixel tool -> fix to 90% -> zoomed diffs -> full-page diff
  -> repeat N times. Verify every fix visually.
- NEVER hand-write page content HTML — use the import pipeline.
- Re-assert the orchestrator's TodoWrite list after any sub-agent completes.

## Completion Criteria
- [ ] All URLs discovered and triaged; migrate-list is clean (no 404/redirect/dupe).
- [ ] Block inventory + functionality map complete.
- [ ] Design tokens + framework CSS in place.
- [ ] Global fragments (header/footer/ISI) + all blocks built (incl. new + auto-blocks).
- [ ] All migrate-list pages imported and rendering.
- [ ] Every page validated (structure + block + page critique) with a baseline score.
- [ ] Per-page refinement available; each refined page reaches 90-95% with no
      visible diffs.
