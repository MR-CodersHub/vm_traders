
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const ordersTableBody = document.querySelector('.orders-table tbody');
    const modal = document.getElementById('order-details-modal');
    const closeModal = document.querySelector('.close-modal');
    const modalSummary = document.getElementById('modal-order-summary');
    const modalItems = document.getElementById('modal-order-items');
    const modalTotal = document.querySelector('#modal-order-total span:last-child');

    const renderOrders = () => {
        let orders = JSON.parse(localStorage.getItem('orders') || '[]');
        
        // Simulate status updates (for demo purposes as requested)
        // Order flow: Pending -> Packed -> Delivered
        let updated = false;
        orders = orders.map(order => {
            if (order.userId === currentUser.id || currentUser.role === 'admin') {
                const elapsed = Date.now() - order.timestamp;
                
                // Demo logic: packed after 1 min, delivered after 3 mins
                if (order.status === 'Pending' && elapsed > 60000) {
                    order.status = 'Packed';
                    updated = true;
                }
                if (order.status === 'Packed' && elapsed > 180000) {
                    order.status = 'Delivered';
                    updated = true;
                }
            }
            return order;
        });

        if (updated) {
            localStorage.setItem('orders', JSON.stringify(orders));
        }

        // Filter for current user
        const userOrders = orders.filter(o => o.userId === currentUser.id).sort((a,b) => b.timestamp - a.timestamp);

        if (userOrders.length === 0) {
            ordersTableBody.innerHTML = '<tr><td colspan="5" class="empty-orders"><i class="fa-solid fa-box" style="font-size: 3rem; display: block; margin-bottom: 10px;"></i>No orders found yet. Start shopping!</td></tr>';
            return;
        }

        ordersTableBody.innerHTML = '';
        userOrders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="font-family: monospace; font-weight: 600;">#${order.id}</td>
                <td>${order.date.split(',')[0]}</td>
                <td style="font-weight: 600;">₹${order.total.toFixed(2)}</td>
                <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
                <td><button class="btn btn-outline view-details-btn" data-id="${order.id}" style="padding: 5px 12px; font-size: 0.85rem;">View Details</button></td>
            `;
            ordersTableBody.appendChild(row);
        });

        // Add event listeners to view buttons
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', () => showOrderDetails(btn.dataset.id));
        });
    };

    const showOrderDetails = (orderId) => {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const order = orders.find(o => o.id === orderId);

        if (!order) return;

        modalSummary.innerHTML = `
            <div class="detail-item"><span>Order ID:</span> <strong>#${order.id}</strong></div>
            <div class="detail-item"><span>Date:</span> <span>${order.date}</span></div>
            <div class="detail-item"><span>Status:</span> <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></div>
            <div class="detail-item"><span>Type:</span> <span>${order.type === 'delivery' ? 'Home Delivery' : 'Store Pickup'}</span></div>
            <div class="detail-item"><span>${order.type === 'delivery' ? 'Address' : 'Time Slot'}:</span> <span style="text-align: right; max-width: 60%;">${order.details}</span></div>
        `;

        modalItems.innerHTML = '<h4 style="margin-bottom: 15px; font-size: 1rem;">Items:</h4>';
        order.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'detail-item';
            const price = parseFloat(String(item.price).replace('₹', ''));
            itemDiv.innerHTML = `
                <span>${item.name} (×${item.quantity})</span>
                <span>₹${(price * item.quantity).toFixed(2)}</span>
            `;
            modalItems.appendChild(itemDiv);
        });

        modalTotal.textContent = `₹${order.total.toFixed(2)}`;
        modal.classList.add('show');
    };

    if (closeModal) {
        closeModal.addEventListener('click', () => modal.classList.remove('show'));
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('show');
    });

    renderOrders();
    // Refresh status every 30 seconds while on page
    setInterval(renderOrders, 30000);
});

