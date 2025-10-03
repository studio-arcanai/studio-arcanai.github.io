/**
 * Menu JavaScript - Version simplifiée et fonctionnelle
 * Compatible avec le CSS menu.css fourni
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🍔 Initialisation du menu...');

    // ==========================================================================
    // Variables principales
    // ==========================================================================
    
    const header = document.getElementById('header');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const dropdown = document.getElementById('formations-dropdown');
    
    // Vérification des éléments
    console.log('Header:', header ? '✅' : '❌');
    console.log('Mobile toggle:', mobileToggle ? '✅' : '❌');
    console.log('Nav menu:', navMenu ? '✅' : '❌');
    console.log('Dropdown:', dropdown ? '✅' : '❌');

    // ==========================================================================
    // 1. MENU MOBILE BURGER
    // ==========================================================================
    
    if (mobileToggle && navMenu) {
        // Clic sur le burger
        mobileToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🍔 Clic burger détecté');
            
            const isOpen = navMenu.classList.contains('active');
            
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
        
        // Fonctions pour ouvrir/fermer
        function openMobileMenu() {
            console.log('📱 Ouverture menu mobile');
            navMenu.classList.add('active');
            mobileToggle.classList.add('active');
            mobileToggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
            
            // Fermer le dropdown si ouvert
            if (dropdown) {
                dropdown.classList.remove('active');
            }
        }
        
        function closeMobileMenu() {
            console.log('📱 Fermeture menu mobile');
            navMenu.classList.remove('active');
            mobileToggle.classList.remove('active');
            mobileToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
        
        // Fermer sur clic à l'extérieur
        document.addEventListener('click', function(e) {
            if (navMenu.classList.contains('active') && 
                !header.contains(e.target)) {
                closeMobileMenu();
            }
        });
        
        // Fermer sur Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });
        
        // Fermer sur redimensionnement vers desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });
        
        console.log('✅ Menu burger configuré');
    } else {
        console.error('❌ Impossible de configurer le menu burger');
    }

    // ==========================================================================
    // 2. DROPDOWN DESKTOP
    // ==========================================================================
    
    if (dropdown) {
        const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
        const dropdownMenu = dropdown.querySelector('.dropdown-menu');
        
        if (dropdownToggle && dropdownMenu) {
            // Clic sur le toggle
            dropdownToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('📋 Clic dropdown détecté');
                
                const isActive = dropdown.classList.contains('active');
                
                // Fermer tous les autres dropdowns
                document.querySelectorAll('.nav-dropdown.active').forEach(item => {
                    if (item !== dropdown) {
                        item.classList.remove('active');
                        const toggle = item.querySelector('.dropdown-toggle');
                        if (toggle) toggle.setAttribute('aria-expanded', 'false');
                    }
                });
                
                // Toggle le dropdown actuel
                if (isActive) {
                    dropdown.classList.remove('active');
                    dropdownToggle.setAttribute('aria-expanded', 'false');
                } else {
                    dropdown.classList.add('active');
                    dropdownToggle.setAttribute('aria-expanded', 'true');
                }
            });
            
            // Fermer sur clic à l'extérieur
            document.addEventListener('click', function(e) {
                if (dropdown.classList.contains('active') && 
                    !dropdown.contains(e.target)) {
                    dropdown.classList.remove('active');
                    dropdownToggle.setAttribute('aria-expanded', 'false');
                }
            });
            
            // Navigation clavier
            dropdownToggle.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    dropdownToggle.click();
                }
                
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    dropdown.classList.add('active');
                    dropdownToggle.setAttribute('aria-expanded', 'true');
                    const firstLink = dropdownMenu.querySelector('.dropdown-link');
                    if (firstLink) firstLink.focus();
                }
                
                if (e.key === 'Escape') {
                    dropdown.classList.remove('active');
                    dropdownToggle.setAttribute('aria-expanded', 'false');
                }
            });
            
            // Navigation dans le menu
            const dropdownLinks = dropdownMenu.querySelectorAll('.dropdown-link');
            dropdownLinks.forEach((link, index) => {
                link.addEventListener('keydown', function(e) {
                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        const nextIndex = index + 1 < dropdownLinks.length ? index + 1 : 0;
                        dropdownLinks[nextIndex].focus();
                    }
                    
                    if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        const prevIndex = index > 0 ? index - 1 : dropdownLinks.length - 1;
                        dropdownLinks[prevIndex].focus();
                    }
                    
                    if (e.key === 'Escape') {
                        dropdown.classList.remove('active');
                        dropdownToggle.setAttribute('aria-expanded', 'false');
                        dropdownToggle.focus();
                    }
                });
            });
            
            console.log('✅ Dropdown configuré');
        }
    }

    // ==========================================================================
    // 3. SCROLL EFFECTS
    // ==========================================================================
    
    if (header) {
        let lastScrollY = window.scrollY;
        
        function handleScroll() {
            const currentScrollY = window.scrollY;
            
            // Classe scrolled
            if (currentScrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Masquer/afficher le header (desktop uniquement)
            if (window.innerWidth > 768 && !navMenu.classList.contains('active')) {
                if (currentScrollY > lastScrollY && currentScrollY > 200) {
                    header.style.transform = 'translateY(-100%)';
                } else {
                    header.style.transform = 'translateY(0)';
                }
            }
            
            lastScrollY = currentScrollY;
        }
        
        // Throttle pour les performances
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(function() {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
        
        console.log('✅ Scroll effects configurés');
    }

    // ==========================================================================
    // 4. SMOOTH SCROLLING
    // ==========================================================================
    
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href && href !== '#' && href.length > 1) {
                const target = document.querySelector(href);
                
                if (target) {
                    e.preventDefault();
                    
                    const headerHeight = header ? header.offsetHeight : 80;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Fermer les menus ouverts
                    if (navMenu && navMenu.classList.contains('active')) {
                        closeMobileMenu();
                    }
                    
                    if (dropdown && dropdown.classList.contains('active')) {
                        dropdown.classList.remove('active');
                        const toggle = dropdown.querySelector('.dropdown-toggle');
                        if (toggle) toggle.setAttribute('aria-expanded', 'false');
                    }
                }
            }
        });
    });
    
    console.log('✅ Smooth scrolling configuré');

    // ==========================================================================
    // 5. FINALISATION
    // ==========================================================================
    
    console.log('🎉 Menu initialisé avec succès !');
    
    // Test automatique après 2 secondes (développement seulement)
    setTimeout(() => {
        if (mobileToggle && navMenu) {
            console.log('🧪 Test disponible : mobileToggle.click()');
        }
    }, 2000);
});

// ==========================================================================
// FONCTIONS UTILITAIRES GLOBALES
// ==========================================================================

// Fonction pour fermer tous les menus (utilisable depuis l'extérieur)
window.closeAllMenus = function() {
    const navMenu = document.getElementById('nav-menu');
    const mobileToggle = document.getElementById('mobile-toggle');
    const dropdowns = document.querySelectorAll('.nav-dropdown.active');
    
    // Fermer menu mobile
    if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        if (mobileToggle) {
            mobileToggle.classList.remove('active');
            mobileToggle.setAttribute('aria-expanded', 'false');
        }
        document.body.style.overflow = '';
    }
    
    // Fermer dropdowns
    dropdowns.forEach(dropdown => {
        dropdown.classList.remove('active');
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
};