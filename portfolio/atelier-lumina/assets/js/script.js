/**
 * ATELIER LUMINA - JAVASCRIPT SIMPLIFIÉ
 * Version optimisée et maintenable
 * 4 étapes, interactions essentielles
 */

class AtelierLuminaTour {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 4;
        this.isTransitioning = false;

        this.elements = {};
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.updateProgress();

        console.log('🏠 Atelier Lumina Tour initialisé');
    }

    // ===== CACHE DES ÉLÉMENTS =====
    cacheElements() {
        this.elements = {
            // Navigation
            progressFill: document.querySelector('.progress-fill'),
            stepDots: document.querySelectorAll('.step-dot'),
            tourSteps: document.querySelectorAll('.tour-step'),

            // Boutons de navigation
            nextButtons: document.querySelectorAll('[data-next-step]'),
            prevButtons: document.querySelectorAll('[data-prev-step]'),
            restartButton: document.querySelector('[data-restart-step]'),

            // Étape 0: Entrée
            workshopDoor: document.querySelector('.workshop-door'),

            // Étape 1: Artisans
            artisanTabs: document.querySelectorAll('.artisan-tab'),
            artisanCards: document.querySelectorAll('.artisan-card'),

            // Étape 2: Galerie
            filterButtons: document.querySelectorAll('.filter-btn'),
            productCards: document.querySelectorAll('.product-card'),
            detailCard: document.querySelector('.detail-card'),

            // Étape 3: Formulaire
            contactForm: document.querySelector('.contact-form'),
            methodCards: document.querySelectorAll('.method-card')
        };
    }

    // ===== ÉVÉNEMENTS =====
    bindEvents() {
        // Navigation par les dots
        this.elements.stepDots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToStep(index));
        });

        // Boutons suivant/précédent
        this.elements.nextButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const nextStep = parseInt(e.target.dataset.nextStep);
                this.goToStep(nextStep);
            });
        });

        this.elements.prevButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const prevStep = parseInt(e.target.dataset.prevStep);
                this.goToStep(prevStep);
            });
        });

        // Bouton restart
        if (this.elements.restartButton) {
            this.elements.restartButton.addEventListener('click', () => {
                this.goToStep(0);
            });
        }

        // Porte d'entrée - interaction
        if (this.elements.workshopDoor) {
            this.elements.workshopDoor.addEventListener('click', () => {
                this.playDoorEffect();
                setTimeout(() => this.goToStep(1), 800);
            });
        }

        // Onglets artisans
        this.elements.artisanTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const artisan = e.target.closest('.artisan-tab').dataset.artisan;
                this.switchArtisan(artisan);
            });
        });

        // Filtres galerie
        this.elements.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterProducts(filter);
            });
        });

        // Cartes produits
        this.elements.productCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const product = e.target.closest('.product-card').dataset.product;
                this.selectProduct(product);
            });
        });

        // Formulaire de contact
        if (this.elements.contactForm) {
            this.elements.contactForm.addEventListener('submit', (e) => {
                this.handleFormSubmit(e);
            });
        }

        // Cartes méthodes de contact - effets hover
        this.elements.methodCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });

        // Navigation clavier
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });

        // Gestion responsive
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
    }

    // ===== NAVIGATION PRINCIPALE =====
    goToStep(stepIndex) {
        if (this.isTransitioning || stepIndex < 0 || stepIndex >= this.totalSteps) {
            return;
        }

        if (stepIndex === this.currentStep) {
            return;
        }

        this.isTransitioning = true;

        // Masquer l'étape actuelle
        this.elements.tourSteps[this.currentStep]?.classList.remove('active');

        // Afficher la nouvelle étape
        this.currentStep = stepIndex;
        this.elements.tourSteps[this.currentStep]?.classList.add('active');

        // Mettre à jour la progression
        this.updateProgress();

        // Initialiser l'étape
        this.initStep(stepIndex);

        // Scroll en haut
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Analytics
        this.trackEvent('step_viewed', { step: stepIndex });

        setTimeout(() => {
            this.isTransitioning = false;
        }, 300);
    }

    updateProgress() {
        const progress = (this.currentStep / (this.totalSteps - 1)) * 100;

        // Barre de progression
        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = `${progress}%`;
        }

        // Dots de navigation
        this.elements.stepDots.forEach((dot, index) => {
            dot.classList.remove('active');
            if (index === this.currentStep) {
                dot.classList.add('active');
            }
        });
    }

    initStep(stepIndex) {
        switch (stepIndex) {
            case 0:
                this.initEntranceStep();
                break;
            case 1:
                this.initArtisansStep();
                break;
            case 2:
                this.initGalleryStep();
                break;
            case 3:
                this.initOrderStep();
                break;
        }
    }

    // ===== ÉTAPE 0: ENTRÉE =====
    initEntranceStep() {
        // Animation d'entrée simple
        const elements = document.querySelectorAll('#step-0 .welcome-content > *');
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';

            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
                el.style.transition = 'all 0.6s ease-out';
            }, index * 100);
        });
    }

    playDoorEffect() {
        if (!this.elements.workshopDoor) return;

        this.elements.workshopDoor.style.transform = 'perspective(400px) rotateY(-12deg) scale(1.05)';
        this.elements.workshopDoor.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3)';

        setTimeout(() => {
            this.elements.workshopDoor.style.transform = 'perspective(400px) rotateY(0deg) scale(1)';
            this.elements.workshopDoor.style.boxShadow = 'var(--shadow-lg)';
        }, 600);
    }

    // ===== ÉTAPE 1: ARTISANS =====
    initArtisansStep() {
        // S'assurer que Julie est sélectionnée par défaut
        this.switchArtisan('julie');
    }

    switchArtisan(artisanName) {
        // Mettre à jour les onglets
        this.elements.artisanTabs.forEach(tab => {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');

            if (tab.dataset.artisan === artisanName) {
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
            }
        });

        // Mettre à jour les cartes
        this.elements.artisanCards.forEach(card => {
            card.classList.remove('active');

            if (card.id === `${artisanName}-content`) {
                card.classList.add('active');
            }
        });

        // Animation légère
        const activeCard = document.querySelector(`#${artisanName}-content`);
        if (activeCard) {
            activeCard.style.opacity = '0';
            activeCard.style.transform = 'translateY(10px)';

            setTimeout(() => {
                activeCard.style.opacity = '1';
                activeCard.style.transform = 'translateY(0)';
                activeCard.style.transition = 'all 0.4s ease-out';
            }, 50);
        }
    }

    // ===== ÉTAPE 2: GALERIE =====
    initGalleryStep() {
        // Sélectionner le produit featured par défaut
        this.selectProduct('suspension-chene');
        this.filterProducts('all');
    }

    filterProducts(filterType) {
        // Mettre à jour les boutons de filtre
        this.elements.filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filterType) {
                btn.classList.add('active');
            }
        });

        // Filtrer les produits
        this.elements.productCards.forEach(card => {
            const shouldShow = filterType === 'all' || card.classList.contains(filterType);

            if (shouldShow) {
                card.classList.remove('hidden');
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            } else {
                card.classList.add('hidden');
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
            }
        });
    }

    selectProduct(productId) {
        // Mettre à jour les cartes produits
        this.elements.productCards.forEach(card => {
            card.classList.remove('featured');
            if (card.dataset.product === productId) {
                card.classList.add('featured');
            }
        });

        // Mettre à jour les détails (simplifié)
        this.updateProductDetails(productId);
    }

    updateProductDetails(productId) {
        const productData = this.getProductData(productId);
        if (!productData || !this.elements.detailCard) return;

        const titleEl = this.elements.detailCard.querySelector('.detail-title');
        const priceEl = this.elements.detailCard.querySelector('.detail-price');

        if (titleEl) titleEl.textContent = productData.name;
        if (priceEl) priceEl.textContent = productData.price;

        // Animation légère
        this.elements.detailCard.style.opacity = '0.7';
        setTimeout(() => {
            this.elements.detailCard.style.opacity = '1';
            this.elements.detailCard.style.transition = 'opacity 0.3s ease';
        }, 150);
    }

    getProductData(productId) {
        const products = {
            'suspension-chene': {
                name: 'Suspension Chêne Recyclé',
                price: '189€'
            },
            'applique-pin': {
                name: 'Applique Pin des Aravis',
                price: '149€'
            },
            'lampe-noyer': {
                name: 'Lampe Noyer & Cuivre',
                price: '229€'
            },
            'lustre-custom': {
                name: 'Lustre Matériaux Mixtes',
                price: 'À partir de 449€'
            }
        };

        return products[productId];
    }

    // ===== ÉTAPE 3: COMMANDE =====
    initOrderStep() {
        // Vérifier que le formulaire est prêt
        if (this.elements.contactForm) {
            this.setupFormValidation();
        }
    }

    setupFormValidation() {
        const inputs = this.elements.contactForm.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Validation basique
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Ce champ est requis';
        } else if (field.type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Adresse email invalide';
        }

        this.updateFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    updateFieldValidation(field, isValid, errorMessage) {
        field.classList.remove('error', 'valid');

        // Supprimer l'ancien message d'erreur
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) existingError.remove();

        if (isValid && field.value.trim()) {
            field.classList.add('valid');
        } else if (!isValid) {
            field.classList.add('error');

            const errorEl = document.createElement('div');
            errorEl.className = 'field-error';
            errorEl.textContent = errorMessage;
            errorEl.style.color = '#e74c3c';
            errorEl.style.fontSize = '12px';
            errorEl.style.marginTop = '4px';

            field.parentNode.appendChild(errorEl);
        }
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorEl = field.parentNode.querySelector('.field-error');
        if (errorEl) errorEl.remove();
    }

    handleFormSubmit(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        // Validation de tous les champs
        const form = event.target;
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        let isFormValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showFormMessage('Veuillez corriger les erreurs ci-dessus.', 'error');
            return;
        }

        // Simulation de l'envoi
        this.showFormLoading();

        setTimeout(() => {
            this.showFormSuccess(data);
            this.trackEvent('form_submitted', data);
        }, 1500);
    }

    showFormLoading() {
        const submitBtn = this.elements.contactForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = '⏳ Envoi en cours...';
            submitBtn.disabled = true;
        }
    }

    showFormSuccess(data) {
        const form = this.elements.contactForm;
        const successMessage = document.createElement('div');
        successMessage.className = 'form-success';
        successMessage.innerHTML = `
            <div style="text-align: center; padding: 2rem; background: white; border-radius: 12px; box-shadow: var(--shadow-sm);">
                <h3 style="color: var(--sage-green); margin-bottom: 1rem;">🎉 Demande envoyée avec succès !</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                    Merci ${data.name || 'pour votre demande'} ! Julie ou Maxime vous recontactera sous 24h.
                </p>
                <div style="font-size: 14px; color: var(--text-muted);">
                    <p><strong>Prochaines étapes :</strong></p>
                    <p>📞 Échange téléphonique dans les 24h</p>
                    <p>📝 Devis personnalisé sous 48h</p>
                    <p>⚒️ Fabrication en 3-4 semaines</p>
                </div>
            </div>
        `;

        form.style.opacity = '0';
        form.style.transition = 'opacity 0.3s ease';

        setTimeout(() => {
            form.replaceWith(successMessage);
        }, 300);
    }

    showFormMessage(message, type = 'info') {
        const form = this.elements.contactForm;
        let messageEl = form.querySelector('.form-message');

        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.className = 'form-message';
            form.insertBefore(messageEl, form.firstChild);
        }

        messageEl.textContent = message;
        messageEl.style.padding = '1rem';
        messageEl.style.borderRadius = '8px';
        messageEl.style.marginBottom = '1rem';
        messageEl.style.fontSize = '14px';

        if (type === 'error') {
            messageEl.style.background = '#fee';
            messageEl.style.color = '#c53030';
            messageEl.style.border = '1px solid #feb2b2';
        } else {
            messageEl.style.background = '#f0fff4';
            messageEl.style.color = '#22543d';
            messageEl.style.border = '1px solid #9ae6b4';
        }
    }

    // ===== NAVIGATION CLAVIER =====
    handleKeyboard(event) {
        if (this.isTransitioning) return;

        switch (event.key) {
            case 'ArrowRight':
            case ' ': // Espace
                event.preventDefault();
                this.goToStep(Math.min(this.currentStep + 1, this.totalSteps - 1));
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.goToStep(Math.max(this.currentStep - 1, 0));
                break;
            case 'Home':
                event.preventDefault();
                this.goToStep(0);
                break;
            case 'End':
                event.preventDefault();
                this.goToStep(this.totalSteps - 1);
                break;
        }
    }

    // ===== RESPONSIVE =====
    handleResize() {
        const isMobile = window.innerWidth < 768;

        if (isMobile) {
            document.documentElement.classList.add('mobile');
        } else {
            document.documentElement.classList.remove('mobile');
        }
    }

    // ===== UTILITAIRES =====
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

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
    }

    trackEvent(eventName, eventData) {
        // Analytics (Google Analytics, etc.)
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, eventData);
        }

        // Console pour développement
        console.log(`📊 Event: ${eventName}`, eventData);
    }

    // ===== MÉTHODES PUBLIQUES =====
    getCurrentStep() {
        return this.currentStep;
    }

    getTotalSteps() {
        return this.totalSteps;
    }

    reset() {
        this.goToStep(0);
    }

    destroy() {
        // Nettoyage des event listeners si nécessaire
        console.log('🧹 Tour détruit');
    }
}

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier que les éléments essentiels sont présents
    const tourContainer = document.querySelector('.tour-container');
    const firstStep = document.querySelector('#step-0');

    if (!tourContainer || !firstStep) {
        console.warn('⚠️ Éléments du tour manquants');
        return;
    }

    // Initialiser le tour
    window.atelierTour = new AtelierLuminaTour();

    // Gestion des erreurs globales
    window.addEventListener('error', (e) => {
        console.error('❌ Erreur dans le tour:', e.error);
    });

    // Indicateur de chargement terminé
    document.body.classList.add('tour-loaded');

    console.log('🚀 Atelier Lumina Tour prêt !');
});

// ===== EXPORT POUR MODULES =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AtelierLuminaTour;
}