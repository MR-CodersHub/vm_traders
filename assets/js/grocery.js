// Now properly syncs live with Admin Edits via Centralized DataLayer
const groceryProducts = DataLayer.getProducts();

const categories = ["All", "Dairy Products", "Packaged Staples", "Snacks & Packaged Foods", "Beverages", "Household Essentials"];

const productsGrid = document.getElementById('productsGrid');
const categoryFilters = document.getElementById('categoryFilters');
const searchInput = document.getElementById('searchInput');

let currentCategory = "All";
let searchQuery = "";

function init() {
    renderFilterButtons();
    renderProducts();

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderProducts();
    });
}

function renderFilterButtons() {
    categoryFilters.innerHTML = '';
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.classList.add('filter-btn');
        if (category === currentCategory) {
            btn.classList.add('active');
        }
        btn.textContent = category;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentCategory = category;
            renderProducts();
        });
        categoryFilters.appendChild(btn);
    });
}

function renderProducts() {
    const filteredProducts = groceryProducts.filter(product => {
        const matchesCategory = currentCategory === "All" || product.category === currentCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    productsGrid.innerHTML = '';

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-results">
                <i class="fa-solid fa-basket-shopping"></i>
                <p>No products found matching your search or category.</p>
            </div>
        `;
        return;
    }

    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.dataset.id = product.id;
        card.dataset.name = product.name;
        card.dataset.price = product.price;
        card.dataset.image = product.image;

        card.innerHTML = `
            <div class="img-wrapper" onclick="window.location.href='product.html?id=${product.id}'" style="cursor:pointer; position: relative;">
                <img src="${product.image}" loading="lazy" alt="${product.name}" onerror="this.src='assets/images/grocery/default.png'">
                <div class="product-badge" style="position: absolute; top: 8px; left: 8px; background: rgba(255,255,255,0.9); padding: 4px 8px; border-radius: 6px; font-size: 0.65rem; font-weight: 700; color: var(--dark-orange); border: 1px solid var(--border-color);">${product.unit}</div>
                <button class="wishlist-btn-prominent" onclick="toggleWishlistInline(event, '${product.id}')" title="Add to Wishlist">
                    <i class="fa-regular fa-heart"></i>
                </button>
            </div>
            <div class="product-info">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 4px;">
                    <div class="product-category">${product.category}</div>
                </div>
                <h3 class="product-title" onclick="window.location.href='product.html?id=${product.id}'" style="cursor:pointer; font-size: 0.9rem; min-height: 2.6em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${product.name}</h3>
                
                <div class="qty-section-compact">
                    <div class="qty-controls-mini">
                        <button class="qty-btn-mini" type="button" onclick="updateQty(event, ${product.price}, -1)"><i class="fa-solid fa-minus"></i></button>
                        <input type="number" class="qty-input-mini" value="1" min="1" onchange="manualQty(event, ${product.price})">
                        <button class="qty-btn-mini" type="button" onclick="updateQty(event, ${product.price}, 1)"><i class="fa-solid fa-plus"></i></button>
                    </div>
                    <div class="price-mini">₹${product.price.toFixed(2)}</div>
                </div>

                <div class="product-footer-compact">
                    <div class="total-row" style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.75rem; color: #888; font-weight: 500;">Total:</span>
                        <span class="total-price-display" style="font-size: 1.1rem; font-weight: 800; color: var(--primary-orange);">₹${product.price.toFixed(2)}</span>
                    </div>
                    <div class="footer-actions-row">
                        <button class="add-cart-btn-compact-full" onclick="quickAddToCart(event, '${product.id}')" title="Add to Cart">
                            <i class="fa-solid fa-cart-shopping"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

// Global scope functions for DOM events
window.updateQty = function (event, price, change) {
    const container = event.target.closest('.product-info');
    const input = container.querySelector('.qty-input');
    const totalDisplay = container.querySelector('.total-price-display');

    let currentVal = parseInt(input.value) || 1;
    let newVal = currentVal + change;

    // Prevent negative or zero
    if (newVal < 1) newVal = 1;
    input.value = newVal;

    // Total price updates instantly
    totalDisplay.textContent = '₹' + (price * newVal).toFixed(2);
};

window.manualQty = function (event, price) {
    const container = event.target.closest('.product-info');
    const input = event.target;
    const totalDisplay = container.querySelector('.total-price-display');

    let currentVal = parseInt(input.value);

    if (isNaN(currentVal) || currentVal < 1) {
        currentVal = 1;
        input.value = currentVal;
    }

    totalDisplay.textContent = '₹' + (price * currentVal).toFixed(2);
};

window.quickAddToCart = function(event, id) {
    event.stopPropagation();
    const container = event.target.closest('.product-info');
    const qty = parseInt(container.querySelector('input').value) || 1;
    const product = groceryProducts.find(p => String(p.id) === String(id));
    if (product && typeof addToCart === 'function') {
        addToCart(product, qty);
    }
};

window.quickBuyNow = function(event, id) {
    event.stopPropagation();
    const container = event.target.closest('.product-info');
    const qty = parseInt(container.querySelector('input').value) || 1;
    const product = groceryProducts.find(p => String(p.id) === String(id));
    if (product && typeof addToCart === 'function') {
        addToCart(product, qty);
        window.location.href = 'cart.html';
    }
};

window.toggleWishlistInline = function(event, id) {
    event.stopPropagation();
    const btn = event.currentTarget;
    const product = groceryProducts.find(p => String(p.id) === String(id));
    if (product && typeof toggleWishlist === 'function') {
        toggleWishlist(product, btn);
    }
};

document.addEventListener('DOMContentLoaded', init);
