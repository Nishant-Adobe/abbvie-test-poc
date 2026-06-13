export default function decorate(block) {
  const container = document.createElement('div');
  container.className = 'abbv-flex-container-v2 flexbox-column-mobile flexbox-cards margin-top-80 savings-card-cards';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const imageCell = cells[0];
    const textCell = cells[1];

    const flexboxItem = document.createElement('div');
    flexboxItem.className = 'flexboxitem-v2 parbase';

    const flexItem = document.createElement('div');
    flexItem.className = 'abbv-flex-item-v2 background-light-purple rounded-corners text-align-center col-2-card icon-image-card';

    // Icon image
    const img = imageCell?.querySelector('img');
    if (img) {
      const iconDiv = document.createElement('div');
      iconDiv.className = 'icon-image';
      const iconImg = document.createElement('img');
      iconImg.src = img.src;
      iconImg.alt = img.alt || '';
      iconDiv.appendChild(iconImg);
      flexItem.appendChild(iconDiv);
    }

    // Text content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'abbv-rich-text abbv-rich-text-common';

    if (textCell) {
      const heading = textCell.querySelector('h3') || textCell.querySelector('p:first-child');
      const isH3Heading = !!textCell.querySelector('h3');
      if (heading) {
        const p = document.createElement('p');
        p.className = 'heading-2 c-linz-dark-purple';
        p.textContent = heading.textContent;
        contentDiv.appendChild(p);
      }

      textCell.querySelectorAll('p').forEach((p, i) => {
        if (!isH3Heading && i === 0) return;
        if (p.querySelector('a') && p.textContent.trim() === p.querySelector('a')?.textContent.trim()) return;
        const cloned = p.cloneNode(true);
        contentDiv.appendChild(cloned);
      });
    }

    flexItem.appendChild(contentDiv);

    // CTA button
    const link = textCell?.querySelector('a');
    if (link) {
      const ctaDiv = document.createElement('div');
      ctaDiv.className = 'cta parbase';
      const ctaLink = document.createElement('a');
      ctaLink.className = 'abbv-button-primary abbv-icon-keyboard_arrow_right i-a';
      ctaLink.href = link.href;
      ctaLink.textContent = link.textContent;
      ctaDiv.appendChild(ctaLink);
      flexItem.appendChild(ctaDiv);
    }

    flexboxItem.appendChild(flexItem);
    container.appendChild(flexboxItem);
  });

  block.textContent = '';
  block.appendChild(container);
}
