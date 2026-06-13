/*
 * Video Playlist Block
 * Show a video referenced by a link
 * https://www.hlx.live/developer/block-collection/video
 */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function embedYoutube(url, autoplay, background) {
  const usp = new URLSearchParams(url.search);
  let suffix = '';
  if (background || autoplay) {
    const suffixParams = {
      autoplay: autoplay ? '1' : '0',
      mute: background ? '1' : '0',
      controls: background ? '0' : '1',
      disablekb: background ? '1' : '0',
      loop: background ? '1' : '0',
      playsinline: background ? '1' : '0',
    };
    suffix = `&${Object.entries(suffixParams).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;
  }
  let vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
  const embed = url.pathname;
  if (url.origin.includes('youtu.be')) {
    [, vid] = url.pathname.split('/');
  }

  const temp = document.createElement('div');
  temp.innerHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&v=${vid}${suffix}` : embed}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; picture-in-picture" allowfullscreen="" scrolling="no" title="Content from Youtube" loading="lazy"></iframe>
    </div>`;
  return temp.children.item(0);
}

function embedVimeo(url, autoplay, background) {
  const [, video] = url.pathname.split('/');
  let suffix = '';
  if (background || autoplay) {
    const suffixParams = {
      autoplay: autoplay ? '1' : '0',
      background: background ? '1' : '0',
    };
    suffix = `?${Object.entries(suffixParams).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;
  }
  const temp = document.createElement('div');
  temp.innerHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://player.vimeo.com/video/${video}${suffix}"
      style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
      frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen
      title="Content from Vimeo" loading="lazy"></iframe>
    </div>`;
  return temp.children.item(0);
}

function embedBrightcove(url, autoplay) {
  const src = new URL(url.href);
  if (autoplay) src.searchParams.set('autoplay', 'true');
  const temp = document.createElement('div');
  temp.innerHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="${src.href}" allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
      allowfullscreen title="Content from Brightcove" loading="lazy"></iframe>
    </div>`;
  return temp.children.item(0);
}

function getVideoElement(source, autoplay, background) {
  const video = document.createElement('video');
  video.setAttribute('controls', '');
  if (autoplay) video.setAttribute('autoplay', '');
  if (background) {
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.removeAttribute('controls');
    video.addEventListener('canplay', () => {
      video.muted = true;
      if (autoplay) video.play();
    });
  }

  const sourceEl = document.createElement('source');
  sourceEl.setAttribute('src', source);
  sourceEl.setAttribute('type', `video/${source.split('.').pop()}`);
  video.append(sourceEl);

  return video;
}

const loadVideoEmbed = (block, link, autoplay, background) => {
  if (block.dataset.embedLoaded === 'true') {
    return;
  }
  const url = new URL(link);

  const isYoutube = link.includes('youtube') || link.includes('youtu.be');
  const isVimeo = link.includes('vimeo');
  const isBrightcove = link.includes('brightcove.net');

  if (isBrightcove) {
    const embedWrapper = embedBrightcove(url, autoplay);
    block.append(embedWrapper);
    embedWrapper.querySelector('iframe').addEventListener('load', () => {
      block.dataset.embedLoaded = true;
    });
  } else if (isYoutube) {
    const embedWrapper = embedYoutube(url, autoplay, background);
    block.append(embedWrapper);
    embedWrapper.querySelector('iframe').addEventListener('load', () => {
      block.dataset.embedLoaded = true;
    });
  } else if (isVimeo) {
    const embedWrapper = embedVimeo(url, autoplay, background);
    block.append(embedWrapper);
    embedWrapper.querySelector('iframe').addEventListener('load', () => {
      block.dataset.embedLoaded = true;
    });
  } else {
    const videoEl = getVideoElement(link, autoplay, background);
    block.append(videoEl);
    videoEl.addEventListener('canplay', () => {
      block.dataset.embedLoaded = true;
    });
  }
};

/*
 * Custom AbbVie video carousel (matches linzess.com "Patient Experiences").
 * For a Brightcove *playlist* URL we recreate the original layout — a main
 * player, a purple metadata panel (quote / person / transcript) and a
 * thumbnail rail with prev/next arrows — instead of the stock playlist iframe.
 */

// Parse "https://players.brightcove.net/{account}/{player}_default/index.html?playlistId={id}"
function parseBrightcovePlaylist(link) {
  const url = new URL(link);
  const playlistId = url.searchParams.get('playlistId');
  if (!playlistId || !url.hostname.includes('brightcove.net')) return null;
  const [, account, playerSeg] = url.pathname.split('/');
  const player = (playerSeg || '').replace(/_default$/, '');
  return { account, player, playlistId };
}

// The Brightcove Playback API needs the player's public policy key; read it
// from the player config JS once and cache the promise so multiple carousels
// on the same page share a single config fetch.
const policyKeyCache = new Map();
function fetchPolicyKey(account, player) {
  const cacheId = `${account}/${player}`;
  if (!policyKeyCache.has(cacheId)) {
    const cfg = `https://players.brightcove.net/${account}/${player}_default/index.min.js`;
    policyKeyCache.set(cacheId, fetch(cfg).then((r) => r.text()).then((js) => {
      const m = js.match(/policyKey["']?\s*[:=]\s*["'](BCpk[A-Za-z0-9_-]+)/) || js.match(/(BCpk[A-Za-z0-9_-]+)/);
      return m ? m[1] : null;
    }));
  }
  return policyKeyCache.get(cacheId);
}

async function fetchPlaylist({ account, player, playlistId }) {
  const policyKey = await fetchPolicyKey(account, player);
  if (!policyKey) return [];
  const api = `https://edge.api.brightcove.com/playback/v1/accounts/${account}/playlists/${playlistId}?limit=100`;
  const res = await fetch(api, { headers: { Accept: `application/json;pk=${policyKey}` } });
  const json = await res.json();
  return json.videos || [];
}

// description is HTML: <p>"quote" <span>Name, age</span> <span>Prescribed …</span></p>
function parseMeta(description) {
  const tmp = document.createElement('div');
  tmp.innerHTML = description || '';
  const spanEls = [...tmp.querySelectorAll('span')];
  const spans = spanEls.map((s) => s.textContent.trim());
  spanEls.forEach((s) => s.remove());
  const quote = tmp.textContent.replace(/\s+/g, ' ').trim();
  return { quote, person: spans[0] || '', prescribed: spans[1] || '' };
}

function playerIframeSrc(account, player, videoId, autoplay) {
  const src = new URL(`https://players.brightcove.net/${account}/${player}_default/index.html`);
  src.searchParams.set('videoId', videoId);
  if (autoplay) src.searchParams.set('autoplay', 'true');
  return src.href;
}

function buildCarousel(block, ctx, videos) {
  const { account, player } = ctx;
  block.classList.add('video-carousel');

  const main = document.createElement('div');
  main.className = 'video-carousel-main';

  const playerEl = document.createElement('div');
  playerEl.className = 'video-carousel-player';

  const meta = document.createElement('div');
  meta.className = 'video-carousel-meta';

  main.append(playerEl, meta);

  const rail = document.createElement('div');
  rail.className = 'video-carousel-rail';

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'video-carousel-prev';
  prev.setAttribute('aria-label', 'Previous Video');

  const list = document.createElement('ul');
  list.className = 'video-carousel-thumbs';

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'video-carousel-next';
  next.setAttribute('aria-label', 'Next Video');

  rail.append(prev, list, next);

  const select = (index, autoplay) => {
    const video = videos[index];
    const { quote, person, prescribed } = parseMeta(video.description);

    // Player: poster + play overlay until clicked, then the Brightcove iframe.
    playerEl.innerHTML = '';
    if (autoplay) {
      const wrap = document.createElement('div');
      wrap.className = 'video-carousel-embed';
      wrap.innerHTML = `<iframe src="${playerIframeSrc(account, player, video.id, true)}"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen
        title="${video.name}" loading="lazy"></iframe>`;
      playerEl.append(wrap);
    } else {
      const poster = document.createElement('button');
      poster.type = 'button';
      poster.className = 'video-carousel-poster';
      poster.setAttribute('aria-label', `Play ${video.name}`);
      poster.style.backgroundImage = `url("${video.poster}")`;
      poster.innerHTML = '<span class="video-carousel-play"></span>';
      poster.addEventListener('click', () => select(index, true));
      playerEl.append(poster);
    }

    // Metadata panel.
    meta.innerHTML = '';
    const q = document.createElement('p');
    q.className = 'video-carousel-quote';
    q.textContent = quote;
    const who = document.createElement('p');
    who.className = 'video-carousel-person';
    who.textContent = person;
    const presc = document.createElement('p');
    presc.className = 'video-carousel-prescribed';
    presc.textContent = prescribed;
    meta.append(q, who, presc);
    if (video.long_description) {
      const tr = document.createElement('a');
      tr.className = 'video-carousel-transcript';
      tr.href = video.long_description;
      tr.textContent = 'View Transcript';
      meta.append(tr);
    }

    // Active thumbnail.
    [...list.children].forEach((li, i) => li.classList.toggle('active', i === index));
  };

  videos.forEach((video, index) => {
    const li = document.createElement('li');
    li.className = 'video-carousel-thumb';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', `Play ${video.name}`);
    btn.style.backgroundImage = `url("${video.poster}")`;
    btn.innerHTML = '<span class="video-carousel-play"></span>';
    btn.addEventListener('click', () => select(index, true));

    const caption = document.createElement('span');
    caption.className = 'video-carousel-thumb-title';
    caption.textContent = video.name;

    li.append(btn, caption);
    list.append(li);
  });

  // Rail scrolling.
  const scrollByCard = (dir) => {
    const card = list.querySelector('li');
    const amount = card ? card.offsetWidth + 16 : 240;
    list.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };
  prev.addEventListener('click', () => scrollByCard(-1));
  next.addEventListener('click', () => scrollByCard(1));

  block.append(main, rail);
  select(0, false);
}

export default async function decorate(block) {
  const placeholder = block.querySelector('picture');
  const link = block.querySelector('a').href;
  block.textContent = '';
  block.dataset.embedLoaded = false;

  const autoplay = block.classList.contains('autoplay');

  // Brightcove *playlist* → custom AbbVie carousel (player + meta panel + rail).
  const playlistCtx = parseBrightcovePlaylist(link);
  if (playlistCtx) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        fetchPlaylist(playlistCtx)
          .then((videos) => {
            if (videos.length) buildCarousel(block, playlistCtx, videos);
            else loadVideoEmbed(block, link, false, false);
          })
          .catch(() => loadVideoEmbed(block, link, false, false));
      }
    });
    observer.observe(block);
    return;
  }

  // Single Brightcove video → embed iframe directly on scroll.
  const isBrightcove = link.includes('brightcove.net');
  if (isBrightcove) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        loadVideoEmbed(block, link, false, false);
      }
    });
    observer.observe(block);
    return;
  }

  if (placeholder) {
    block.classList.add('placeholder');
    const wrapper = document.createElement('div');
    wrapper.className = 'video-playlist-placeholder';
    wrapper.append(placeholder);

    if (!autoplay) {
      wrapper.insertAdjacentHTML(
        'beforeend',
        '<div class="video-playlist-placeholder-play"><button type="button" title="Play"></button></div>',
      );
      wrapper.addEventListener('click', () => {
        wrapper.remove();
        loadVideoEmbed(block, link, true, false);
      });
    }
    block.append(wrapper);
  }

  if (!placeholder || autoplay) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        const playOnLoad = autoplay && !prefersReducedMotion.matches;
        loadVideoEmbed(block, link, playOnLoad, autoplay);
      }
    });
    observer.observe(block);
  }
}
