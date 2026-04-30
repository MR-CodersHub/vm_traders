// Global Authentication Guard
(function() {
    const protectedPages = [
        'cart.html',
        'checkout.html',
        'wishlist.html',
        'orders.html',
        'user-dashboard.html',
        'profile.html',
        'admin-dashboard.html',
        'admin-products.html',
        'admin-orders.html',
        'admin-customers.html',
        'admin-settings.html'
    ];
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const currentUser = DataLayer.getCurrentUser();

    if (protectedPages.includes(currentPath) && !currentUser) {
        window.location.href = 'login.html';
    }

    // Redirect logged-in users away from login/signup/reset-password to the homepage
    if (currentUser && (currentPath === 'login.html' || currentPath === 'signup.html' || currentPath === 'reset-password.html')) {
        window.location.href = 'index.html';
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginMethod = document.getElementById('loginMethod');
    const passwordArea = document.getElementById('passwordArea');
    const otpArea = document.getElementById('otpArea');
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const otpHint = document.getElementById('otpHint');
    const errorMsg = document.getElementById('errorMsg');
    const userDropdownContainer = document.querySelector('.user-dropdown-container');
    const userDropdownToggle = document.querySelector('.user-dropdown-toggle');
    const userDropdownMenu = document.querySelector('.user-dropdown-menu');

    // Toggle Password Visibility
    const toggleIcons = document.querySelectorAll('.password-toggle-icon');
    toggleIcons.forEach(icon => {
        icon.addEventListener('click', function () {
            const input = this.parentElement.querySelector('input');
            const iconItem = this.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                iconItem.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                iconItem.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });

    // Handle Login Method Toggle
    if (loginMethod) {
        loginMethod.addEventListener('change', function() {
            if (this.value === 'otp') {
                passwordArea.style.display = 'none';
                otpArea.style.display = 'block';
            } else {
                passwordArea.style.display = 'block';
                otpArea.style.display = 'none';
            }
        });
    }

    // Handle Send OTP (Mock)
    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', () => {
            const phone = document.getElementById('phoneNumber').value;
            if (phone.length === 10) {
                otpHint.style.display = 'block';
                sendOtpBtn.textContent = 'Resend OTP';
                alert('OTP Sent! (Mock: 123456)');
            } else {
                alert('Please enter a valid 10-digit phone number.');
            }
        });
    }

    // Handle Signup
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fullName = document.getElementById('fullName').value;
            const phone = document.getElementById('phoneNumber').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                showError('Passwords do not match.');
                return;
            }

            let users = DataLayer.getUsers();
            if (users.find(u => u.phone === phone)) {
                showError('User with this phone number already exists.');
                return;
            }

            const newUser = { fullName, phone, password };
            users.push(newUser);
            DataLayer.saveUsers(users);

            alert('Registration successful! Please login.');
            window.location.href = 'login.html';
        });
    }

    // Handle Login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const phone = document.getElementById('phoneNumber').value;
            const method = loginMethod.value;
            let users = DataLayer.getUsers();
            const user = users.find(u => u.phone === phone);

            if (!user) {
                alert('User not found. Please sign up.');
                return;
            }

            if (method === 'password') {
                const password = document.getElementById('password').value;
                if (user.password === password) {
                    performLogin(user);
                } else {
                    alert('Incorrect password.');
                }
            } else {
                const otp = document.getElementById('otpCode').value;
                if (otp === '123456') {
                    performLogin(user);
                } else {
                    alert('Invalid OTP code.');
                }
            }
        });
    }

    // Handle Reset Password
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const currentUser = DataLayer.getCurrentUser();
            const users = DataLayer.getUsers();

            if (newPassword !== confirmPassword) {
                showError('Passwords do not match.');
                return;
            }

            if (!currentUser || !currentUser.phone) {
                showError('Please login before changing your password.');
                return;
            }

            const user = users.find(u => u.phone === currentUser.phone);
            if (!user) {
                showError('Unable to find your account.');
                return;
            }

            user.password = newPassword;
            DataLayer.saveUsers(users);
            DataLayer.setCurrentUser(user);
            alert('Password updated successfully.');
            window.location.href = 'login.html';
        });
    }

    function performLogin(user) {
        DataLayer.setCurrentUser(user);
        alert('Login successful! Welcome, ' + user.fullName);
        window.location.href = 'index.html';
    }

    function showError(msg) {
        if (errorMsg) {
            errorMsg.textContent = msg;
            errorMsg.style.display = 'block';
        } else {
            alert(msg);
        }
    }

    // User Icon Click Action & Navigation
    function handleAccountNavigation(e) {
        // Find the toggle button if it was clicked
        const toggle = e.target.closest('.user-dropdown-toggle');
        if (!toggle) return;

        e.preventDefault();
        e.stopPropagation(); // Control propagation as requested
        
        const currentUser = DataLayer.getCurrentUser();
        
        if (currentUser) {
            // If logged in, just toggle the dropdown visibility
            const dropdown = toggle.parentElement.querySelector('.user-dropdown-menu');
            if (dropdown) {
                dropdown.classList.toggle('show');
                
                // Close other dropdowns if they exist
                document.querySelectorAll('.user-dropdown-menu.show').forEach(menu => {
                    if (menu !== dropdown) menu.classList.remove('show');
                });
            }
        } else {
            // If not logged in, redirect to login page
            window.location.href = 'login.html';
        }
    }

    // Use event delegation on the document for robustness
    document.addEventListener('click', handleAccountNavigation);

    // Handle all elements with data-auth="login" or "logout"
    function attachAuthListeners() {
        document.querySelectorAll('[data-auth="login"]').forEach(link => {
            link.addEventListener('click', handleAccountNavigation);
        });

        document.querySelectorAll('[data-auth="logout"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        });
        
        // Also catch any direct links to login.html that might have been missed
        document.querySelectorAll('a[href="login.html"]').forEach(link => {
            // If it's a logout link, handle logout
            if (link.textContent.toLowerCase().includes('logout') || link.closest('.logout-link') || link.closest('.sidebar-item-logout')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    logout();
                });
            } else {
                // Otherwise treat it as a generic account navigation
                link.addEventListener('click', handleAccountNavigation);
            }
        });
    }

    // Global click to close the dropdown if open
    document.addEventListener('click', (e) => {
        // Close dropdowns only if clicking outside the dropdown container
        if (!e.target.closest('.user-dropdown-container')) {
            document.querySelectorAll('.user-dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });

    attachAuthListeners();

    // Global Login State Update
    function updateLoginState() {
        const currentUser = DataLayer.getCurrentUser();
        
        // Update Sidebar User Info if exists (Admin pages)
        const sidebarName = document.querySelector('.sidebar-user-name');
        const sidebarAvatar = document.querySelector('.sidebar-user-avatar');
        
        if (currentUser && sidebarName) {
            sidebarName.textContent = currentUser.fullName;
            if (sidebarAvatar) {
                // Get initials
                const initials = currentUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                sidebarAvatar.textContent = initials;
            }
        }

        const menus = document.querySelectorAll('.user-dropdown-menu');
        
        menus.forEach(menu => {
            if (currentUser) {
                menu.innerHTML = `
                    <p class="user-dropdown-item" style="font-weight: 700; color: var(--primary); font-size: 0.85rem;">Welcome, ${currentUser.fullName.split(' ')[0]}</p>
                    <div class="user-dropdown-divider"></div>
                    <a href="user-dashboard.html" class="user-dropdown-item"><i class="fa-solid fa-box"></i> My Orders</a>
                    <a href="admin-dashboard.html" class="user-dropdown-item"><i class="fa-solid fa-gear"></i> Admin Panel</a>
                    <div class="user-dropdown-divider"></div>
                    <a href="#" class="user-dropdown-item logout-trigger" style="color: #ef4444;"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
                `;
            } else {
                menu.innerHTML = `
                    <a href="#" class="user-dropdown-item" data-auth="login">Login / Sign Up</a>
                    <div class="user-dropdown-divider"></div>
                    <a href="admin-dashboard.html" class="user-dropdown-item">Admin Dashboard</a>
                `;
            }
        });

        // Re-attach listeners to new dynamic elements
        attachAuthListeners();
        
        // Handle the logout trigger specifically since it might be added multiple times
        document.querySelectorAll('.logout-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        });
    }

    function logout() {
        DataLayer.logout();
        alert('You have been logged out.');
        window.location.href = 'index.html';
    }

    // Initial check
    updateLoginState();

    // Export login check for other scripts
    window.isLoggedIn = () => !!DataLayer.getCurrentUser();
});
