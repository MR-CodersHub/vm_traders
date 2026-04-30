document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const productsGrid = document.getElementById('related-products-grid');

    if (!productId) {
        window.location.href = 'grocery.html';
        return;
    }

    const product = DataLayer.getProducts().find(p => p.id === productId);

    if (!product) {
        document.getElementById('product-name').innerText = "Product Not Found";
        return;
    }

    // Bind basic info
    document.getElementById('product-name').innerText = product.name;
    document.getElementById('product-img').src = product.image;
    document.getElementById('product-category').innerText = product.category;
    document.getElementById('product-price').innerText = `₹${product.price.toFixed(2)}`;
    document.getElementById('product-unit').innerText = product.unit;
    document.title = `VM Traders | ${product.name}`;

    // Quantity logic
    const qtyInput = document.getElementById('qty-input');
    document.getElementById('plus-btn').addEventListener('click', (e) => {
        e.preventDefault();
        qtyInput.value = parseInt(qtyInput.value) + 1;
    });
    document.getElementById('minus-btn').addEventListener('click', (e) => {
        e.preventDefault();
        const currentValue = parseInt(qtyInput.value);
        if (currentValue > 1) qtyInput.value = currentValue - 1;
    });

    // Add to cart from detail page
    document.getElementById('add-to-cart-btn').addEventListener('click', () => {
        if (!DataLayer.getCurrentUser()) {
            alert('Please Login to add items to the cart!');
            window.location.href = 'login.html';
            return;
        }

        const qty = parseInt(qtyInput.value);
        if (window.addToCart) {
            window.addToCart(product, qty);
        }
    });

    // Wishlist handling
    const wishlistBtn = document.getElementById('wishlist-btn-detail');
    wishlistBtn.addEventListener('click', () => {
        if (window.toggleWishlist) {
            window.toggleWishlist(product, wishlistBtn);
            if (window.updateHeartIcons) window.updateHeartIcons();
        }
    });

    if (window.updateHeartIcons) window.updateHeartIcons();

    // Render Related Products
    function renderRelated() {
        const allProducts = DataLayer.getProducts();
        const related = allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
        
        productsGrid.innerHTML = '';
        
        if (related.length === 0) {
            productsGrid.innerHTML = '<p>No related products found.</p>';
            return;
        }

        related.forEach(item => {
            const card = document.createElement('div');
            card.className = 'product-card-compact reveal';
            card.innerHTML = `
                <div class="compact-img-wrapper" onclick="window.location.href='product.html?id=${item.id}'">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/images/grocery/default.png'">
                </div>
                <div class="info" onclick="window.location.href='product.html?id=${item.id}'">
                    <h4>${item.name}</h4>
                    <div class="price">₹${item.price.toFixed(2)}</div>
                </div>
                <button class="add-btn-compact add-cart-btn-small" 
                        data-id="${item.id}" 
                        data-name="${item.name}" 
                        data-price="${item.price}" 
                        data-image="${item.image}">
                    <i class="fa-solid fa-plus"></i> Add
                </button>
            `;
            productsGrid.appendChild(card);
        });
    }

    renderRelated();

    // Re-run animation reveal
    if (typeof ScrollReveal !== 'undefined') {
        const sr = ScrollReveal({
            distance: '30px',
            duration: 800,
            reset: false,
            viewFactor: 0.1
        });
        sr.reveal('.reveal', { origin: 'bottom', interval: 100 });
    }
});

