
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.querySelector('.menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinksContainer) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinksContainer.classList.toggle('active');

            // Initial Icon state
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinksContainer.classList.contains('active')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars';
            }
        });
    }

    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop() || 'index.html';

    // Shared Injection Function for Bottom Nav
    const injectBottomNav = () => {
        // Prevent double injection
        if (document.querySelector('.bottom-nav')) {
            updateActiveStateByPage();
            return;
        }

        const nav = document.createElement('nav');
        nav.className = 'bottom-nav';
        nav.innerHTML = `
            <ul>
                <li class="bottom-nav-item" data-page="index.html">
                    <a href="index.html">
                        <i class="fa-solid fa-house-chimney"></i>
                        <span>Home</span>
                    </a>
                </li>
                <li class="bottom-nav-item" data-page="grocery.html">
                    <a href="grocery.html">
                        <i class="fa-solid fa-basket-shopping"></i>
                        <span>Grocery</span>
                    </a>
                </li>
                <li class="bottom-nav-item" data-page="cart.html">
                    <a href="cart.html" style="position: relative;">
                        <i class="fa-solid fa-cart-shopping"></i>
                        <span class="cart-badge" style="display: none; position: absolute; top: -5px; right: -5px; min-width: 16px; height: 16px; font-size: 0.6rem; background: var(--primary-orange); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">0</span>
                        <span>Cart</span>
                    </a>
                </li>
                <li class="bottom-nav-item" data-page="about.html">
                    <a href="about.html">
                        <i class="fa-solid fa-circle-question"></i>
                        <span>About</span>
                    </a>
                </li>
            </ul>
        `;
        document.body.appendChild(nav);
        updateActiveStateByPage();
    };

    const updateActiveStateByPage = () => {
        const navElement = document.querySelector('.bottom-nav');
        if (!navElement) return;

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const items = navElement.querySelectorAll('.bottom-nav-item');

        items.forEach((item) => {
            const itemPage = item.getAttribute('data-page');
            // Exact match or fallback for root
            const isActive = currentPage === itemPage || (currentPage === '' && itemPage === 'index.html');

            if (isActive) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    };

    // Inject immediately on load
    injectBottomNav();
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(injectBottomNav, 100);
    });

    // Dashboard Sidebar Off-canvas Logic - Centralized for Admin/User Dashboards

    // Dashboard Sidebar Off-canvas Logic - Centralized for Admin/User Dashboards
    const initSidebar = () => {
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');

        if (!sidebar) return;

        // Create overlay if it doesn't exist
        let sidebarOverlay = document.querySelector('.sidebar-overlay');
        if (!sidebarOverlay) {
            sidebarOverlay = document.createElement('div');
            sidebarOverlay.className = 'sidebar-overlay';
            document.body.appendChild(sidebarOverlay);
        }

        // Create close button if it doesn't exist inside sidebar
        let sidebarClose = sidebar.querySelector('.sidebar-close');
        if (!sidebarClose) {
            sidebarClose = document.createElement('div');
            sidebarClose.className = 'sidebar-close';
            sidebarClose.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            sidebar.prepend(sidebarClose);
        }

        const openSidebar = () => {
            sidebar.classList.add('open');
            sidebarOverlay.classList.add('active');
            document.body.classList.add('sidebar-open');
        };

        const closeSidebar = () => {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
            document.body.classList.remove('sidebar-open');
        };

        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openSidebar();
            });
        }

        // Close logic
        sidebarOverlay.addEventListener('click', closeSidebar);
        sidebarClose.addEventListener('click', closeSidebar);

        // ESC key closes the sidebar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeSidebar();
        });

        // Close on sidebar link click (especially important for mobile SPA feel)
        sidebar.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 992) closeSidebar();
            });
        });
    };

    if (document.body.classList.contains('dashboard-layout')) {
        initSidebar();
    }

    // Modern Scroll Reveal Animations
    const initScrollReveal = () => {
        const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');

        // Fallback for browsers without IntersectionObserver or fails to trigger
        const forceReveal = () => {
            revealElements.forEach(el => {
                if (!el.classList.contains('revealed')) {
                    el.classList.add('revealed');
                    el.style.opacity = '';
                    el.style.transform = '';
                }
            });
        };

        // If IntersectionObserver is not supported, reveal everything instantly
        if (!('IntersectionObserver' in window)) {
            forceReveal();
            return;
        }

        const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    entry.target.style.opacity = '';
                    entry.target.style.transform = '';
                    revealObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealElements.forEach(el => revealObserver.observe(el));

        document.querySelectorAll('.reveal-stagger').forEach(container => {
            Array.from(container.children).forEach((child, index) => {
                child.style.transitionDelay = `${Math.min(index * 0.1, 0.8)}s`;
            });
        });

        // Final safety net: reveal elements after 2.5s if they missed the trigger
        setTimeout(forceReveal, 2500);
    };

    setTimeout(initScrollReveal, 100);
});


