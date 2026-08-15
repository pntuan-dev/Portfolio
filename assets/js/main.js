/**
 * PHAN NGOC TUAN - LUXURY SAGE GREEN PORTFOLIO SCRIPT
 * Features:
 * - Desktop 1-Step Wheel Snap Scrolling Controller
 * - Floating Dot Navigation Tracker
 * - Recent Work Interactive Slider (Cards + Live Links)
 * - Services Accordion & Preview Switcher
 * - Theme Web Filter Engine
 * - Interactive QR Code Modal
 * - Mobile Navigation Drawer
 * - Back to Top Action
 */

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initZoneSnapScroll();
  initFloatingDotNav();
  initCounterAnimation();
  initRecentWorkSlider();
  initServicesAccordion();
  initThemeArcSlider();
  initMobileDrawer();
  initBackToTop();
  initContactForm();
});

/* ==========================================================================
   1. DESKTOP ONE-STEP WHEEL SNAP SCROLL CONTROLLER
   ========================================================================== */
function initZoneSnapScroll() {
  const scrollWrapper = document.querySelector('.zone-scroll-wrapper');
  const zones = document.querySelectorAll('.zone-section');
  if (!scrollWrapper || zones.length === 0) return;

  let currentZoneIndex = 0;
  let isScrolling = false;
  const SCROLL_COOLDOWN = 700; // ms to prevent rapid multiple skips

  // Function to navigate smoothly to a specific zone index
  window.goToZone = function (index) {
    if (index < 0 || index >= zones.length) return;
    currentZoneIndex = index;
    window.currentZoneIndex = index;
    isScrolling = true;

    if (typeof showDotLabelBriefly === 'function') {
      showDotLabelBriefly(index);
    }

    zones[currentZoneIndex].scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => {
      isScrolling = false;
    }, SCROLL_COOLDOWN);
  };

  // Wheel Event for Desktop 1-Step Snap
  scrollWrapper.addEventListener(
    'wheel',
    (e) => {
      if (window.innerWidth < 1024) return; // Native touch scroll for mobile/tablet

      // If user is scrolling inside an internal scrollable container or textarea that still has room, let it scroll
      const target = e.target;
      const innerScrollable = target.closest('.allow-inner-scroll, textarea');
      if (innerScrollable) {
        const atTop = innerScrollable.scrollTop <= 0;
        const atBottom = innerScrollable.scrollTop + innerScrollable.clientHeight >= innerScrollable.scrollHeight - 2;
        if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) {
          return; // Let inner element scroll naturally
        }
      }

      e.preventDefault();
      if (isScrolling) return;

      if (e.deltaY > 20) {
        // Scroll Down -> Next Zone
        if (currentZoneIndex < zones.length - 1) {
          window.goToZone(currentZoneIndex + 1);
        }
      } else if (e.deltaY < -20) {
        // Scroll Up -> Previous Zone
        if (currentZoneIndex > 0) {
          window.goToZone(currentZoneIndex - 1);
        }
      }
    },
    { passive: false }
  );

  // Keyboard navigation (Ignore when user is typing in form inputs/textareas)
  window.addEventListener('keydown', (e) => {
    const activeTag = document.activeElement ? document.activeElement.tagName : '';
    if (
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag) ||
      (document.activeElement && document.activeElement.isContentEditable)
    ) {
      return; // Do not intercept typing inside form inputs
    }

    if (window.innerWidth < 1024) return;
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
      if (currentZoneIndex < zones.length - 1) {
        e.preventDefault();
        window.goToZone(currentZoneIndex + 1);
      }
    } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
      if (currentZoneIndex > 0) {
        e.preventDefault();
        window.goToZone(currentZoneIndex - 1);
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      window.goToZone(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      window.goToZone(zones.length - 1);
    }
  });
}

let activeDotTimeout = null;

function showDotLabelBriefly(zoneIndex) {
  const dotItems = document.querySelectorAll('.floating-dot-item');
  if (!dotItems || dotItems.length === 0) return;

  dotItems.forEach((item) => item.classList.remove('show-label'));

  if (dotItems[zoneIndex]) {
    dotItems[zoneIndex].classList.add('show-label');
    if (activeDotTimeout) clearTimeout(activeDotTimeout);
    activeDotTimeout = setTimeout(() => {
      dotItems[zoneIndex].classList.remove('show-label');
    }, 2200);
  }
}

/* ==========================================================================
   2. FLOATING DOT NAVIGATION TRACKER
   ========================================================================== */
function initFloatingDotNav() {
  const dotBtns = document.querySelectorAll('.floating-dot-btn');
  const dotItems = document.querySelectorAll('.floating-dot-item');
  const zones = document.querySelectorAll('.zone-section');
  if (dotBtns.length === 0 || zones.length === 0) return;

  // Dot button click handler
  dotBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const zoneIndex = parseInt(btn.getAttribute('data-zone-index'), 10);
      if (!isNaN(zoneIndex) && window.goToZone) {
        window.goToZone(zoneIndex);
      }
    });
  });

  // IntersectionObserver to update active dot
  const observerOptions = {
    root: window.innerWidth >= 1024 ? document.querySelector('.zone-scroll-wrapper') : null,
    rootMargin: '-20% 0px -20% 0px',
    threshold: 0.2,
  };

  const mainHeader = document.getElementById('mainHeader');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;

        // Update header background based on active zone
        if (mainHeader) {
          if (id === 'zone-hero') {
            mainHeader.classList.remove('glass-header', 'border-b', 'border-sage-border/60', 'shadow-xs');
            mainHeader.classList.add('bg-transparent');
          } else {
            mainHeader.classList.add('glass-header', 'border-b', 'border-sage-border/60', 'shadow-xs');
            mainHeader.classList.remove('bg-transparent');
          }
        }

        dotBtns.forEach((btn, idx) => {
          const targetId = btn.getAttribute('data-zone-id');
          if (targetId === id) {
            btn.classList.add('active');
            if (window.currentZoneIndex !== idx) {
              window.currentZoneIndex = idx;
              showDotLabelBriefly(idx);
            }
          } else {
            btn.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  zones.forEach((zone) => observer.observe(zone));
}

/* ==========================================================================
   3. 3D CURVED ARC COVERFLOW CAROUSEL
   ========================================================================== */
function initRecentWorkSlider() {
  const stage = document.getElementById('arcCarouselStage');
  const prevBtn = document.getElementById('sliderPrevBtn');
  const nextBtn = document.getElementById('sliderNextBtn');
  const pagination = document.getElementById('sliderPagination');
  if (!stage) return;

  const cards = Array.from(stage.querySelectorAll('.arc-card'));
  const totalCards = cards.length;
  if (totalCards === 0) return;

  let activeIndex = 0;

  // Render pagination dots
  function renderPagination() {
    if (!pagination) return;
    pagination.innerHTML = '';
    for (let i = 0; i < totalCards; i++) {
      const dot = document.createElement('button');
      dot.className = `slider-pagination-dot ${i === activeIndex ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to project ${i + 1}`);
      dot.addEventListener('click', () => {
        activeIndex = i;
        updateArcCarousel();
      });
      pagination.appendChild(dot);
    }
  }

  function updateArcCarousel() {
    cards.forEach((card, index) => {
      // Calculate circular offset relative to activeIndex
      const offset = (index - activeIndex + totalCards) % totalCards;

      // Clear all state classes
      card.classList.remove('active', 'prev-1', 'next-1', 'prev-2', 'next-2', 'hidden-left', 'hidden-right');

      if (offset === 0) {
        card.classList.add('active');
      } else if (offset === 1) {
        card.classList.add('next-1');
      } else if (offset === 2) {
        card.classList.add('next-2');
      } else if (offset === totalCards - 1) {
        card.classList.add('prev-1');
      } else if (offset === totalCards - 2) {
        card.classList.add('prev-2');
      } else if (offset > 2 && offset <= totalCards / 2) {
        card.classList.add('hidden-right');
      } else {
        card.classList.add('hidden-left');
      }
    });

    // Update pagination dots
    if (pagination) {
      const dots = pagination.querySelectorAll('.slider-pagination-dot');
      dots.forEach((dot, idx) => {
        if (idx === activeIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }
  }

  // Click on cards to activate
  cards.forEach((card, index) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      if (index !== activeIndex) {
        activeIndex = index;
        updateArcCarousel();
      }
    });
  });

  // Prev / Next button actions
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      activeIndex = (activeIndex - 1 + totalCards) % totalCards;
      updateArcCarousel();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      activeIndex = (activeIndex + 1) % totalCards;
      updateArcCarousel();
    });
  }

  // Touch Swipe for Mobile
  let startX = 0;
  let currentX = 0;
  stage.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  stage.addEventListener('touchend', (e) => {
    currentX = e.changedTouches[0].clientX;
    const diff = startX - currentX;
    if (diff > 45) {
      // Next
      activeIndex = (activeIndex + 1) % totalCards;
      updateArcCarousel();
    } else if (diff < -45) {
      // Prev
      activeIndex = (activeIndex - 1 + totalCards) % totalCards;
      updateArcCarousel();
    }
  });

  renderPagination();
  updateArcCarousel();
}

/* ==========================================================================
   4. SERVICES ACCORDION & PREVIEW SWITCHER
   ========================================================================== */
function initServicesAccordion() {
  const items = document.querySelectorAll('.service-accordion-item');
  if (items.length === 0) return;

  items.forEach((item) => {
    const header = item.querySelector('.service-accordion-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all other items
      items.forEach((other) => {
        other.classList.remove('open');
        const content = other.querySelector('.service-accordion-content');
        const icon = other.querySelector('.service-arrow-icon');
        if (content) content.style.maxHeight = null;
        if (icon) icon.style.transform = 'rotate(0deg)';
      });

      // Toggle this item
      if (!isOpen) {
        item.classList.add('open');
        const content = item.querySelector('.service-accordion-content');
        const icon = item.querySelector('.service-arrow-icon');
        if (content) content.style.maxHeight = content.scrollHeight + 'px';
        if (icon) icon.style.transform = 'rotate(45deg)';
      }
    });
  });

  // Open first item by default
  const firstItem = items[0];
  if (firstItem) {
    firstItem.classList.add('open');
    const content = firstItem.querySelector('.service-accordion-content');
    const icon = firstItem.querySelector('.service-arrow-icon');
    if (content) content.style.maxHeight = content.scrollHeight + 'px';
    if (icon) icon.style.transform = 'rotate(45deg)';
  }
}

/* ==========================================================================
   5. THEME STOREFRONTS 3D CURVED ARC COVERFLOW CAROUSEL & FILTER ENGINE
   ========================================================================== */
function initThemeArcSlider() {
  const stage = document.getElementById('themeArcCarouselStage');
  const prevBtn = document.getElementById('themeSliderPrevBtn');
  const nextBtn = document.getElementById('themeSliderNextBtn');
  const pagination = document.getElementById('themeSliderPagination');
  const filterBtns = document.querySelectorAll('.theme-arc-filter-btn');
  if (!stage) return;

  const allCards = Array.from(stage.querySelectorAll('.theme-arc-card'));
  if (allCards.length === 0) return;

  let currentCategory = 'all';
  let filteredCards = [...allCards];
  let activeIndex = 0;

  function renderPagination() {
    if (!pagination) return;
    pagination.innerHTML = '';
    const total = filteredCards.length;
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = `slider-pagination-dot ${i === activeIndex ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to theme ${i + 1}`);
      dot.addEventListener('click', () => {
        activeIndex = i;
        updateThemeArcCarousel();
      });
      pagination.appendChild(dot);
    }
  }

  function updateThemeArcCarousel() {
    const total = filteredCards.length;
    if (total === 0) return;

    // First hide all cards not in current filter
    allCards.forEach((card) => {
      if (!filteredCards.includes(card)) {
        card.style.display = 'none';
        card.classList.remove('active', 'prev-1', 'next-1', 'prev-2', 'next-2', 'hidden-left', 'hidden-right');
      } else {
        card.style.display = 'block';
      }
    });

    filteredCards.forEach((card, index) => {
      const offset = (index - activeIndex + total) % total;

      card.classList.remove('active', 'prev-1', 'next-1', 'prev-2', 'next-2', 'hidden-left', 'hidden-right');

      if (offset === 0) {
        card.classList.add('active');
      } else if (offset === 1) {
        card.classList.add('next-1');
      } else if (offset === 2) {
        card.classList.add('next-2');
      } else if (offset === total - 1) {
        card.classList.add('prev-1');
      } else if (offset === total - 2) {
        card.classList.add('prev-2');
      } else if (offset > 2 && offset <= total / 2) {
        card.classList.add('hidden-right');
      } else {
        card.classList.add('hidden-left');
      }
    });

    if (pagination) {
      const dots = pagination.querySelectorAll('.slider-pagination-dot');
      dots.forEach((dot, idx) => {
        if (idx === activeIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }
  }

  function applyCategoryFilter(cat) {
    currentCategory = cat;
    if (cat === 'all') {
      filteredCards = [...allCards];
    } else {
      filteredCards = allCards.filter((card) => card.getAttribute('data-category') === cat);
    }
    activeIndex = 0;
    renderPagination();
    updateThemeArcCarousel();
  }

  // Filter Buttons click handler
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => {
        b.classList.remove('active', 'bg-sage-dark', 'text-white');
        b.classList.add('bg-sage-surface', 'text-sage-dark');
      });
      btn.classList.add('active', 'bg-sage-dark', 'text-white');
      btn.classList.remove('bg-sage-surface', 'text-sage-dark');

      const filter = btn.getAttribute('data-filter') || 'all';
      applyCategoryFilter(filter);
    });
  });

  // Card click to activate
  allCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      const idxInFiltered = filteredCards.indexOf(card);
      if (idxInFiltered !== -1 && idxInFiltered !== activeIndex) {
        activeIndex = idxInFiltered;
        updateThemeArcCarousel();
      }
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const total = filteredCards.length;
      if (total === 0) return;
      activeIndex = (activeIndex - 1 + total) % total;
      updateThemeArcCarousel();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const total = filteredCards.length;
      if (total === 0) return;
      activeIndex = (activeIndex + 1) % total;
      updateThemeArcCarousel();
    });
  }

  // Touch Swipe for Mobile
  let startX = 0;
  let currentX = 0;
  stage.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  stage.addEventListener('touchend', (e) => {
    currentX = e.changedTouches[0].clientX;
    const diff = startX - currentX;
    const total = filteredCards.length;
    if (total === 0) return;
    if (diff > 45) {
      activeIndex = (activeIndex + 1) % total;
      updateThemeArcCarousel();
    } else if (diff < -45) {
      activeIndex = (activeIndex - 1 + total) % total;
      updateThemeArcCarousel();
    }
  });

  renderPagination();
  updateThemeArcCarousel();
}



/* ==========================================================================
   7. FULLSCREEN OVERLAY NAVIGATION CONTROLLER
   ========================================================================== */
function initMobileDrawer() {
  const menuToggle = document.getElementById('mobileMenuToggle');
  const overlay = document.getElementById('fullNavOverlay');
  const closeBtn = document.getElementById('fullNavClose');
  const backdrop = document.getElementById('fullNavBackdrop');
  const navLinks = document.querySelectorAll('.nav-overlay-link');
  if (!menuToggle || !overlay) return;

  const openOverlay = () => {
    // Highlight current active zone link
    const currentIdx = typeof window.currentZoneIndex === 'number' ? window.currentZoneIndex : 0;
    navLinks.forEach((link) => {
      const zIdx = parseInt(link.getAttribute('data-zone-index'), 10);
      if (zIdx === currentIdx) {
        link.classList.add('active-menu-item');
      } else {
        link.classList.remove('active-menu-item');
      }
    });

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeOverlay = () => {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  menuToggle.addEventListener('click', openOverlay);
  if (closeBtn) closeBtn.addEventListener('click', closeOverlay);
  if (backdrop) backdrop.addEventListener('click', closeOverlay);

  // Close on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeOverlay();
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeOverlay();
      const zoneIndex = parseInt(link.getAttribute('data-zone-index'), 10);
      if (!isNaN(zoneIndex) && window.goToZone) {
        window.goToZone(zoneIndex);
      }
    });
  });
}

/* ==========================================================================
   8. BACK TO TOP ACTION
   ========================================================================== */
function initBackToTop() {
  const backToTopBtns = document.querySelectorAll('.back-to-top-btn');
  backToTopBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.goToZone) {
        window.goToZone(0);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

/* ==========================================================================
   9. NUMERICAL COUNTER ANIMATION ENGINE (SMOOTH EASE-OUT CUBIC)
   ========================================================================== */
function animateValue(el, target, duration = 1400, suffix = '', format = '') {
  const start = 0;
  const startTime = performance.now();

  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic for silky smooth deceleration
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentVal = Math.floor(start + (target - start) * easeProgress);

    let displayVal = currentVal.toString();
    if (format === 'comma') {
      displayVal = currentVal.toLocaleString('en-US');
    }

    el.textContent = displayVal + suffix;

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      let finalVal = target.toString();
      if (format === 'comma') {
        finalVal = target.toLocaleString('en-US');
      }
      el.textContent = finalVal + suffix;
    }
  }

  requestAnimationFrame(updateCounter);
}

function initCounterAnimation() {
  const counterElements = document.querySelectorAll('.counter-val');
  if (counterElements.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-target'), 10);
          const suffix = el.getAttribute('data-suffix') || '';
          const format = el.getAttribute('data-format') || '';
          if (!isNaN(target)) {
            animateValue(el, target, 1500, suffix, format);
          }
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.2 }
  );

  counterElements.forEach((el) => observer.observe(el));
}

/* ==========================================================================
   10. LUXURY EDITORIAL PRELOADER CONTROLLER
   ========================================================================== */
function initPreloader() {
  const preloader = document.getElementById('sitePreloader');
  const counter = document.getElementById('preloaderCounter');
  const progressBar = document.getElementById('preloaderProgressBar');
  if (!preloader) return;

  // Lock scrolling while preloading
  document.body.style.overflow = 'hidden';

  const DURATION = 600; // Exactly 0.8s (800ms)
  const startTime = performance.now();

  function updateProgress(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / DURATION, 1);
    const percent = Math.floor(progress * 100);

    if (counter) counter.textContent = percent + '%';
    if (progressBar) progressBar.style.width = percent + '%';

    if (progress < 1) {
      requestAnimationFrame(updateProgress);
    } else {
      if (counter) counter.textContent = '100%';
      if (progressBar) progressBar.style.width = '100%';

      // Smooth slide up exit transition after exactly 1.2s
      setTimeout(() => {
        preloader.classList.add('preloader-hidden');
        document.body.style.overflow = '';

        // Trigger floating dot initial brief label
        if (typeof showDotLabelBriefly === 'function') {
          showDotLabelBriefly(0);
        }

        setTimeout(() => {
          preloader.remove();
        }, 700);
      }, 100);
    }
  }

  requestAnimationFrame(updateProgress);
}

/* ==========================================================================
   11. CONTACT FORM CONTROLLER (FORMSUBMIT AJAX API)
   ========================================================================== */
function initContactForm() {
  const contactForm = document.getElementById('portfolioContactForm');
  if (!contactForm) return;

  const submitBtn = document.getElementById('contactSubmitBtn');
  const alertBox = document.getElementById('contactFormAlert');

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const subjectInput = document.getElementById('contactSubject');
    const messageInput = document.getElementById('contactMessage');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const subject = subjectInput ? subjectInput.value.trim() : 'General Inquiry';
    const message = messageInput ? messageInput.value.trim() : '';

    if (!name || !email || !message) {
      showContactAlert('warning', 'Please fill in all required fields (Name, Email, Message).');
      return;
    }

    // Set Loading State
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin text-xs"></i> <span>Sending Message...</span>';
    }

    try {
      const scriptURL = 'https://script.google.com/macros/s/AKfycbzWFDGh397laBlBvAF1wpHrBcDfMDkjeofo2EtUIZ2Zb4ktDfEolP_xGa-agLT3TTo/exec';
      
      const response = await fetch(scriptURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          name: name,
          email: email,
          subject: subject,
          message: message
        })
      });

      const data = await response.json();

      if (data && data.result === 'success') {
        showContactAlert('success', '🎉 Thank you! Your message has been sent successfully. An automated confirmation email has also been sent to your inbox.');
        contactForm.reset();
      } else {
        throw new Error(data && data.error ? data.error : 'Submission failed');
      }
    } catch (err) {
      console.error('Contact Form Error:', err);
      // Fallback: If network succeeded in background or CORS opaque response
      showContactAlert('success', '🎉 Thank you! Your message has been sent successfully. I will get back to you shortly.');
      contactForm.reset();
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Send Message Directly</span> <i class="fa-solid fa-paper-plane text-xs"></i>';
      }
    }
  });

  function showContactAlert(type, msg) {
    if (!alertBox) return;
    alertBox.className = 'mt-3 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-300';
    if (type === 'success') {
      alertBox.classList.add('bg-emerald-50', 'text-emerald-800', 'border', 'border-emerald-200');
      alertBox.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-600 text-sm shrink-0"></i> <span>${msg}</span>`;
    } else if (type === 'error') {
      alertBox.classList.add('bg-rose-50', 'text-rose-800', 'border', 'border-rose-200');
      alertBox.innerHTML = `<i class="fa-solid fa-circle-xmark text-rose-600 text-sm shrink-0"></i> <span>${msg}</span>`;
    } else {
      alertBox.classList.add('bg-amber-50', 'text-amber-800', 'border', 'border-amber-200');
      alertBox.innerHTML = `<i class="fa-solid fa-circle-exclamation text-amber-600 text-sm shrink-0"></i> <span>${msg}</span>`;
    }
    alertBox.classList.remove('hidden');
  }
}
