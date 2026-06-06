export default function decorate(block) {
  // Card variant configuration: alternating background styles
  const cardVariants = [
    { bg: 'background-dark-purple', textClass: 'c-linz-white', ctaClass: 'abbv-button-secondary' },
    { bg: 'background-light-purple', textClass: '', ctaClass: 'abbv-button-primary margin-top-16' },
  ];

  // Build the original DOM structure
  const container = document.createElement('div');
  container.className = 'abbv-flex-container-v2 flexbox-column-mobile flexbox-cards margin-top-110';

  [...block.children].forEach((row, index) => {
    const variant = cardVariants[index % cardVariants.length];
    const cells = [...row.children];
    const imageCell = cells[0];
    const textCell = cells[1];

    // .flexboxitem-v2.parbase
    const flexItem = document.createElement('div');
    flexItem.className = 'flexboxitem-v2 parbase';

    // .abbv-flex-item-v2 with variant classes
    const cardInner = document.createElement('div');
    cardInner.className = `abbv-flex-item-v2 ${variant.bg} rounded-corners text-align-center col-2-card icon-image-card`;

    // .image-text-v2.parbase
    const imageTextParbase = document.createElement('div');
    imageTextParbase.className = 'image-text-v2 parbase';

    // .abbv-image-text-v2.abbv-image-swap (with text color class)
    const imageTextV2 = document.createElement('div');
    imageTextV2.className = `${variant.textClass ? `${variant.textClass} ` : ''}abbv-image-text-v2 abbv-image-swap`;

    // .abbv-image-content-container-v2 (icon image)
    const imageContainer = document.createElement('div');
    imageContainer.className = 'abbv-image-content-container-v2';
    const picture = imageCell.querySelector('picture');
    if (picture) {
      imageContainer.appendChild(picture.cloneNode(true));
    }

    // .abbv-image-text-content-container-v2.abbv-image-text-out
    const textContainer = document.createElement('div');
    textContainer.className = 'abbv-image-text-content-container-v2 abbv-image-text-out';

    // .abbv-image-text-content-v2
    const textContent = document.createElement('div');
    textContent.className = 'abbv-image-text-content-v2';

    // .abbv-image-text-display-v2
    const textDisplay = document.createElement('div');
    textDisplay.className = 'abbv-image-text-display-v2';

    // .abbv-stretched-card-body
    const cardBody = document.createElement('div');
    cardBody.className = 'abbv-stretched-card-body';

    // Extract heading and body paragraphs (not the CTA link paragraph)
    const headings = textCell.querySelectorAll('h2, h3');
    const paragraphs = textCell.querySelectorAll('p');
    let ctaLink = null;

    headings.forEach((h) => {
      const p = document.createElement('p');
      p.className = 'heading-2';
      p.innerHTML = h.innerHTML;
      cardBody.appendChild(p);
    });

    paragraphs.forEach((p) => {
      // Check if this paragraph contains only a link (CTA)
      const links = p.querySelectorAll('a');
      if (links.length === 1 && p.textContent.trim() === links[0].textContent.trim()) {
        [ctaLink] = links;
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

    // CTA section
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

  // Replace block content
  block.textContent = '';
  block.appendChild(container);
}
