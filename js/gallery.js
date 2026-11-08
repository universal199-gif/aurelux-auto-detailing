/* ==========================================================================
   AURELUX Auto Detailing — js/gallery.js
   Gallery page only: category filters + accessible lightbox.
   Loaded after js/main.js. Everything is wrapped in a function, so nothing
   leaks into the global scope or conflicts with main.js.

   CONTENTS
   1. Setup & helpers     3. Lightbox
   2. Category filters    4. Start-up
   ========================================================================== */

(function () {
  'use strict';

  /* 1. SETUP & HELPERS ---------------------------------------------------- */
  const grid = document.getElementById('gallery-grid');
  const lightbox = document.getElementById('lightbox');
  if (!grid || !lightbox) return;

  const items = Array.prototype.slice.call(grid.querySelectorAll('.gallery-item'));
  const filterBar = document.getElementById('gallery-filters');
  const chips = filterBar
    ? Array.prototype.slice.call(filterBar.querySelectorAll('.filter-chip'))
    : [];
  const statusEl = document.getElementById('gallery-status');
  const emptyEl = document.getElementById('gallery-empty');

  const lbImg = document.getElementById('lightbox-img');
  const lbCaption = document.getElementById('lightbox-caption');
  const lbCounter = document.getElementById('lightbox-counter');
  const lbStatus = document.getElementById('lightbox-status');
  const btnClose = document.getElementById('lightbox-close');
  const btnPrev = document.getElementById('lightbox-prev');
  const btnNext = document.getElementById('lightbox-next');

  // Same 1x1 transparent image used in gallery.html
  const PLACEHOLDER =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canAnimate = () =>
    !motionQuery.matches && typeof Element.prototype.animate === 'function';

  // Small fade-in. Skipped entirely when the user prefers reduced motion.
  function fadeIn(el, duration, lift) {
    if (!canAnimate()) return;
    el.animate(
      [
        { opacity: 0, transform: lift ? 'translateY(10px)' : 'none' },
        { opacity: 1, transform: 'none' }
      ],
      { duration: duration, easing: 'ease-out' }
    );
  }

  // Read the data for one tile (image path, description, category, caption)
  function readItem(item) {
    const img = item.querySelector('img');
    const caption = item.querySelector('.gallery-item__caption');
    const categoryEl = caption ? caption.querySelector('span') : null;
    const category = categoryEl ? categoryEl.textContent.trim() : '';
    const title = caption
      ? Array.prototype.filter
          .call(caption.childNodes, (node) => node.nodeType === 3)
          .map((node) => node.textContent)
          .join('')
          .trim()
      : '';
    return {
      src: img ? img.getAttribute('src') : '',
      alt: img ? img.getAttribute('alt') || '' : '',
      category: category,
      title: title
    };
  }

  /* 2. CATEGORY FILTERS --------------------------------------------------- */
  function applyFilter(category, announce) {
    let shown = 0;

    items.forEach((item) => {
      const match = category === 'all' || item.getAttribute('data-category') === category;
      const wasHidden = item.hidden;
      item.hidden = !match;
      if (match) {
        shown += 1;
        if (wasHidden) fadeIn(item, 320, true);
      }
    });

    let label = 'All';
    chips.forEach((chip) => {
      const active = chip.getAttribute('data-filter') === category;
      chip.setAttribute('aria-pressed', String(active));
      if (active) label = chip.textContent.trim();
    });

    if (emptyEl) emptyEl.hidden = shown !== 0;

    if (announce && statusEl) {
      statusEl.textContent =
        'Showing ' + shown + ' of ' + items.length + ' illustrative images' +
        (category === 'all' ? '.' : ': ' + label + '.');
    }
  }

  /* 3. LIGHTBOX ----------------------------------------------------------- */
  const supportsDialog = typeof lightbox.showModal === 'function';

  let list = []; // visible tiles at the moment the lightbox opened
  let currentIndex = 0;
  let captionBase = '';
  let opener = null; // tile that opened the lightbox (focus returns here)

  function render(index) {
    const total = list.length;
    currentIndex = (index + total) % total;

    const data = readItem(list[currentIndex]);
    captionBase = data.category ? data.category + ': ' + data.title : data.title;

    lbCaption.textContent = captionBase;
    lbCounter.textContent = currentIndex + 1 + ' / ' + total;
    lbStatus.textContent =
      'Image ' + (currentIndex + 1) + ' of ' + total + '. ' + data.alt;

    lbImg.style.opacity = ''; // undo a hidden state left by a previous missing image
    lbImg.alt = data.alt;
    lbImg.src = data.src;

    btnPrev.hidden = total < 2;
    btnNext.hidden = total < 2;
  }

  function go(step) {
    if (list.length > 1) render(currentIndex + step);
  }

  function openLightbox(item) {
    // Very old browsers without <dialog>: fall back to opening the image itself
    if (!supportsDialog) {
      window.open(readItem(item).src, '_blank', 'noopener');
      return;
    }

    list = items.filter((tile) => !tile.hidden);
    opener = item;
    render(Math.max(0, list.indexOf(item)));

    lightbox.showModal();
    document.body.classList.add('is-locked');
    fadeIn(lightbox, 220, false);
    btnClose.focus();
  }

  // Image finished loading: gentle fade (ignore the blank placeholder)
  lbImg.addEventListener('load', () => {
    if (lbImg.getAttribute('src') !== PLACEHOLDER) fadeIn(lbImg, 260, false);
  });

  // Image file missing: keep the viewer working and say so in the caption
  lbImg.addEventListener('error', () => {
    if (lbImg.getAttribute('src') === PLACEHOLDER) return;
    lbImg.style.opacity = '0';
    lbCaption.textContent = captionBase + ' (image file not available)';
  });

  // Open from any tile (event delegation)
  grid.addEventListener('click', (event) => {
    const item = event.target.closest('.gallery-item');
    if (item) openLightbox(item);
  });

  btnClose.addEventListener('click', () => lightbox.close());
  btnPrev.addEventListener('click', () => go(-1));
  btnNext.addEventListener('click', () => go(1));

  // Click on the dark backdrop or empty space closes; the image, caption
  // and buttons do not.
  lightbox.addEventListener('click', (event) => {
    if (event.target.closest('.lightbox__img, .lightbox__caption, .lightbox__btn')) return;
    lightbox.close();
  });

  // Arrow keys move between images (Escape is handled natively by <dialog>)
  lightbox.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(1);
    }
  });

  // Swipe left/right on touch screens (buttons remain available too)
  let touchX = 0;
  let touchY = 0;
  let touching = false;

  lightbox.addEventListener(
    'touchstart',
    (event) => {
      if (event.touches.length !== 1 || event.target.closest('.lightbox__btn')) {
        touching = false;
        return;
      }
      touching = true;
      touchX = event.touches[0].clientX;
      touchY = event.touches[0].clientY;
    },
    { passive: true }
  );

  lightbox.addEventListener(
    'touchend',
    (event) => {
      if (!touching) return;
      touching = false;
      const dx = event.changedTouches[0].clientX - touchX;
      const dy = event.changedTouches[0].clientY - touchY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        go(dx < 0 ? 1 : -1);
      }
    },
    { passive: true }
  );

  // Fires for every way of closing (button, Escape, backdrop)
  lightbox.addEventListener('close', () => {
    // main.js uses the same class while the mobile menu is open; leave it alone then
    if (!document.querySelector('.site-header.nav-open')) {
      document.body.classList.remove('is-locked');
    }

    lbImg.style.opacity = '';
    lbImg.alt = '';
    lbImg.src = PLACEHOLDER;

    if (opener && !opener.hidden) opener.focus();
    opener = null;
  });

  /* 4. START-UP ----------------------------------------------------------- */
  if (filterBar) {
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        applyFilter(chip.getAttribute('data-filter'), true);
      });
    });
    filterBar.hidden = false; // reveal the filters only now that they work
    applyFilter('all', false);
  }
})();