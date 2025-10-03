/**
 * L'Art de la Beauté - Formation Onglerie
 * Script pour les interactions et fonctionnalités spécifiques
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
    },
    formations: {
        'prothesie-ongulaire': {
            title: 'Formation Prothésie Ongulaire Complète',
            duration: '5 jours',
            price: 'Sur devis',
            description: 'Formation complète pour apprendre toutes les techniques de prothésie ongulaire gel.',
            program: [
                'Théorie et hygiène',
                'Préparation de l\'ongle naturel',
                'Pose gel classique',
                'French manucure',
                'Nail art de base',
                'Dépose et entretien'
            ]
        },
        'pose-americaine': {
            title: 'Formation Pose Américaine',
            duration: '2 jours',
            price: 'Sur devis',
            description: 'Technique avancée pour une pose parfaite et un gain de temps exceptionnel.',
            program: [
                'Principe de la pose américaine',
                'Technique de modelage',
                'Optimisation du temps',
                'Finitions parfaites'
            ]
        },
        'baby-manucure': {
            title: 'Formation Baby Manucure',
            duration: '1 jour',
            price: 'Sur devis',
            description: 'Soin complémentaire pour des cuticules parfaites.',
            program: [
                'Préparation des cuticules',
                'Techniques de coupe délicate',
                'Soins nourrissants',
                'Protocole de sécurité'
            ]
        },
        'manucure-japonaise': {
            title: 'Formation Manucure Japonaise',
            duration: '1 jour',
            price: 'Sur devis',
            description: 'Soin détox naturel pour les ongles entre deux poses.',
            program: [
                'Philosophie de la manucure japonaise',
                'Produits naturels utilisés',
                'Technique de polissage',
                'Protocole complet'
            ]
        },
        'popit-gel': {
            title: 'Formation PopIt Gel et Acrygel',
            duration: '2 jours',
            price: 'Sur devis',
            description: 'Apprenez la dernière tendance et développez votre créativité.',
            program: [
                'Présentation des matériaux',
                'Techniques PopIt',
                'Travail avec l\'acrygel',
                'Créations artistiques',
                'Tendances actuelles'
            ]
        }
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
    
    setupScrollEffects() {
        const handleScroll = throttle(() => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 50) {
                $.addClass(this.header, 'scrolled');
            } else {
                $.removeClass(this.header, 'scrolled');
            }
            
            if (currentScrollY > this.lastScrollY && currentScrollY > 200) {
                this.header.style.transform = 'translateY(-100%)';
            } else {
                this.header.style.transform = 'translateY(0)';
            }
            
            this.lastScrollY = currentScrollY;
        }, 16);
        
        $.on(window, 'scroll', handleScroll);
    }
    
    setupMobileMenu() {
        if (!this.mobileToggle || !this.navMenu) return;
        
        $.on(this.mobileToggle, 'click', () => {
            const isOpen = $.hasClass(this.navMenu, 'active');
            
            $.toggleClass(this.navMenu, 'active');
            $.toggleClass(this.mobileToggle, 'active');
            
            this.mobileToggle.setAttribute('aria-expanded', !isOpen);
            
            if (!isOpen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        $.on(document, 'click', (e) => {
            if (!this.header.contains(e.target) && $.hasClass(this.navMenu, 'active')) {
                this.closeMobileMenu();
            }
        });
        
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
                        
                        this.closeMobileMenu();
                    }
                }
            });
        });
    }
    
    setupActiveNavigation() {
        const sections = $.getAll('section[id]');
        
        if (sections.length === 0) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.navLinks.forEach(link => $.removeClass(link, 'active'));
                    
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
        
        this.addAnimationAttributes();
        this.setupIntersectionObserver();
    }
    
    addAnimationAttributes() {
        const elementsToAnimate = [
            '.hero-content',
            '.intro-content',
            '.highlight-card',
            '.formation-card',
            '.section-header',
            '.contact-item',
            '.cta-content'
        ];
        
        elementsToAnimate.forEach(selector => {
            const elements = $.getAll(selector);
            elements.forEach((element, index) => {
                if (!element.dataset.animate) {
                    element.dataset.animate = 'fade-up';
                    element.dataset.delay = index * 100;
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
// Gestionnaire des formations
// ==========================================================================

class FormationManager {
    constructor() {
        this.formations = CONFIG.formations;
        this.modal = null;
        this.init();
    }
    
    init() {
        this.createModal();
        this.setupFormationCards();
        this.setupFormationSelector();
    }
    
    createModal() {
        // Créer la structure de la modale
        this.modal = document.createElement('div');
        this.modal.className = 'formation-modal';
        this.modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close" aria-label="Fermer">
                    <i class="fas fa-times"></i>
                </button>
                <div class="modal-header">
                    <h3 class="modal-title"></h3>
                    <div class="modal-meta">
                        <span class="modal-duration"></span>
                        <span class="modal-price"></span>
                    </div>
                </div>
                <div class="modal-body">
                    <p class="modal-description"></p>
                    <div class="modal-program">
                        <h4>Programme de formation :</h4>
                        <ul class="program-list"></ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary modal-contact">
                        <i class="fas fa-phone"></i>
                        Nous contacter
                    </button>
                    <button class="btn-secondary modal-close-btn">Fermer</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        this.setupModalEvents();
        this.addModalStyles();
    }
    
    addModalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .formation-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 1rem;
            }
            
            .formation-modal.active {
                display: flex;
            }
            
            .modal-overlay {
                position: absolute;
                inset: 0;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(4px);
            }
            
            .modal-content {
                position: relative;
                background: white;
                border-radius: 1.5rem;
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                animation: modalAppear 0.3s ease;
            }
            
            @keyframes modalAppear {
                from {
                    opacity: 0;
                    transform: scale(0.9) translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }
            
            .modal-close {
                position: absolute;
                top: 1rem;
                right: 1rem;
                width: 40px;
                height: 40px;
                border: none;
                background: rgba(0, 0, 0, 0.1);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                z-index: 10;
            }
            
            .modal-close:hover {
                background: rgba(0, 0, 0, 0.2);
                transform: scale(1.1);
            }
            
            .modal-header {
                padding: 2rem 2rem 1rem;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .modal-title {
                font-family: 'Playfair Display', serif;
                font-size: 1.75rem;
                font-weight: 600;
                color: #111827;
                margin-bottom: 1rem;
            }
            
            .modal-meta {
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
            }
            
            .modal-duration,
            .modal-price {
                background: linear-gradient(135deg, #ec4899, #8b5cf6);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 0.75rem;
                font-size: 0.875rem;
                font-weight: 600;
            }
            
            .modal-body {
                padding: 2rem;
            }
            
            .modal-description {
                font-size: 1.125rem;
                color: #4b5563;
                margin-bottom: 2rem;
                line-height: 1.6;
            }
            
            .modal-program h4 {
                font-weight: 600;
                color: #111827;
                margin-bottom: 1rem;
            }
            
            .program-list {
                list-style: none;
                padding: 0;
            }
            
            .program-list li {
                padding: 0.75rem 0;
                padding-left: 2rem;
                position: relative;
                color: #4b5563;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .program-list li:last-child {
                border-bottom: none;
            }
            
            .program-list li::before {
                content: '✓';
                position: absolute;
                left: 0;
                color: #10b981;
                font-weight: bold;
                font-size: 1.1rem;
            }
            
            .modal-footer {
                padding: 1rem 2rem 2rem;
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
            }
            
            .modal-footer .btn-primary,
            .modal-footer .btn-secondary {
                flex: 1;
                min-width: 150px;
            }
            
            @media (max-width: 640px) {
                .modal-footer {
                    flex-direction: column;
                }
                
                .modal-footer .btn-primary,
                .modal-footer .btn-secondary {
                    width: 100%;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    setupModalEvents() {
        const overlay = this.modal.querySelector('.modal-overlay');
        const closeBtn = this.modal.querySelector('.modal-close');
        const closeBtnFooter = this.modal.querySelector('.modal-close-btn');
        const contactBtn = this.modal.querySelector('.modal-contact');
        
        // Fermer la modale
        [overlay, closeBtn, closeBtnFooter].forEach(element => {
            $.on(element, 'click', () => this.closeModal());
        });
        
        // Contact depuis la modale
        $.on(contactBtn, 'click', () => {
            this.closeModal();
            const contactSection = $.get('#contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        // Fermer avec Escape
        $.on(document, 'keydown', (e) => {
            if (e.key === 'Escape' && $.hasClass(this.modal, 'active')) {
                this.closeModal();
            }
        });
    }
    
    setupFormationCards() {
        const cards = $.getAll('.formation-card');
        
        cards.forEach((card, index) => {
            const viewDetailsBtn = card.querySelector('.view-details');
            const learnMoreBtn = card.querySelector('.btn-primary, .btn-secondary');
            
            // Extraire l'ID de formation depuis le titre ou data attribute
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            let formationId = this.getFormationIdFromTitle(title);
            
            if (viewDetailsBtn) {
                $.on(viewDetailsBtn, 'click', (e) => {
                    e.stopPropagation();
                    this.openModal(formationId);
                });
            }
            
            if (learnMoreBtn) {
                $.on(learnMoreBtn, 'click', (e) => {
                    e.preventDefault();
                    this.openModal(formationId);
                });
            }
            
            // Effet parallax léger sur les images
            this.setupCardParallax(card);
        });
    }
    
    getFormationIdFromTitle(title) {
        if (title.includes('prothésie ongulaire')) return 'prothesie-ongulaire';
        if (title.includes('pose américaine')) return 'pose-americaine';
        if (title.includes('baby manucure')) return 'baby-manucure';
        if (title.includes('manucure japonaise')) return 'manucure-japonaise';
        if (title.includes('popit')) return 'popit-gel';
        return 'prothesie-ongulaire';
    }
    
    setupCardParallax(card) {
        const img = card.querySelector('.card-image img');
        if (!img) return;
        
        $.on(card, 'mouseenter', () => {
            img.style.transform = 'scale(1.1) translateY(-5px)';
        });
        
        $.on(card, 'mouseleave', () => {
            img.style.transform = 'scale(1) translateY(0)';
        });
    }
    
    setupFormationSelector() {
        const selector = $.get('select[name="formation"]');
        if (!selector) return;
        
        // Pré-remplir avec les formations disponibles
        const options = [
            { value: '', text: 'Sélectionnez une formation' },
            { value: 'prothesie-ongulaire', text: 'Prothésie ongulaire complète' },
            { value: 'pose-americaine', text: 'Pose américaine' },
            { value: 'baby-manucure', text: 'Baby manucure' },
            { value: 'manucure-japonaise', text: 'Manucure japonaise' },
            { value: 'popit-gel', text: 'PopIt gel et acrygel' },
            { value: 'autre', text: 'Autre formation' }
        ];
        
        selector.innerHTML = options.map(option => 
            `<option value="${option.value}">${option.text}</option>`
        ).join('');
    }
    
    openModal(formationId) {
        const formation = this.formations[formationId];
        if (!formation) return;
        
        // Remplir le contenu de la modale
        this.modal.querySelector('.modal-title').textContent = formation.title;
        this.modal.querySelector('.modal-duration').textContent = formation.duration;
        this.modal.querySelector('.modal-price').textContent = formation.price;
        this.modal.querySelector('.modal-description').textContent = formation.description;
        
        const programList = this.modal.querySelector('.program-list');
        programList.innerHTML = formation.program.map(item => 
            `<li>${item}</li>`
        ).join('');
        
        // Afficher la modale
        $.addClass(this.modal, 'active');
        document.body.style.overflow = 'hidden';
        
        // Focus management
        const firstFocusable = this.modal.querySelector('.modal-close');
        if (firstFocusable) firstFocusable.focus();
        
        // Analytics event
        if (window.gtag) {
            window.gtag('event', 'formation_details_view', {
                formation_name: formation.title,
                formation_id: formationId
            });
        }
    }
    
    closeModal() {
        $.removeClass(this.modal, 'active');
        document.body.style.overflow = '';
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
        this.setupFormationPreselection();
    }
    
    setupFormationPreselection() {
        // Pré-sélectionner une formation depuis l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const formationParam = urlParams.get('formation');
        
        if (formationParam) {
            const selector = this.form.querySelector('select[name="formation"]');
            if (selector) {
                selector.value = formationParam;
            }
        }
    }
    
    setupValidation() {
        const inputs = this.form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            $.on(input, 'blur', () => this.validateField(input));
            $.on(input, 'input', () => this.clearFieldError(input));
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';
        
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
        const originalText = submitButton.innerHTML;
        
        // État de chargement
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
        submitButton.disabled = true;
        
        try {
            // Simuler l'envoi
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showSuccessMessage();
            this.form.reset();
            
            // Analytics event
            if (window.gtag) {
                window.gtag('event', 'form_submit', {
                    form_name: 'contact_onglerie',
                    page_location: window.location.href
                });
            }
            
        } catch (error) {
            this.showErrorMessage();
        } finally {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    }
    
    showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'form-message success';
        message.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Votre demande a été envoyée avec succès ! Nous vous recontacterons rapidement pour discuter de votre formation.</span>
        `;
        
        this.form.insertBefore(message, this.form.firstChild);
        
        setTimeout(() => {
            message.remove();
        }, 7000);
    }
    
    showErrorMessage() {
        const message = document.createElement('div');
        message.className = 'form-message error';
        message.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>Une erreur s'est produite. Veuillez réessayer ou nous appeler directement au 06 51 27 28 68.</span>
        `;
        
        this.form.insertBefore(message, this.form.firstChild);
        
        setTimeout(() => {
            message.remove();
        }, 7000);
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
        this.setupImageOptimization();
        this.setupPreloading();
    }
    
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
    
    setupImageOptimization() {
        // Optimiser les images selon la taille d'écran
        const images = $.getAll('.card-image img, .hero-background img');
        
        images.forEach(img => {
            if (window.innerWidth < 768) {
                // Version mobile - images plus petites
                img.src = img.src.replace('w=400', 'w=300').replace('h=300', 'h=200');
            }
        });
    }
    
    setupPreloading() {
        // Précharger les images importantes au hover
        const cards = $.getAll('.formation-card');
        
        cards.forEach(card => {
            $.on(card, 'mouseenter', () => {
                const img = card.querySelector('img');
                if (img && !img.dataset.preloaded) {
                    const link = document.createElement('link');
                    link.rel = 'preload';
                    link.as = 'image';
                    link.href = img.src;
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
        this.setupSkipLinks();
    }
    
    setupKeyboardNavigation() {
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
                        if (node.nodeType === 1) {
                            if (node.matches('.form-message')) {
                                node.setAttribute('role', 'alert');
                                node.setAttribute('aria-live', 'polite');
                            }
                            if (node.matches('.formation-modal')) {
                                node.setAttribute('role', 'dialog');
                                node.setAttribute('aria-modal', 'true');
                            }
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
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        announcer.id = 'announcer';
        document.body.appendChild(announcer);
        
        window.announce = (message) => {
            announcer.textContent = message;
            setTimeout(() => {
                announcer.textContent = '';
            }, 1000);
        };
    }
    
    setupSkipLinks() {
        // Ajouter des liens de navigation rapide
        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
            <a href="#formations" class="skip-link">Aller aux formations</a>
            <a href="#contact" class="skip-link">Aller au contact</a>
        `;
        
        document.body.insertBefore(skipLinks, document.body.firstChild);
        
        // Styles pour les skip links
        const style = document.createElement('style');
        style.textContent = `
            .skip-links {
                position: absolute;
                top: -100px;
                left: 0;
                z-index: 10001;
            }
            
            .skip-link {
                position: absolute;
                background: #111827;
                color: white;
                padding: 0.5rem 1rem;
                text-decoration: none;
                border-radius: 0 0 0.5rem 0;
                transition: all 0.3s ease;
            }
            
            .skip-link:focus {
                top: 100px;
                outline: 2px solid #ec4899;
            }
        `;
        
        document.head.appendChild(style);
    }
}

// ==========================================================================
// Initialisation
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialiser tous les modules
    // new Navigation();
    new ScrollAnimations();
    new FormationManager();
    new ContactForm();
    new PerformanceOptimizer();
    new AccessibilityEnhancer();
    
    // Gestion des erreurs globales
    window.addEventListener('error', (e) => {
        console.error('Erreur JavaScript:', e.error);
    });
    
    // Performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('⏱️ Temps de chargement page onglerie:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
            }, 0);
        });
    }
    
    console.log('💅 Formation Onglerie - Page chargée avec succès!');
});