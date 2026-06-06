function loadBrightcoveScript(account, player) {
  if (document.querySelector('script[src*="players.brightcove"]')) return Promise.resolve();
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = `https://players.brightcove.net/${account}/${player}_default/index.min.js`;
    script.onload = resolve;
    script.onerror = resolve;
    document.head.appendChild(script);
  });
}

export default function decorate(block) {
  // Read Brightcove config from block metadata (data attributes on the block div)
  const meta = (name) => document.querySelector(`meta[name="${name}"]`)?.content || '';
  const bcAccount = block.getAttribute('data-bc-account') || meta('bc-account');
  const bcPlayer = block.getAttribute('data-bc-player') || meta('bc-player');

  const container = document.createElement('div');
  container.className = 'abbv-flex-container-v2 flexbox-column-mobile flexbox-cards c-dark-purple flexbox-video-cards home-flexbox-column';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const imageCell = cells[0];
    const textCell = cells[1];

    const flexboxItem = document.createElement('div');
    flexboxItem.className = 'flexboxitem-v2 parbase';

    const flexItem = document.createElement('div');
    flexItem.className = 'abbv-flex-item-v2 background-light-purple rounded-corners';

    // Extract video ID from authored content
    // Convention: author puts video ID in the image alt text or as a data attribute
    // Fallback: extract from Brightcove poster URL pattern
    const img = imageCell?.querySelector('img');
    let videoId = '';

    // Check if alt text contains a video ID (numeric string)
    const altText = img?.getAttribute('alt') || '';
    if (/^\d{10,}$/.test(altText.trim())) {
      videoId = altText.trim();
    }

    // Check for data-video-id on the image or cell
    if (!videoId) {
      videoId = imageCell?.getAttribute('data-video-id')
        || img?.getAttribute('data-video-id')
        || '';
    }

    // Extract from Brightcove poster URL pattern (e.g., /static/ACCOUNT_ID/...)
    if (!videoId && img?.src) {
      const bcMatch = img.src.match(/\/static\/(\d+)\//);
      if (bcMatch) {
        videoId = ''; // Account ID not video ID from poster URL
      }
    }

    // Video player section
    const videoPlayer = document.createElement('div');
    videoPlayer.className = 'abbv-video-player home-video-cards';

    const videoWrapper = document.createElement('div');
    videoWrapper.className = 'abbv-video-wrapper';

    if (videoId) {
      const videoEl = document.createElement('video-js');
      videoEl.setAttribute('data-account', bcAccount);
      videoEl.setAttribute('data-player', bcPlayer);
      videoEl.setAttribute('data-embed', 'default');
      videoEl.setAttribute('data-video-id', videoId);
      videoEl.setAttribute('controls', '');
      videoEl.className = 'vjs-fluid';
      videoWrapper.appendChild(videoEl);
    } else if (img) {
      // Fallback: show poster image
      const posterDiv = document.createElement('div');
      posterDiv.className = 'vjs-poster';
      const posterImg = document.createElement('img');
      const isExternal = img.src.startsWith('http')
        && !img.src.includes(window.location.hostname);
      posterImg.src = isExternal ? img.src : img.src;
      posterImg.alt = img.alt || '';
      posterDiv.appendChild(posterImg);
      videoWrapper.appendChild(posterDiv);
    }

    videoPlayer.appendChild(videoWrapper);
    flexItem.appendChild(videoPlayer);

    // Card content section
    const cardContent = document.createElement('div');
    cardContent.className = 'abbv-video-card-content';

    if (textCell) {
      const h3 = textCell.querySelector('h3');
      if (h3) cardContent.appendChild(h3.cloneNode(true));

      textCell.querySelectorAll(':scope > p').forEach((p) => {
        if (p.classList.contains('button-container')) return;
        if (p.querySelector('picture')) return;
        const clonedP = p.cloneNode(true);
        clonedP.querySelectorAll('a.button').forEach((a) => {
          a.classList.remove('button', 'primary', 'secondary');
        });
        cardContent.appendChild(clonedP);
      });

      const transcriptLink = textCell.querySelector('.button-container a')
        || textCell.querySelector('a[href*="transcript"]');
      if (transcriptLink) {
        const plainLink = document.createElement('a');
        plainLink.href = transcriptLink.href;
        plainLink.textContent = transcriptLink.textContent;
        plainLink.className = 'video-transcript-link';
        cardContent.appendChild(plainLink);
      }
    }

    flexItem.appendChild(cardContent);
    flexboxItem.appendChild(flexItem);
    container.appendChild(flexboxItem);
  });

  block.textContent = '';
  block.appendChild(container);

  // Load Brightcove SDK if any videos exist
  if (container.querySelector('video-js')) {
    loadBrightcoveScript(bcAccount, bcPlayer);
  }
}
