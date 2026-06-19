/* Brand JS override — RINVOQ · hero-pharma
 *
 * REPLACES the base blocks/hero-pharma/hero-pharma.js for the RINVOQ brand
 * (registered in blocks/block-brand-overrides.json -> jsOverrides.hero-pharma).
 *
 * The live RINVOQ homepage hero is a 6-slide auto-rotating carousel (owl-carousel
 * on the source). Every slide shares the SAME copy — "RINVOQ / RELIEF / See how
 * RINVOQ helps tame symptoms in 9 conditions / with a ONCE-DAILY PILL" — over a
 * full-bleed photo; the source lazy-loads a per-slide photo. We reproduce the
 * carousel mechanics (6 slides, autoplay, prev/next arrows, red dots) and render
 * the authored hero copy + photo on every slide. The single authored hero photo
 * is reused across slides (the source slides differ only by a subtly different,
 * lazy-loaded photo and identical text).
 *
 * DOM per slide mirrors the base decorator's .hero-container so the existing
 * blocks/rinvoq/hero-pharma.css (charcoal band, left-pinned copy, RELIEF
 * brushstroke pseudo-element, full-bleed cover photo) applies unchanged.
 */

const AUTOPLAY_MS = 6000;

/* The live RINVOQ hero rotates 2 slides (RA + PsA photos); both share identical
   copy. Slide 1's photo comes from the authored content; the rest are brand
   assets self-hosted under /icons/rinvoq/hero/ (never hot-linked cross-origin).
   Add more { desktop, mobile } entries here to add slides. */
const EXTRA_SLIDE_PHOTOS = [
  {
    desktop: '/icons/rinvoq/hero/psa-hero-desktop.jpg',
    mobile: '/icons/rinvoq/hero/psa-hero-mobile.jpg',
  },
];

function buildSlide(desktopSrc, mobileSrc, subheadingHTML, h1HTML, description, isHomepage) {
  const slide = document.createElement('div');
  slide.className = 'rinvoq-hero-slide';

  const heroContainer = document.createElement('div');
  heroContainer.className = 'c-linz-white hero-container Linzess-home-hero-belly-bnr abbv-image-text-v2 abbv-image-swap';

  // Photo
  const imgContentContainer = document.createElement('div');
  imgContentContainer.className = 'abbv-image-content-container-v2';
  const picture = document.createElement('picture');
  const sDesktop = document.createElement('source');
  sDesktop.setAttribute('media', '(min-width: 985px)');
  sDesktop.setAttribute('srcset', desktopSrc);
  const sTablet = document.createElement('source');
  sTablet.setAttribute('media', '(min-width: 601px) and (max-width: 984px)');
  sTablet.setAttribute('srcset', desktopSrc);
  const sMobile = document.createElement('source');
  sMobile.setAttribute('media', '(max-width: 600px)');
  sMobile.setAttribute('srcset', mobileSrc);
  const img = document.createElement('img');
  img.setAttribute('src', desktopSrc);
  img.setAttribute('alt', '');
  img.setAttribute('loading', 'lazy');
  picture.append(sDesktop, sTablet, sMobile, img);
  imgContentContainer.appendChild(picture);

  // Text overlay
  const textContentContainer = document.createElement('div');
  textContentContainer.className = 'abbv-image-text-content-container-v2 middle-middle';
  const textContent = document.createElement('div');
  textContent.className = 'abbv-image-text-content-v2';
  const textDisplay = document.createElement('div');
  textDisplay.className = 'abbv-image-text-display-v2';
  const cardBody = document.createElement('div');
  cardBody.className = 'abbv-stretched-card-body';

  const pSubheading = document.createElement('p');
  pSubheading.className = 'tl-m';
  pSubheading.innerHTML = subheadingHTML;

  const dividerP = document.createElement('p');
  const dividerSpan = document.createElement('span');
  dividerSpan.className = 'divider';
  dividerSpan.innerHTML = '&nbsp;';
  dividerP.appendChild(dividerSpan);

  const h1 = document.createElement('h1');
  h1.className = isHomepage ? 'home-hero-title mb20 mb6-m tl-m' : 'mb20 mb6-m tl-m';
  h1.innerHTML = h1HTML;

  const pDesc = document.createElement('p');
  pDesc.className = 'mb15-m tl-m';
  pDesc.textContent = description;

  cardBody.append(pSubheading, dividerP, h1, pDesc);
  textDisplay.appendChild(cardBody);
  textContent.appendChild(textDisplay);
  textContentContainer.appendChild(textContent);

  heroContainer.append(imgContentContainer, textContentContainer);
  slide.appendChild(heroContainer);
  return slide;
}

export default function decorate(block) {
  const rows = [...block.children];
  const imageCell = rows[0]?.querySelector('div');
  const picture = imageCell?.querySelector('picture');
  const textCell = rows[1]?.querySelector('div');
  const paragraphs = textCell ? [...textCell.querySelectorAll('p')] : [];

  const imgEl = picture?.querySelector('img');
  const desktopSrc = imgEl?.getAttribute('src') || '';
  const mobileSrc = desktopSrc.replace('homepage-hero-desktop', 'homepage-hero-mobile');

  const subheadingHTML = paragraphs[0] ? paragraphs[0].innerHTML : '';
  const description = paragraphs.length > 1 ? paragraphs[1]?.textContent || '' : '';
  const authoredH1 = textCell?.querySelector('h1');
  const h1HTML = authoredH1 ? authoredH1.innerHTML : '';
  const isHomepage = /(^|\/)(index)?$/.test(window.location.pathname.replace(/\.html$/, ''));

  block.innerHTML = '';

  const carousel = document.createElement('div');
  carousel.className = 'rinvoq-hero-carousel';

  const track = document.createElement('div');
  track.className = 'rinvoq-hero-track';

  // Slide 1 uses the authored hero photo; the rest use the brand hero photos.
  const slidePhotos = [
    { desktop: desktopSrc, mobile: mobileSrc },
    ...EXTRA_SLIDE_PHOTOS,
  ];
  const slideCount = slidePhotos.length;

  const slides = [];
  slidePhotos.forEach((photo, i) => {
    const slide = buildSlide(
      photo.desktop,
      photo.mobile,
      subheadingHTML,
      h1HTML,
      description,
      isHomepage,
    );
    if (i === 0) slide.classList.add('is-active');
    track.appendChild(slide);
    slides.push(slide);
  });
  carousel.appendChild(track);

  // Prev/next arrows
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'rinvoq-hero-arrow rinvoq-hero-prev';
  prev.setAttribute('aria-label', 'Previous slide');
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'rinvoq-hero-arrow rinvoq-hero-next';
  next.setAttribute('aria-label', 'Next slide');
  carousel.append(prev, next);

  // Red dots
  const dots = document.createElement('div');
  dots.className = 'rinvoq-hero-dots';
  const dotEls = [];
  for (let i = 0; i < slideCount; i += 1) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'rinvoq-hero-dot';
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    if (i === 0) dot.classList.add('is-active');
    dots.appendChild(dot);
    dotEls.push(dot);
  }
  carousel.appendChild(dots);

  let current = 0;
  let timer = null;

  function render() {
    track.style.transform = `translateX(-${current * 100}%)`;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
    dotEls.forEach((d, i) => d.classList.toggle('is-active', i === current));
  }

  function goTo(index) {
    current = (index + slideCount) % slideCount;
    render();
  }

  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  function start() {
    stop();
    timer = setInterval(() => goTo(current + 1), AUTOPLAY_MS);
  }

  prev.addEventListener('click', () => { goTo(current - 1); start(); });
  next.addEventListener('click', () => { goTo(current + 1); start(); });
  dotEls.forEach((d, i) => d.addEventListener('click', () => { goTo(i); start(); }));
  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);

  block.appendChild(carousel);
  render();

  // Only run the rotator/controls when there is more than one slide.
  if (slideCount > 1) {
    start();
  } else {
    prev.remove();
    next.remove();
    dots.remove();
  }
}
