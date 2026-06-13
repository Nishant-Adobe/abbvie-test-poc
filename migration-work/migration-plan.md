# Migration Plan: Linzess.com Full Site

**Mode:** URL List
**Source:** 37 unique HTML pages + 5 PDF assets
**Generated:** 2026-06-08

## URL Summary
- **Total provided:** 48 URLs
- **Deduplicated HTML pages:** 37 (removed trailing-slash duplicates, http→https normalization)
- **PDF assets:** 5 (will not be imported as HTML pages)
- **Duplicate of homepage:** http://www.linzess.com/ (same as https://www.linzess.com/)

## Steps
- [x] 1. Project Setup
- [x] 2. Site Analysis (11 templates created from 37 URLs)
- [x] 3. Page Analysis (why-linzess analyzed: 9 blocks, 8 sections, 5 new variants)
- [x] 4. Block Mapping (content-page template populated with DOM selectors)
- [x] 5. Import Infrastructure (10 parsers, 2 transformers — all validated)
- [x] 6. URL Classification and Content Import (content-page: 5/5 pages imported)

## PDF Assets (non-HTML, excluded from template analysis)
- https://www.linzess.com/content/dam/linzess/pdf/digital-cookbook.pdf
- https://www.linzess.com/content/dam/linzess/pdf/14-comfort-food-classics.pdf
- https://www.linzess.com/content/dam/linzess/pdf/10-fast-and-fresh-recipes.pdf
- https://www.linzess.com/content/dam/linzess/pdf/9-new-recipes-to-tempt-your-taste-buds.pdf
- https://www.linzess.com/content/dam/linzess/pdf/desserts-recipes.pdf

## Artifacts
- `.migration/project.json`
- `migration-work/authoring-analysis.json`
- `tools/importer/page-templates.json`
- `tools/importer/parsers/*.js`
- `tools/importer/transformers/*.js`
- `tools/importer/import-*.js`
- `content/*.plain.html`

## Current Status
- **Active Step:** 0 - Initialize
- **Last Updated:** 2026-06-08
