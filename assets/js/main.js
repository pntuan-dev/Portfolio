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
  initZoneSnapScroll();
  initFloatingDotNav();
  initRecentWorkSlider();
  initServicesAccordion();
  initThemeFilter();
  initQrModal();
  initMobileDrawer();
  initBackToTop();
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
    isScrolling = true;

    if (window.innerWidth >= 1024) {
      zones[currentZoneIndex].scrollIntoView({ behavior: 'smooth' });
    } else {
      zones[currentZoneIndex].scrollIntoView({ behavior: 'smooth' });
    }

    setTimeout(() => {
      isScrolling = false;
    }, SCROLL_COOLDOWN);
  };

  // Wheel Event for Desktop 1-Step Snap
  scrollWrapper.addEventListener(
    'wheel',
    (e) => {
      if (window.innerWidth < 1024) return; // Native touch scroll for mobile/tablet

      // If user is scrolling inside an internal scrollable container that still has room, let it scroll
      const target = e.target;
      const innerScrollable = target.closest('.allow-inner-scroll');
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

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
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

/* ==========================================================================
   2. FLOATING DOT NAVIGATION TRACKER
   ========================================================================== */
function initFloatingDotNav() {
  const dotBtns = document.querySelectorAll('.floating-dot-btn');
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

        dotBtns.forEach((btn) => {
          const targetId = btn.getAttribute('data-zone-id');
          if (targetId === id) {
            btn.classList.add('active');
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
   3. RECENT WORK INTERACTIVE SLIDER
   ========================================================================== */
function initRecentWorkSlider() {
  const track = document.getElementById('recentWorkTrack');
  const prevBtn = document.getElementById('sliderPrevBtn');
  const nextBtn = document.getElementById('sliderNextBtn');
  const pagination = document.getElementById('sliderPagination');
  if (!track) return;

  const slides = track.querySelectorAll('.slider-slide');
  const totalSlides = slides.length;
  let currentIndex = 0;

  function getVisibleSlides() {
    if (window.innerWidth >= 1200) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }

  function getMaxIndex() {
    const visible = getVisibleSlides();
    return Math.max(0, totalSlides - visible);
  }

  // Create pagination dots
  function renderPagination() {
    if (!pagination) return;
    pagination.innerHTML = '';
    const maxIndex = getMaxIndex();
    for (let i = 0; i <= maxIndex; i++) {
      const dot = document.createElement('button');
      dot.className = `slider-pagination-dot ${i === currentIndex ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to slide group ${i + 1}`);
      dot.addEventListener('click', () => {
        currentIndex = i;
        updateSlider();
      });
      pagination.appendChild(dot);
    }
  }

  function updateSlider() {
    const visible = getVisibleSlides();
    const slideWidthPercent = 100 / visible;
    const maxIndex = getMaxIndex();

    if (currentIndex > maxIndex) currentIndex = maxIndex;
    if (currentIndex < 0) currentIndex = 0;

    const translateValue = -(currentIndex * slideWidthPercent);
    track.style.transform = `translateX(${translateValue}%)`;

    // Update pagination dots
    if (pagination) {
      const dots = pagination.querySelectorAll('.slider-pagination-dot');
      dots.forEach((dot, idx) => {
        if (idx === currentIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentIndex--;
      if (currentIndex < 0) currentIndex = getMaxIndex();
      updateSlider();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentIndex++;
      if (currentIndex > getMaxIndex()) currentIndex = 0;
      updateSlider();
    });
  }

  // Touch Swipe for Mobile
  let startX = 0;
  let currentX = 0;
  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    currentX = e.changedTouches[0].clientX;
    const diff = startX - currentX;
    if (diff > 50) {
      // Next
      currentIndex++;
      if (currentIndex > getMaxIndex()) currentIndex = 0;
      updateSlider();
    } else if (diff < -50) {
      // Prev
      currentIndex--;
      if (currentIndex < 0) currentIndex = getMaxIndex();
      updateSlider();
    }
  });

  window.addEventListener('resize', () => {
    renderPagination();
    updateSlider();
  });

  renderPagination();
  updateSlider();
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
   5. THEME WEB FILTER ENGINE
   ========================================================================== */
function initThemeFilter() {
  const filterBtns = document.querySelectorAll('.theme-filter-btn');
  const themeCards = document.querySelectorAll('.theme-catalog-card');
  if (filterBtns.length === 0 || themeCards.length === 0) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active', 'bg-sage-dark', 'text-white'));
      btn.classList.add('active', 'bg-sage-dark', 'text-white');

      const filter = btn.getAttribute('data-filter');

      themeCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.classList.add('animate-fade-in');
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   6. INTERACTIVE QR CODE MODAL
   ========================================================================== */
function initQrModal() {
  const qrTrigger = document.getElementById('qrModalTrigger');
  const qrModal = document.getElementById('qrModal');
  const qrCloseBtn = document.getElementById('qrModalClose');
  if (!qrTrigger || !qrModal) return;

  qrTrigger.addEventListener('click', () => {
    qrModal.classList.remove('hidden');
    qrModal.classList.add('flex');
  });

  const closeModal = () => {
    qrModal.classList.add('hidden');
    qrModal.classList.remove('flex');
  };

  if (qrCloseBtn) qrCloseBtn.addEventListener('click', closeModal);
  qrModal.addEventListener('click', (e) => {
    if (e.target === qrModal) closeModal();
  });
}

/* ==========================================================================
   7. MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileDrawer() {
  const menuToggle = document.getElementById('mobileMenuToggle');
  const drawer = document.getElementById('mobileNavDrawer');
  const closeBtn = document.getElementById('mobileDrawerClose');
  const navLinks = document.querySelectorAll('.mobile-nav-link');
  if (!menuToggle || !drawer) return;

  const openDrawer = () => {
    drawer.classList.remove('translate-x-full');
  };

  const closeDrawer = () => {
    drawer.classList.add('translate-x-full');
  };

  menuToggle.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeDrawer();
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
