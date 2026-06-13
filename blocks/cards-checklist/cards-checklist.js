import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Cards Checklist — emits the ORIGINAL linzess.com AbbVie flex DOM + class names so
 * the already-loaded framework CSS (abbv-framework.css, linzess-global.css) styles it
 * verbatim. No per-property hand-tuning in this block's CSS.
 *
 * Original structure (per card):
 *   .abbv-flex-container-v2.flexbox-column-mobile.flexbox-cards.c-dark-purple.margin-top-{40|80}
 *     .flexboxitem-v2.parbase
 *       .abbv-flex-item-v2.background-{off-white|light-purple}.rounded-corners
 *         .rich-text
 *           .abbv-rich-text.[variant].c-linz-dark-purple.text-align-center.abbv-rich-text-common
 *             p.circle.background-{light-purple|off-white}.font-size-md  (the IBS-C / CIC badge)
 *             ...body / checklist / footnote...
 *
 * Alternation (matches original):
 *   odd card (IBS-C):  card background-off-white,   badge background-light-purple
 *   even card (CIC):   card background-light-purple, badge background-off-white
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Checklist variant if any card contains a <ul> (the "How Can Help" cards);
  // otherwise the text-only variant ("When Can I Expect" cards).
  const isChecklist = rows.some((row) => row.querySelector('ul'));

  const container = document.createElement('div');
  container.className = `abbv-flex-container-v2 flexbox-column-mobile flexbox-cards c-dark-purple ${
    isChecklist ? 'margin-top-80 howlinz-flex' : 'margin-top-40'
  }`;

  rows.forEach((row, index) => {
    const odd = index % 2 === 0;
    const cardBg = odd ? 'background-off-white' : 'background-light-purple';
    const badgeBg = odd ? 'background-light-purple' : 'background-off-white';

    // The authored text lives in the last cell of the row.
    const textCell = row.querySelector(':scope > div:last-child');

    const flexItemWrap = document.createElement('div');
    flexItemWrap.className = 'flexboxitem-v2 parbase';
    moveInstrumentation(row, flexItemWrap);

    const flexItem = document.createElement('div');
    flexItem.className = `abbv-flex-item-v2 ${cardBg} rounded-corners`;

    const richText = document.createElement('div');
    richText.className = 'rich-text';

    const abbvRichText = document.createElement('div');
    abbvRichText.className = isChecklist
      ? 'abbv-rich-text checkmark-list checkmark-list-nopadding margin-bottom-40 abbv-rich-text-common'
      : 'abbv-rich-text c-linz-dark-purple text-align-center abbv-rich-text-common';

    // Move the authored children (badge p, optional ul, body p, footnote p) over,
    // then apply the original framework class names to each.
    const children = textCell ? [...textCell.children] : [];
    children.forEach((el, childIdx) => {
      if (childIdx === 0 && el.tagName === 'P') {
        // First paragraph is the IBS-C / CIC badge → make it the .circle
        el.className = `circle ${badgeBg} font-size-md`;
        if (isChecklist) el.classList.add('c-linz-dark-purple');
      } else if (el.tagName === 'UL') {
        el.className = 'c-linz-dark-purple';
        const items = [...el.children];
        // Original gives the last list item extra bottom margin.
        if (items.length) items[items.length - 1].className = 'margin-bottom-24';
      } else if (el.tagName === 'P') {
        // Remaining paragraphs: footnote (starts with *) vs body copy.
        const txt = el.textContent.trim();
        if (txt.startsWith('*')) el.className = 'footnote max-auto';
        else el.className = 'mb0';
      }
      abbvRichText.append(el);
    });

    richText.append(abbvRichText);
    flexItem.append(richText);
    flexItemWrap.append(flexItem);
    container.append(flexItemWrap);
  });

  block.textContent = '';
  block.append(container);
}
