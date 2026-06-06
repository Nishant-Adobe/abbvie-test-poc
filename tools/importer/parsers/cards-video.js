/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-video
 * Base block: cards
 * Source: https://www.linzess.com/
 * Selector: .abbv-flex-container-v2.flexbox-video-cards
 * Generated: 2026-06-05
 *
 * UE Model: container block "cards" with child "card" items.
 * Each card has fields: image (reference), text (richtext).
 * Each card item = one row with [image, text] columns.
 */
export default function parse(element, { document }) {
  // Find all card items within the flex container
  const cardItems = element.querySelectorAll(':scope > .flexboxitem-v2');

  const cells = [];

  cardItems.forEach((cardItem) => {
    // Extract poster image from the video player
    // Try multiple locations: vjs-poster img, video poster attribute, any img in video container
    // Exclude thumbnail images (vjs-thumbnail-image) which are small preview sprites
    const posterImg = cardItem.querySelector('.vjs-poster img[src]:not([src=""])')
      || cardItem.querySelector('.abbv-video-container img[src]:not([src=""]):not(.vjs-thumbnail-image)')
      || cardItem.querySelector('video-js img[src]:not([src=""]):not(.vjs-thumbnail-image)');
    const videoEl = cardItem.querySelector('video[poster]');
    // Fallback: try video-js element poster attribute
    const videoJsEl = cardItem.querySelector('video-js[poster]');

    // Extract text content from abbv-video-content area
    const contentArea = cardItem.querySelector('.abbv-video-content');

    // Build image cell with field hint
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    if (posterImg) {
      const img = document.createElement('img');
      img.src = posterImg.getAttribute('src') || '';
      img.alt = posterImg.getAttribute('alt') || '';
      imageCell.appendChild(img);
    } else if (videoEl && videoEl.getAttribute('poster')) {
      const img = document.createElement('img');
      img.src = videoEl.getAttribute('poster');
      img.alt = '';
      imageCell.appendChild(img);
    }

    // Build text cell with field hint containing title, quote, patient info, and link
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));

    if (contentArea) {
      // Extract heading (video title)
      const heading = contentArea.querySelector('h3, h2, h4');
      if (heading) {
        const h = document.createElement(heading.tagName.toLowerCase());
        h.textContent = heading.textContent.trim();
        textCell.appendChild(h);
      }

      // Extract quote/description - get the innermost p that contains the actual text
      // The source has nested <p><p>quote text<span>name</span><span>condition</span></p></p>
      const paragraphs = contentArea.querySelectorAll('p');
      // Find the deepest paragraph with actual text content (not just wrapping)
      let deepestP = null;
      paragraphs.forEach((p) => {
        // Prefer the innermost p that has direct text content
        if (p.querySelector('span') || p.childNodes[0]?.nodeType === 3) {
          deepestP = p;
        }
      });

      if (deepestP) {
        // Extract only the quote text (first text node, before spans)
        let quoteText = '';
        for (const node of deepestP.childNodes) {
          if (node.nodeType === 3) { // Text node
            quoteText += node.textContent;
          } else if (node.nodeName === 'SPAN') {
            break; // Stop at first span
          }
        }
        quoteText = quoteText.trim();
        if (quoteText) {
          const p = document.createElement('p');
          p.textContent = quoteText;
          textCell.appendChild(p);
        }

        // Extract patient name/age and condition from spans
        const spans = deepestP.querySelectorAll(':scope > span');
        spans.forEach((span) => {
          const spanText = span.textContent.trim();
          if (spanText) {
            const p = document.createElement('p');
            p.textContent = spanText;
            textCell.appendChild(p);
          }
        });
      }

      // Extract transcript link
      const transcriptLink = contentArea.querySelector('a.transcript-link, a[href*="transcript"]');
      if (transcriptLink) {
        const a = document.createElement('a');
        a.href = transcriptLink.getAttribute('href') || '';
        a.textContent = transcriptLink.textContent.trim();
        textCell.appendChild(a);
      }
    }

    // Each card = one row with [image, text] columns
    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-video', cells });
  element.replaceWith(block);
}
