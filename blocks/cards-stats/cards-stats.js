export default function decorate(block) {
  const rows = [...block.children];

  // Alternating background patterns for cards and circles
  const cardBackgrounds = ['background-light-purple', 'background-off-white', 'background-light-purple'];
  const circleBackgrounds = ['background-off-white', 'background-light-purple', 'background-off-white'];

  // Build the original DOM structure
  const container = document.createElement('div');
  container.className = 'abbv-flex-container-v2 flexbox-column-mobile flexbox-cards c-dark-purple margin-top-80 mt4-m';

  rows.forEach((row, index) => {
    const cells = [...row.children];
    const textCell = cells[1] || cells[0];

    // Get paragraphs from the text cell
    const paragraphs = textCell ? [...textCell.querySelectorAll('p')] : [];

    // Create flexboxitem-v2 wrapper
    const flexItem = document.createElement('div');
    flexItem.className = 'flexboxitem-v2 parbase';

    // Create abbv-flex-item-v2 with alternating background
    const flexItemInner = document.createElement('div');
    flexItemInner.className = `abbv-flex-item-v2 ${cardBackgrounds[index] || cardBackgrounds[0]} rounded-corners text-align-center`;

    // Create rich-text wrapper
    const richText = document.createElement('div');
    richText.className = 'rich-text';

    const richTextInner = document.createElement('div');
    richTextInner.className = 'abbv-rich-text c-linz-dark-purple abbv-rich-text-common';

    // First paragraph becomes the circle with stat number
    if (paragraphs[0]) {
      const circleP = document.createElement('p');
      circleP.className = `circle ${circleBackgrounds[index] || circleBackgrounds[0]} font-size-md`;

      // Extract the number and unit from the first paragraph
      // Original format: <p><strong>11.5<br> million</strong></p>
      const strong = paragraphs[0].querySelector('strong, b');
      if (strong) {
        const content = strong.innerHTML;
        // Split by <br> to get number and unit
        const parts = content.split(/<br\s*\/?>/i);
        const number = parts[0].trim();
        const unit = parts[1] ? parts[1].trim() : '';

        const b = document.createElement('b');
        const span = document.createElement('span');
        span.className = 'font-size-xl';
        span.textContent = number;
        b.appendChild(span);
        if (unit) {
          b.appendChild(document.createElement('br'));
          b.appendChild(document.createTextNode(unit));
        }
        circleP.appendChild(b);
      } else {
        circleP.innerHTML = paragraphs[0].innerHTML;
      }

      richTextInner.appendChild(circleP);
    }

    // Second paragraph becomes the description
    if (paragraphs[1]) {
      const descP = document.createElement('p');
      descP.className = 'mb24-m';
      descP.innerHTML = paragraphs[1].innerHTML;
      richTextInner.appendChild(descP);
    }

    richText.appendChild(richTextInner);
    flexItemInner.appendChild(richText);
    flexItem.appendChild(flexItemInner);
    container.appendChild(flexItem);
  });

  // Replace block contents with new structure
  block.textContent = '';
  block.appendChild(container);
}
