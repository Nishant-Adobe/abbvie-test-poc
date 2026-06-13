export default function decorate(block) {
  // Extract authored content from the block table rows
  const rows = [...block.children];

  // Row 0: image cell
  const imageRow = rows[0];
  const imageCell = imageRow?.querySelector('div');
  const picture = imageCell?.querySelector('picture');

  // Row 1: text cell
  const textRow = rows[1];
  const textCell = textRow?.querySelector('div');
  const paragraphs = textCell ? [...textCell.querySelectorAll('p')] : [];

  // Extract text content
  const description = paragraphs.length > 1 ? paragraphs[1]?.textContent || '' : '';
  const ctaLink = textCell?.querySelector('a');
  const ctaText = ctaLink?.textContent || '';
  const ctaHref = ctaLink?.getAttribute('href') || '';
  const ctaTitle = ctaLink?.getAttribute('title') || ctaText;

  // Get image sources
  const imgEl = picture?.querySelector('img');
  const desktopSrc = imgEl?.getAttribute('src') || '';
  // Use mobile image if a source element with small media exists
  const mobileSrc = desktopSrc.replace('homepage-hero-desktop', 'homepage-hero-mobile');

  // Build the exact original DOM structure
  block.innerHTML = '';

  // Create .hero-container with all original classes
  const heroContainer = document.createElement('div');
  heroContainer.className = 'c-linz-white hero-container Linzess-home-hero-belly-bnr abbv-image-text-v2 abbv-image-swap';

  // Create .abbv-image-content-container-v2
  const imgContentContainer = document.createElement('div');
  imgContentContainer.className = 'abbv-image-content-container-v2';

  // Create responsive picture element
  const newPicture = document.createElement('picture');

  const sourceDesktop = document.createElement('source');
  sourceDesktop.setAttribute('media', '(min-width: 985px)');
  sourceDesktop.setAttribute('srcset', desktopSrc);
  sourceDesktop.className = 'abbv-image-text-img abbv-image-text-img-large';

  const sourceTablet = document.createElement('source');
  sourceTablet.setAttribute('media', '(min-width: 601px) and (max-width: 984px)');
  sourceTablet.setAttribute('srcset', desktopSrc);
  sourceTablet.className = 'abbv-image-text-img abbv-image-text-img-medium';

  const sourceMobile = document.createElement('source');
  sourceMobile.setAttribute('media', '(max-width: 600px)');
  sourceMobile.setAttribute('srcset', mobileSrc);
  sourceMobile.className = 'abbv-image-text-img abbv-image-text-img-small';

  const newImg = document.createElement('img');
  newImg.setAttribute('src', desktopSrc);
  newImg.setAttribute('alt', '');
  newImg.setAttribute('width', '2048');
  newImg.setAttribute('height', '1154');

  newPicture.append(sourceDesktop, sourceTablet, sourceMobile, newImg);
  imgContentContainer.appendChild(newPicture);

  // Create .abbv-image-text-content-container-v2.middle-middle
  const textContentContainer = document.createElement('div');
  textContentContainer.className = 'abbv-image-text-content-container-v2 middle-middle';

  // Create .abbv-image-text-content-v2
  const textContent = document.createElement('div');
  textContent.className = 'abbv-image-text-content-v2';

  // Create .abbv-image-text-display-v2
  const textDisplay = document.createElement('div');
  textDisplay.className = 'abbv-image-text-display-v2';

  // Create .abbv-stretched-card-body
  const cardBody = document.createElement('div');
  cardBody.className = 'abbv-stretched-card-body';

  // Subheading paragraph
  const pSubheading = document.createElement('p');
  pSubheading.className = 'tl-m';
  pSubheading.innerHTML = paragraphs[0] ? paragraphs[0].innerHTML : '';

  // Orange divider accent between eyebrow and H1 (original: <p><span class="divider">)
  const dividerP = document.createElement('p');
  const dividerSpan = document.createElement('span');
  dividerSpan.className = 'divider';
  dividerSpan.innerHTML = '&nbsp;';
  dividerP.appendChild(dividerSpan);

  // H1 heading — only the homepage hero uses the larger .home-hero-title (56px);
  // interior pages (e.g. why-linzess) use the default 40px h1 with no class.
  const isHomepage = /(^|\/)(index)?$/.test(window.location.pathname.replace(/\.html$/, ''));
  const newH1 = document.createElement('h1');
  newH1.className = isHomepage ? 'home-hero-title mb20 mb6-m tl-m' : 'mb20 mb6-m tl-m';
  const authoredH1 = textCell?.querySelector('h1');
  newH1.innerHTML = authoredH1 ? authoredH1.innerHTML : '';

  // Description paragraph
  const pDesc = document.createElement('p');
  pDesc.className = 'mb15-m tl-m';
  pDesc.textContent = description;

  // CTA button (only if link text and href exist)
  let ctaButton = null;
  if (ctaText && ctaHref) {
    ctaButton = document.createElement('a');
    ctaButton.className = 'abbv-button-primary abbv-icon-keyboard_arrow_right i-b abbv-image-text-link abbv-stretched-link';
    ctaButton.setAttribute('href', ctaHref);
    ctaButton.setAttribute('title', ctaTitle);
    ctaButton.setAttribute('target', '_self');
    ctaButton.textContent = ctaText;
  }

  // Assemble the DOM tree
  cardBody.append(pSubheading, dividerP, newH1, pDesc);
  if (ctaButton) cardBody.appendChild(ctaButton);
  textDisplay.appendChild(cardBody);
  textContent.appendChild(textDisplay);
  textContentContainer.appendChild(textContent);

  heroContainer.append(imgContentContainer, textContentContainer);
  block.appendChild(heroContainer);
}
