/**
 * L'Art de la Beauté - AB Académie
 * Script principal pour les interactions modernes
 */

// ==========================================================================
// Variables globales et configuration
// ==========================================================================

const CONFIG = {
    breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1280
    },
    animations: {
        duration: 300,
        easing: 'ease-in-out'
    },
    intersection: {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    }
};

// ==========================================================================
// Utilitaires
// ==========================================================================

/**
 * Utilitaires DOM simplifiés
 */
const $ = {
    get: (selector) => document.querySelector(selector),
    getAll: (selector) => document.querySelectorAll(selector),
    on: (element, event, handler) => element.addEventListener(event, handler),
    off: (element, event, handler) => element.removeEventListener(event, handler),
    addClass: (element, className) => element.classList.add(className),
    removeClass: (element, className) => element.classList.remove(className),
    toggleClass: (element, className) => element.classList.toggle(className),
    hasClass: (element, className) => element.classList.contains(className)
};

/**
 * Fonction de throttle pour optimiser les performances
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Fonction de debounce pour optimiser les performances
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// ==========================================================================
// Navigation et Header
// ==========================================================================

class Navigation {
    constructor() {
        this.header = $.get('#header');
        this.mobileToggle = $.get('#mobile-toggle');
        this.navMenu = $.get('#nav-menu');
        this.navLinks = $.getAll('.nav-link');
        this.lastScrollY = window.scrollY;
        
        this.init();
    }
    
    init() {
        if (!this.header) return;
        
        this.setupScrollEffects();
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupActiveNavigation();
    }
    
    /**
     * Effets de scroll sur le header
     */
    setupScrollEffects() {
        const handleScroll = throttle(() => {
            const currentScrollY = window.scrollY;
            
            // Ajouter/retirer la classe 'scrolled'
            if (currentScrollY > 50) {
                $.addClass(this.header, 'scrolled');
            } else {
                $.removeClass(this.header, 'scrolled');
            }
            
            // Header qui se cache/montre selon la direction du scroll
            if (currentScrollY > this.lastScrollY && currentScrollY > 200) {
                this.header.style.transform = 'translateY(-100%)';
            } else {
                this.header.style.transform = 'translateY(0)';
            }
            
            this.lastScrollY = currentScrollY;
        }, 16); // ~60fps
        
        $.on(window, 'scroll', handleScroll);
    }
    
    /**
     * Menu mobile
     */
    setupMobileMenu() {
        if (!this.mobileToggle || !this.navMenu) return;
        
        $.on(this.mobileToggle, 'click', () => {
            const isOpen = $.hasClass(this.navMenu, 'active');
            
            $.toggleClass(this.navMenu, 'active');
            $.toggleClass(this.mobileToggle, 'active');
            
            // Gérer l'accessibilité
            this.mobileToggle.setAttribute('aria-expanded', !isOpen);
            
            // Empêcher le scroll du body quand le menu est ouvert
            if (!isOpen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Fermer le menu sur click outside
        $.on(document, 'click', (e) => {
            if (!this.header.contains(e.target) && $.hasClass(this.navMenu, 'active')) {
                this.closeMobileMenu();
            }
        });
        
        // Fermer le menu sur Escape
        $.on(document, 'keydown', (e) => {
            if (e.key === 'Escape' && $.hasClass(this.navMenu, 'active')) {
                this.closeMobileMenu();
            }
        });
    }
    
    closeMobileMenu() {
        $.removeClass(this.navMenu, 'active');
        $.removeClass(this.mobileToggle, 'active');
        this.mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
    
    /**
     * Scroll fluide pour les liens d'ancre
     */
    setupSmoothScrolling() {
        this.navLinks.forEach(link => {
            $.on(link, 'click', (e) => {
                const href = link.getAttribute('href');
                
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = $.get(href);
                    
                    if (target) {
                        const headerHeight = this.header.offsetHeight;
                        const targetPosition = target.offsetTop - headerHeight - 20;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                        
                        // Fermer le menu mobile si ouvert
                        this.closeMobileMenu();
                    }
                }
            });
        });
    }
    
    /**
     * Navigation active selon la section visible
     */
    setupActiveNavigation() {
        const sections = $.getAll('section[id]');
        
        if (sections.length === 0) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Retirer la classe active de tous les liens
                    this.navLinks.forEach(link => $.removeClass(link, 'active'));
                    
                    // Ajouter la classe active au lien correspondant
                    const activeLink = $.get(`a[href="#${entry.target.id}"]`);
                    if (activeLink) {
                        $.addClass(activeLink, 'active');
                    }
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-80px 0px -80px 0px'
        });
        
        sections.forEach(section => observer.observe(section));
    }
}

// ==========================================================================
// Animations d'apparition
// ==========================================================================

class ScrollAnimations {
    constructor() {
        this.animatedElements = $.getAll('[data-animate]');
        this.init();
    }
    
    init() {
        if (this.animatedElements.length === 0) return;
        
        // Ajouter les attributs data-animate aux éléments qui doivent être animés
        this.addAnimationAttributes();
        this.setupIntersectionObserver();
    }
    
    addAnimationAttributes() {
        // Ajouter automatiquement les animations aux éléments appropriés
        const elementsToAnimate = [
            '.hero-content',
            '.hero-image',
            '.formation-card',
            '.feature',
            '.section-header',
            '.contact-item'
        ];
        
        elementsToAnimate.forEach(selector => {
            const elements = $.getAll(selector);
            elements.forEach((element, index) => {
                if (!element.dataset.animate) {
                    element.dataset.animate = 'fade-up';
                    element.dataset.delay = index * 100; // Décalage pour l'effet cascade
                }
            });
        });
    }
    
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const delay = element.dataset.delay || 0;
                    
                    setTimeout(() => {
                        $.addClass(element, 'animate-in');
                    }, delay);
                    
                    observer.unobserve(element);
                }
            });
        }, CONFIG.intersection);
        
        this.animatedElements.forEach(element => {
            observer.observe(element);
        });
    }
}

// ==========================================================================
// Formulaire de contact
// ==========================================================================

class ContactForm {
    constructor() {
        this.form = $.get('.contact-form');
        this.init();
    }
    
    init() {
        if (!this.form) return;
        
        this.setupValidation();
        this.setupSubmission();
    }
    
    setupValidation() {
        const inputs = this.form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Validation en temps réel
            $.on(input, 'blur', () => this.validateField(input));
            $.on(input, 'input', () => this.clearFieldError(input));
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';
        
        // Règles de validation
        switch (fieldName) {
            case 'name':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Le nom est requis';
                } else if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Le nom doit contenir au moins 2 caractères';
                }
                break;
                
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value) {
                    isValid = false;
                    errorMessage = 'L\'email est requis';
                } else if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Veuillez entrer un email valide';
                }
                break;
                
            case 'phone':
                if (value && !/^[\d\s\-\+\(\)\.]{10,}$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Veuillez entrer un numéro de téléphone valide';
                }
                break;
                
            case 'message':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Le message est requis';
                } else if (value.length < 10) {
                    isValid = false;
                    errorMessage = 'Le message doit contenir au moins 10 caractères';
                }
                break;
        }
        
        this.showFieldError(field, isValid, errorMessage);
        return isValid;
    }
    
    showFieldError(field, isValid, message) {
        const formGroup = field.closest('.form-group');
        let errorElement = formGroup.querySelector('.field-error');
        
        if (!isValid) {
            $.addClass(field, 'error');
            
            if (!errorElement) {
                errorElement = document.createElement('span');
                errorElement.className = 'field-error';
                formGroup.appendChild(errorElement);
            }
            
            errorElement.textContent = message;
        } else {
            $.removeClass(field, 'error');
            if (errorElement) {
                errorElement.remove();
            }
        }
    }
    
    clearFieldError(field) {
        $.removeClass(field, 'error');
        const formGroup = field.closest('.form-group');
        const errorElement = formGroup.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    setupSubmission() {
        $.on(this.form, 'submit', (e) => {
            e.preventDefault();
            
            // Valider tous les champs
            const inputs = this.form.querySelectorAll('input[required], textarea[required]');
            let isFormValid = true;
            
            inputs.forEach(input => {
                if (!this.validateField(input)) {
                    isFormValid = false;
                }
            });
            
            if (isFormValid) {
                this.submitForm();
            }
        });
    }
    
    async submitForm() {
        const submitButton = this.form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        // État de chargement
        submitButton.textContent = 'Envoi en cours...';
        submitButton.disabled = true;
        
        try {
            // Simuler l'envoi (remplacer par votre logique d'envoi réelle)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Succès
            this.showSuccessMessage();
            this.form.reset();
            
        } catch (error) {
            // Erreur
            this.showErrorMessage();
        } finally {
            // Remettre le bouton dans son état initial
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }
    
    showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'form-message success';
        message.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Votre message a été envoyé avec succès ! Nous vous répondrons rapidement.</span>
        `;
        
        this.form.insertBefore(message, this.form.firstChild);
        
        setTimeout(() => {
            message.remove();
        }, 5000);
    }
    
    showErrorMessage() {
        const message = document.createElement('div');
        message.className = 'form-message error';
        message.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>Une erreur s'est produite. Veuillez réessayer ou nous contacter directement.</span>
        `;
        
        this.form.insertBefore(message, this.form.firstChild);
        
        setTimeout(() => {
            message.remove();
        }, 5000);
    }
}

// ==========================================================================
// Optimisations de performance
// ==========================================================================

class PerformanceOptimizer {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupLazyLoading();
        this.setupPreloadOptimization();
    }
    
    /**
     * Lazy loading des images
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const images = $.getAll('img[loading="lazy"]');
            
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        
                        $.removeClass(img, 'lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => {
                $.addClass(img, 'lazy');
                imageObserver.observe(img);
            });
        }
    }
    
    /**
     * Préchargement intelligent des ressources
     */
    setupPreloadOptimization() {
        // Précharger les images critiques au hover
        const cards = $.getAll('.formation-card, .feature');
        
        cards.forEach(card => {
            $.on(card, 'mouseenter', () => {
                const img = card.querySelector('img[data-preload]');
                if (img && !img.dataset.preloaded) {
                    const link = document.createElement('link');
                    link.rel = 'preload';
                    link.as = 'image';
                    link.href = img.dataset.preload;
                    document.head.appendChild(link);
                    img.dataset.preloaded = 'true';
                }
            });
        });
    }
}

// ==========================================================================
// Accessibility enhancements
// ==========================================================================

class AccessibilityEnhancer {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupScreenReaderAnnouncements();
    }
    
    setupKeyboardNavigation() {
        // Navigation au clavier pour les éléments interactifs
        const interactiveElements = $.getAll('button, a, input, select, textarea');
        
        interactiveElements.forEach(element => {
            $.on(element, 'keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
                        e.preventDefault();
                        element.click();
                    }
                }
            });
        });
    }
    
    setupFocusManagement() {
        // Gestion du focus pour les éléments dynamiques
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && node.matches('.form-message')) {
                            // Annoncer les messages d'erreur/succès
                            node.setAttribute('role', 'alert');
                            node.setAttribute('aria-live', 'polite');
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    setupScreenReaderAnnouncements() {
        // Zone d'annonces pour les lecteurs d'écran
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        announcer.id = 'announcer';
        document.body.appendChild(announcer);
        
        // Fonction globale pour annoncer des messages
        window.announce = (message) => {
            announcer.textContent = message;
            setTimeout(() => {
                announcer.textContent = '';
            }, 1000);
        };
    }
}

// ==========================================================================
// Initialisation
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialiser tous les modules
    // new Navigation();
    new ScrollAnimations();
    new ContactForm();
    new PerformanceOptimizer();
    new AccessibilityEnhancer();
    
    // Gestion des erreurs globales
    window.addEventListener('error', (e) => {
        console.error('Erreur JavaScript:', e.error);
        // Optionnel : envoyer l'erreur à un service de monitoring
    });
    
    // Performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Temps de chargement:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
            }, 0);
        });
    }
    
    console.log('🎨 L\'Art de la Beauté - Site chargé avec succès!');
});

// ==========================================================================
// CSS supplémentaire pour les animations et états
// ==========================================================================

// Injecter les styles CSS pour les animations
const animationStyles = `
    <style>
        /* Styles pour les animations */
        [data-animate] {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease;
        }
        
        [data-animate].animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        /* Styles pour les images lazy */
        img.lazy {
            filter: blur(5px);
            transition: filter 0.3s;
        }
        
        img.lazy.loaded {
            filter: none;
        }
        
        /* Styles pour les erreurs de formulaire */
        .field-error {
            color: var(--error, #ef4444);
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: block;
        }
        
        .form-group input.error,
        .form-group textarea.error {
            border-color: var(--error, #ef4444);
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
        
        /* Messages de formulaire */
        .form-message {
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .form-message.success {
            background: #d1fae5;
            color: #065f46;
            border: 1px solid #a7f3d0;
        }
        
        .form-message.error {
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #fca5a5;
        }
        
        /* Menu mobile */
        @media (max-width: 767px) {
            .nav-menu {
                position: fixed;
                top: 80px;
                left: 0;
                width: 100%;
                background: white;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                transform: translateY(-100%);
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                flex-direction: column;
                padding: 2rem;
                gap: 1rem;
            }
            
            .nav-menu.active {
                transform: translateY(0);
                opacity: 1;
                visibility: visible;
            }
        }
        
        /* Styles pour l'accessibilité */
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
        
        /* Focus visible amélioré */
        *:focus-visible {
            outline: 2px solid var(--primary-pink, #ec4899);
            outline-offset: 2px;
        }
    </style>
`;

document.head.insertAdjacentHTML('beforeend', animationStyles);