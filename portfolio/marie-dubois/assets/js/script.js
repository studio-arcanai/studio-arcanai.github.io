// ===== MODERN LANDING PAGE JAVASCRIPT ===== //

// ===== DOM CONTENT LOADED ===== //
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

// ===== MAIN INITIALIZATION ===== //
function initializeApp() {
    initHeader();
    initScrollAnimations();
    initCounters();
    initFAQ();
    initSmoothScroll();
    initTiltCards();
    initParticleEffects();
    initCTATracking();
}

// ===== HEADER MANAGEMENT ===== //
function initHeader() {
    const header = document.querySelector('.header');
    const hero = document.querySelector('.hero');
    let headerHeight = header.offsetHeight;

    // Ajuster la hauteur du hero pour compenser le header fixe
    hero.style.paddingTop = `${headerHeight + 40}px`;

    // Header scroll effects
    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateHeader() {
        const scrollY = window.scrollY;
        const scrollDirection = scrollY > lastScrollY ? 'down' : 'up';

        // Header background opacity based on scroll
        if (scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(30px)';
            header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
            header.classList.add('scrolled');
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.05)';
            header.style.backdropFilter = 'blur(30px)';
            header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
            header.classList.remove('scrolled');
        }

        // Hide/show header based on scroll direction (optional)
        if (scrollDirection === 'down' && scrollY > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }

        lastScrollY = scrollY;
        ticking = false;
    }

    function requestHeaderUpdate() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestHeaderUpdate, { passive: true });

    // Handle window resize
    window.addEventListener('resize', function () {
        headerHeight = header.offsetHeight;
        hero.style.paddingTop = `${headerHeight + 40}px`;
    });
}

// ===== SCROLL ANIMATIONS WITH INTERSECTION OBSERVER ===== //
function initScrollAnimations() {
    // Configure intersection observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-on-scroll');

                // Trigger counters when stats section is visible
                if (entry.target.classList.contains('stats-grid')) {
                    animateCounters();
                }

                // Add staggered animation for grids
                if (entry.target.classList.contains('problem-grid') ||
                    entry.target.classList.contains('method-steps') ||
                    entry.target.classList.contains('testimonials-grid')) {
                    animateGridItems(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observe elements
    const animateElements = document.querySelectorAll([
        '.section-title',
        '.problem-grid',
        '.method-steps',
        '.stats-grid',
        '.testimonials-grid',
        '.offer-content',
        '.faq-grid',
        '.urgency-content',
        '.cta-content'
    ].join(','));

    animateElements.forEach(element => {
        observer.observe(element);
    });
}

// ===== STAGGERED GRID ANIMATIONS ===== //
function animateGridItems(container) {
    const items = container.children;
    Array.from(items).forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            item.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

            requestAnimationFrame(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            });
        }, index * 150);
    });
}

// ===== ANIMATED COUNTERS ===== //
function initCounters() {
    window.countersAnimated = false; // Prevent multiple animations
}

function animateCounters() {
    if (window.countersAnimated) return;
    window.countersAnimated = true;

    const counters = document.querySelectorAll('[data-count]');

    counters.forEach(counter => {
        const target = parseFloat(counter.dataset.count);
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
            current += increment;

            if (current < target) {
                // Handle different number types
                if (target % 1 === 0) {
                    // Integer
                    counter.textContent = Math.floor(current);
                } else {
                    // Decimal (like 4.9)
                    counter.textContent = current.toFixed(1);
                }
                requestAnimationFrame(updateCounter);
            } else {
                // Final value
                if (target % 1 === 0) {
                    counter.textContent = target;
                } else {
                    counter.textContent = target.toFixed(1);
                }
            }
        };

        // Add some delay between counters
        const delay = Array.from(counters).indexOf(counter) * 200;
        setTimeout(updateCounter, delay);
    });
}

// ===== FAQ INTERACTIVE ===== //
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question.addEventListener('click', function () {
            const isActive = item.classList.contains('active');

            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    otherAnswer.style.maxHeight = null;
                    otherAnswer.style.opacity = '0';
                }
            });

            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
                answer.style.maxHeight = null;
                answer.style.opacity = '0';
            } else {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
                answer.style.opacity = '1';
                answer.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            }
        });

        // Initialize closed state
        answer.style.display = 'block';
        answer.style.maxHeight = '0';
        answer.style.opacity = '0';
        answer.style.overflow = 'hidden';
        answer.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    });
}

// ===== SMOOTH SCROLL ===== //
function initSmoothScroll() {
    // Handle anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== 3D TILT CARDS EFFECT ===== //
function initTiltCards() {
    const tiltCards = document.querySelectorAll('.tilt-card');

    tiltCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transition = 'transform 0.1s ease-out';
        });

        card.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const mouseX = e.clientX - centerX;
            const mouseY = e.clientY - centerY;

            const rotateX = (mouseY / rect.height) * -10;
            const rotateY = (mouseX / rect.width) * 10;

            this.style.transform = `
                perspective(1000px) 
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg) 
                translateY(-10px)
                scale(1.02)
            `;
        });

        card.addEventListener('mouseleave', function () {
            this.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            this.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
        });
    });
}

// ===== PARTICLE EFFECTS ENHANCEMENT ===== //
function initParticleEffects() {
    // Add mouse interaction to particles
    const particles = document.querySelectorAll('.particle');

    document.addEventListener('mousemove', function (e) {
        particles.forEach((particle, index) => {
            const speed = (index + 1) * 0.02;
            const x = (e.clientX * speed) / 100;
            const y = (e.clientY * speed) / 100;

            particle.style.transform += ` translate(${x}px, ${y}px)`;
        });
    });

    // Create additional floating elements
    createFloatingElements();
}

function createFloatingElements() {
    const heroSection = document.querySelector('.hero');

    // Create additional decorative elements
    for (let i = 0; i < 3; i++) {
        const element = document.createElement('div');
        element.className = 'floating-decoration';
        element.style.cssText = `
            position: absolute;
            width: ${20 + Math.random() * 40}px;
            height: ${20 + Math.random() * 40}px;
            background: linear-gradient(45deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1));
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            pointer-events: none;
            animation: floatRandom ${15 + Math.random() * 10}s infinite ease-in-out;
            animation-delay: ${Math.random() * 5}s;
        `;

        heroSection.appendChild(element);
    }

    // Add CSS for floating decoration animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatRandom {
            0%, 100% { 
                transform: translate(0, 0) rotate(0deg) scale(1);
                opacity: 0.3;
            }
            25% { 
                transform: translate(100px, -50px) rotate(90deg) scale(1.2);
                opacity: 0.7;
            }
            50% { 
                transform: translate(-50px, -100px) rotate(180deg) scale(0.8);
                opacity: 1;
            }
            75% { 
                transform: translate(-100px, 50px) rotate(270deg) scale(1.1);
                opacity: 0.5;
            }
        }
    `;
    document.head.appendChild(style);
}

// ===== CTA TRACKING & ANALYTICS ===== //
function initCTATracking() {
    // Track button clicks
    const ctaButtons = document.querySelectorAll('.btn-primary, .btn-secondary');

    ctaButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            // Add click effect
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);

            // Track analytics (replace with your analytics solution)
            trackEvent('CTA_Click', {
                button_text: this.textContent.trim(),
                position: this.closest('section')?.className || 'unknown'
            });
        });
    });

    // Track phone link clicks
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach(link => {
        link.addEventListener('click', function () {
            trackEvent('Phone_Click', {
                phone_number: this.getAttribute('href')
            });
        });
    });
}

// ===== ANALYTICS HELPER ===== //
function trackEvent(eventName, parameters = {}) {
    // Google Analytics 4 example (replace with your tracking)
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, parameters);
    }

    // Console log for development
    console.log('Event tracked:', eventName, parameters);
}

// ===== UTILITY FUNCTIONS ===== //

// Throttle function for performance
function throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;

    return function (...args) {
        const currentTime = Date.now();

        if (currentTime - lastExecTime > delay) {
            func.apply(this, args);
            lastExecTime = currentTime;
        } else {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
                lastExecTime = Date.now();
            }, delay - (currentTime - lastExecTime));
        }
    };
}

// Debounce function for resize events
function debounce(func, delay) {
    let timeoutId;

    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// ===== PERFORMANCE OPTIMIZATIONS ===== //

// Optimize scroll events
const optimizedScrollHandler = throttle(function () {
    // Add any additional scroll-based functionality here
}, 16); // ~60fps

window.addEventListener('scroll', optimizedScrollHandler, { passive: true });

// Optimize resize events
const optimizedResizeHandler = debounce(function () {
    // Recalculate any size-dependent elements
    const header = document.querySelector('.header');
    const hero = document.querySelector('.hero');
    if (header && hero) {
        hero.style.paddingTop = `${header.offsetHeight + 40}px`;
    }
}, 250);

window.addEventListener('resize', optimizedResizeHandler);

// ===== PROGRESSIVE ENHANCEMENT ===== //

// Check for reduced motion preference
function respectsReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Disable animations for users who prefer reduced motion
if (respectsReducedMotion()) {
    document.documentElement.style.setProperty('--transition-base', 'none');
    document.documentElement.style.setProperty('--transition-slow', 'none');
    document.documentElement.style.setProperty('--transition-bounce', 'none');
}

// ===== ERROR HANDLING ===== //
window.addEventListener('error', function (e) {
    console.error('JavaScript error:', e.error);
    // You could send this to your error tracking service
});

// ===== EXPORT FOR TESTING ===== //
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeApp,
        trackEvent,
        throttle,
        debounce
    };
}