// =============================================
//  PHAN NGOC TUAN - Portfolio Shared Scripts
// =============================================

// --- Mouse Glow Effect ---
document.addEventListener('mousemove', (e) => {
    const glow = document.getElementById('glow');
    if (!glow) return;
    glow.style.setProperty('--mouse-x', `${e.clientX}px`);
    glow.style.setProperty('--mouse-y', `${e.clientY}px`);
});

// --- Intersection Observer for Nav Highlighting ---
// rootMargin: trigger only when a section reaches the TOP area of the viewport
// '-10% 0px -80% 0px' means: the active zone is the band between 10% and 20% from top
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

// Ensure 'about' is active by default on page load
const setActive = (id) => {
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
        }
    });
};

// Set first section active immediately
if (sections.length > 0) {
    setActive(sections[0].id);
}

const observerOptions = {
    root: null,
    rootMargin: '-10% 0px -80% 0px',
    threshold: 0
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            setActive(entry.target.id);
        }
    });
}, observerOptions);

sections.forEach(section => observer.observe(section));
