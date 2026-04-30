document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.getElementById('homeProductsGrid');
    const searchInput = document.getElementById('homeSearchInput');
    const categoryPills = document.querySelectorAll('.category-pill');
    let currentCategory = 'All';

    // Get products from DataLayer (fully offline)
    const getProducts = () => DataLayer.getProducts();

    function renderProducts(filterText = '') {
        const products = getProducts();
        productsGrid.innerHTML = '';

        const filtered = products.filter(p => {
            const matchesCategory = (currentCategory === 'All' || p.category === currentCategory);
            const matchesSearch = p.name.toLowerCase().includes(filterText.toLowerCase()) || 
                                  p.category.toLowerCase().includes(filterText.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        if (filtered.length === 0) {
            productsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                <i class="fa-solid fa-magnifying-glass" style="font-size: 3rem; color: var(--text-light); opacity: 0.5;"></i>
                <p style="margin-top: 15px; color: var(--text-light);">No products found matching your search.</p>
            </div>`;
            return;
        }

        filtered.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card reveal';
            card.dataset.id = product.id;
            card.dataset.name = product.name;
            card.dataset.price = product.price;
            card.dataset.image = product.image;
            
            card.innerHTML = `
                <div class="product-click-area" onclick="window.location.href='product.html?id=${product.id}'" style="cursor:pointer; flex: 1; display: flex; flex-direction: column;">
                    <div class="product-img">
                        <img src="${product.image}" alt="${product.name}" onerror="this.src='assets/images/grocery/default.png'">
                    </div>
                    <div class="product-info" style="padding-bottom: 0;">
                        <div style="display:flex; justify-content:space-between; align-items:start;">
                            <div>
                                <h3 style="margin-bottom:2px;">${product.name}</h3>
                                <span style="font-size:0.8rem; color:var(--text-light); display:block; margin-bottom:8px;">${product.unit} | ${product.category}</span>
                            </div>
                            <div class="price">₹${product.price.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
                <div class="product-info" style="padding-top: 10px;">
                    <div class="product-footer" style="margin-top:5px;">
                        <div class="action-buttons" style="width:100%; display:flex; justify-content:space-between; align-items:center;">
                             <button class="wishlist-btn" title="Add to Wishlist"><i class="fa-solid fa-heart"></i></button>
                             <button class="btn btn-primary add-cart-btn" style="padding: 8px 15px; font-size:0.85rem; border-radius:8px; display:flex; align-items:center; gap:8px;">
                                <i class="fa-solid fa-cart-shopping"></i> Add
                             </button>
                        </div>
                    </div>
                </div>
            `;
            productsGrid.appendChild(card);
        });
        
        // Re-run animation reveal if applicable
        if (typeof ScrollReveal !== 'undefined') {
            ScrollReveal().reveal('.product-card', { delay: 100, distance: '20px', origin: 'bottom' });
        }
    }

    // Search Interaction
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderProducts(e.target.value);
        });
    }

    // Category Filter Interaction
    categoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
            categoryPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentCategory = pill.getAttribute('data-category');
            renderProducts(searchInput.value);
            
            // Scroll to grid top on mobile
            if (window.innerWidth < 768) {
                document.getElementById('homeGridTitle').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Initial Render
    renderProducts();

    // ScrollReveal Global Init
    if (typeof ScrollReveal !== 'undefined') {
        const sr = ScrollReveal({
            distance: '30px',
            duration: 800,
            reset: false,
            viewFactor: 0.1
        });

        sr.reveal('.reveal', { origin: 'bottom', interval: 100 });
        sr.reveal('.reveal-stagger > div', { origin: 'bottom', interval: 100 });
        sr.reveal('.offer-slide', { origin: 'right', interval: 150 });
        sr.reveal('.deal-card', { origin: 'bottom', interval: 100, delay: 200 });
    }
});

