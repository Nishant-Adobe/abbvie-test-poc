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
  const bcAccount = '1029485116001';
  const bcPlayer = 'Mcp9TXMkPT';

  const row = block.querySelector(':scope > div');
  if (!row) return;
  const cells = [...row.children];
  const imageCell = cells[0];
  const textCell = cells[1];

  const img = imageCell?.querySelector('img');
  const posterSrc = img?.src || '';
  const videoId = img?.alt?.trim() || '';

  const container = document.createElement('div');
  container.className = 'abbv-flex-container-v2 flexbox-column-mobile flexbox-cards c-dark-purple flexbox-video-cards flexbox-video-cards--single';

  const flexboxItem = document.createElement('div');
  flexboxItem.className = 'flexboxitem-v2 parbase';

  const flexItem = document.createElement('div');
  flexItem.className = 'abbv-flex-item-v2 background-light-purple rounded-corners max-620';

  // Video player
  const videoPlayer = document.createElement('div');
  videoPlayer.className = 'abbv-video-player';
  videoPlayer.setAttribute('data-account', bcAccount);
  videoPlayer.setAttribute('data-player', bcPlayer);
  videoPlayer.setAttribute('data-video-id', videoId);

  const videoWrapper = document.createElement('div');
  videoWrapper.className = 'abbv-video-wrapper';

  // Poster
  const posterDiv = document.createElement('div');
  posterDiv.className = 'vjs-poster';
  if (posterSrc) {
    const posterImg = document.createElement('img');
    posterImg.src = posterSrc;
    posterImg.alt = '';
    posterImg.loading = 'lazy';
    posterDiv.appendChild(posterImg);
  }
  videoWrapper.appendChild(posterDiv);

  // Play button
  const playBtn = document.createElement('button');
  playBtn.className = 'vjs-big-play-button';
  playBtn.setAttribute('aria-label', 'Play Video');
  playBtn.innerHTML = '<span class="vjs-icon-placeholder"></span><span class="vjs-control-text">Play Video</span>';
  videoWrapper.appendChild(playBtn);

  videoPlayer.appendChild(videoWrapper);
  flexItem.appendChild(videoPlayer);

  // Card content (title + transcript link)
  const cardContent = document.createElement('div');
  cardContent.className = 'abbv-video-card-content';

  if (textCell) {
    const h3 = textCell.querySelector('h3');
    if (h3) cardContent.appendChild(h3.cloneNode(true));

    const transcriptLink = textCell.querySelector('a[href*="transcript"]');
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

  block.textContent = '';
  block.appendChild(container);

  // Click to play
  playBtn.addEventListener('click', () => {
    loadBrightcoveScript(bcAccount, bcPlayer).then(() => {
      const videoEl = document.createElement('video-js');
      videoEl.setAttribute('data-account', bcAccount);
      videoEl.setAttribute('data-player', bcPlayer);
      videoEl.setAttribute('data-embed', 'default');
      if (videoId && /^\d{10,}$/.test(videoId)) {
        videoEl.setAttribute('data-video-id', videoId);
      }
      videoEl.setAttribute('controls', '');
      videoEl.setAttribute('autoplay', '');
      videoEl.className = 'vjs-fluid';
      videoWrapper.innerHTML = '';
      videoWrapper.appendChild(videoEl);
      if (window.bc) {
        window.bc(videoEl);
      } else {
        const checkBc = setInterval(() => {
          if (window.bc) {
            clearInterval(checkBc);
            window.bc(videoEl);
          }
        }, 200);
        setTimeout(() => clearInterval(checkBc), 10000);
      }
    });
  });
}
