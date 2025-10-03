// ========================================
// MENU BURGER MOBILE
// ========================================

const burgerBtn = document.getElementById('burgerBtn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const navLinks = document.querySelectorAll('.nav-link');

// Ouvrir/Fermer le menu
burgerBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    sidebarOverlay.classList.toggle('active');
    burgerBtn.classList.toggle('active');
    
    // Empêcher le scroll du body quand le menu est ouvert
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
});

// Fermer le menu au clic sur l'overlay
sidebarOverlay.addEventListener('click', () => {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    burgerBtn.classList.remove('active');
    document.body.style.overflow = '';
});

// Fermer le menu au clic sur un lien de navigation (mobile)
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 968) {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            burgerBtn.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

// ========================================
// SMOOTH SCROLL NAVIGATION
// ========================================

navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 80; // Offset pour le header mobile
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
        
        // Active state
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

// CTA sidebar smooth scroll
const ctaSidebar = document.querySelector('.cta-sidebar');
ctaSidebar.addEventListener('click', function(e) {
    e.preventDefault();
    const contactSection = document.querySelector('#contact');
    
    if (contactSection) {
        const offsetTop = contactSection.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
    
    // Fermer le menu si mobile
    if (window.innerWidth <= 968) {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        burgerBtn.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ========================================
// INTERSECTION OBSERVER - NAVIGATION ACTIVE
// ========================================

const sections = document.querySelectorAll('section');

const observerOptions = {
    threshold: 0.3,
    rootMargin: '-80px 0px -50% 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}, observerOptions);

sections.forEach(section => observer.observe(section));

// ========================================
// FILTRES PORTFOLIO
// ========================================

const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const filter = this.getAttribute('data-filter');
        
        // Active state sur les boutons
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        // Filtrer les projets
        projectCards.forEach(card => {
            const category = card.getAttribute('data-category');
            
            if (filter === 'tous') {
                card.classList.remove('hidden');
                setTimeout(() => {
                    card.style.animation = 'fadeIn 0.5s ease forwards';
                }, 100);
            } else if (category === filter) {
                card.classList.remove('hidden');
                setTimeout(() => {
                    card.style.animation = 'fadeIn 0.5s ease forwards';
                }, 100);
            } else {
                card.style.animation = 'fadeOut 0.3s ease forwards';
                setTimeout(() => {
                    card.classList.add('hidden');
                }, 300);
            }
        });
    });
});

// Animations CSS pour les filtres
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ========================================
// FORMULAIRE DE CONTACT
// ========================================

const contactForm = document.querySelector('.contact-form');

contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const nom = document.getElementById('nom').value;
    const email = document.getElementById('email').value;
    const telephone = document.getElementById('telephone').value;
    const message = document.getElementById('message').value;

    const subject = encodeURIComponent('Demande de projet - ' + nom);
    const body = encodeURIComponent(
        'Nom : ' + nom + '\n' +
        'Email : ' + email + '\n' +
        'Téléphone : ' + telephone + '\n\n' +
        'Message :\n' + message
    );

    window.location.href = 'mailto:studio.arcanai@gmail.com?subject=' + subject + '&body=' + body;
});

// contactForm.addEventListener('submit', function(e) {
//     e.preventDefault();
    
//     // Récupérer les données du formulaire
//     const formData = new FormData(this);
//     const data = Object.fromEntries(formData);
    
//     // Ici, vous pouvez ajouter votre logique d'envoi
//     // Par exemple avec fetch() vers votre backend
    
//     console.log('Données du formulaire:', data);
    
//     // Message de confirmation (à personnaliser selon votre backend)
//     alert('Merci pour votre message ! Je vous recontacte très rapidement.');
    
//     // Réinitialiser le formulaire
//     this.reset();
// });

// ========================================
// PERFORMANCE - LAZY LOADING IMAGES
// ========================================

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    const images = document.querySelectorAll('.project-image');
    images.forEach(img => imageObserver.observe(img));
}

// ========================================
// RESET SCROLL ON PAGE LOAD
// ========================================

window.addEventListener('load', () => {
    window.scrollTo(0, 0);
});

// ========================================
// RESPONSIVE - RESET MENU ON RESIZE
// ========================================

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.innerWidth > 968) {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            burgerBtn.classList.remove('active');
            document.body.style.overflow = '';
        }
    }, 250);
});