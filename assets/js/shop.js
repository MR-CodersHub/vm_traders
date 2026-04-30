
document.addEventListener('DOMContentLoaded', () => {
    // Initialize storage and Perform a Sanity Check/Cleanup on older/corrupted data
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (!Array.isArray(cart)) {
            cart = [];
        } else {
            // Remove items that are totally broken (missing ID or Name)
            const countBefore = cart.length;
            cart = cart.filter(item => item && item.id && item.name);
            if (cart.length !== countBefore) {
                console.warn(`Cart: Auto-cleaned ${countBefore - cart.length} corrupted items.`);
            }
        }
    } catch(e) {
        cart = [];
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    
    if (!localStorage.getItem('wishlist')) localStorage.setItem('wishlist', JSON.stringify([]));

    updateCartCount();
    updateWishlistCount();

    // Delegation to handle dynamically added elements
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        if (btn.classList.contains('add-cart-btn')) {
            if (!DataLayer.getCurrentUser()) {
                alert('Please Login to add items to the cart!');
                window.location.href = 'login.html';
                return;
            }
            
            const card = btn.closest('.product-card');
            if (card) {
                const product = getProductData(card);
                // Check if there's a specialized qty input in the card/context
                const qtyInput = card.querySelector('.qty-input');
                const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
                
                addToCart(product, qty);
                animateButton(btn);
            }
        }

        if (btn.classList.contains('add-cart-btn-small')) {
            if (!DataLayer.getCurrentUser()) {
                alert('Please Login to add items to the cart!');
                window.location.href = 'login.html';
                return;
            }
            
            const product = {
                id: btn.dataset.id,
                name: btn.dataset.name,
                price: btn.dataset.price,
                image: btn.dataset.image
            };
            
            addToCart(product, 1);
            animateButton(btn);
        }

        if (btn.classList.contains('wishlist-btn')) {
            const card = btn.closest('.product-card');
            if (card) {
                const product = getProductData(card);
                toggleWishlist(product, btn);
            }
        }

        if (btn.classList.contains('remove-cart-item')) {
            const id = btn.dataset.id;
            removeFromCart(id);
        }

        if (btn.classList.contains('remove-wishlist-item')) {
            const id = btn.dataset.id;
            removeFromWishlist(id);
        }
    });

    if (window.location.pathname.includes('cart.html')) renderCartPage();
    if (window.location.pathname.includes('wishlist.html')) renderWishlistPage();
    updateHeartIcons();
});

function getProductData(card) {
    return {
        id: card.dataset.id || 'p' + Date.now(),
        name: card.dataset.name || card.querySelector('h3')?.textContent || 'Grocery Item',
        price: card.dataset.price || card.querySelector('.price')?.textContent || '0.00',
        image: card.dataset.image || card.querySelector('img')?.src || 'assets/images/grocery/default.png'
    };
}

window.addToCart = function(product, quantity = 1) {
    if (!product || !product.id) {
        console.warn('Cart: Incomplete product data received.', product);
        return;
    }

    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (!Array.isArray(cart)) cart = [];
    } catch(e) {
        console.error('Cart: Error parsing storage data.', e);
        cart = [];
    }
    
    let price = typeof product.price === 'string' ? parseFloat(product.price.replace('₹', '').replace('$', '').trim()) || 0 : parseFloat(product.price) || 0;
    const productId = String(product.id);
    const existingIndex = cart.findIndex(item => item && String(item.id) === productId);

    if (existingIndex > -1) {
        cart[existingIndex].quantity = (parseInt(cart[existingIndex].quantity) || 0) + (parseInt(quantity) || 1);
        console.log(`Cart: Updated quantity for ${product.name}. New Qty: ${cart[existingIndex].quantity}`);
    } else {
        const newItem = {
            id: productId,
            name: product.name || 'Grocery Item',
            price: price,
            image: product.image || 'assets/images/grocery/default.png',
            quantity: parseInt(quantity) || 1
        };
        cart.push(newItem);
        console.log(`Cart: Added new item: ${product.name}`, newItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast('Added to Cart!');
    
    if (window.location.pathname.includes('cart.html')) renderCartPage();
}

window.toggleWishlist = function(product, btn) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const index = wishlist.findIndex(item => String(item.id) === String(product.id));

    if (index > -1) {
        wishlist.splice(index, 1);
        if (btn && btn.querySelector('i')) btn.querySelector('i').className = 'fa-regular fa-heart';
        showToast('Removed from Wishlist');
    } else {
        wishlist.push(product);
        if (btn && btn.querySelector('i')) btn.querySelector('i').className = 'fa-solid fa-heart';
        showToast('Added to Wishlist');
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
}

function removeFromCart(id) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(item => String(item.id) !== String(id));
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartPage();
    updateCartCount();
}

function removeFromWishlist(id) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    wishlist = wishlist.filter(item => String(item.id) !== String(id));
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    renderWishlistPage();
    updateWishlistCount();
    updateHeartIcons();
}

function updateHeartIcons() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    // Grid and detail buttons
    const buttons = document.querySelectorAll('.wishlist-btn, #wishlist-btn-detail');
    buttons.forEach(btn => {
        const card = btn.closest('.product-card');
        let id = btn.id === 'wishlist-btn-detail' ? new URLSearchParams(window.location.search).get('id') : card?.dataset.id;
        
        if (id) {
            const inWishlist = wishlist.some(item => String(item.id) === String(id));
            const icon = btn.querySelector('i');
            if (icon) {
                if (inWishlist) {
                    icon.className = 'fa-solid fa-heart';
                    icon.style.color = '#ff4d4d';
                } else {
                    icon.className = 'fa-regular fa-heart';
                    icon.style.color = '';
                }
            }
        }
    });

    // Main Navigation Header Heart Icon
    const navHeartLink = document.querySelector('.nav-icons a[href="wishlist.html"]');
    const navHeartIcon = navHeartLink?.querySelector('i');
    if (navHeartIcon) {
        if (wishlist.length > 0) {
            navHeartIcon.className = 'fa-solid fa-heart';
            // Keeping it white/orange themed in header for premium feel unless it's the badge
            navHeartIcon.style.color = 'var(--white)'; 
        } else {
            navHeartIcon.className = 'fa-regular fa-heart';
            navHeartIcon.style.color = '';
        }
    }
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((total, item) => total + (parseInt(item.quantity) || 1), 0);
    
    // Find cart icon badges
    const badges = document.querySelectorAll('#nav-cart-badge, .cart-badge');
    badges.forEach(badge => {
        if (count > 0) {
            badge.style.display = 'inline-block';
            badge.textContent = count > 99 ? '99+' : count;
            
            const icon = badge.previousElementSibling;
            if (icon) {
                icon.classList.remove('cart-active-highlight');
                void icon.offsetWidth;
                icon.classList.add('cart-active-highlight');
            }
        } else {
            badge.style.display = 'none';
        }
    });
}

function updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const count = wishlist.length;
    
    const badges = document.querySelectorAll('#nav-wishlist-badge, .wishlist-badge');
    badges.forEach(badge => {
        if (count > 0) {
            badge.style.display = 'flex';
            badge.textContent = count;
        } else {
            badge.style.display = 'none';
        }
    });
}


function renderCartPage() {
    const container = document.getElementById('cart-items-container');
    const totalElem = document.getElementById('cart-total');
    const subtotalElem = document.getElementById('cart-subtotal');
    if (!container) return;

    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (!Array.isArray(cart)) cart = [];
    } catch(e) {
        cart = [];
    }
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart-state reveal">
                <i class="fa-solid fa-basket-shopping empty-cart-icon"></i>
                <h2>Your bag is empty</h2>
                <p class="subtext" style="margin-bottom: 30px;">Looks like you haven't added anything to your cart yet.</p>
                <a href="grocery.html" class="btn btn-primary" style="padding: 15px 40px; text-decoration: none;">Explore Groceries</a>
            </div>
        `;
        if (subtotalElem) subtotalElem.textContent = '₹0.00';
        if (totalElem) totalElem.textContent = '₹0.00';
        return;
    }

    let subtotal = 0;
    container.innerHTML = '';

    cart.forEach(item => {
        const itemTotal = (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);
        subtotal += itemTotal;

        const card = document.createElement('div');
        card.className = 'cart-item-card reveal';
        card.innerHTML = `
            <div class="cart-item-img">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/images/grocery/default.png'">
            </div>
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p class="cart-item-meta">Category: Grocery | Unit Price: ₹${parseFloat(item.price).toFixed(2)}</p>
                <div class="cart-item-actions">
                    <div class="cart-qty-controls">
                        <button class="cart-qty-btn" onclick="updateCartQty('${item.id}', -1)"><i class="fa-solid fa-minus"></i></button>
                        <input type="number" class="cart-qty-input" value="${item.quantity}" readonly>
                        <button class="cart-qty-btn" onclick="updateCartQty('${item.id}', 1)"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
            </div>
            <div class="cart-item-price">
                <span class="price-current">₹${itemTotal.toFixed(2)}</span>
                <button class="remove-btn" onclick="removeFromCart('${item.id}')" title="Remove Item" style="margin-top: 15px; margin-left: auto;">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
        container.appendChild(card);
    });

    if (subtotalElem) subtotalElem.textContent = `₹${subtotal.toFixed(2)}`;
    if (totalElem) totalElem.textContent = `₹${subtotal.toFixed(2)}`;
}

window.updateCartQty = function(id, change) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const index = cart.findIndex(item => String(item.id) === String(id));
    
    if (index > -1) {
        cart[index].quantity = Math.max(1, (parseInt(cart[index].quantity) || 1) + change);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartPage();
        updateCartCount();
    }
}

window.clearCart = function() {
    if(confirm('Are you sure you want to clear your entire cart?')) {
        localStorage.setItem('cart', '[]');
        renderCartPage();
        updateCartCount();
    }
}

// Global scope bindings for inline HTML triggers without page reload
window.updateCartItemQty = function(id, change) {
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch(e) { cart = []; }

    let item = cart.find(i => i && String(i.id) === String(id));
    if (item) {
        item.quantity = (parseInt(item.quantity) || 1) + change;
        if (item.quantity < 1) item.quantity = 1;
        
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartPage(); 
        updateCartCount();
    }
};

window.manualCartItemQty = function(id, value) {
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch(e) { cart = []; }

    let item = cart.find(i => i && String(i.id) === String(id));
    if (item) {
        let val = parseInt(value);
        if (isNaN(val) || val < 1) val = 1; 
        item.quantity = val;
        
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartPage(); 
        updateCartCount();
    }
};

function renderWishlistPage() {
    const container = document.getElementById('wishlist-grid');
    if (!container) return;

    const wishlist = JSON.parse(localStorage.getItem('wishlist'));
    container.innerHTML = '';

    if (wishlist.length === 0) {
        container.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Your wishlist is empty.</p>';
        return;
    }

    wishlist.forEach(item => {
        const col = document.createElement('div');
        col.className = 'product-card';
        // Reconstruct card
        col.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="product-info" style="margin-top:15px;">
                <h3>${item.name}</h3>
                <div class="product-footer">
                    <span class="price">${item.price}</span>
                     <div style="display: flex; gap: 10px;">
                        <button class="add-btn add-cart-btn" onclick="addToCartFromWishlist('${item.id}')"><i class="fa-solid fa-cart-shopping"></i></button>
                        <button class="add-btn remove-wishlist-item" data-id="${item.id}" style="background: #fee2e2; color: #ef4444;"><i class="fa-solid fa-trash"></i></button>
                     </div>
                </div>
            </div>
        `;
        // Hacky pass to make cart button work via delegation or we just add data attributes
        col.dataset.id = item.id;
        col.dataset.name = item.name;
        col.dataset.price = item.price;
        col.dataset.image = item.image;

        container.appendChild(col);
    });
}

// Helper to quickly move from wishlist to cart
window.addToCartFromWishlist = function (id) {
    const wishlist = JSON.parse(localStorage.getItem('wishlist'));
    const product = wishlist.find(item => item.id === id);
    if (product) {
        addToCart(product);
    }
}


function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

function animateButton(btn) {
    btn.style.transform = 'scale(1.2)';
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
    }, 200);
}


