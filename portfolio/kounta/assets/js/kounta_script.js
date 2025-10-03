// Estado global da aplicação
const AppState = {
    visitStartTime: Date.now(),
    scrollProgress: 0,
    hasScrolledToServices: false,
    hasScrolledToContact: false,
    clickEvents: [],
    isPhoneCallAvailable: true,
    urgencyLevel: 1
};

// Configuração
const CONFIG = {
    phoneNumber: '+351931166395',
    urgencyMessages: [
        "🔥 Consulta disponível agora",
        "⚡ Vagas limitadas hoje",
        "💫 O seu momento de mudança chegou",
        "🌟 Não deixe passar esta oportunidade"
    ],
    scrollThresholds: {
        services: 0.3,
        contact: 0.7,
        urgency: 0.5
    }
};

// Utilitários
const Utils = {
    // Debounce para otimizar as performances
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle para os eventos de scroll
    throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    },

    // Animação fluida para um elemento
    smoothScrollTo(element, offset = 0) {
        const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    },

    // Verificar se um elemento é visível
    isElementVisible(element, threshold = 0.1) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        return (
            rect.top <= windowHeight * (1 - threshold) &&
            rect.bottom >= windowHeight * threshold
        );
    },

    // Calcular o tempo passado na página
    getTimeOnPage() {
        return Math.floor((Date.now() - AppState.visitStartTime) / 1000);
    },

    // Formatar o tempo em minutos:segundos
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
};

// Gestão da urgência e da persuasão
const UrgencyManager = {
    init() {
        this.showInitialUrgency();
        this.setupScrollBasedUrgency();
        this.setupTimeBasedUrgency();
        this.setupExitIntentDetection();
    },

    showInitialUrgency() {
        setTimeout(() => {
            this.showUrgencyNotification("🔥 Consulta disponível agora - Vagas limitadas", 5000);
        }, 10000); // Após 10 segundos
    },

    setupTimeBasedUrgency() {
        // Aumentar a urgência a cada 30 segundos
        setInterval(() => {
            const timeOnPage = Utils.getTimeOnPage();

            if (timeOnPage > 30 && timeOnPage <= 60) {
                this.updatePhoneButtonText("⏰ CHAMADA URGENTE");
            } else if (timeOnPage > 60 && timeOnPage <= 120) {
                this.updatePhoneButtonText("🚨 ÚLTIMA OPORTUNIDADE");
                this.addPulseAnimation();
            } else if (timeOnPage > 120) {
                this.showUrgencyNotification("⚡ O seu futuro decide-se agora - Não demore mais!", 8000);
                this.intensifyCallButtons();
            }
        }, 30000);
    },

    setupScrollBasedUrgency() {
        const checkScrollUrgency = Utils.throttle(() => {
            const scrollPercent = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight));

            if (scrollPercent > CONFIG.scrollThresholds.services && !AppState.hasScrolledToServices) {
                AppState.hasScrolledToServices = true;
                this.showUrgencyNotification("💫 Procura uma solução? Ligue agora!", 4000);
            }

            if (scrollPercent > CONFIG.scrollThresholds.contact && !AppState.hasScrolledToContact) {
                AppState.hasScrolledToContact = true;
                this.showUrgencyNotification("🌟 Apenas mais algumas vagas disponíveis hoje", 6000);
                this.activateFloatingCallButton();
            }
        }, 500);

        window.addEventListener('scroll', checkScrollUrgency);
    },

    setupExitIntentDetection() {
        let hasShownExitIntent = false;

        document.addEventListener('mouseleave', (e) => {
            if (e.clientY <= 0 && !hasShownExitIntent) {
                hasShownExitIntent = true;
                this.showExitIntentModal();
            }
        });
    },

    showUrgencyNotification(message, duration = 5000) {
        // Remover as notificações existentes
        const existingNotification = document.querySelector('.urgency-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'urgency-notification';
        notification.innerHTML = `
            <div class="urgency-content">
                <span class="urgency-message">${message}</span>
                <a href="tel:${CONFIG.phoneNumber}" class="urgency-call-btn">LIGAR</a>
                <button class="urgency-close">&times;</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Animação de entrada
        setTimeout(() => notification.classList.add('show'), 100);

        // Gestão do fecho
        const closeBtn = notification.querySelector('.urgency-close');
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });

        // Auto-remoção
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);

        this.trackUrgencyInteraction('notification_shown', message);
    },

    showExitIntentModal() {
        const modal = document.createElement('div');
        modal.className = 'exit-intent-modal';
        modal.innerHTML = `
            <div class="exit-modal-content">
                <button class="exit-modal-close">&times;</button>
                <h3>⚡ ESPERE !</h3>
                <p>A sua solução está ao seu alcance.</p>
                <p><strong>Oferta especial:</strong> Consulta por apenas 35€ se ligar nos próximos 5 minutos!</p>
                <div class="exit-countdown">
                    <span id="countdown-timer">5:00</span>
                </div>
                <a href="tel:${CONFIG.phoneNumber}" class="exit-call-btn">APROVEITAR A OFERTA</a>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);

        // Countdown timer
        this.startCountdown(300); // 5 minutos

        // Gestão do fecho
        const closeBtn = modal.querySelector('.exit-modal-close');
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });

        // Fechar clicando fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        });

        this.trackUrgencyInteraction('exit_intent_shown');
    },

    startCountdown(seconds) {
        const timerElement = document.getElementById('countdown-timer');
        if (!timerElement) return;

        const countdown = setInterval(() => {
            if (seconds <= 0) {
                clearInterval(countdown);
                timerElement.textContent = "EXPIRADO";
                return;
            }

            timerElement.textContent = Utils.formatTime(seconds);
            seconds--;
        }, 1000);
    },

    updatePhoneButtonText(newText) {
        const phoneButtons = document.querySelectorAll('.btn-call, .btn-primary, .btn-final');
        phoneButtons.forEach(btn => {
            if (btn.href && btn.href.includes('tel:')) {
                btn.innerHTML = newText;
            }
        });
    },

    addPulseAnimation() {
        const phoneButtons = document.querySelectorAll('[href*="tel:"]');
        phoneButtons.forEach(btn => {
            btn.classList.add('pulse-animation');
        });
    },

    intensifyCallButtons() {
        const phoneButtons = document.querySelectorAll('[href*="tel:"]');
        phoneButtons.forEach(btn => {
            btn.classList.add('intense-glow');
        });
    },

    activateFloatingCallButton() {
        if (document.querySelector('.floating-call-btn')) return;

        const floatingBtn = document.createElement('div');
        floatingBtn.className = 'floating-call-btn';
        floatingBtn.innerHTML = `
            <a href="tel:${CONFIG.phoneNumber}">
                <span class="float-icon">📞</span>
                <span class="float-text">CHAMADA URGENTE</span>
            </a>
        `;

        document.body.appendChild(floatingBtn);
        setTimeout(() => floatingBtn.classList.add('show'), 100);

        this.trackUrgencyInteraction('floating_button_activated');
    },

    trackUrgencyInteraction(type, details = '') {
        AppState.clickEvents.push({
            type: type,
            details: details,
            timestamp: Date.now(),
            timeOnPage: Utils.getTimeOnPage()
        });

        console.log(`Urgency Event: ${type}`, details);
    }
};

// Gestão das animações e interações visuais
const AnimationManager = {
    init() {
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupParallaxEffects();
        this.setupCountUpAnimations();
        this.setupIntersectionObserver();
    },

    setupScrollAnimations() {
        // Animação do header no scroll
        const header = document.querySelector('.header-main');
        const scrollHandler = Utils.throttle(() => {
            const scrolled = window.pageYOffset;

            if (scrolled > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            // Atualização do progresso de scroll
            AppState.scrollProgress = (scrolled / (document.documentElement.scrollHeight - window.innerHeight));
        }, 16);

        window.addEventListener('scroll', scrollHandler);
    },

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');

                    // Trigger específico para os elementos de serviços
                    if (entry.target.classList.contains('service-card')) {
                        setTimeout(() => {
                            entry.target.classList.add('bounce-in');
                        }, Math.random() * 300);
                    }
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observar todos os elementos animáveis
        document.querySelectorAll('.service-card, .timeline-item, .feature, .location-item, .faq-item').forEach(el => {
            observer.observe(el);
        });
    },

    setupParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.hero-image');

        const parallaxHandler = Utils.throttle(() => {
            const scrolled = window.pageYOffset;
            parallaxElements.forEach(el => {
                const rate = scrolled * -0.5;
                el.style.transform = `translate3d(0, ${rate}px, 0)`;
            });
        }, 16);

        window.addEventListener('scroll', parallaxHandler);
    },

    setupCountUpAnimations() {
        const countElements = document.querySelectorAll('.guarantee-percent');

        countElements.forEach(el => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateCountUp(entry.target, 100, 2000);
                        observer.unobserve(entry.target);
                    }
                });
            });
            observer.observe(el);
        });
    },

    animateCountUp(element, target, duration) {
        const start = 0;
        const range = target - start;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (range * easeOutQuart));

            element.textContent = current + '%';

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    },

    setupHoverEffects() {
        // Efeito de hover sofisticado nas cartas de serviço
        document.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                this.createRippleEffect(e.target, e);
            });
        });
    },

    createRippleEffect(element, event) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';

        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        element.appendChild(ripple);

        setTimeout(() => ripple.remove(), 1000);
    }
};

// Gestão da navegação e do scroll suave
const NavigationManager = {
    init() {
        this.setupSmoothScrolling();
        this.setupMobileMenu();
        this.highlightActiveSection();
    },

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    Utils.smoothScrollTo(targetElement, 80);

                    // Tracking de navegação
                    this.trackNavigation(targetId);
                }
            });
        });
    },

    setupMobileMenu() {
        // Para uma futura implementação do menu mobile
        // Se necessário, podemos adicionar um hamburger menu aqui
    },

    highlightActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-main a[href^="#"]');

        const highlightHandler = Utils.throttle(() => {
            let currentSection = '';

            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 100 && rect.bottom >= 100) {
                    currentSection = section.id;
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSection}`) {
                    link.classList.add('active');
                }
            });
        }, 100);

        window.addEventListener('scroll', highlightHandler);
    },

    trackNavigation(target) {
        AppState.clickEvents.push({
            type: 'navigation',
            target: target,
            timestamp: Date.now(),
            timeOnPage: Utils.getTimeOnPage()
        });
    }
};

// Gestão das interações telefónicas
const PhoneManager = {
    init() {
        this.trackPhoneClicks();
        this.setupCallButtonEffects();
        this.addCallTracking();
    },

    trackPhoneClicks() {
        document.querySelectorAll('[href*="tel:"]').forEach(link => {
            link.addEventListener('click', (e) => {
                // Tracking do evento de chamada
                const buttonText = e.target.textContent.trim();
                const buttonLocation = this.getButtonLocation(e.target);

                AppState.clickEvents.push({
                    type: 'phone_click',
                    buttonText: buttonText,
                    location: buttonLocation,
                    timestamp: Date.now(),
                    timeOnPage: Utils.getTimeOnPage()
                });

                // Animação de confirmação
                this.showCallConfirmation(e.target);

                // Analytics (se disponível)
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'phone_click', {
                        'button_text': buttonText,
                        'button_location': buttonLocation,
                        'value': 50
                    });
                }

                console.log('Chamada iniciada:', CONFIG.phoneNumber, 'desde:', buttonLocation);
            });
        });
    },

    getButtonLocation(button) {
        const section = button.closest('section');
        if (section) {
            return section.className || section.id || 'unknown';
        }

        if (button.closest('header')) return 'header';
        if (button.closest('footer')) return 'footer';
        if (button.classList.contains('floating-call-btn')) return 'floating';

        return 'other';
    },

    setupCallButtonEffects() {
        document.querySelectorAll('[href*="tel:"]').forEach(button => {
            // Efeito de respiração subtil
            button.addEventListener('mouseenter', () => {
                button.style.animation = 'subtle-pulse 1.5s infinite';
            });

            button.addEventListener('mouseleave', () => {
                button.style.animation = '';
            });
        });
    },

    showCallConfirmation(button) {
        const originalText = button.innerHTML;
        button.innerHTML = '📞 A ligar...';
        button.style.pointerEvents = 'none';

        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.pointerEvents = 'auto';
        }, 2000);
    },

    addCallTracking() {
        // Adicionar números de telefone trackáveis se necessário
        // Para diferentes fontes de tráfego
    }
};

// Gestão dos testemunhos
const TestimonialsManager = {
    currentSlide: 0,
    totalSlides: 0,
    autoSlideInterval: null,

    init() {
        this.setupSlider();
        this.setupNavigation();
        this.startAutoSlide();
        this.setupTrackingEvents();
    },

    setupSlider() {
        const cards = document.querySelectorAll('.testimonial-card');
        this.totalSlides = cards.length;

        if (this.totalSlides === 0) return;

        // Ocultar todas as cartas exceto a primeira
        cards.forEach((card, index) => {
            if (index !== 0) {
                card.classList.remove('active');
            }
        });
    },

    setupNavigation() {
        const prevBtn = document.querySelector('.testimonial-prev');
        const nextBtn = document.querySelector('.testimonial-next');
        const dots = document.querySelectorAll('.testimonials-dots .dot');

        if (prevBtn) prevBtn.addEventListener('click', () => this.prevSlide());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextSlide());

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
    },

    goToSlide(slideIndex) {
        const cards = document.querySelectorAll('.testimonial-card');
        const dots = document.querySelectorAll('.testimonials-dots .dot');

        // Remover active de todas as cartas e dots
        cards.forEach(card => card.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        // Ativar a nova carta e dot
        if (cards[slideIndex]) cards[slideIndex].classList.add('active');
        if (dots[slideIndex]) dots[slideIndex].classList.add('active');

        this.currentSlide = slideIndex;
        this.restartAutoSlide();

        // Tracking
        this.trackTestimonialView(slideIndex);
    },

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.totalSlides;
        this.goToSlide(nextIndex);
    },

    prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.goToSlide(prevIndex);
    },

    startAutoSlide() {
        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, 5000); // Muda a cada 5 segundos
    },

    restartAutoSlide() {
        clearInterval(this.autoSlideInterval);
        this.startAutoSlide();
    },

    setupTrackingEvents() {
        // Rastrear cliques nos testemunhos
        document.querySelectorAll('.testimonial-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                this.trackTestimonialClick(index);
            });
        });

        // Rastrear cliques no CTA
        const ctaBtn = document.querySelector('.btn-testimonial');
        if (ctaBtn) {
            ctaBtn.addEventListener('click', () => {
                AppState.clickEvents.push({
                    type: 'testimonial_cta_click',
                    timestamp: Date.now(),
                    timeOnPage: Utils.getTimeOnPage(),
                    currentTestimonial: this.currentSlide
                });
            });
        }
    },

    trackTestimonialView(index) {
        AppState.clickEvents.push({
            type: 'testimonial_view',
            testimonialIndex: index,
            timestamp: Date.now(),
            timeOnPage: Utils.getTimeOnPage()
        });
    },

    trackTestimonialClick(index) {
        AppState.clickEvents.push({
            type: 'testimonial_click',
            testimonialIndex: index,
            timestamp: Date.now(),
            timeOnPage: Utils.getTimeOnPage()
        });
    }
};

// Gestor de performance e otimização
const PerformanceManager = {
    init() {
        this.optimizeImages();
        this.preloadCriticalResources();
        this.setupLazyLoading();
        this.monitorPerformance();
    },

    optimizeImages() {
        // Observer para o lazy loading das imagens
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.add('loaded');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    },

    preloadCriticalResources() {
        // Pré-carregar os recursos críticos
        const criticalAssets = [
            'assets/img/logo.svg',
            'assets/img/toit-traditionnel.jpg'
        ];

        criticalAssets.forEach(asset => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = asset;
            document.head.appendChild(link);
        });
    },

    setupLazyLoading() {
        // Setup para os elementos não-críticos
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                }
            });
        });

        document.querySelectorAll('.lazy-load').forEach(el => {
            observer.observe(el);
        });
    },

    monitorPerformance() {
        // Monitoring básico das performances
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = {
                    loadTime: Date.now() - AppState.visitStartTime,
                    timing: performance.timing,
                    navigation: performance.navigation
                };

                console.log('Performance Data:', perfData);
            }, 1000);
        });
    }
};

// Inicialização principal
class KontaLandingApp {
    constructor() {
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;

        // Verificar que o DOM está carregado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        console.log('🔮 Inicialização da página Professor Kounta...');

        try {
            // Inicializar todos os managers
            UrgencyManager.init();
            AnimationManager.init();
            NavigationManager.init();
            PhoneManager.init();
            PerformanceManager.init();
            TestimonialsManager.init();

            // Setup dos eventos globais
            this.setupGlobalEvents();

            this.isInitialized = true;
            console.log('✅ Aplicação inicializada com sucesso');

        } catch (error) {
            console.error('❌ Erro durante a inicialização:', error);
        }
    }

    injectDynamicStyles() {
        const dynamicStyles = `
            <style>
            .urgency-notification {
                position: fixed;
                top: 100px;
                right: -400px;
                background: linear-gradient(135deg, #c41e3a, #8b1538);
                color: white;
                padding: 1rem;
                border-radius: 10px 0 0 10px;
                box-shadow: 0 4px 20px rgba(196, 30, 58, 0.3);
                z-index: 1001;
                max-width: 350px;
                transition: right 0.3s ease;
            }
            
            .urgency-notification.show {
                right: 0;
            }
            
            .urgency-content {
                display: flex;
                align-items: center;
                gap: 1rem;
                position: relative;
            }
            
            .urgency-message {
                flex: 1;
                font-weight: 600;
            }
            
            .urgency-call-btn {
                background: #d4af37;
                color: #343a40;
                padding: 0.5rem 1rem;
                border-radius: 5px;
                text-decoration: none;
                font-weight: 700;
                transition: all 0.3s ease;
            }
            
            .urgency-call-btn:hover {
                background: #b8941f;
                transform: scale(1.05);
            }
            
            .urgency-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .exit-intent-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 1002;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .exit-intent-modal.show {
                opacity: 1;
                visibility: visible;
            }
            
            .exit-modal-content {
                background: white;
                padding: 3rem;
                border-radius: 20px;
                text-align: center;
                max-width: 500px;
                position: relative;
                transform: scale(0.7);
                transition: transform 0.3s ease;
            }
            
            .exit-intent-modal.show .exit-modal-content {
                transform: scale(1);
            }
            
            .exit-modal-close {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                font-size: 2rem;
                cursor: pointer;
                color: #c41e3a;
            }
            
            .exit-countdown {
                background: #c41e3a;
                color: white;
                padding: 1rem;
                border-radius: 10px;
                margin: 2rem 0;
                font-size: 2rem;
                font-weight: bold;
            }
            
            .exit-call-btn {
                background: linear-gradient(135deg, #d4af37, #b8941f);
                color: #343a40;
                padding: 1rem 2rem;
                border-radius: 50px;
                text-decoration: none;
                font-weight: 700;
                display: inline-block;
                transition: all 0.3s ease;
            }
            
            .floating-call-btn {
                position: fixed;
                bottom: 20px;
                right: -200px;
                z-index: 1000;
                transition: right 0.3s ease;
            }
            
            .floating-call-btn.show {
                right: 20px;
            }
            
            .floating-call-btn a {
                background: linear-gradient(135deg, #c41e3a, #8b1538);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 50px;
                text-decoration: none;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                box-shadow: 0 4px 20px rgba(196, 30, 58, 0.4);
                animation: float-bounce 2s infinite;
            }
            
            .pulse-animation {
                animation: urgent-pulse 1s infinite !important;
            }
            
            .intense-glow {
                box-shadow: 0 0 30px rgba(212, 175, 55, 0.8) !important;
                animation: intense-glow 1.5s infinite !important;
            }
            
            .ripple-effect {
                position: absolute;
                border-radius: 50%;
                background: rgba(196, 30, 58, 0.3);
                transform: scale(0);
                animation: ripple 1s linear;
                pointer-events: none;
            }
            
            .scrolled {
                background: rgba(255, 255, 255, 0.98) !important;
                box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1) !important;
            }
            
            .animate-in {
                animation: slideInUp 0.6s ease forwards;
            }
            
            .bounce-in {
                animation: bounceIn 0.8s ease forwards;
            }
            
            @keyframes urgent-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            @keyframes intense-glow {
                0%, 100% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.6); }
                50% { box-shadow: 0 0 40px rgba(212, 175, 55, 1); }
            }
            
            @keyframes float-bounce {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
            
            @keyframes ripple {
                0% {
                    transform: scale(0);
                    opacity: 1;
                }
                100% {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes bounceIn {
                0% {
                    opacity: 0;
                    transform: scale(0.3);
                }
                50% {
                    opacity: 1;
                    transform: scale(1.05);
                }
                70% {
                    transform: scale(0.9);
                }
                100% {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            @keyframes subtle-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
            }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', dynamicStyles);
    }

    setupGlobalEvents() {
        // Gestão dos erros globais
        window.addEventListener('error', (e) => {
            console.warn('Erro capturado:', e.error);
        });

        // Gestão da visibilidade da página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                AppState.pageHiddenTime = Date.now();
            } else {
                // O utilizador volta à página
                const timeAway = Date.now() - (AppState.pageHiddenTime || Date.now());
                if (timeAway > 30000) { // Mais de 30 segundos ausente
                    UrgencyManager.showUrgencyNotification("🎯 Bem-vindo de volta! A sua solução aguarda", 4000);
                }
            }
        });

        // Tracking do scroll para analytics
        let maxScrollReached = 0;
        window.addEventListener('scroll', Utils.throttle(() => {
            const scrollPercent = Math.round((window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
            if (scrollPercent > maxScrollReached) {
                maxScrollReached = scrollPercent;

                // Marcos de scroll
                if (scrollPercent >= 25 && !AppState.scroll25) {
                    AppState.scroll25 = true;
                    this.trackEngagement('scroll_25');
                }
                if (scrollPercent >= 50 && !AppState.scroll50) {
                    AppState.scroll50 = true;
                    this.trackEngagement('scroll_50');
                }
                if (scrollPercent >= 75 && !AppState.scroll75) {
                    AppState.scroll75 = true;
                    this.trackEngagement('scroll_75');
                    UrgencyManager.showUrgencyNotification("🔥 Quase no fim? É hora de agir!", 5000);
                }
                if (scrollPercent >= 90 && !AppState.scroll90) {
                    AppState.scroll90 = true;
                    this.trackEngagement('scroll_90');
                }
            }
        }, 1000));

        // Deteção da inatividade
        this.setupInactivityDetection();

        // Otimização para mobile
        this.setupMobileOptimizations();
    }

    setupInactivityDetection() {
        let inactivityTimer;
        let lastActivity = Date.now();

        const resetTimer = () => {
            lastActivity = Date.now();
            clearTimeout(inactivityTimer);

            inactivityTimer = setTimeout(() => {
                const timeInactive = Date.now() - lastActivity;
                if (timeInactive >= 60000) { // 1 minuto de inatividade
                    UrgencyManager.showUrgencyNotification("⏰ Ainda aqui? A sua consulta aguarda!", 6000);
                }
            }, 60000);
        };

        // Eventos que reinicializam o timer de inatividade
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, Utils.debounce(resetTimer, 1000));
        });

        resetTimer(); // Começar o timer
    }

    setupMobileOptimizations() {
        // Deteção mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {
            document.body.classList.add('mobile-device');

            // Otimizações específicas mobile
            this.optimizeForMobile();
        }

        // Gestão da orientação
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                window.scrollTo(0, window.pageYOffset + 1); // Força o recálculo
                window.scrollTo(0, window.pageYOffset - 1);
            }, 500);
        });
    }

    optimizeForMobile() {
        // Melhorar as interações tácteis
        document.querySelectorAll('a, button').forEach(element => {
            element.style.minHeight = '44px';
            element.style.minWidth = '44px';
        });

        // Otimizar as animações para mobile
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (prefersReducedMotion.matches) {
            document.body.classList.add('reduced-motion');
        }

        // Call-to-action otimizado para mobile
        const mobileCallBar = document.createElement('div');
        mobileCallBar.className = 'mobile-call-bar';
        mobileCallBar.innerHTML = `
            <a href="tel:${CONFIG.phoneNumber}" class="mobile-call-btn">
                📞 LIGAR AGORA
            </a>
        `;
        document.body.appendChild(mobileCallBar);
    }

    trackEngagement(event, data = {}) {
        const engagementData = {
            event: event,
            timestamp: Date.now(),
            timeOnPage: Utils.getTimeOnPage(),
            scrollProgress: Math.round(AppState.scrollProgress * 100),
            ...data
        };

        AppState.clickEvents.push(engagementData);

        // Enviar para Google Analytics se disponível
        if (typeof gtag !== 'undefined') {
            gtag('event', event, {
                custom_parameter: JSON.stringify(data),
                time_on_page: Utils.getTimeOnPage()
            });
        }

        console.log('📊 Engagement tracked:', engagementData);
    }

    // Métodos públicos para interação externa
    showCustomUrgency(message, duration = 5000) {
        UrgencyManager.showUrgencyNotification(message, duration);
    }

    getAnalyticsData() {
        return {
            visitDuration: Utils.getTimeOnPage(),
            maxScroll: Math.round(AppState.scrollProgress * 100),
            interactions: AppState.clickEvents.length,
            events: AppState.clickEvents,
            urgencyLevel: AppState.urgencyLevel
        };
    }

    // Debug et monitoring
    enableDebugMode() {
        window.KontaDebug = {
            state: AppState,
            config: CONFIG,
            utils: Utils,
            showUrgency: (msg) => this.showCustomUrgency(msg),
            getAnalytics: () => this.getAnalyticsData(),
            triggerExitIntent: () => UrgencyManager.showExitIntentModal()
        };

        console.log('🔧 Modo debug ativado. Use window.KontaDebug para interagir.');
    }
};


// Extensions pour fonctionnalités avancées
const AdvancedFeatures = {
    // A/B Testing basique
    setupABTesting() {
        const variant = Math.random() > 0.5 ? 'A' : 'B';

        if (variant === 'B') {
            // Variante B : Prix plus visible
            document.querySelectorAll('.price').forEach(price => {
                price.style.fontSize = '2.5rem';
                price.style.color = '#d4af37';
            });

            // Tracking de la variante
            AppState.abVariant = 'B';
        } else {
            AppState.abVariant = 'A';
        }

        console.log(`🧪 Variante A/B: ${variant}`);
    },

    // Personalização baseada na hora
    setupTimeBasedPersonalization() {
        const hour = new Date().getHours();
        let timeMessage = '';

        if (hour >= 6 && hour < 12) {
            timeMessage = '🌅 Bom dia! Comece o seu dia com uma mudança positiva';
        } else if (hour >= 12 && hour < 17) {
            timeMessage = '☀️ Boa tarde! O momento perfeito para transformar a sua vida';
        } else if (hour >= 17 && hour < 22) {
            timeMessage = '🌆 Boa noite! Termine este dia tomando a decisão certa';
        } else {
            timeMessage = '🌙 Mesmo tarde à noite, o seu futuro não pode esperar';
        }

        setTimeout(() => {
            UrgencyManager.showUrgencyNotification(timeMessage, 4000);
        }, 15000);
    },

    // Deteção da geolocalização (se autorizada)
    setupLocationPersonalization() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Se obtemos a posição, podemos personalizar a mensagem
                    setTimeout(() => {
                        UrgencyManager.showUrgencyNotification(
                            "🗺️ Serviço disponível na sua região! Consulta imediata possível",
                            5000
                        );
                    }, 20000);
                },
                () => {
                    // Geolocalização recusada ou impossível
                    console.log('Geolocalização não disponível');
                }
            );
        }
    },

    // Social proof dinâmico
    setupSocialProof() {
        const consultationsToday = Math.floor(Math.random() * 15) + 5; // Entre 5 e 20
        const peopleWaiting = Math.floor(Math.random() * 8) + 2; // Entre 2 e 10

        // Adicionar um indicador de social proof
        const socialProofDiv = document.createElement('div');
        socialProofDiv.className = 'social-proof-indicator';
        socialProofDiv.innerHTML = `
            <div class="social-proof-content">
                <span class="social-proof-icon">👥</span>
                <span class="social-proof-text">${consultationsToday} consultas hoje • ${peopleWaiting} pessoas em espera</span>
                <div class="social-proof-dots">
                    <span class="dot active"></span>
                    <span class="dot active"></span>
                    <span class="dot"></span>
                </div>
            </div>
        `;

        // Inserir após o header
        const header = document.querySelector('.header-main');
        if (header && header.nextSibling) {
            header.parentNode.insertBefore(socialProofDiv, header.nextSibling);
        }

        // Animação dos pontos
        setInterval(() => {
            const dots = socialProofDiv.querySelectorAll('.dot');
            dots.forEach((dot, index) => {
                setTimeout(() => {
                    dot.classList.toggle('active');
                }, index * 200);
            });
        }, 3000);
    },

    // Countdown dinâmico
    setupDynamicCountdown() {
        // Criar um countdown para "oferta do dia"
        const now = new Date();
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        const timeLeft = endOfDay - now;

        if (timeLeft > 0) {
            const countdownElement = document.createElement('div');
            countdownElement.className = 'daily-offer-countdown';
            countdownElement.innerHTML = `
                <div class="countdown-content">
                    <span class="countdown-label">⚡ Oferta especial do dia termina em:</span>
                    <div class="countdown-timer" id="daily-countdown">
                        <span class="time-part"><span id="hours">00</span><small>h</small></span>
                        <span class="time-part"><span id="minutes">00</span><small>m</small></span>
                        <span class="time-part"><span id="seconds">00</span><small>s</small></span>
                    </div>
                </div>
            `;

            // Inserir antes da seção de contacto
            const contactSection = document.querySelector('#contacto');
            if (contactSection) {
                contactSection.parentNode.insertBefore(countdownElement, contactSection);
            }

            // Iniciar o countdown
            this.startDailyCountdown(Math.floor(timeLeft / 1000));
        }
    },

    startDailyCountdown(totalSeconds) {
        const updateCountdown = () => {
            if (totalSeconds <= 0) {
                return;
            }

            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            const hoursEl = document.getElementById('hours');
            const minutesEl = document.getElementById('minutes');
            const secondsEl = document.getElementById('seconds');

            if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
            if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
            if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');

            totalSeconds--;
        };

        updateCountdown(); // Mise à jour immédiate
        setInterval(updateCountdown, 1000);
    }
};

// Inicialização e arranque
const kontaApp = new KontaLandingApp();

// Iniciar a aplicação
kontaApp.init();


// Activer les fonctionnalités avancées après le chargement complet
window.addEventListener('load', () => {
    setTimeout(() => {
        AdvancedFeatures.setupABTesting();
        AdvancedFeatures.setupTimeBasedPersonalization();
        AdvancedFeatures.setupLocationPersonalization();
        AdvancedFeatures.setupSocialProof();
        AdvancedFeatures.setupDynamicCountdown();

        // Ajouter les styles pour les nouvelles fonctionnalités
        const advancedStyles = `
            <style>
            .social-proof-indicator {
                position: fixed;
                top: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(45, 80, 22, 0.95);
                color: white;
                padding: 0.8rem 2rem;
                border-radius: 25px;
                font-size: 0.9rem;
                z-index: 999;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .social-proof-content {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .social-proof-dots {
                display: flex;
                gap: 4px;
            }
            
            .dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transition: all 0.3s ease;
            }
            
            .dot.active {
                background: #d4af37;
                transform: scale(1.2);
            }
            
            .daily-offer-countdown {
                background: linear-gradient(135deg, #c41e3a, #8b1538);
                color: white;
                padding: 2rem 0;
                text-align: center;
                margin: 3rem 0;
            }
            
            .countdown-content {
                max-width: 600px;
                margin: 0 auto;
            }
            
            .countdown-label {
                display: block;
                font-size: 1.2rem;
                margin-bottom: 1rem;
                font-weight: 600;
            }
            
            .countdown-timer {
                display: flex;
                justify-content: center;
                gap: 2rem;
            }
            
            .time-part {
                background: rgba(255, 255, 255, 0.1);
                padding: 1rem;
                border-radius: 10px;
                min-width: 80px;
                backdrop-filter: blur(10px);
            }
            
            .time-part span {
                font-size: 2rem;
                font-weight: bold;
                display: block;
            }
            
            .time-part small {
                font-size: 0.8rem;
                opacity: 0.8;
            }
            
            .mobile-call-bar {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #c41e3a, #8b1538);
                padding: 1rem;
                z-index: 1000;
                display: none;
            }
            
            .mobile-call-btn {
                display: block;
                background: #d4af37;
                color: #343a40;
                text-align: center;
                padding: 1rem;
                border-radius: 10px;
                text-decoration: none;
                font-weight: bold;
                font-size: 1.1rem;
            }
            
            @media (max-width: 768px) {
                .mobile-call-bar {
                    display: block;
                }
                
                .social-proof-indicator {
                    position: static;
                    transform: none;
                    margin: 1rem;
                    font-size: 0.8rem;
                }
                
                .countdown-timer {
                    gap: 1rem;
                }
                
                .time-part {
                    min-width: 60px;
                    padding: 0.8rem;
                }
                
                .time-part span {
                    font-size: 1.5rem;
                }
            }
            
            .mobile-device .floating-call-btn {
                display: none;
            }
            
            .reduced-motion * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', advancedStyles);
    }, 2000);
});

// Debug mode em desenvolvimento
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.KontaDebug = {
        state: AppState,
        config: CONFIG,
        utils: Utils,
        showUrgency: (msg) => kontaApp.showCustomUrgency(msg),
        getAnalytics: () => kontaApp.getAnalyticsData(),
        triggerExitIntent: () => UrgencyManager.showExitIntentModal()
    };

    console.log('🔧 Modo debug ativado. Use window.KontaDebug para interagir.');
}



// Export pour utilisation externe si nécessaire
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { KontaLandingApp, Utils, UrgencyManager };
}