document.addEventListener('DOMContentLoaded', () => {

    const getProducts = () => DataLayer.getProducts();
    const saveProducts = (p) => DataLayer.saveProducts(p);
    const getOrders = () => DataLayer.getOrders();
    const saveOrders = (o) => DataLayer.saveOrders(o);

    /* --- METRICS (Overview Page) --- */
    const updateMetrics = () => {
        const orders = getOrders();
        const statRevenue = document.getElementById('stat-revenue');
        const statPending = document.getElementById('stat-pending');
        const statTotal = document.getElementById('stat-total-orders');
        const statCompleted = document.getElementById('stat-completed');

        if (!statRevenue) return; // Not on the overview page

        const total = orders.length;
        const pending = orders.filter(o => o.status === 'Pending').length;
        const completed = orders.filter(o => o.status === 'Completed').length;
        let revenue = orders.reduce((sum, o) => o.status === 'Completed' ? sum + parseFloat(o.total || 0) : sum, 0);

        statRevenue.textContent = '₹' + revenue.toFixed(2);
        statPending.textContent = pending;
        statTotal.textContent = total;
        statCompleted.textContent = completed;
    };

    /* --- PRODUCT MANAGEMENT (Products Page) --- */
    const productsTableBody = document.querySelector('#products-table tbody');
    const addProductForm = document.getElementById('addProductForm');
    let currentProductPage = 1;
    const productsPerPage = 6;

    const loadProducts = () => {
        if (!productsTableBody) return;
        const allProducts = getProducts();
        const totalPages = Math.ceil(allProducts.length / productsPerPage);
        
        if (currentProductPage > totalPages && totalPages > 0) currentProductPage = totalPages;
        if (currentProductPage < 1) currentProductPage = 1;

        const start = (currentProductPage - 1) * productsPerPage;
        const paginatedProducts = allProducts.slice(start, start + productsPerPage);

        productsTableBody.innerHTML = '';
        
        if (paginatedProducts.length === 0) {
            productsTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">No products found.</td></tr>';
            renderPagination(0);
            return;
        }

        paginatedProducts.forEach(p => {
            const tr = document.createElement('tr');
            
            // Stock Status Logic
            let stockStatus = 'badge-success';
            let stockLabel = 'In Stock';
            const stockNum = parseInt(p.stock || 0);
            
            if (stockNum === 0) {
                stockStatus = 'badge-danger';
                stockLabel = 'Out of Stock';
            } else if (stockNum < 20) {
                stockStatus = 'badge-warning';
                stockLabel = 'Low Stock';
            }

            tr.innerHTML = `
                <td style="width:80px;">
                    <div style="width:50px; height:50px; border-radius:10px; overflow:hidden; border:1px solid var(--border); background:#f8fafc;">
                        <img src="${p.image}" onerror="this.src='assets/images/grocery/default.png'" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                </td>
                <td style="white-space: nowrap;">
                    <div style="font-weight: 700; color: var(--text-main); font-size: 1rem;">${p.name}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">ID: ${String(p.id).slice(-6).toUpperCase()}</div>
                </td>
                <td style="white-space: nowrap;"><span class="badge badge-info">${p.category}</span></td>
                <td style="white-space: nowrap; font-weight: 800; color: var(--text-main); font-size: 1.05rem;">₹${parseFloat(p.price).toFixed(2)}</td>
                <td style="white-space: nowrap; color: var(--text-muted); font-weight: 500;">${p.unit}</td>
                <td style="white-space: nowrap;"><span class="badge ${stockStatus}">${stockNum} ${stockLabel}</span></td>
                <td style="white-space: nowrap;">
                    <div style="display:flex; gap:8px;">
                        <button class="nav-icon" onclick="editProduct('${p.id}')" title="Edit Product" style="width:36px; height:36px; cursor:pointer;"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="nav-icon" onclick="deleteProduct('${p.id}')" title="Delete Product" style="width:36px; height:36px; cursor:pointer; color: #ef4444; border-color: #fee2e2;"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            productsTableBody.appendChild(tr);
        });

        renderPagination(totalPages);
    };

    const renderPagination = (totalPages) => {
        const pagContainer = document.getElementById('product-pagination');
        if (!pagContainer) return;

        if (totalPages <= 1) {
            pagContainer.innerHTML = '';
            return;
        }

        let html = '<div class="pagination-flex" style="display:flex; justify-content:center; align-items:center; gap:8px; margin-top:32px;">';
        
        html += `<button onclick="changeProductPage(${currentProductPage - 1})" class="btn" style="padding:8px 16px; background: white; border: 1px solid var(--border); color: var(--text-main);" ${currentProductPage === 1 ? 'disabled' : ''}>Prev</button>`;
        
        for (let i = 1; i <= totalPages; i++) {
            const isActive = i === currentProductPage;
            const activeStyle = isActive ? 'background:var(--primary); color:white; border-color:var(--primary);' : 'background:white; color:var(--text-main); border-color:var(--border);';
            html += `<button onclick="changeProductPage(${i})" class="btn" style="min-width:40px; justify-content:center; ${activeStyle}">${i}</button>`;
        }
        
        html += `<button onclick="changeProductPage(${currentProductPage + 1})" class="btn" style="padding:8px 16px; background: white; border: 1px solid var(--border); color: var(--text-main);" ${currentProductPage === totalPages ? 'disabled' : ''}>Next</button>`;
        
        html += '</div>';
        pagContainer.innerHTML = html;
    };

    window.changeProductPage = (page) => {
        currentProductPage = page;
        loadProducts();
    };

    window.editProduct = (id) => {
        let products = getProducts();
        let p = products.find(x => String(x.id) === String(id));
        if (p) {
            const newName = prompt("Enter new Name:", p.name);
            if (newName === null) return;
            const newPrice = prompt("Enter new Price:", p.price);
            if (newPrice === null) return;

            p.name = newName;
            p.price = parseFloat(newPrice) || p.price;
            saveProducts(products);
            loadProducts();
        }
    };

    window.deleteProduct = (id) => {
        if (confirm('Delete this product?')) {
            let products = getProducts().filter(p => String(p.id) !== String(id));
            saveProducts(products);
            loadProducts();
        }
    };

    // Image Preview logic
    const pImageInput = document.getElementById('p-image');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const imagePreview = document.getElementById('imagePreview');
    let currentBase64Image = '';

    if (pImageInput) {
        pImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    currentBase64Image = event.target.result;
                    imagePreview.src = currentBase64Image;
                    imagePreviewContainer.style.display = 'flex';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (addProductForm) {
        addProductForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const products = getProducts();
            
            // Fallback placeholder image
            const placeholder = 'assets/images/grocery/default.png'; 
            
            products.unshift({
                id: 'p-' + Date.now(),
                name: document.getElementById('p-name').value,
                category: document.getElementById('p-category').value,
                price: parseFloat(document.getElementById('p-price').value),
                unit: document.getElementById('p-unit').value,
                stock: parseInt(document.getElementById('p-stock').value),
                image: currentBase64Image || placeholder
            });
            
            saveProducts(products);
            addProductForm.reset();
            currentBase64Image = '';
            if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';
            loadProducts();
        });
    }

    /* --- ORDER MANAGEMENT (Orders Page) --- */
    const ordersTableBody = document.querySelector('#orders-table tbody');

    const loadOrders = () => {
        if (!ordersTableBody) return;
        const orders = getOrders();
        ordersTableBody.innerHTML = '';
        
        if (orders.length === 0) {
            const emptyState = document.getElementById('orders-empty-state');
            if (emptyState) emptyState.style.display = 'block';
            ordersTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">No orders processed yet.</td></tr>';
            return;
        }

        orders.forEach(order => {
            const tr = document.createElement('tr');
            const items = order.items || order.cart || [];
            
            let itemsHTML = items.map((item, idx) => `
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 6px; padding: 4px 8px; background: #f8fafc; border-radius: 6px; border: 1px solid var(--border);">
                    <div style="font-weight: 600; font-size: 0.8rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px;">${item.name}</div> 
                    <div style="display:flex; gap: 4px; align-items:center;">
                        <input type="number" class="admin-input" style="width:38px; padding:2px 4px; height:24px; font-size:0.75rem; text-align: center;" value="${item.quantity}" onchange="modifyOrder('${order.id}', ${idx}, 'quantity', this.value)">
                        <span style="color: var(--text-muted); font-size: 0.7rem;">×</span>
                        <input type="number" class="admin-input" style="width:55px; padding:2px 4px; height:24px; font-size:0.75rem;" value="${item.final_price || item.price}" onchange="modifyOrder('${order.id}', ${idx}, 'final_price', this.value)">
                    </div>
                </div>
            `).join('');

            const statuses = ['Pending', 'Packed', 'Out for Delivery', 'Completed', 'Rejected'];
            let optionsHTML = statuses.map(s => `<option value="${s}" ${order.status === s ? 'selected' : ''}>${s}</option>`).join('');

            tr.innerHTML = `
                <td style="vertical-align: top; padding-top: 20px;">
                    <div style="font-weight:800; color: var(--text-main); font-size: 0.9rem; white-space: nowrap;">#${String(order.id).slice(0, 10)}</div>
                    <div style="font-size:0.7rem; color:var(--text-muted); margin-top: 4px;">${order.date || 'Today'}</div>
                </td>
                <td style="min-width: 220px; vertical-align: top;">
                    <div style="font-weight:700; color:var(--primary); margin-bottom:10px; font-size: 0.9rem;">${order.customerName || 'Guest Customer'}</div>
                    <div style="display: flex; flex-direction: column; max-height: 150px; overflow-y: auto; padding-right: 5px;">${itemsHTML}</div>
                </td>
                <td style="vertical-align: top; padding-top: 20px;">
                    <div style="background: var(--bg-main); padding: 10px; border-radius: 8px; border: 1px solid var(--border); text-align: center;">
                        <div style="font-size:0.65rem; color:var(--text-muted); font-weight: 700; text-transform: uppercase;">Subtotal</div>
                        <div style="font-weight: 700; color: var(--text-main); font-size: 0.9rem;">₹${calculateBase(items).toFixed(2)}</div>
                    </div>
                </td>
                <td style="vertical-align: top; padding-top: 20px;">
                    <div style="font-size:0.65rem; color:var(--text-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 2px;">Total Paid</div>
                    <strong style="color:var(--text-main); font-size:1.1rem; font-weight: 800;">₹${parseFloat(order.total || 0).toFixed(2)}</strong>
                </td>
                <td style="vertical-align: top; padding-top: 20px;">
                    <div style="position: relative; width: 140px;">
                        <select class="admin-input" onchange="updateOrderStatus('${order.id}', this.value)" style="padding:6px 10px; font-weight:700; font-size:0.8rem; appearance: none; background: #f8fafc; border: 1px solid var(--border); width: 100%;">
                            ${optionsHTML}
                        </select>
                        <i class="fa-solid fa-chevron-down" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 0.65rem; pointer-events: none; color: var(--text-muted);"></i>
                    </div>
                </td>
                <td style="vertical-align: top; padding-top: 20px;">
                    <div style="display:flex; flex-direction: column; gap:6px; min-width: 100px;">
                        <button class="btn btn-primary" style="padding: 6px 10px; font-size:0.75rem; width: 100%; justify-content: center;" onclick="updateOrderStatus('${order.id}', 'Packed')">Process</button>
                        <button class="btn" style="padding: 6px 10px; font-size:0.75rem; width: 100%; background:#fef2f2; color:#ef4444; border:1px solid #fee2e2; justify-content: center;" onclick="updateOrderStatus('${order.id}', 'Rejected')">Cancel</button>
                    </div>
                </td>
            `;
            ordersTableBody.appendChild(tr);
        });
    };

    const calculateBase = (items) => items.reduce((sum, i) => sum + (parseFloat(i.price) * parseInt(i.quantity)), 0);

    window.modifyOrder = (orderId, idx, field, val) => {
        let orders = getOrders();
        let o = orders.find(x => String(x.id) === String(orderId));
        if (o) {
            let items = o.items || o.cart || [];
            if (field === 'quantity') items[idx].quantity = Math.max(1, parseInt(val));
            else if (field === 'final_price') items[idx].final_price = parseFloat(val);
            
            items[idx].totalValue = (items[idx].final_price || items[idx].price) * items[idx].quantity;
            o.total = items.reduce((sum, i) => sum + (i.totalValue || (i.price * i.quantity)), 0);
            saveOrders(orders);
            loadOrders();
        }
    };

    window.updateOrderStatus = (id, s) => {
        let orders = getOrders();
        let idx = orders.findIndex(x => String(x.id) === String(id));
        if (idx !== -1) {
            orders[idx].status = s;
            saveOrders(orders);
            loadOrders();
        }
    };

    // Note: Mobile Sidebar Toggle logic is centralized in assets/js/mobile-nav.js
    // to provide consistent behavior across the entire application and avoid event conflicts.

    /* --- CUSTOMER MANAGEMENT (Customers Page) --- */
    const customerTableBody = document.querySelector('.admin-table tbody');
    if (customerTableBody && window.location.pathname.includes('admin-customers.html')) {
        const renderCustomers = () => {
            const currentUser = DataLayer.getCurrentUser();
            customerTableBody.innerHTML = '';
            
            if (!currentUser) {
                customerTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">Please login to view customer data.</td></tr>';
                return;
            }

            // As requested: "update only login user only"
            // We only show the currently logged-in user in the table
            const initials = currentUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 32px; height: 32px; background: var(--primary-soft); color: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem;">${initials}</div>
                        <span style="font-weight: 600;">${currentUser.fullName} (You)</span>
                    </div>
                </td>
                <td>${currentUser.phone || 'N/A'}</td>
                <td>${(getOrders().filter(o => o.phone === currentUser.phone)).length}</td>
                <td>Recently</td>
                <td><span class="badge badge-success">Active</span></td>
                <td><button class="nav-icon" style="width:32px; height:32px; opacity:0.5; cursor:not-allowed;"><i class="fa-solid fa-ellipsis-vertical"></i></button></td>
            `;
            customerTableBody.appendChild(tr);
        };
        renderCustomers();
    }

    // Initialize
    const welcomeMsg = document.getElementById('welcome-message');
    const currentUser = DataLayer.getCurrentUser();
    if (welcomeMsg && currentUser) {
        welcomeMsg.textContent = `Welcome back, ${currentUser.fullName.split(' ')[0]}!`;
    }

    updateMetrics();
    loadProducts();
    loadOrders();
});

