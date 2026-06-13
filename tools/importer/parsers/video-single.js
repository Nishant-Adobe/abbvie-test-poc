/* eslint-disable */
/* global WebImporter */
/**
 * Parser for video-single
 * Base block: video-single
 * Source: https://www.linzess.com/find-relief
 * Selector: .abbv-flex-container-v2.flexbox-video-cards.flexbox-video-cards--single
 *
 * UE Model field groups (each MUST be its own ROW or md2jcr fails to map):
 *   - image (+ imageAlt collapsed): poster image; img alt carries the Brightcove video id
 *   - text (richtext): video title (h3) + transcript link
 */
export default function parse(element, { document }) {
  // Brightcove config lives on the video-js element (or its inner <video>).
  const videoJsEl = element.querySelector('video-js[data-video-id], [data-video-id]');
  const videoId = videoJsEl ? (videoJsEl.getAttribute('data-video-id') || '').trim() : '';

  // Poster image: prefer an explicit poster attribute, else any thumbnail img.
  let posterSrc = '';
  const posterEl = element.querySelector('[poster]');
  if (posterEl) posterSrc = posterEl.getAttribute('poster') || '';
  if (!posterSrc) {
    const img = element.querySelector('.vjs-poster img, img');
    if (img) posterSrc = img.getAttribute('src') || '';
  }

  // Title + transcript link.
  const h3 = element.querySelector('h3');
  const transcriptLink = element.querySelector('a[href*="transcript"]');

  // Row 1: image (imageAlt is a collapsed sub-field carried by the img's alt
  // attribute — the Brightcove video id — NOT a separate cell node).
  const imageFrag = document.createDocumentFragment();
  imageFrag.appendChild(document.createComment(' field:image '));
  if (posterSrc) {
    const picture = document.createElement('picture');
    const img = document.createElement('img');
    img.src = posterSrc;
    img.alt = videoId;
    picture.appendChild(img);
    imageFrag.appendChild(picture);
  }

  // Row 2: text (title + transcript link).
  const textFrag = document.createDocumentFragment();
  textFrag.appendChild(document.createComment(' field:text '));
  if (h3) {
    const title = document.createElement('h3');
    title.textContent = h3.textContent.trim();
    textFrag.appendChild(title);
  }
  if (transcriptLink) {
    const link = document.createElement('a');
    link.href = transcriptLink.getAttribute('href');
    link.textContent = transcriptLink.textContent.trim();
    textFrag.appendChild(link);
  }

  const cells = [
    [imageFrag],
    [textFrag],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'video-single', cells });
  element.replaceWith(block);
}
