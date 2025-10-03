/**
 * Script optimisé Maître Boundou - SEO & Performance
 * Corrige le problème de header masquant + optimisations avancées
 */

// ===== CONFIGURATION GLOBALE =====
const CONFIG = {
    phone: '+33745938332',
    whatsappBase: 'https://wa.me/33745938332',
    trackingEnabled: true,
    animationDuration: 600,
    headerHeight: 120, // Hauteur combinée breadcrumb + header
    scrollOffset: 20,
    debounceDelay: 16, // ~60fps
    throttleDelay: 100,
    countdownDuration: 15 * 60, // 15 minutes
    regions: {
        france: ['ile-de-france', 'auvergne-rhone-alpes', 'nouvelle-aquitaine', 'occitanie', 'hauts-de-france', 'grand-est', 'pays-de-la-loire', 'bretagne', 'paca', 'normandie', 'bourgogne-franche-comte', 'centre-val-de-loire', 'corse'],
        belgique: ['anvers', 'brabant-flamand', 'flandre-occidentale', 'flandre-orientale', 'limbourg']
    }
};

// ===== VARIABLES GLOBALES =====
let isScrolled = false;
let consultationFormSubmitted = false;
let countdownActive = false;
let countdownInterval = null;
let intersectionObserver = null;
let resizeObserver = null;
let pageLoadTime = performance.now();
let engagementMetrics = {
    timeOnPage: 0,
    maxScroll: 0,
    interactions: 0,
    ctaClicks: 0,
    formStarted: false,
    formCompleted: false
};

// ===== UTILITAIRES OPTIMISÉS =====
const Utils = {
    // Debounce optimisé avec AbortController pour annulation
    debounce(func, wait, options = {}) {
        let timeout;
        let abortController;
        
        const debounced = function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                if (!abortController?.signal.aborted) {
                    func.apply(this, args);
                }
            };
            
            clearTimeout(timeout);
            abortController?.abort();
            abortController = new AbortController();
            timeout = setTimeout(later, wait);
        };
        
        debounced.cancel = () => {
            clearTimeout(timeout);
            abortController?.abort();
        };
        
        return debounced;
    },

    // Throttle avec RAF pour les animations
    throttle(func, limit) {
        let inThrottle;
        let rafId;
        
        return function() {
            const args = arguments;
            const context = this;
            
            if (!inThrottle) {
                rafId = requestAnimationFrame(() => {
                    func.apply(context, args);
                    inThrottle = false;
                });
                inThrottle = true;
            }
        };
    },

    // Intersection Observer optimisé avec options par défaut
    createObserver(callback, options = {}) {
        const defaultOptions = {
            root: null,
            rootMargin: '0px 0px -30px 0px',
            threshold: 0.15
        };
        return new IntersectionObserver(callback, { ...defaultOptions, ...options });
    },

    // Smooth scroll corrigé pour le header
    smoothScrollTo(targetId, offset = CONFIG.headerHeight) {
        const target = document.getElementById(targetId) || document.querySelector(targetId);
        if (!target) return;
        
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
        
        // Utiliser l'API moderne si disponible
        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({
                top: Math.max(0, targetPosition),
                behavior: 'smooth'
            });
        } else {
            // Fallback pour anciens navigateurs
            this.animatedScrollTo(Math.max(0, targetPosition));
        }
        
        this.trackEvent('navigation_click', { target: targetId, method: 'smooth_scroll' });
    },

    // Animation de scroll personnalisée (fallback)
    animatedScrollTo(targetY) {
        const startY = window.pageYOffset;
        const difference = targetY - startY;
        const duration = Math.min(Math.abs(difference) * 0.5, 800);
        let startTime = null;

        function step(currentTime) {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const ease = progress * (2 - progress); // easeOutQuad
            
            window.scrollTo(0, startY + difference * ease);
            
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }
        
        requestAnimationFrame(step);
    },

    // Tracking avancé avec validation des données
    trackEvent(eventName, properties = {}) {
        if (!CONFIG.trackingEnabled || typeof eventName !== 'string') return;
        
        const eventData = {
            ...properties,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent.slice(0, 100), // Limiter la taille
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            timeOnPage: Math.round((Date.now() - pageLoadTime) / 1000)
        };

        console.log('📊 Event tracked:', eventName, eventData);

        // Google Analytics 4 - avec gestion d'erreur
        if (typeof gtag !== 'undefined') {
            try {
                gtag('event', eventName, {
                    custom_parameter_1: JSON.stringify(eventData).slice(0, 500),
                    event_category: 'engagement',
                    event_label: eventName
                });
            } catch (e) {
                console.warn('GA4 tracking error:', e);
            }
        }

        // Facebook Pixel - avec gestion d'erreur
        if (typeof fbq !== 'undefined') {
            try {
                fbq('track', eventName, eventData);
            } catch (e) {
                console.warn('Facebook Pixel error:', e);
            }
        }

        // Tracking personnalisé (localStorage pour analytics offline)
        try {
            const existingEvents = JSON.parse(localStorage.getItem('boundou_events') || '[]');
            existingEvents.push({ event: eventName, data: eventData });
            
            // Garder seulement les 50 derniers événements
            const recentEvents = existingEvents.slice(-50);
            localStorage.setItem('boundou_events', JSON.stringify(recentEvents));
        } catch (e) {
            // Ignore localStorage errors (mode privé, stockage plein, etc.)
        }
    },

    // Détection de région basée sur la sélection utilisateur
    getRegionInfo(regionCode) {
        for (const [country, regions] of Object.entries(CONFIG.regions)) {
            if (regions.includes(regionCode)) {
                return {
                    country: country,
                    regionCode: regionCode,
                    isEU: true,
                    currency: 'EUR',
                    timezone: country === 'france' ? 'Europe/Paris' : 'Europe/Brussels'
                };
            }
        }
        return { country: 'unknown', regionCode: regionCode };
    },

    // Validation avancée de formulaire
    validateForm(form) {
        const errors = [];
        const data = new FormData(form);
        
        // Validation nom (au moins 2 caractères, pas que des espaces)
        const name = data.get('name')?.trim();
        if (!name || name.length < 2) {
            errors.push({ field: 'name', message: 'Nom requis (minimum 2 caractères)' });
        }
        
        // Validation téléphone (format français/belge basique)
        const phone = data.get('phone')?.trim();
        const phoneRegex = /^(?:\+33|0)[1-9](?:[0-9]{8})$|^(?:\+32|0)[1-9](?:[0-9]{7,8})$/;
        if (!phone || !phoneRegex.test(phone.replace(/\s/g, ''))) {
            errors.push({ field: 'phone', message: 'Numéro de téléphone invalide' });
        }
        
        // Validation message (minimum 10 caractères)
        const message = data.get('message')?.trim();
        if (!message || message.length < 10) {
            errors.push({ field: 'message', message: 'Message trop court (minimum 10 caractères)' });
        }
        
        // Validation région
        const region = data.get('region');
        const allRegions = [...CONFIG.regions.france, ...CONFIG.regions.belgique];
        if (!region || !allRegions.includes(region)) {
            errors.push({ field: 'region', message: 'Veuillez sélectionner votre région' });
        }
        
        return errors;
    }
};

// ===== GESTIONNAIRE DE PERFORMANCE =====
class PerformanceManager {
    constructor() {
        this.metrics = {
            lcp: 0,
            fid: 0,
            cls: 0,
            fcp: 0
        };
        this.init();
    }

    init() {
        // Web Vitals avec API moderne
        if ('PerformanceObserver' in window) {
            this.observeWebVitals();
        }

        // Lazy loading des images
        this.setupLazyLoading();

        // Préchargement intelligent
        this.setupIntelligentPreloading();

        // Optimisation des polices
        this.optimizeFonts();
    }

    observeWebVitals() {
        try {
            // Largest Contentful Paint
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.lcp = lastEntry.startTime;
                Utils.trackEvent('web_vital_lcp', {
                    value: Math.round(lastEntry.startTime),
                    rating: lastEntry.startTime < 2500 ? 'good' : lastEntry.startTime < 4000 ? 'needs-improvement' : 'poor'
                });
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay
            new PerformanceObserver((entryList) => {
                entryList.getEntries().forEach(entry => {
                    this.metrics.fid = entry.processingStart - entry.startTime;
                    Utils.trackEvent('web_vital_fid', {
                        value: Math.round(this.metrics.fid),
                        rating: this.metrics.fid < 100 ? 'good' : this.metrics.fid < 300 ? 'needs-improvement' : 'poor'
                    });
                });
            }).observe({ entryTypes: ['first-input'] });

            // Cumulative Layout Shift
            new PerformanceObserver((entryList) => {
                let clsValue = 0;
                entryList.getEntries().forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                this.metrics.cls = clsValue;
                Utils.trackEvent('web_vital_cls', {
                    value: Math.round(clsValue * 1000) / 1000,
                    rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor'
                });
            }).observe({ entryTypes: ['layout-shift'] });

        } catch (error) {
            console.warn('Web Vitals observation failed:', error);
        }
    }

    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            img.addEventListener('load', () => {
                                img.classList.add('loaded');
                            });
                            observer.unobserve(img);
                        }
                    }
                });
            }, { rootMargin: '50px' });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    setupIntelligentPreloading() {
        // Précharger les ressources importantes au hover
        const importantLinks = document.querySelectorAll('.cta-primary, .cta-secondary');
        const preloadedResources = new Set();

        importantLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                if (link.href && !preloadedResources.has(link.href)) {
                    const linkElement = document.createElement('link');
                    linkElement.rel = 'prefetch';
                    linkElement.href = link.href;
                    document.head.appendChild(linkElement);
                    preloadedResources.add(link.href);
                }
            }, { passive: true });
        });
    }

    optimizeFonts() {
        // Précharger les polices critiques si pas déjà fait
        const criticalFonts = [
            'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap',
            'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap'
        ];

        criticalFonts.forEach(fontUrl => {
            if (!document.querySelector(`link[href="${fontUrl}"]`)) {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.href = fontUrl;
                link.as = 'style';
                link.crossOrigin = 'anonymous';
                document.head.appendChild(link);
            }
        });
    }
}

// ===== GESTIONNAIRE D'ANIMATIONS =====
class AnimationManager {
    constructor() {
        this.observedElements = new WeakSet();
        this.init();
    }

    init() {
        // Respecter les préférences utilisateur
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.disableAnimations();
            return;
        }

        this.setupIntersectionObserver();
        this.setupParallaxEffect();
    }

    disableAnimations() {
        document.documentElement.style.setProperty('--transition-fast', '0ms');
        document.documentElement.style.setProperty('--transition-normal', '0ms');
        document.documentElement.style.setProperty('--transition-slow', '0ms');
    }

    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.observedElements.has(entry.target)) {
                    this.animateElement(entry.target);
                    this.observedElements.add(entry.target);
                }
            });
        }, options);

        // Observer les éléments à animer
        document.querySelectorAll(`
            .service-card, 
            .testimonial-card, 
            .problem-card, 
            .benefit,
            .faq-item,
            .consultation-form
        `).forEach(el => {
            intersectionObserver.observe(el);
        });
    }

    animateElement(element) {
        // Animation avec délai progressif pour les grilles
        const siblings = Array.from(element.parentNode.children);
        const index = siblings.indexOf(element);
        const delay = Math.min(index * 100, 500); // Maximum 500ms de délai

        setTimeout(() => {
            element.classList.add('fade-in');
            Utils.trackEvent('element_animated', { 
                element: element.className.split(' ')[0],
                delay: delay 
            });
        }, delay);
    }

    setupParallaxEffect() {
        const heroBackground = document.querySelector('.hero-background');
        if (!heroBackground) return;

        const parallaxHandler = Utils.throttle(() => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.3;
            heroBackground.style.transform = `translateY(${rate}px)`;
        }, CONFIG.throttleDelay);

        window.addEventListener('scroll', parallaxHandler, { passive: true });
    }
}

// ===== GESTIONNAIRE DE NAVIGATION =====
class NavigationManager {
    constructor() {
        this.header = document.getElementById('header');
        this.lastScrollY = window.scrollY;
        this.ticking = false;
        this.init();
    }

    init() {
        this.setupStickyHeader();
        this.setupSmoothScrolling();
        this.setupMobileOptimizations();
        this.fixHeaderOverlapIssue();
    }

    // CORRECTION: Fix du problème de masquage du header
    fixHeaderOverlapIssue() {
        // Ajuster la marge du hero pour compenser le header fixe
        const hero = document.querySelector('.hero');
        if (hero && this.header) {
            const breadcrumb = document.querySelector('.breadcrumb-nav');
            const totalHeaderHeight = this.header.offsetHeight + (breadcrumb?.offsetHeight || 0);
            
            hero.style.paddingTop = `${totalHeaderHeight + 20}px`; // +20px de marge
            hero.style.marginTop = '0'; // Supprimer le margin-top du CSS
            
            // Ajuster aussi les offsets de scroll
            CONFIG.headerHeight = totalHeaderHeight;
        }
    }

    setupStickyHeader() {
        const scrollHandler = () => {
            if (!this.ticking) {
                requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;
                    
                    // Header sticky avec effet de transparence
                    if (currentScrollY > 50 && !isScrolled) {
                        this.header?.classList.add('scrolled');
                        isScrolled = true;
                    } else if (currentScrollY <= 50 && isScrolled) {
                        this.header?.classList.remove('scrolled');
                        isScrolled = false;
                    }

                    // Tracking du scroll pour engagement
                    const scrollPercentage = Math.round(
                        (currentScrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
                    );
                    engagementMetrics.maxScroll = Math.max(engagementMetrics.maxScroll, scrollPercentage);

                    this.lastScrollY = currentScrollY;
                    this.ticking = false;
                });
                this.ticking = true;
            }
        };

        window.addEventListener('scroll', scrollHandler, { passive: true });
    }

    setupSmoothScrolling() {
        // Gérer tous les liens d'ancrage
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;

            e.preventDefault();
            const targetId = link.getAttribute('href').slice(1);
            if (targetId) {
                Utils.smoothScrollTo(targetId);
                Utils.trackEvent('anchor_navigation', { target: targetId });
            }
        });
    }

    setupMobileOptimizations() {
        // Détection tactile améliorée
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');

            // Optimisation des interactions tactiles
            document.querySelectorAll('button, .cta-primary, .cta-secondary').forEach(element => {
                element.addEventListener('touchstart', function() {
                    this.classList.add('touch-active');
                }, { passive: true });

                element.addEventListener('touchend', function() {
                    setTimeout(() => this.classList.remove('touch-active'), 150);
                }, { passive: true });
            });
        }

        // Gestion de l'orientation
        window.addEventListener('orientationchange', Utils.debounce(() => {
            this.fixHeaderOverlapIssue();
            Utils.trackEvent('orientation_change', { 
                orientation: screen.orientation?.angle || 'unknown' 
            });
        }, 300));
    }
}

// ===== GESTIONNAIRE DE CONVERSION =====
class ConversionManager {
    constructor() {
        this.conversionGoals = {
            phone_call: 10,
            whatsapp_click: 8,
            form_submit: 15,
            form_start: 3,
            email_click: 5,
            scroll_75: 2
        };
        this.init();
    }

    init() {
        this.setupPhoneTracking();
        this.setupWhatsAppTracking();
        this.setupFormTracking();
        this.setupScrollMilestones();
        this.setupClickTracking();
        this.setupEngagementMetrics();
    }

    setupPhoneTracking() {
        document.querySelectorAll('a[href^="tel:"], .cta-phone').forEach(link => {
            link.addEventListener('click', (e) => {
                const phoneNumber = CONFIG.phone;
                Utils.trackEvent('phone_call_initiated', {
                    source: this.getSourceContext(e.target),
                    phone: phoneNumber,
                    value: this.conversionGoals.phone_call
                });
                
                engagementMetrics.ctaClicks++;
                this.showConversionFeedback('Appel en cours...', 'phone');
            });
        });
    }

    setupWhatsAppTracking() {
        document.querySelectorAll('.whatsapp-btn, a[href*="wa.me"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const region = document.getElementById('region')?.value || 'unknown';
                Utils.trackEvent('whatsapp_initiated', {
                    source: this.getSourceContext(e.target),
                    region: region,
                    value: this.conversionGoals.whatsapp_click
                });
                
                engagementMetrics.ctaClicks++;
                this.showConversionFeedback('Redirection WhatsApp...', 'whatsapp');
            });
        });
    }

    setupFormTracking() {
        const form = document.getElementById('consultationForm');
        if (!form) return;

        // Tracking de début de formulaire
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                if (!engagementMetrics.formStarted) {
                    engagementMetrics.formStarted = true;
                    Utils.trackEvent('form_started', {
                        form_id: 'consultation',
                        value: this.conversionGoals.form_start
                    });
                }
            }, { once: true });
        });

        // Tracking de soumission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission(form);
        });
    }

    async handleFormSubmission(form) {
        if (consultationFormSubmitted) return;

        const errors = Utils.validateForm(form);
        if (errors.length > 0) {
            this.showFormErrors(errors);
            Utils.trackEvent('form_validation_failed', { errors: errors.length });
            return;
        }

        consultationFormSubmitted = true;
        const submitBtn = form.querySelector('.form-submit');
        const originalText = submitBtn.textContent;
        
        // Animation de soumission
        submitBtn.textContent = '📤 Envoi en cours...';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';

        // Simuler l'envoi avec données réelles
        const formData = new FormData(form);
        const submissionData = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            region: formData.get('region'),
            problem: formData.get('problem'),
            message: formData.get('message'),
            timestamp: new Date().toISOString(),
            source: 'landing_page'
        };

        try {
            // Simulation d'envoi (remplacer par vraie API)
            await this.simulateFormSubmission(submissionData);
            
            // Succès
            this.showFormSuccess(form);
            Utils.trackEvent('form_submitted_success', {
                ...submissionData,
                value: this.conversionGoals.form_submit
            });
            
            engagementMetrics.formCompleted = true;
            
            // Auto-prompt WhatsApp après 3 secondes
            setTimeout(() => this.showWhatsAppPrompt(submissionData), 3000);
            
        } catch (error) {
            // Erreur
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            
            this.showNotification('Erreur lors de l\'envoi. Veuillez réessayer.', 'error');
            Utils.trackEvent('form_submission_error', { error: error.message });
        }
    }

    async simulateFormSubmission(data) {
        // Simulation réaliste d'API
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.95) { // 5% de chance d'erreur
                    reject(new Error('Network timeout'));
                } else {
                    resolve({ success: true, id: Date.now() });
                }
            }, 1500 + Math.random() * 1000); // 1.5-2.5s délai réaliste
        });
    }

    showFormSuccess(form) {
        const region = Utils.getRegionInfo(form.region?.value);
        
        form.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
                <h3 style="color: var(--light-gold); margin-bottom: 1rem;">Demande Reçue !</h3>
                <p style="margin-bottom: 1rem;">Votre consultation a été envoyée avec succès.</p>
                <p style="color: var(--success); font-weight: bold; margin-bottom: 1rem;">
                    📱 Maître Boundou vous contactera sous 2h maximum
                </p>
                <div style="background: rgba(40, 167, 69, 0.1); padding: 1rem; border-radius: 10px; margin-bottom: 1rem;">
                    <p style="font-size: 0.9rem;">
                        🔒 Vos informations sont protégées<br>
                        📍 Service disponible dans votre région: ${region.country === 'france' ? 'France' : 'Belgique'}
                    </p>
                </div>
                <p style="font-size: 0.9rem; color: var(--text-gray);">
                    Un SMS de confirmation sera envoyé sur votre téléphone
                </p>
            </div>
        `;
    }

    showFormErrors(errors) {
        errors.forEach(error => {
            const field = document.getElementById(error.field);
            if (field) {
                field.style.borderColor = 'var(--danger)';
                field.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.2)';
                
                // Créer ou mettre à jour le message d'erreur
                let errorMsg = field.parentNode.querySelector('.error-message');
                if (!errorMsg) {
                    errorMsg = document.createElement('div');
                    errorMsg.className = 'error-message';
                    errorMsg.style.cssText = `
                        color: var(--danger);
                        font-size: 0.85rem;
                        margin-top: 0.25rem;
                        font-weight: 500;
                    `;
                    field.parentNode.appendChild(errorMsg);
                }
                errorMsg.textContent = error.message;

                // Supprimer l'erreur au focus
                field.addEventListener('focus', () => {
                    field.style.borderColor = '';
                    field.style.boxShadow = '';
                    errorMsg?.remove();
                }, { once: true });
            }
        });

        this.showNotification('Veuillez corriger les erreurs dans le formulaire', 'error');
    }

    setupScrollMilestones() {
        const milestones = [25, 50, 75, 90];
        const trackedMilestones = new Set();

        const scrollHandler = Utils.throttle(() => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercentage = Math.round((scrollTop / docHeight) * 100);

            milestones.forEach(milestone => {
                if (scrollPercentage >= milestone && !trackedMilestones.has(milestone)) {
                    trackedMilestones.add(milestone);
                    Utils.trackEvent('scroll_milestone', {
                        percentage: milestone,
                        value: milestone >= 75 ? this.conversionGoals.scroll_75 : 1
                    });
                }
            });
        }, 250);

        window.addEventListener('scroll', scrollHandler, { passive: true });
    }

    setupClickTracking() {
        // Tracking global des clics avec délégation d'événement
        document.addEventListener('click', (e) => {
            const target = e.target.closest('button, .cta-primary, .cta-secondary, .service-card, .benefit');
            if (!target) return;

            engagementMetrics.interactions++;
            
            Utils.trackEvent('element_interaction', {
                element_type: target.tagName.toLowerCase(),
                element_class: target.className,
                content: target.textContent?.slice(0, 50) || '',
                position: this.getElementPosition(target)
            });
        });
    }

    setupEngagementMetrics() {
        // Mise à jour continue des métriques
        setInterval(() => {
            engagementMetrics.timeOnPage = Math.round((Date.now() - pageLoadTime) / 1000);
        }, 1000);

        // Tracking avant fermeture
        window.addEventListener('beforeunload', () => {
            Utils.trackEvent('session_end', {
                ...engagementMetrics,
                final_scroll: engagementMetrics.maxScroll,
                engagement_score: this.calculateEngagementScore()
            });
        });

        // Tracking de visibilité de la page
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                Utils.trackEvent('page_hidden', { timeOnPage: engagementMetrics.timeOnPage });
            } else {
                Utils.trackEvent('page_visible', { timeOnPage: engagementMetrics.timeOnPage });
            }
        });
    }

    calculateEngagementScore() {
        let score = 0;
        score += Math.min(engagementMetrics.timeOnPage / 60, 10) * 2; // Max 20 points pour le temps
        score += Math.min(engagementMetrics.maxScroll / 10, 10); // Max 10 points pour le scroll
        score += engagementMetrics.interactions * 3; // 3 points par interaction
        score += engagementMetrics.ctaClicks * 10; // 10 points par clic CTA
        score += engagementMetrics.formStarted ? 15 : 0; // 15 points si formulaire commencé
        score += engagementMetrics.formCompleted ? 25 : 0; // 25 points si formulaire complété
        return Math.round(score);
    }

    getSourceContext(element) {
        const section = element.closest('section');
        return section?.id || section?.className.split(' ')[0] || 'unknown';
    }

    getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            x: Math.round(rect.left + rect.width / 2),
            y: Math.round(rect.top + rect.height / 2),
            viewport_position: rect.top < window.innerHeight / 2 ? 'top' : 'bottom'
        };
    }

    showConversionFeedback(message, type) {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'phone' ? '#28a745' : '#25d366'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            font-weight: 500;
        `;
        feedback.textContent = message;
        document.body.appendChild(feedback);

        setTimeout(() => {
            feedback.style.transform = 'translateX(100%)';
            setTimeout(() => feedback.remove(), 300);
        }, 2000);
    }

    showWhatsAppPrompt(userData) {
        const popup = document.createElement('div');
        const message = encodeURIComponent(
            `Bonjour Maître Boundou, j'ai envoyé une demande de consultation.\n` +
            `Nom: ${userData.name}\n` +
            `Région: ${userData.region}\n` +
            `Problème: ${userData.problem}`
        );

        popup.innerHTML = `
            <div style="
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
                animation: fadeIn 0.3s ease-out;
            ">
                <div style="
                    background: white;
                    color: black;
                    padding: 2rem;
                    border-radius: 15px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    max-width: 400px;
                    text-align: center;
                    animation: scaleIn 0.3s ease-out;
                ">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">💬</div>
                    <h3 style="color: #25d366; margin-bottom: 1rem;">Continuons sur WhatsApp</h3>
                    <p style="margin-bottom: 2rem; line-height: 1.5;">
                        Pour un échange plus direct et recevoir votre consultation personnalisée
                    </p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <a href="https://wa.me/${CONFIG.phone.replace(/\D/g, '')}?text=${message}" 
                           style="
                               background: #25d366;
                               color: white;
                               padding: 1rem 2rem;
                               border-radius: 25px;
                               text-decoration: none;
                               font-weight: bold;
                               transition: transform 0.2s;
                           "
                           target="_blank"
                           rel="noopener noreferrer">
                            Ouvrir WhatsApp
                        </a>
                        <button onclick="this.closest('[style*=\"fixed\"]').remove()" 
                                style="
                                    background: #6c757d;
                                    color: white;
                                    padding: 1rem 2rem;
                                    border: none;
                                    border-radius: 25px;
                                    cursor: pointer;
                                    font-weight: bold;
                                ">
                            Plus tard
                        </button>
                    </div>
                </div>
            </div>
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            </style>
        `;
        
        document.body.appendChild(popup);
        
        Utils.trackEvent('whatsapp_prompt_shown', { trigger: 'form_success' });
        
        // Auto-remove après 15 secondes
        setTimeout(() => {
            if (popup.parentElement) {
                popup.remove();
                Utils.trackEvent('whatsapp_prompt_timeout');
            }
        }, 15000);
    }

    showNotification(message, type = 'info') {
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());

        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
            font-weight: 500;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
}

// ===== GESTIONNAIRE DE CONTENU DYNAMIQUE =====
class DynamicContentManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupCountdown();
        this.setupTooltips();
        this.setupFAQ();
        this.setupDynamicMessages();
    }

    setupCountdown() {
        const countdownTimer = document.getElementById('countdownTimer');
        if (!countdownTimer) return;

        let timeLeft = CONFIG.countdownDuration;
        countdownActive = true;

        const updateCountdown = () => {
            if (!countdownActive) return;

            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;

            if (timeLeft > 0) {
                countdownTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                
                // Effets d'urgence progressifs
                if (timeLeft <= 300) { // 5 minutes
                    countdownTimer.style.color = '#ff6b6b';
                    countdownTimer.classList.add('urgent');
                }
                
                if (timeLeft <= 60) { // 1 minute
                    countdownTimer.style.color = '#ff3838';
                    countdownTimer.style.fontSize = '1.3em';
                }
                
                timeLeft--;
            } else {
                this.handleCountdownExpiry(countdownTimer);
            }
        };

        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);

        // Arrêter le compte à rebours si formulaire soumis
        document.getElementById('consultationForm')?.addEventListener('submit', () => {
            this.stopCountdown('Demande reçue ✓', '#28a745');
        });
    }

    handleCountdownExpiry(countdownTimer) {
        countdownTimer.textContent = '00:00';
        countdownTimer.style.color = '#dc3545';
        
        const primaryCTA = document.getElementById('primaryCTA');
        if (primaryCTA) {
            primaryCTA.textContent = '⏰ Créneaux complets - Contactez-nous';
            primaryCTA.style.background = '#6c757d';
            primaryCTA.style.cursor = 'not-allowed';
            primaryCTA.onclick = (e) => {
                e.preventDefault();
                const conversionManager = window.conversionManager || new ConversionManager();
                conversionManager.showNotification(
                    'Plus de créneaux disponibles aujourd\'hui. Contactez-nous directement au ' + CONFIG.phone, 
                    'warning'
                );
            };
        }
        
        countdownActive = false;
        clearInterval(countdownInterval);
        Utils.trackEvent('countdown_expired');
    }

    stopCountdown(message, color) {
        const countdownTimer = document.getElementById('countdownTimer');
        if (countdownTimer) {
            countdownTimer.textContent = message;
            countdownTimer.style.color = color;
        }
        countdownActive = false;
        clearInterval(countdownInterval);
    }

    setupTooltips() {
        const tooltipElements = document.querySelectorAll('.interactive-benefit');
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        
        tooltipElements.forEach(element => {
            if (isMobile) {
                this.setupMobileTooltip(element);
            } else {
                this.setupDesktopTooltip(element);
            }
        });
    }

    setupMobileTooltip(element) {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Fermer les autres tooltips
            document.querySelectorAll('.interactive-benefit.active').forEach(other => {
                if (other !== element) other.classList.remove('active');
            });
            
            // Toggle celui-ci
            const isActive = element.classList.toggle('active');
            
            if (isActive) {
                // Ajuster la hauteur pour le contenu du tooltip
                const tooltip = element.querySelector('.benefit-tooltip');
                if (tooltip) {
                    setTimeout(() => {
                        element.style.minHeight = `${tooltip.scrollHeight + 40}px`;
                    }, 10);
                }
            } else {
                element.style.minHeight = '';
            }
            
            const benefitType = element.getAttribute('data-benefit');
            Utils.trackEvent('tooltip_mobile_interaction', {
                benefit: benefitType,
                action: isActive ? 'open' : 'close'
            });
        });
    }

    setupDesktopTooltip(element) {
        element.addEventListener('mouseenter', () => {
            const benefitType = element.getAttribute('data-benefit');
            Utils.trackEvent('tooltip_hover', { benefit: benefitType });
        });
        
        // Pas besoin de mouseleave handler, géré par CSS
    }

    setupFAQ() {
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const faqItem = question.closest('.faq-item');
                const isActive = faqItem.classList.toggle('active');
                
                // Fermer les autres FAQs (optionnel - comportement accordéon)
                const shouldCloseOthers = true; // Configurable
                if (shouldCloseOthers && isActive) {
                    document.querySelectorAll('.faq-item.active').forEach(other => {
                        if (other !== faqItem) other.classList.remove('active');
                    });
                }
                
                Utils.trackEvent('faq_interaction', {
                    question: question.textContent.slice(0, 50),
                    action: isActive ? 'open' : 'close'
                });
            });
        });
    }

    setupDynamicMessages() {
        // Messages d'urgence rotatifs
        const urgencyBanner = document.getElementById('urgencyBanner');
        if (!urgencyBanner) return;

        const messages = [
            '⏰ <strong>Créneaux limités :</strong> Seulement quelques consultations disponibles aujourd\'hui.',
            '📅 <strong>Planning chargé :</strong> Maître Boundou ne peut accompagner qu\'un nombre restreint de personnes.',
            '🕐 <strong>Réponse rapide :</strong> Votre situation sera analysée dans les plus brefs délais.',
            '✨ <strong>Suivi personnalisé :</strong> Chaque consultation est unique et adaptée à vos besoins.'
        ];

        let messageIndex = 0;
        const rotateMessage = () => {
            urgencyBanner.innerHTML = messages[messageIndex];
            messageIndex = (messageIndex + 1) % messages.length;
        };

        // Rotation toutes les 8 secondes
        setInterval(rotateMessage, 8000);

        // Message initial aléatoire
        messageIndex = Math.floor(Math.random() * messages.length);
        rotateMessage();
    }
}

// ===== GESTIONNAIRE PRINCIPAL =====
class LandingPageManager {
    constructor() {
        this.modules = {};
        this.initialized = false;
        this.init();
    }

    async init() {
        // Attendre que le DOM soit prêt
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
        } else {
            this.onDOMReady();
        }

        // Attendre le chargement complet
        if (document.readyState === 'complete') {
            this.onWindowLoad();
        } else {
            window.addEventListener('load', () => this.onWindowLoad());
        }
    }

    onDOMReady() {
        console.log('🚀 Maître Boundou Landing Page - Initialisation...');
        
        try {
            // Initialiser les gestionnaires dans l'ordre
            this.modules.performance = new PerformanceManager();
            this.modules.animation = new AnimationManager();
            this.modules.navigation = new NavigationManager();
            this.modules.conversion = new ConversionManager();
            this.modules.content = new DynamicContentManager();
            
            // Exposer globalement pour le debugging
            window.boundouManagers = this.modules;
            window.conversionManager = this.modules.conversion;
            
            this.setupGlobalErrorHandling();
            this.setupResizeHandler();
            
            Utils.trackEvent('page_ready', {
                load_time: Math.round(performance.now()),
                user_agent: navigator.userAgent.slice(0, 100),
                screen_resolution: `${screen.width}x${screen.height}`,
                viewport: `${window.innerWidth}x${window.innerHeight}`
            });
            
            this.initialized = true;
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            Utils.trackEvent('initialization_error', { error: error.message });
        }
    }

    onWindowLoad() {
        // Supprimer les loaders éventuels
        const loader = document.querySelector('.loader, .loading-spinner');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 300);
        }

        // Métriques de performance finale
        const loadTime = Math.round(performance.now());
        Utils.trackEvent('page_fully_loaded', {
            total_load_time: loadTime,
            dom_ready_time: pageLoadTime
        });

        console.log(`✅ Page complètement chargée en ${loadTime}ms`);
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', (e) => {
            Utils.trackEvent('javascript_error', {
                message: e.message,
                filename: e.filename,
                line: e.lineno,
                column: e.colno
            });
        });

        window.addEventListener('unhandledrejection', (e) => {
            Utils.trackEvent('promise_rejection', {
                reason: e.reason?.message || 'Unknown promise rejection'
            });
        });
    }

    setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Recalculer les dimensions après resize
                this.modules.navigation?.fixHeaderOverlapIssue();
                
                Utils.trackEvent('window_resize', {
                    new_size: `${window.innerWidth}x${window.innerHeight}`
                });
            }, 250);
        });
    }

    // Méthodes publiques pour interactions externes
    scrollToSection(sectionId) {
        Utils.smoothScrollTo(sectionId);
    }

    showNotification(message, type = 'info') {
        this.modules.conversion?.showNotification(message, type);
    }

    trackCustomEvent(eventName, data = {}) {
        Utils.trackEvent(eventName, data);
    }
}

// ===== STYLES D'ANIMATION DYNAMIQUES =====
const addDynamicStyles = () => {
    if (document.querySelector('#boundou-dynamic-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'boundou-dynamic-styles';
    style.textContent = `
        /* Animations d'interaction */
        .touch-device .cta-primary.touch-active,
        .touch-device .cta-secondary.touch-active {
            transform: scale(0.96) !important;
            transition: transform 0.1s ease;
        }
        
        /* États de focus améliorés */
        .cta-primary:focus-visible,
        .cta-secondary:focus-visible,
        button:focus-visible {
            outline: 2px solid var(--light-gold);
            outline-offset: 3px;
        }
        
        /* Animation de notification */
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        /* Animation des erreurs de formulaire */
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        .form-error {
            animation: shake 0.3s ease-in-out;
        }
        
        /* Optimisation pour les appareils à faible performance */
        @media (prefers-reduced-motion: reduce) {
            .hero-background {
                animation: none !important;
                transform: none !important;
            }
        }
        
        /* Mode sombre du système */
        @media (prefers-color-scheme: dark) {
            /* Déjà géré par les variables CSS du thème sombre */
        }
    `;
    document.head.appendChild(style);
};

// ===== INITIALISATION GLOBALE =====
(() => {
    // Ajouter les styles dynamiques
    addDynamicStyles();
    
    // Initialiser le gestionnaire principal
    const landingPageManager = new LandingPageManager();
    
    // Exposer globalement pour le debugging/intégration
    window.BoundouLandingPage = {
        manager: landingPageManager,
        utils: Utils,
        config: CONFIG,
        trackEvent: Utils.trackEvent,
        scrollToSection: (id) => landingPageManager.scrollToSection(id),
        showNotification: (msg, type) => landingPageManager.showNotification(msg, type)
    };
    
    // Debug mode en développement
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.DEBUG_BOUNDOU = true;
        console.log('🔧 Mode debug activé - window.BoundouLandingPage disponible');
    }
})();