/* RINVOQ cards-feature decorator (JS override, REPLACE mode for brand=rinvoq).
 *
 * Same DOM as the base blocks/cards-feature/cards-feature.js, PLUS it surfaces
 * the grey eyebrow qualifier ("Moderate to Severe" / "Active") and the
 * parenthetical sub-line ("(Atopic Dermatitis)*", "(Non-radiographic Axial
 * Spondyloarthritis)") that the importer concatenated into the CTA link text.
 * The live RINVOQ condition cards show:  eyebrow (grey)  /  name (bold plum)  /
 * optional sub (grey). The base decorator only renders the clean name (h2), so
 * RINVOQ needs this enhanced decorator. Registered in block-brand-overrides.json
 * jsOverrides.cards-feature = ["rinvoq"]. Linzess keeps the base decorator.
 */
export default function decorate(block) {
  const cardVariants = [
    { bg: 'background-dark-purple', textClass: 'c-linz-white', ctaClass: 'abbv-button-secondary' },
    { bg: 'background-light-purple', textClass: '', ctaClass: 'abbv-button-primary margin-top-16' },
  ];

  const container = document.createElement('div');
  container.className = 'abbv-flex-container-v2 flexbox-column-mobile flexbox-cards margin-top-110';

  [...block.children].forEach((row, index) => {
    const variant = cardVariants[index % cardVariants.length];
    const cells = [...row.children];
    const imageCell = cells[0];
    const textCell = cells[1];

    const flexItem = document.createElement('div');
    flexItem.className = 'flexboxitem-v2 parbase';

    const cardInner = document.createElement('div');
    cardInner.className = `abbv-flex-item-v2 ${variant.bg} rounded-corners text-align-center col-2-card icon-image-card`;

    const imageTextParbase = document.createElement('div');
    imageTextParbase.className = 'image-text-v2 parbase';

    const imageTextV2 = document.createElement('div');
    imageTextV2.className = `${variant.textClass ? `${variant.textClass} ` : ''}abbv-image-text-v2 abbv-image-swap`;

    const imageContainer = document.createElement('div');
    imageContainer.className = 'abbv-image-content-container-v2';
    const picture = imageCell.querySelector('picture');
    if (picture) {
      imageContainer.appendChild(picture.cloneNode(true));
    }

    const textContainer = document.createElement('div');
    textContainer.className = 'abbv-image-text-content-container-v2 abbv-image-text-out';

    const textContent = document.createElement('div');
    textContent.className = 'abbv-image-text-content-v2';

    const textDisplay = document.createElement('div');
    textDisplay.className = 'abbv-image-text-display-v2';

    const cardBody = document.createElement('div');
    cardBody.className = 'abbv-stretched-card-body';

    const headings = textCell.querySelectorAll('h2, h3');
    const paragraphs = textCell.querySelectorAll('p');
    let ctaLink = null;

    // Find the CTA link first so we can derive the eyebrow/sub from its text.
    paragraphs.forEach((p) => {
      const links = p.querySelectorAll('a');
      if (links.length === 1 && p.textContent.trim() === links[0].textContent.trim()) {
        [ctaLink] = links;
      }
    });

    headings.forEach((h) => {
      const name = (h.textContent || '').trim();
      const ctaText = ctaLink ? (ctaLink.textContent || '').trim() : '';
      // The link text concatenates: <eyebrow><name><optional parenthetical>.
      // Split on the heading name to recover the grey eyebrow + sub lines.
      let eyebrow = '';
      let sub = '';
      if (ctaText && name && ctaText.includes(name)) {
        const i = ctaText.indexOf(name);
        eyebrow = ctaText.slice(0, i).trim();
        sub = ctaText.slice(i + name.length).trim();
      }

      if (eyebrow) {
        const eb = document.createElement('p');
        eb.className = 'card-eyebrow';
        eb.textContent = eyebrow;
        cardBody.appendChild(eb);
      }

      const p = document.createElement('p');
      p.className = 'heading-2';
      p.innerHTML = h.innerHTML;
      cardBody.appendChild(p);

      if (sub) {
        const sb = document.createElement('p');
        sb.className = 'card-subline';
        sb.textContent = sub;
        cardBody.appendChild(sb);
      }
    });

    paragraphs.forEach((p) => {
      const links = p.querySelectorAll('a');
      if (links.length === 1 && p.textContent.trim() === links[0].textContent.trim()) {
        // CTA — handled below
      } else if (p.textContent.trim()) {
        const bodyP = document.createElement('p');
        bodyP.className = 'mb0-m';
        bodyP.innerHTML = p.innerHTML;
        cardBody.appendChild(bodyP);
      }
    });

    textDisplay.appendChild(cardBody);
    textContent.appendChild(textDisplay);
    textContainer.appendChild(textContent);
    imageTextV2.appendChild(imageContainer);
    imageTextV2.appendChild(textContainer);
    imageTextParbase.appendChild(imageTextV2);
    cardInner.appendChild(imageTextParbase);

    if (ctaLink) {
      const ctaDiv = document.createElement('div');
      ctaDiv.className = 'cta parbase';
      const ctaA = document.createElement('a');
      ctaA.className = `abbv-icon-keyboard_arrow_right ${variant.ctaClass} i-a`;
      ctaA.href = ctaLink.getAttribute('href');
      ctaA.textContent = ctaLink.textContent;
      ctaDiv.appendChild(ctaA);
      cardInner.appendChild(ctaDiv);
    }

    flexItem.appendChild(cardInner);
    container.appendChild(flexItem);
  });

  block.textContent = '';
  block.appendChild(container);
}
