
document.addEventListener('DOMContentLoaded', () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    const typeOptions = document.querySelectorAll('.type-option');
    const deliveryView = document.getElementById('delivery-view');
    const pickupView = document.getElementById('pickup-view');
    const sideSummary = document.getElementById('side-summary');
    const orderItemsList = document.getElementById('order-items-list');
    const finalTotal = document.getElementById('final-total');
    const continueBtn = document.getElementById('continue-to-confirm-btn');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const backBtn = document.getElementById('back-to-step-1');
    const step1View = document.getElementById('step-1-view');
    const step2View = document.getElementById('step-2-view');
    const errorMsg = document.getElementById('error-msg');
    
    let orderType = 'delivery';
    let totalAmount = 0;

    // Render Side Summary (Live)
    const renderSummary = (container, showGrandTotal = true) => {
        container.innerHTML = '';
        totalAmount = 0;
        cart.forEach(item => {
            const price = parseFloat(String(item.price).replace('₹', ''));
            const subtotal = price * item.quantity;
            totalAmount += subtotal;

            const div = document.createElement('div');
            div.className = 'order-summary-item';
            div.innerHTML = `
                <div class="item-details">
                    <span class="item-name">${item.name}</span>
                    <span class="item-qty">Qty: ${item.quantity} × ₹${price.toFixed(2)}</span>
                </div>
                <span class="item-total-price">₹${subtotal.toFixed(2)}</span>
            `;
            container.appendChild(div);
        });

        if (showGrandTotal && finalTotal) {
            finalTotal.textContent = `₹${totalAmount.toFixed(2)}`;
        }
    };

    renderSummary(orderItemsList);

    // Toggle Order Type
    typeOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            typeOptions.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            orderType = opt.dataset.type;

            if (orderType === 'delivery') {
                deliveryView.classList.add('active');
                pickupView.classList.remove('active');
            } else {
                deliveryView.classList.remove('active');
                pickupView.classList.add('active');
            }
        });
    });

    // Saved Address handling
    const savedAddressSelect = document.getElementById('saved-addresses');
    const addressTextarea = document.getElementById('delivery-address');
    if (savedAddressSelect && addressTextarea) {
        savedAddressSelect.addEventListener('change', (e) => {
            addressTextarea.value = e.target.value;
        });
    }

    // Continue to Confirmation
    continueBtn.addEventListener('click', () => {
        const address = addressTextarea.value.trim();
        const timeSlot = document.getElementById('pickup-time-slot').value;

        if (orderType === 'delivery' && !address) {
            errorMsg.style.display = 'block';
            errorMsg.textContent = 'Please provide a shipping address.';
            return;
        }

        errorMsg.style.display = 'none';
        
        // Prepare Step 2
        step1View.style.display = 'none';
        sideSummary.style.display = 'none';
        step2View.classList.add('active');
        document.getElementById('checkout-step-indicator').textContent = 'Step 2: Order Confirmation';

        const confirmationSummary = document.getElementById('confirmation-summary-details');
        confirmationSummary.innerHTML = `
            <p><strong>Method:</strong> ${orderType === 'delivery' ? 'Home Delivery' : 'Store Pickup'}</p>
            <p><strong>${orderType === 'delivery' ? 'Address' : 'Time Slot'}:</strong> ${orderType === 'delivery' ? address : timeSlot}</p>
        `;

        const confirmItemsList = document.getElementById('confirm-items-list');
        renderSummary(confirmItemsList, false);
        document.getElementById('final-total-confirmation').textContent = `₹${totalAmount.toFixed(2)}`;
        
        // Save temporary choice to localStorage if needed (not strictly required if we keep state in memory)
    });

    backBtn.addEventListener('click', () => {
        step1View.style.display = 'block';
        sideSummary.style.display = 'block';
        step2View.classList.remove('active');
        document.getElementById('checkout-step-indicator').textContent = 'Step 1: Delivery Information';
    });

    // Final Place Order
    placeOrderBtn.addEventListener('click', () => {
        const orderId = 'ORD' + Date.now().toString().slice(-8);
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const address = addressTextarea.value.trim();
        const timeSlot = document.getElementById('pickup-time-slot').value;

        const newOrder = {
            id: orderId,
            date: new Date().toLocaleString(),
            items: cart,
            total: totalAmount,
            type: orderType,
            details: orderType === 'delivery' ? address : timeSlot,
            status: 'Pending',
            userId: currentUser.id || 'guest',
            timestamp: Date.now()
        };

        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));

        // Clear Cart
        localStorage.setItem('cart', JSON.stringify([]));

        // Show Success Modal
        const modal = document.getElementById('success-modal');
        const orderIdDisplay = document.getElementById('generated-order-id');
        orderIdDisplay.textContent = orderId;
        modal.classList.add('show');
    });
});
