export default function decorate(block) {
  const container = document.createElement('div');
  container.className = 'abbv-flex-container-v2 flexbox-column-mobile flexbox-cards';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const imageCell = cells[0];
    const textCell = cells[1];

    const flexboxItem = document.createElement('div');
    flexboxItem.className = 'flexboxitem-v2 parbase';

    const flexItem = document.createElement('div');
    flexItem.className = 'abbv-flex-item-v2 background-off-white rounded-corners';

    // Icon
    const img = imageCell?.querySelector('img');
    if (img) {
      const iconDiv = document.createElement('div');
      iconDiv.className = 'card-icon';
      const iconImg = document.createElement('img');
      iconImg.src = img.src;
      iconImg.alt = img.alt || '';
      iconDiv.appendChild(iconImg);
      flexItem.appendChild(iconDiv);
    }

    // Text content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'card-content';

    if (textCell) {
      [...textCell.children].forEach((child) => {
        contentDiv.appendChild(child.cloneNode(true));
      });
    }

    flexItem.appendChild(contentDiv);
    flexboxItem.appendChild(flexItem);
    container.appendChild(flexboxItem);
  });

  block.textContent = '';
  block.appendChild(container);
}
