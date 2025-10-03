// Gestion du sélecteur de pays - Version corrigée
class CountrySelector {
    constructor() {
        this.currentCountry = this.detectCurrentCountry();
        this.init();
    }

    detectCurrentCountry() {
        const path = window.location.pathname;
        if (path.includes('/nl/')) return 'nl';
        if (path.includes('/be/')) return 'be';
        return 'fr';
    }

    init() {
        const selector = document.getElementById('countrySelect');
        if (!selector) return;

        // Définir la valeur actuelle dans le sélecteur
        selector.value = this.currentCountry;

        // Gérer le changement manuel
        selector.addEventListener('change', (e) => {
            this.switchCountry(e.target.value);
        });

        // Redirection automatique SEULEMENT pour les nouvelles visites
        // (pas si l'utilisateur vient de faire un choix)
        this.handleAutoRedirectIfNeeded();
    }

    switchCountry(newCountry) {
        if (newCountry === this.currentCountry) return;

        // Marquer qu'un choix manuel vient d'être fait
        sessionStorage.setItem('manual_country_switch', 'true');

        // Sauvegarder la préférence
        localStorage.setItem('boundou_preferred_country', newCountry);

        // Rediriger vers la bonne page
        const urls = {
            'fr': '/',
            'be': '/be/',
            'nl': '/nl/'
        };

        // Tracking si Utils disponible
        if (typeof Utils !== 'undefined') {
            Utils.trackEvent('country_switched', {
                from: this.currentCountry,
                to: newCountry
            });
        }

        window.location.href = urls[newCountry];
    }

    handleAutoRedirectIfNeeded() {
        // Si l'utilisateur vient de faire un choix manuel, ne pas rediriger
        if (sessionStorage.getItem('manual_country_switch')) {
            sessionStorage.removeItem('manual_country_switch');
            return;
        }

        const preferred = localStorage.getItem('boundou_preferred_country');
        if (!preferred) return;

        // Rediriger seulement si on n'est pas déjà sur la bonne version
        const currentPath = window.location.pathname;
        const shouldRedirect =
            (preferred === 'nl' && !currentPath.includes('/nl/')) ||
            (preferred === 'be' && !currentPath.includes('/be/')) ||
            (preferred === 'fr' && (currentPath.includes('/nl/') || currentPath.includes('/be/')));

        if (shouldRedirect) {
            const urls = {
                'fr': '/',
                'be': '/be/',
                'nl': '/nl/'
            };
            window.location.href = urls[preferred];
        }
    }
}

// Initialiser quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    new CountrySelector();
});