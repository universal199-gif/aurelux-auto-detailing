/* ==========================================================================
   AURELUX Auto Detailing — js/main.js
   Shared behaviour for every page. Vanilla JS, no dependencies.

   NOTE: the "js" class on <html> is added by a tiny inline script in each
   page's <head>, before the stylesheet loads. The CSS relies on it.

   CONTENTS
   1. Mobile navigation      4. Footer year
   2. Header on scroll       5. Missing-image fallback
   3. Scroll reveal          6. Before/after slider
   ========================================================================== */

(function () {
  'use strict';

  const $ = (selector, scope) => (scope || document).querySelector(selector);
  const $$ = (selector, scope) =>
    Array.prototype.slice.call((scope || document).querySelectorAll(selector));

  /* 1. MOBILE NAVIGATION -------------------------------------------------- */
  function initNav() {
    const header = $('.site-header');
    const toggle = $('.nav-toggle');
    const nav = $('#site-nav');
    if (!header || !toggle || !nav) return;

    const desktop = window.matchMedia('(min-width: 56em)'); // matches responsive.css

    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      header.classList.toggle('nav-open', open);
      document.body.classList.toggle('is-locked', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    toggle.addEventListener('click', () => setOpen(!isOpen()));

    // Close after choosing a link
    nav.addEventListener('click', (event) => {
      if (isOpen() && event.target.closest('a')) setOpen(false);
    });

    // Escape closes the menu and returns focus to the button
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Tapping outside the header closes the menu
    document.addEventListener('click', (event) => {
      if (isOpen() && !header.contains(event.target)) setOpen(false);
    });

    // Tabbing out of the header closes the menu
    document.addEventListener('focusin', (event) => {
      if (isOpen() && !header.contains(event.target)) setOpen(false);
    });

    // Resizing or rotating to a wide screen resets the menu state
    const onBreakpoint = (event) => {
      if (event.matches) setOpen(false);
    };
    if (desktop.addEventListener) desktop.addEventListener('change', onBreakpoint);
    else desktop.addListener(onBreakpoint); // older Safari

    setOpen(false);
  }

  /* 2. HEADER ON SCROLL --------------------------------------------------- */
  function initHeaderScroll() {
    const header = $('.site-header');
    if (!header) return;

    let ticking = false;
    const update = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  }

  /* 3. SCROLL REVEAL ------------------------------------------------------ */
  function initReveal() {
    const items = $$('.reveal');
    if (!items.length) return;

    // Without IntersectionObserver, simply show everything
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    // Small stagger between siblings (max 4 steps)
    items.forEach((el) => {
      const siblings = Array.prototype.filter.call(
        el.parentElement.children,
        (child) => child.classList.contains('reveal')
      );
      const index = siblings.indexOf(el);
      if (index > 0) el.style.transitionDelay = Math.min(index, 4) * 80 + 'ms';
    });

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    items.forEach((el) => observer.observe(el));
  }

  /* 4. FOOTER YEAR -------------------------------------------------------- */
  function initYear() {
    const year = $('#year');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  /* 5. MISSING-IMAGE FALLBACK --------------------------------------------- */
  // If an image file is missing, hide the browser's broken-image icon so the
  // neutral card background shows instead. This is only a safety net:
  // replace any missing files in assets/images/.
  function initImageFallback() {
    const hide = (img) => {
      img.style.opacity = '0';
    };

    $$('img').forEach((img) => {
      if (img.complete && img.naturalWidth === 0) hide(img);
    });

    // "error" does not bubble, so listen in the capture phase
    document.addEventListener(
      'error',
      (event) => {
        if (event.target && event.target.tagName === 'IMG') hide(event.target);
      },
      true
    );
  }

  /* 6. BEFORE / AFTER SLIDER ---------------------------------------------- */
  // Uses a real <input type="range">, so keyboard (arrows, Home, End,
  // PageUp/PageDown) and screen readers work. Pointer handling is added so
  // touch dragging is smooth. Vertical swipes still scroll the page.
  function initCompare() {
    $$('.compare').forEach((compare) => {
      const range = $('.compare__range', compare);
      if (!range) return;

      const update = () => {
        const value = Number(range.value);
        compare.style.setProperty('--pos', value + '%');
        range.setAttribute(
          'aria-valuetext',
          value + ' percent before, ' + (100 - value) + ' percent after'
        );
      };

      const setFromPointer = (clientX) => {
        const rect = compare.getBoundingClientRect();
        if (!rect.width) return;
        const percent = ((clientX - rect.left) / rect.width) * 100;
        range.value = String(Math.round(Math.min(100, Math.max(0, percent))));
        update();
      };

      let dragging = false;

      range.addEventListener('pointerdown', (event) => {
        dragging = true;
        if (range.setPointerCapture) range.setPointerCapture(event.pointerId);
        setFromPointer(event.clientX);
      });

      range.addEventListener('pointermove', (event) => {
        if (dragging) setFromPointer(event.clientX);
      });

      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((type) => {
        range.addEventListener(type, () => {
          dragging = false;
        });
      });

      range.addEventListener('input', update);
      update();
    });
  }

  /* INIT ------------------------------------------------------------------ */
  initNav();
  initHeaderScroll();
  initReveal();
  initYear();
  initImageFallback();
  initCompare();
})();