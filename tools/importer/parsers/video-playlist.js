/* eslint-disable */
/* global WebImporter */
/**
 * Parser for video-playlist
 * Base block: video-playlist
 * Source: https://www.linzess.com/why-linzess
 * Selector: .abbv-video-player.abbv-video-playlist.abbv-playlist-type-carousel
 * Generated: 2026-06-08
 *
 * UE Model fields:
 *   - uri (aem-content): Video player embed URL (Brightcove playlist)
 *   - classes (multiselect): Options like autoplay
 *   - placeholder_image (reference): Poster/thumbnail image
 *   - placeholder_imageAlt (text): Alt text for placeholder image
 *
 * Source structure:
 *   - .abbv-video-player wrapper with data-autoplay attribute
 *   - video-js element with data-account, data-player, data-playlist-id
 *   - .vjs-playlist-item list items with thumbnails and titles
 *   - Transcript link (a[href*="transcript"])
 *
 * The block decorator expects a single <a> link to the video embed URL
 * and optionally a <picture> element as a placeholder image.
 */
export default function parse(element, { document }) {
  // Extract Brightcove configuration from the video-js element
  const videoJsEl = element.querySelector('video-js[data-account][data-player]');

  let videoUrl = '';
  if (videoJsEl) {
    const accountId = videoJsEl.getAttribute('data-account');
    const playerId = videoJsEl.getAttribute('data-player');
    const playlistId = videoJsEl.getAttribute('data-playlist-id');

    // Construct the Brightcove player embed URL with playlist
    if (accountId && playerId && playlistId) {
      videoUrl = `https://players.brightcove.net/${accountId}/${playerId}_default/index.html?playlistId=${playlistId}`;
    } else if (accountId && playerId) {
      videoUrl = `https://players.brightcove.net/${accountId}/${playerId}_default/index.html`;
    }
  }

  // Fallback: try to find any iframe src or data-src with brightcove
  if (!videoUrl) {
    const iframe = element.querySelector('iframe[src*="brightcove"], iframe[data-src*="brightcove"]');
    if (iframe) {
      videoUrl = iframe.getAttribute('src') || iframe.getAttribute('data-src') || '';
    }
  }

  // Extract placeholder image - use the first playlist thumbnail at higher resolution
  // or the poster image from the video-js element
  let placeholderSrc = '';
  let placeholderAlt = '';

  // Try poster from video-js
  if (videoJsEl) {
    const poster = videoJsEl.getAttribute('poster');
    if (poster) {
      placeholderSrc = poster;
    }
  }

  // Fallback: use the first playlist item thumbnail (get larger version)
  if (!placeholderSrc) {
    const firstThumb = element.querySelector('.vjs-playlist-item img[src]');
    if (firstThumb) {
      // Convert 160x90 thumbnail URL to 1280x720 for a better placeholder
      placeholderSrc = firstThumb.getAttribute('src').replace('/160x90/', '/1280x720/');
      placeholderAlt = firstThumb.getAttribute('alt') || '';
    }
  }

  // Fallback: any poster image in the video container
  if (!placeholderSrc) {
    const posterImg = element.querySelector('.vjs-poster img[src]:not([src=""])');
    if (posterImg) {
      placeholderSrc = posterImg.getAttribute('src');
      placeholderAlt = posterImg.getAttribute('alt') || '';
    }
  }

  // Build the cells array matching the UE model field groups.
  // The model groups into TWO field rows: `uri`, then `placeholder`
  // (placeholder_image + placeholder_imageAlt collapse into one row).
  // Each field group MUST be its own row, or md2jcr fails to map content.

  // Row 1: uri
  const uriCell = document.createDocumentFragment();
  uriCell.appendChild(document.createComment(' field:uri '));
  if (videoUrl) {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.textContent = videoUrl;
    uriCell.appendChild(link);
  }

  // Row 1 is always present. Row 2 (placeholder) is only emitted when there is
  // an actual placeholder image — an EMPTY placeholder row makes md2jcr throw
  // ("Cannot read properties of null") because there is no content to map.
  const cells = [[uriCell]];

  if (placeholderSrc) {
    // Row 2: placeholder_image + placeholder_imageAlt (collapsed group)
    const placeholderCell = document.createDocumentFragment();
    placeholderCell.appendChild(document.createComment(' field:placeholder_image '));
    const picture = document.createElement('picture');
    const img = document.createElement('img');
    img.src = placeholderSrc;
    img.alt = placeholderAlt;
    picture.appendChild(img);
    placeholderCell.appendChild(picture);
    cells.push([placeholderCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'video-playlist', cells });
  element.replaceWith(block);
}
