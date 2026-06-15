# md2jcr Field Naming Rules — Avoiding _fixFieldOrder Bugs

> Scope: every md2jcr / xwalk conversion pitfall hit during the Linzess
> migration. Read this BEFORE building or renaming any block model, and when
> debugging "component does not exist" / "content isn't mapping" / missing-block
> errors. Each rule below caused a real, reproduced failure.

## Quick Triage: md2jcr error → cause

| md2jcr error | Root cause | Section |
|---|---|---|
| `The component 'X' does not exist` | Block has JS/CSS but no `_block.json` model file, OR title case mismatch | "Block Name Must Match", "Every Block Needs a Model File" |
| `… has errors! The content isn't mapping to the model` | Field count ≠ column/row count, OR model field-groups don't match the authored table layout | "Field Groups Map to ROWS", "Never Add a Column-less Field" |
| `Cannot read properties of null (reading 'name')` | A field-group ROW was emitted EMPTY (e.g. optional image with no value) | "Never Emit an Empty Field Row" |
| Block silently rendered as generic `columns` (loses its class + decorator) | Block name starts with `columns` — md2jcr force-converts it | "Reserved Block-Name Prefix: columns*" |
| Heading line breaks gone / `<sup>` markers gone on deployed page | md2jcr strips `<br>` in headings and mangles `<sup>` | "Inline HTML md2jcr Drops" |

## Every Block Needs a Model File (`_blockname.json`)

A block with `blocks/foo/foo.js` + `foo.css` but **no `blocks/foo/_foo.json`** is
NOT registered as a component. md2jcr throws `The component 'Foo' does not exist`.

- Run this sweep before any import to catch unregistered blocks:
  ```bash
  for d in blocks/*/; do b=$(basename "$d"); \
    [ -f "$d/$b.js" ] && [ ! -f "$d/_$b.json" ] && echo "MISSING MODEL: $b"; done
  ```
- `header` and `footer` are the only legitimate model-less blocks (fragment-based, no xwalk model).
- After adding a model file, rebuild the aggregated JSON: `npm run build:json`.
- Container blocks that repeat items (cards) reuse the shared `card` model — copy the
  pattern from `cards-feature/_cards-feature.json` (definition + `card` item + filter).
  Duplicate identical `card` models across blocks are harmless (md2jcr uses first match).

## Reserved Block-Name Prefix: `columns*`

md2jcr (`mdast-columns-block.js`) hardcodes: **any block whose table header name
starts with `columns` (case-insensitive) is force-converted to the core
`columns/v1/columns` component — IGNORING your model's `resourceType`.**

Consequence: the block renders as generic `<div class="columns">`, dropping its
real class (e.g. `columns-promo`), so its JS decorator never runs and its CSS
never applies. Layout silently breaks on the deployed site.

**Fix: never name a custom block `columns-*`.** Rename it to something that does
not start with `columns` (e.g. `columns-promo` → `promo-tout`). Renaming touches:
block folder + `{name}.js`/`.css`/`_{name}.json`, `scripts/scripts.js`,
`styles/*.css`, importer parser (`name:` in `createBlock`), `import-*.js`
registries + templates, `page-templates.json`, all content `class="…"`, then
`npm run build:json`.

## Critical Rule: Block Name Must Match Component Title EXACTLY

md2jcr resolves blocks by matching the block table header name against the component `title` in `component-definition.json`. This match is **case-sensitive**.

- Block table header in `.plain.html`: `Isi` → looks for component with `"title": "Isi"`
- If definition has `"title": "ISI"` → **WILL NOT MATCH** → "component does not exist" error
- If definition has `"title": "Isi"` → **MATCHES** → works

### Rules:
- The block class in HTML is always lowercase kebab-case: `class="cards-video"`
- EDS converts this to Title Case for the block table header: `Cards Video`
- md2jcr looks up the component by this Title Case name
- The `"title"` field in `component-definition.json` and `_blockname.json` must match exactly

### Common Mistakes:
| Block class | EDS generates | Must match in definition | Common error |
|---|---|---|---|
| `isi` | `Isi` | `"title": "Isi"` | Using `"title": "ISI"` |
| `cards-video` | `Cards Video` | `"title": "Cards Video"` | Using `"title": "Cards-Video"` |
| `hero-pharma` | `Hero Pharma` | `"title": "Hero Pharma"` | Using `"title": "HeroPharma"` |
| `columns-cta` | `Columns Cta` | `"title": "Columns Cta"` | Using `"title": "Columns CTA"` |

### Fix:
Always set `"title"` to the exact Title Case version that EDS generates from the kebab-case block name:
- Split on hyphens
- Capitalize first letter of each word only
- `cards-video` → `Cards Video`
- `isi` → `Isi`
- `columns-cta` → `Columns Cta` (NOT `Columns CTA`)

---

## The Problem

md2jcr's `_fixFieldOrder()` method silently drops fields whose names end with certain suffixes when no matching "base field" exists in the model. This causes values to be lost during import — they never appear in JCR output.

## Dangerous Suffixes

md2jcr treats these as collapsible suffixes: **Alt**, **MimeType**, **Type**, **Text**, **Title**

How it works:
- `_fixFieldOrder` scans for "base fields" — fields NOT ending with any suffix
- For each base field, it looks for `baseField + Suffix` (e.g., `image` → `imageAlt`, `imageMimeType`)
- Suffix fields that have a matching base field are kept (reordered to follow their base)
- Suffix fields that do NOT have a matching base field are **silently dropped**

### Examples of DROPPED fields:

| Field Name | Suffix | Expected Base | Exists? | Result |
|---|---|---|---|---|
| overlayTitle | Title | overlay | NO | **DROPPED** |
| overlayBtnText | Text | overlayBtn | NO | **DROPPED** |
| placeholderAlt | Alt | placeholder | NO | **DROPPED** |
| overlayButtonIconType | Type | overlayButtonIcon | NO | **DROPPED** |

### Examples of KEPT fields (correctly collapsed):

| Field Name | Suffix | Expected Base | Exists? | Result |
|---|---|---|---|---|
| imageMimeType | MimeType | image | YES | Collapsed into image group |
| imageAlt | Alt | image | YES | Collapsed into image group |
| backgroundImageAlt | Alt | backgroundImage | YES | Collapsed into backgroundImage group |

## The Fix: Rename Orphan Suffix Fields

When a field name ends with a suffix but has NO matching base field in the same model, rename it to avoid the suffix pattern.

### Naming Patterns That Work:

| Original (BROKEN) | Renamed (WORKS) | Why |
|---|---|---|
| overlayTitle | overlayHeading | Doesn't end with "Title" |
| overlayBtnText | overlayButtonLabel | Doesn't end with "Text" |
| placeholderAlt | placeholderAltLabel | Doesn't end with "Alt" |
| overlayButtonIconType | overlayBtnIconVariation | Doesn't end with "Type" |
| linkText | Keep if `link` field exists | `link` is the base → correctly collapsed |

### Safe Alternatives for Each Suffix:

| Suffix | Avoid ending with | Use instead |
|---|---|---|
| Alt | *Alt | *AltLabel, *AltDescription, *AccessibleName |
| MimeType | *MimeType | Only use when base field exists (e.g., image → imageMimeType) |
| Type | *Type | *Variation, *Style, *Mode, *Kind |
| Text | *Text | *Label, *Content, *Value, *Copy |
| Title | *Title | *Heading, *Name, *Label, *Caption |

## When to Apply This Rule

Before adding or renaming any field in `component-models.json`:

1. Check if the field name ends with `Alt`, `MimeType`, `Type`, `Text`, or `Title`
2. If YES, check if a field named `fieldNameWithoutSuffix` exists in the SAME model
3. If NO base field exists → rename the field to avoid the suffix

## Files to Update When Renaming

When renaming a field, update ALL references:

- `component-models.json` — field name property
- `component-definition.json` — template default keys
- `component-filters.json` — usually not affected (filter by component ID, not field names)
- Import scripts — row mappings
- Block JS/CSS — if they read field values from DOM attributes

## Validation Script

Run this to detect orphan suffix fields in your models:

```bash
node -e "
const models = JSON.parse(require('fs').readFileSync('component-models.json','utf8'));
const suffixes = ['Alt', 'MimeType', 'Type', 'Text', 'Title'];
models.forEach(model => {
  const fields = model.fields.filter(f => f.component !== 'tab');
  const baseNames = fields.filter(f => !suffixes.some(s => f.name.endsWith(s))).map(f => f.name);
  fields.forEach(f => {
    const suffix = suffixes.find(s => f.name.endsWith(s));
    if (suffix) {
      const base = f.name.substring(0, f.name.lastIndexOf(suffix));
      if (!baseNames.includes(base)) {
        console.log('[ORPHAN]', model.id + '.' + f.name, '→ base \"' + base + '\" not found → WILL BE DROPPED');
      }
    }
  });
});
"
```

## Field Groups Map to ROWS (not columns) — content layout must match

md2jcr groups model fields with `FieldGroup._groupFields()`: fields collapse by
shared prefix-before-`_` and by the Alt/MimeType/Type/Text/Title suffixes. Each
resulting **group becomes one TABLE ROW** (single column). The authored block
table MUST present one row per field group, in order — NOT all fields packed
into one multi-column row.

Worked example — `video-playlist` / `video` model groups into 2 rows:
- row 1 = `uri`
- row 2 = `placeholder` (with `placeholder_image` + collapsed `placeholder_imageAlt`)

So the parser must emit `cells = [[uriCell], [placeholderCell]]` (two rows), each
with its `<!-- field:name -->` hint. A single row with 3 columns
(`uri | image | alt`) → `content isn't mapping` error.

For a parser, mirror the field-group count exactly:
```js
const cells = [[uriCell]];               // row 1: uri
if (placeholderSrc) cells.push([placeholderCell]); // row 2: placeholder (only if present)
WebImporter.Blocks.createBlock(document, { name: 'video-playlist', cells });
```

A JS decorator that reads these blocks must read **rows**, not columns:
```js
const rows = [...block.querySelectorAll(':scope > div')];
const [imgCell, textCell] = rows.map((r) => r.querySelector(':scope > div') || r);
// fall back to legacy single-row-2-cell layout if rows.length === 1
```

Collapsed sub-fields (e.g. `imageAlt`, `placeholder_imageAlt`) ride on their base
field's element (the `<img alt="…">`), NOT as a separate cell node. Emitting a
separate node for the collapsed sub-field also breaks mapping.

## Never Add a Column-less Field (e.g. `classes`)

A `multiselect` field named `classes` (block-variant options) has NO authored
column — the variant comes from the block-name suffix the decorator reads via
`block.classList`. Declaring `classes` as a model field makes md2jcr expect an
extra column and misalign every following field. **Remove `classes` from the
model**; keep variant logic in the block name + decorator.

## Never Emit an Empty Field Row

If an optional field-group row is emitted with NO content (e.g. a placeholder
image that doesn't exist), md2jcr throws `Cannot read properties of null
(reading 'name')`. Only push the row when it has content:
```js
const cells = [[uriCell]];
if (placeholderSrc) cells.push([placeholderCell]); // omit entirely when empty
```

## Inline HTML md2jcr Drops (verified against the real library)

When AEM converts markdown headings/text to JCR:
- `<br>` inside a **heading** is STRIPPED (titles are a plain-text attribute).
  `# Get Ahead of Your<br>Returning` → `title="Get Ahead of YourReturning"`.
  `<br>` inside a `<p>` survives.
- `<sup>…</sup>` is mangled to `<div>…</div>` then dropped. Plain unicode
  superscript chars (†, ‡, ®) with NO `<sup>` wrapper are preserved cleanly.

Implication for content: don't rely on `<br>` in headings or `<sup>` wrappers for
footnote markers — use unicode characters directly.

## Reproducing md2jcr Locally (don't guess)

Use the real `@adobe/helix-md2jcr` library to reproduce errors before/after a fix
(found at `…/import-validator/node_modules/@adobe/helix-md2jcr`):
```js
import { md2jcr } from '@adobe/helix-md2jcr';
const opts = { models, definition, filters }; // the three component-*.json
const xml = (await md2jcr(gridTableMarkdown, opts)).toString();
```
Build the grid-table markdown with EXACT column-boundary alignment (`+---+---+`
separators must line up) — a malformed fixture produces misleading
`component 'X' does not exist` errors that are fixture bugs, not real bugs. When
in doubt, validate the parser output via the parser-validator hook (which loads
the live page) instead of hand-writing tables.

## Applied Fixes in This Project

**Video block (video model):**
- `overlayTitle` → `overlayHeading`
- `overlayBtnText` → `overlayButtonLabel`
- `placeholderAlt` → `placeholderAltLabel`
- `overlayButtonIconType` → `overlayBtnIconVariation`

**Impact on import script field groups (Video — 18 groups):**

```
[0]  uri
[1]  placeholderImage (collapsed: placeholderImageMimeType)
[2]  placeholderAltLabel
[3]  overlayHeading          ← title value goes here
[4]  overlayDescription
[5]  overlayButtonLabel      ← "Watch 7:25" button text
[6]  videoContentLayout
[7]  classes (overlayColor, overlayBtnStyle, customDynamicClass, commonCustomClass)
[8]  overlayBtnIconVariation ← "icon-font" or "image"
[9]  overlayButtonFontIcon   ← "play"
[10] projectNumber
[11] enableAutoplay
[12] enableCaptions
[13] enablePlayerControls
[14] enableFullscreen
[15] blockId
[16] language
[17] analytics (analytics_id)
```
