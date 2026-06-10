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

    const img = imageCell?.querySelector('img');
    const posterSrc = img?.src || '';

    // Video player section with poster + play button overlay
    const videoPlayer = document.createElement('div');
    videoPlayer.className = 'abbv-video-player home-video-cards';
    videoPlayer.setAttribute('data-account', bcAccount);
    videoPlayer.setAttribute('data-player', bcPlayer);

    const videoWrapper = document.createElement('div');
    videoWrapper.className = 'abbv-video-wrapper';

    // Poster image
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

    // Play button overlay
    const playBtn = document.createElement('button');
    playBtn.className = 'vjs-big-play-button';
    playBtn.setAttribute('aria-label', 'Play Video');
    playBtn.innerHTML = '<span class="vjs-icon-placeholder"></span><span class="vjs-control-text">Play Video</span>';
    videoWrapper.appendChild(playBtn);

    // Video title overlay label
    const h3 = textCell?.querySelector('h3');
    if (h3) {
      const titleOverlay = document.createElement('div');
      titleOverlay.className = 'vjs-dock-title';
      titleOverlay.textContent = h3.textContent;
      videoWrapper.appendChild(titleOverlay);
    }

    videoPlayer.appendChild(videoWrapper);
    flexItem.appendChild(videoPlayer);

    // Card content section
    const cardContent = document.createElement('div');
    cardContent.className = 'abbv-video-card-content';

    if (textCell) {
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

    // Extract video ID from poster URL path segment or img alt
    const videoId = img?.alt?.trim() || '';
    if (!videoId || !/^\d{10,}$/.test(videoId)) {
      const match = posterSrc.match(/\/static\/\d+\/([a-f0-9-]+)\//);
      if (match) {
        videoPlayer.setAttribute('data-poster-id', match[1]);
      }
    }
    videoPlayer.setAttribute('data-video-id', videoId);

    // Click-to-play: load Brightcove on play button click
    playBtn.addEventListener('click', () => {
      const vid = videoPlayer.getAttribute('data-video-id');
      loadBrightcoveScript(bcAccount, bcPlayer).then(() => {
        const videoEl = document.createElement('video-js');
        videoEl.setAttribute('data-account', bcAccount);
        videoEl.setAttribute('data-player', bcPlayer);
        videoEl.setAttribute('data-embed', 'default');
        if (vid && /^\d{10,}$/.test(vid)) {
          videoEl.setAttribute('data-video-id', vid);
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
  });

  block.textContent = '';
  block.appendChild(container);
}
