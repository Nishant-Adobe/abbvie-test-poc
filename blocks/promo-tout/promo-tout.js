export default function decorate(block) {
  // Get the single row with 2 cells
  const row = block.querySelector(':scope > div');
  if (!row) return;
  const cells = [...row.children];
  if (cells.length < 2) return;

  const imgCell = cells[0];
  const textCell = cells[1];

  // Determine variant based on content heuristics
  // savings-card-tout: typically in a "white" section with more text content
  // eligible-tout: short heading + single CTA, light purple bg
  // discussion-tout: heading + description + CTA, off-white bg
  const paragraphs = textCell.querySelectorAll('p');
  const textParagraphs = [...paragraphs].filter((p) => {
    if (p.querySelector('picture')) return false;
    const link = p.querySelector('a');
    if (!link) return true;
    if (p.textContent.trim() === link.textContent.trim()) return false;
    return true;
  });

  let variant = 'eligible-tout';
  if (textParagraphs.length >= 3) {
    variant = 'savings-card-tout';
  } else if (textParagraphs.length === 2) {
    variant = 'discussion-tout';
  }

  // Build the original DOM structure
  // Outer container: .abbv-row-container with variant classes
  const container = document.createElement('div');
  const containerClasses = ['abbv-row-container', 'rounded-corners', 'image-text-wrapper'];

  if (variant === 'eligible-tout') {
    containerClasses.push('background-light-purple', 'margin-top-80', 'eligible-tout', 'tablet-tout-row');
  } else if (variant === 'savings-card-tout') {
    containerClasses.push('background-off-white', 'savings-card-tout');
  } else {
    containerClasses.push('background-off-white', 'margin-top-80', 'discussion-tout', 'tablet-tout-row');
  }
  container.classList.add(...containerClasses);

  // Inner row: .abbv-row
  const abbvRow = document.createElement('div');
  abbvRow.classList.add('abbv-row');

  // Column 0: image
  const col0 = document.createElement('div');
  col0.classList.add('abbv-col', 'abbv-col-6');

  const imageTextV2 = document.createElement('div');
  imageTextV2.classList.add('image-text-v2', 'parbase');

  const imgWrapper = document.createElement('div');
  imgWrapper.classList.add('abbv-image-text-v2', 'abbv-image-swap');

  const imgContentContainer = document.createElement('div');
  imgContentContainer.classList.add('abbv-image-content-container-v2');

  // Move the picture element
  const picture = imgCell.querySelector('picture');
  if (picture) {
    imgContentContainer.appendChild(picture);
  }

  imgWrapper.appendChild(imgContentContainer);
  imageTextV2.appendChild(imgWrapper);
  col0.appendChild(imageTextV2);

  // Column 1: text content
  const col1 = document.createElement('div');
  col1.classList.add('abbv-col', 'abbv-col-6');

  // Find all paragraphs and links in original text cell
  const allChildren = [...textCell.children];

  allChildren.forEach((child) => {
    // Check if this is a button-container (EDS wraps standalone <p><a> in .button-container)
    if (child.classList.contains('button-container')) {
      const link = child.querySelector('a');
      if (link) {
        // Create CTA structure
        const ctaDiv = document.createElement('div');
        ctaDiv.classList.add('cta', 'parbase');

        const ctaLink = document.createElement('a');
        ctaLink.classList.add('abbv-icon-keyboard_arrow_right', 'abbv-button-primary', 'i-a');
        ctaLink.href = link.href;
        ctaLink.textContent = link.textContent;

        ctaDiv.appendChild(ctaLink);
        col1.appendChild(ctaDiv);
      }
    } else if (child.tagName === 'P' || child.tagName === 'H1' || child.tagName === 'H2' || child.tagName === 'H3') {
      // Check if paragraph contains only a link (it's a CTA)
      const linkInP = child.querySelector('a');
      if (linkInP && child.textContent.trim() === linkInP.textContent.trim() && !child.querySelector('strong')) {
        // This is a standalone CTA link
        const ctaDiv = document.createElement('div');
        ctaDiv.classList.add('cta', 'parbase');

        const ctaLink = document.createElement('a');
        ctaLink.classList.add('abbv-icon-keyboard_arrow_right', 'abbv-button-primary', 'i-a');
        ctaLink.href = linkInP.href;
        ctaLink.textContent = linkInP.textContent;

        ctaDiv.appendChild(ctaLink);
        col1.appendChild(ctaDiv);
      } else {
        // Regular text content - wrap in rich-text structure
        const richTextDiv = document.createElement('div');
        richTextDiv.classList.add('rich-text');

        const innerDiv = document.createElement('div');
        innerDiv.classList.add('abbv-rich-text', 'margin-bottom-24', 'abbv-rich-text-common');

        // Determine if heading or body text
        const p = document.createElement('p');
        if (child.tagName === 'P' && !child.querySelector('a')) {
          // Check if this is a heading-style paragraph (first text content, usually)
          const isHeading = col1.querySelectorAll('.rich-text').length === 0 && !child.querySelector('sup');
          if (isHeading && textParagraphs.length > 0 && child === textParagraphs[0]) {
            p.classList.add('heading-2', 'c-linz-dark-purple', 'mt0', 'mb0');
          }
          p.innerHTML = child.innerHTML;
        } else {
          p.innerHTML = child.innerHTML;
        }

        innerDiv.appendChild(p);
        richTextDiv.appendChild(innerDiv);
        col1.appendChild(richTextDiv);
      }
    }
  });

  abbvRow.appendChild(col0);
  abbvRow.appendChild(col1);
  container.appendChild(abbvRow);

  // Clear the block and insert the new structure
  block.textContent = '';
  block.appendChild(container);
}
