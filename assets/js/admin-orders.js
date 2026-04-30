document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('.order-table tbody');
    if (!tableBody) return;

    function renderAdminOrders() {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        if (orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No orders found.</td></tr>';
            return;
        }

        tableBody.innerHTML = '';
        orders.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(order => {
            const dateStr = new Date(order.date).toLocaleDateString();
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${order.id}</strong></td>
                <td><input type="text" value="${order.address}" style="width: 150px; border: 1px solid #ddd; padding: 4px; border-radius: 4px;" onchange="updateOrder('${order.id}', 'address', this.value)" title="Order Address/Name"></td>
                <td>${dateStr}</td>
                <td>
                    <div style="display:flex; align-items:center;">
                        $<input type="number" step="0.01" value="${parseFloat(order.total).toFixed(2)}" style="width:80px; margin-left:4px; border: 1px solid #ddd; padding: 4px; border-radius: 4px;" onchange="updateOrder('${order.id}', 'total', this.value)">
                    </div>
                </td>
                <td>
                    <select onchange="updateOrder('${order.id}', 'status', this.value)" style="border: 1px solid #ddd; padding: 4px; border-radius: 4px;">
                        <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option value="Packed" ${order.status === 'Packed' ? 'selected' : ''}>Packed</option>
                        <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    </select>
                </td>
                <td><button onclick="deleteOrder('${order.id}')" style="background:none; border:none; color:#e74c3c; cursor:pointer;"><i class="fa-solid fa-trash" style="font-size: 1.2rem;"></i></button></td>
            `;
            tableBody.appendChild(tr);
        });
    }

    renderAdminOrders();

    window.updateOrder = function(id, field, value) {
        let orders = JSON.parse(localStorage.getItem('orders') || '[]');
        let order = orders.find(o => o.id === id);
        if (order) {
            order[field] = value;
            localStorage.setItem('orders', JSON.stringify(orders));
        }
    };

    window.deleteOrder = function(id) {
        if(confirm("Delete this order?")) {
            let orders = JSON.parse(localStorage.getItem('orders') || '[]');
            orders = orders.filter(o => o.id !== id);
            localStorage.setItem('orders', JSON.stringify(orders));
            renderAdminOrders();
        }
    };
});

