document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;

    // ---------- Mobile Menu Toggle ----------
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = hamburger.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = hamburger.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });

    // ---------- Dark / Light Theme ----------
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');

    const setThemeIcon = () => {
        const dark = root.getAttribute('data-theme') === 'dark';
        themeIcon.className = dark ? 'fas fa-sun' : 'fas fa-moon';
    };
    setThemeIcon();

    themeToggle.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) { }
        setThemeIcon();
    });

    // ---------- Navbar, Progress Bar, Back-to-top ----------
    const navbar = document.getElementById('navbar');
    const progress = document.getElementById('scrollProgress');
    const backToTop = document.getElementById('backToTop');

    const onScroll = () => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        navbar.classList.toggle('scrolled', y > 30);
        backToTop.classList.toggle('show', y > 600);
        progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // ---------- Active nav link on scroll ----------
    const sections = ['home', 'about', 'services', 'portfolio', 'contact']
        .map(id => document.getElementById(id))
        .filter(Boolean);
    const links = document.querySelectorAll('.nav-link');

    if ('IntersectionObserver' in window) {
        const spy = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        sections.forEach(s => spy.observe(s));
    }

    // ---------- Scroll Reveal ----------
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        revealEls.forEach(el => {
            // small stagger for items inside grids
            const siblings = el.parentElement ? Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal')) : [];
            const idx = siblings.indexOf(el);
            if (idx > 0) el.style.transitionDelay = Math.min(idx, 5) * 0.08 + 's';
            io.observe(el);
        });
    } else {
        revealEls.forEach(el => el.classList.add('visible'));
    }

    // ---------- Typing Effect ----------
    const typedEl = document.getElementById('typedText');
    const words = ['Template Setup', 'CSS Customization', 'Responsive Design', 'Bug Fixing', 'Landing Pages'];
    let w = 0, c = 0, deleting = false;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const type = () => {
        const word = words[w];
        typedEl.textContent = word.substring(0, c);
        let delay = deleting ? 45 : 90;

        if (!deleting && c === word.length) { deleting = true; delay = 1600; }
        else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 400; }
        else { c += deleting ? -1 : 1; }

        setTimeout(type, delay);
    };

    if (reduceMotion) { typedEl.textContent = words[0]; } else { type(); }

    // ---------- Animated Counters ----------
    const counters = document.querySelectorAll('.counter');
    const animateCounter = el => {
        const target = +el.dataset.target;
        const duration = 1600;
        const start = performance.now();
        const step = now => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased);
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window) {
        const co = new IntersectionObserver((entries, obs) => {
            entries.forEach(e => {
                if (e.isIntersecting) { animateCounter(e.target); obs.unobserve(e.target); }
            });
        }, { threshold: 0.6 });
        counters.forEach(el => co.observe(el));
    } else {
        counters.forEach(el => { el.textContent = el.dataset.target; });
    }

    // ---------- Contact Form Handling ----------
    const contactForm = document.getElementById('contactForm');
    const toast = document.getElementById('toast');

    const FORM_ENDPOINT = 'https://formspree.io/f/xppqdvrz';

    const showToast = (message, ok = true) => {
        toast.querySelector('span').textContent = message;
        const icon = toast.querySelector('i');
        icon.className = ok ? 'fas fa-check-circle' : 'fas fa-circle-exclamation';
        icon.style.color = ok ? '' : '#f87171';
        toast.classList.add('show');
        clearTimeout(showToast.t);
        showToast.t = setTimeout(() => toast.classList.remove('show'), 5000);
    };

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = contactForm.querySelector('button');
        const originalText = btn.innerText;

        btn.innerText = 'Sending...';
        btn.disabled = true;

        try {
            const res = await fetch(FORM_ENDPOINT, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: new FormData(contactForm)
            });
            if (res.ok) {
                showToast('Thank you for your message! I will get back to you soon.');
                contactForm.reset();
            } else {
                showToast('Sorry, the message could not be sent. Please try again or contact me on Fiverr/Upwork.', false);
            }
        } catch (err) {
            showToast('Network error. Please check your connection and try again.', false);
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
});

// ================= Extras =================
(function () {
    const ready = fn => document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn);
    ready(() => {
        // Preloader
        const pre = document.getElementById('preloader');
        const hidePre = () => pre && pre.classList.add('hide');
        window.addEventListener('load', () => setTimeout(hidePre, 350));
        setTimeout(hidePre, 3000); // safety net

        // Portfolio filter (category read from each card's badge)
        const cards = document.querySelectorAll('.portfolio-card');
        cards.forEach(c => { c.dataset.category = c.querySelector('.category-badge').textContent.trim(); });
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const f = btn.dataset.filter;
                cards.forEach(c => {
                    const show = f === 'all' || c.dataset.category === f;
                    c.classList.toggle('hide', !show);
                    if (show) {
                        c.classList.add('visible');
                        c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop');
                    }
                });
            });
        });

        // FAQ accordion
        document.querySelectorAll('.faq-item').forEach(item => {
            const q = item.querySelector('.faq-q');
            const a = item.querySelector('.faq-a');
            q.addEventListener('click', () => {
                const open = item.classList.contains('open');
                document.querySelectorAll('.faq-item.open').forEach(o => {
                    o.classList.remove('open');
                    o.querySelector('.faq-a').style.maxHeight = null;
                    o.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
                });
                if (!open) {
                    item.classList.add('open');
                    a.style.maxHeight = a.scrollHeight + 'px';
                    q.setAttribute('aria-expanded', 'true');
                }
            });
        });

        // Cursor glow + 3D tilt (mouse devices only)
        if (window.matchMedia('(hover: hover) and (min-width: 993px)').matches) {
            const glow = document.getElementById('cursorGlow');
            window.addEventListener('mousemove', e => {
                glow.classList.add('on');
                glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
            }, { passive: true });

            document.querySelectorAll('.service-card, .step').forEach(card => {
                card.addEventListener('mousemove', e => {
                    const r = card.getBoundingClientRect();
                    const x = (e.clientX - r.left) / r.width - 0.5;
                    const y = (e.clientY - r.top) / r.height - 0.5;
                    card.style.transform = `perspective(700px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg) translateY(-8px)`;
                    card.style.transition = 'transform 0.1s ease-out, box-shadow 0.35s ease';
                });
                card.addEventListener('mouseleave', () => {
                    card.style.transform = '';
                    card.style.transition = '';
                });
            });
        }
    });
})();

// ================= Polish pass =================
(function () {
    const ready = fn => document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn);
    ready(() => {
        // Add shine + "View Project" pill to portfolio images (uses each card's existing Live Preview link)
        document.querySelectorAll('.portfolio-card').forEach(card => {
            const img = card.querySelector('.portfolio-img');
            const link = card.querySelector('a.btn-small');
            if (!img || !link) return;
            const shine = document.createElement('span');
            shine.className = 'shine';
            img.appendChild(shine);
            const pill = document.createElement('a');
            pill.className = 'view-pill';
            pill.href = link.href;
            pill.target = '_blank';
            pill.rel = 'noopener';
            pill.innerHTML = 'View Project <i class="fas fa-arrow-up-right-from-square"></i>';
            img.appendChild(pill);
        });

        if (!window.matchMedia('(hover: hover) and (min-width: 993px)').matches) return;

        // Hero photo: gentle parallax following the mouse
        const hero = document.querySelector('.hero');
        const photo = document.querySelector('.image-wrap > img');
        if (hero && photo) {
            hero.addEventListener('mousemove', e => {
                const r = hero.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                photo.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
            });
            hero.addEventListener('mouseleave', () => { photo.style.transform = ''; });
        }

        // Magnetic buttons
        document.querySelectorAll('.hero-buttons .btn, .cta .btn').forEach(btn => {
            btn.addEventListener('mousemove', e => {
                const r = btn.getBoundingClientRect();
                const x = (e.clientX - r.left - r.width / 2) * 0.18;
                const y = (e.clientY - r.top - r.height / 2) * 0.28;
                btn.style.transform = `translate(${x}px, ${y}px)`;
            });
            btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
        });
    });
})();

// Image fallback for project thumbnails
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.portfolio-img img').forEach(img => {
        const fail = () => img.parentElement.classList.add('img-fallback');
        img.addEventListener('error', fail);
        if (img.complete && img.naturalWidth === 0) fail();
    });
});
