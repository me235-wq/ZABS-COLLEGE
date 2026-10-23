(function() {
    'use strict';

    const header = document.getElementById('header');
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const yearEl = document.getElementById('year');
    const themeToggleBtn = document.getElementById('themeToggle');
    const mobileThemeToggleBtn = document.getElementById('mobileThemeToggle');

    let currentLightboxIndex = 0;
    let galleryImages = [];

    document.addEventListener('DOMContentLoaded', function() {
        initTheme();
        initYear();
        initHeader();
        initMobileMenu();
        initScrollAnimations();
        initGallery();
        initLightbox();
        initSmoothScroll();
    });

    function initTheme() {
        const savedTheme = localStorage.getItem('zabs_theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }

        if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
        if (mobileThemeToggleBtn) mobileThemeToggleBtn.addEventListener('click', toggleTheme);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('zabs_theme', newTheme);
    }

    function initYear() {
        if (yearEl) yearEl.textContent = new Date().getFullYear();
    }

    function initHeader() {
        function handleScroll() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    }

    function initMobileMenu() {
        if (!mobileToggle || !mobileMenu) return;
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        document.body.appendChild(overlay);

        function openMenu() {
            mobileMenu.classList.add('active');
            mobileToggle.classList.add('active');
            mobileToggle.setAttribute('aria-expanded', 'true');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeMenu() {
            mobileMenu.classList.remove('active');
            mobileToggle.classList.remove('active');
            mobileToggle.setAttribute('aria-expanded', 'false');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        mobileToggle.addEventListener('click', function() {
            if (mobileMenu.classList.contains('active')) closeMenu();
            else openMenu();
        });

        overlay.addEventListener('click', closeMenu);
        const mobileLinks = mobileMenu.querySelectorAll('.mobile-link, .mobile-cta');
        mobileLinks.forEach(function(link) { link.addEventListener('click', closeMenu); });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) closeMenu();
        });
    }

    function initScrollAnimations() {
        const reveals = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
            reveals.forEach(function(el) { observer.observe(el); });
        } else {
            reveals.forEach(function(el) { el.classList.add('visible'); });
        }
    }

    function initGallery() {
        const items = document.querySelectorAll('.gallery-item');
        galleryImages = Array.from(items).map(function(item) {
            const img = item.querySelector('img');
            return { src: img ? (img.dataset.full || img.currentSrc || img.src) : '', alt: img ? img.alt : 'Gallery image' };
        });
        items.forEach(function(item, index) {
            item.addEventListener('click', function() { openLightbox(index); });
        });
    }

    function initLightbox() {
        if (!lightbox) return;
        lightboxClose.addEventListener('click', closeLightbox);
        lightboxPrev.addEventListener('click', prevImage);
        lightboxNext.addEventListener('click', nextImage);
        lightbox.addEventListener('click', function(e) { if (e.target === lightbox) closeLightbox(); });

        document.addEventListener('keydown', function(e) {
            if (!lightbox.classList.contains('active')) return;
            switch(e.key) {
                case 'Escape': closeLightbox(); break;
                case 'ArrowLeft': prevImage(); break;
                case 'ArrowRight': nextImage(); break;
            }
        });
    }

    function openLightbox(index) {
        if (!lightbox || galleryImages.length === 0) return;
        currentLightboxIndex = index;
        updateLightboxImage();
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        setTimeout(function() { lightboxClose.focus(); }, 100);
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function prevImage() {
        currentLightboxIndex = (currentLightboxIndex - 1 + galleryImages.length) % galleryImages.length;
        updateLightboxImage();
    }

    function nextImage() {
        currentLightboxIndex = (currentLightboxIndex + 1) % galleryImages.length;
        updateLightboxImage();
    }

    function updateLightboxImage() {
        if (!lightboxImg || !lightboxCounter) return;
        const image = galleryImages[currentLightboxIndex];
        lightboxImg.src = image.src;
        lightboxImg.alt = image.alt;
        lightboxCounter.textContent = (currentLightboxIndex + 1) + ' / ' + galleryImages.length;
    }

    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(function(link) {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#' || href.length < 2) return;
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const headerHeight = header ? header.offsetHeight : 0;
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            });
        });
    }

    document.querySelectorAll('img').forEach(function(img) {
        img.addEventListener('error', function() {
            this.style.opacity = '0.3';
            this.alt = 'Image not available';
            if (this.parentElement) {
                this.parentElement.style.background = 'linear-gradient(135deg, var(--border-light), var(--border))';
            }
        });
    });
})();