// Local icon fallback for offline usage
(function() {
    const iconMap = {
        'ph-storefront': '🏬',
        'ph-shopping-cart': '🛒',
        'ph-heart': '❤️',
        'ph-user': '👤',
        'ph-user-circle': '👤',
        'ph-list': '☰',
        'ph-magnifying-glass': '🔍',
        'ph-arrow-right': '➡️',
        'ph-arrow-left': '⬅️',
        'ph-envelope': '✉️',
        'ph-phone': '📞',
        'ph-map-pin': '📍',
        'ph-house': '🏠',
        'ph-leaf': '🍃',
        'ph-apple': '🍎',
        'ph-drop': '💧',
        'ph-package': '📦',
        'ph-cookie': '🍪',
        'ph-brandy': '🍹',
        'ph-browser': '🌐',
        'ph-chart-line': '📈',
        'ph-users': '👥',
        'ph-gear': '⚙️',
        'ph-sign-out': '🚪',
        'ph-x': '✖️',
        'ph-shopping-bag-open': '🛍️',
        'ph-check-circle': '✅',
        'ph-timer': '⏱️',
        'ph-currency-circle-dollar': '💲',
        'ph-shopping-bag': '🛍️',
        'ph-credit-card': '💳',
        'ph-truck': '🚚',
        'ph-headset': '🎧',
        'ph-magic-wand': '🪄',
        'ph-caret-down': '▼',
        'ph-eye': '👁️',
        'ph-eye-slash': '🙈',
        'ph-heart-break': '💔',
        'ph-clock': '🕒',
        'ph-fill': '',
        'ph-bold': ''
    };

    function updateIconElement(element) {
        const iconClass = Array.from(element.classList)
            .filter(cls => cls.startsWith('ph-') && cls !== 'ph-fill' && cls !== 'ph-bold' && cls !== 'ph-thin' && cls !== 'ph-duotone')
            .find(cls => iconMap[cls]);

        if (iconClass) {
            element.textContent = iconMap[iconClass];
            element.style.fontStyle = 'normal';
            element.style.fontFamily = 'inherit';
            element.style.display = 'inline-flex';
            element.style.alignItems = 'center';
            element.style.justifyContent = 'center';
            element.style.lineHeight = '1';
        }
    }

// document.addEventListener('DOMContentLoaded', () => {
//     document.querySelectorAll('.ph').forEach(updateIconElement);
// });
})();
