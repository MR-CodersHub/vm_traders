document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.querySelector('.products-grid-full');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    let currentCategory = 'All';

    const getProducts = () => DataLayer.getProducts();

    function renderProducts() {
        if (!productsGrid) return;
        const products = getProducts();
        productsGrid.innerHTML = '';

        const filtered = products.filter(p => {
            // E-commerce categories vs Grocery categories
            const ecomCategories = ["Electronics", "Fashion", "Home Essentials", "Accessories", "Personal Care"];
            const isEcom = ecomCategories.includes(p.category);
            
            if (currentCategory === 'All') return isEcom || !p.id.startsWith('g'); // Show all non-grocery or all ecom
            return p.category === currentCategory;
        });

        if (filtered.length === 0) {
            productsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                <p style="color: var(--text-light);">No products found in this category.</p>
            </div>`;
            return;
        }

        filtered.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card reveal';
            card.setAttribute('data-category', product.category);
            card.setAttribute('data-id', product.id);
            card.setAttribute('data-name', product.name);
            card.setAttribute('data-price', product.price);
            card.setAttribute('data-image', product.image);
            
            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}" onerror="this.src='assets/images/grocery/default.png'">
                <div class="product-info" style="margin-top:15px;">
                    <h3>${product.name}</h3>
                    <div class="product-rating">
                        <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
                    </div>
                    <div class="product-footer">
                        <span class="price">₹${parseFloat(product.price).toFixed(2)}</span>
                        <div class="action-buttons">
                            <button class="wishlist-btn"><i class="fa-solid fa-heart"></i></button>
                            <button class="add-btn add-cart-btn"><i class="fa-solid fa-cart-shopping"></i></button>
                        </div>
                    </div>
                </div>
            `;
            productsGrid.appendChild(card);
        });

        // Re-run scroll reveal
        if (typeof ScrollReveal !== 'undefined') {
            ScrollReveal().reveal('.product-card', { delay: 100, distance: '20px', origin: 'bottom' });
        }
    }

    // Filter Button Interaction
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.textContent;
            renderProducts();

            // Update URL without reload
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('category', currentCategory);
            window.history.pushState({}, '', newUrl);
        });
    });

    // Check URL parameters
    const params = new URLSearchParams(window.location.search);
    const urlCategory = params.get('category');
    if (urlCategory) {
        currentCategory = urlCategory;
        filterButtons.forEach(btn => {
            if (btn.textContent === currentCategory) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    }

    // Initial Render
    renderProducts();
});


