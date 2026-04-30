document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('.data-table tbody');
    const addBtn = document.querySelector('.admin-header .btn-primary');
    if (!tableBody) return;

    let products = JSON.parse(localStorage.getItem('admin_products') || '[]');
    if(products.length === 0) {
        products = [
            { id: 1, name: "Revitalizing Face Cream", category: "Personal Care", price: 24.99, stock: 45, image: "assets/images/prod-face-cream.png" },
            { id: 2, name: "Premium Urban Sneakers", category: "Fashion", price: 59.00, stock: 12, image: "assets/images/prod-sneakers.png" }
        ];
        localStorage.setItem('admin_products', JSON.stringify(products));
    }

    function renderAdminProducts() {
        products = JSON.parse(localStorage.getItem('admin_products') || '[]');
        if (products.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No products found. Add one!</td></tr>';
            return;
        }

        tableBody.innerHTML = '';
        products.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding:12px;">
                    <img src="${p.image}" alt="" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
                </td>
                <td style="padding:12px;">
                    <input type="text" value="${p.name}" onchange="updateProduct(${p.id}, 'name', this.value)" style="border:1px solid #ccc; padding:6px; width: 100%; box-sizing: border-box;">
                </td>
                <td style="padding:12px;">
                    <input type="text" value="${p.category}" onchange="updateProduct(${p.id}, 'category', this.value)" style="border:1px solid #ccc; padding:6px; width: 100%; box-sizing: border-box;">
                </td>
                <td style="padding:12px;">
                    <div style="display:flex; align-items:center;">
                        $<input type="number" step="0.01" value="${p.price}" onchange="updateProduct(${p.id}, 'price', this.value)" style="border:1px solid #ccc; width:70px; padding:6px; margin-left: 2px;">
                    </div>
                </td>
                <td style="padding:12px;">
                    <input type="number" value="${p.stock}" onchange="updateProduct(${p.id}, 'stock', this.value)" style="border:1px solid #ccc; width:60px; padding:6px;">
                </td>
                <td style="padding:12px;">
                    <button onclick="deleteProduct(${p.id})" style="background:none; border:none; color:#e74c3c; cursor:pointer;" title="Delete Product"><i class="fa-solid fa-trash" style="font-size: 1.2rem;"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    renderAdminProducts();

    window.updateProduct = function(id, field, value) {
        let prods = JSON.parse(localStorage.getItem('admin_products') || '[]');
        let prod = prods.find(p => p.id === id);
        if (prod) {
            if (field === 'price' || field === 'stock') prod[field] = parseFloat(value);
            else prod[field] = value;
            localStorage.setItem('admin_products', JSON.stringify(prods));
        }
    };

    window.deleteProduct = function(id) {
        if(confirm("Confirm deletion of this product?")) {
            let prods = JSON.parse(localStorage.getItem('admin_products') || '[]');
            prods = prods.filter(p => p.id !== id);
            localStorage.setItem('admin_products', JSON.stringify(prods));
            renderAdminProducts();
        }
    };

    if(addBtn) {
        addBtn.addEventListener('click', () => {
            let prods = JSON.parse(localStorage.getItem('admin_products') || '[]');
            const newId = prods.length > 0 ? Math.max(...prods.map(p=>p.id)) + 1 : 1;
            prods.unshift({
                id: newId,
                name: "New Product",
                category: "Uncategorized",
                price: 0.00,
                stock: 0,
                image: "assets/images/grocery/default.png"
            });
            localStorage.setItem('admin_products', JSON.stringify(prods));
            renderAdminProducts();
        });
    }
});

