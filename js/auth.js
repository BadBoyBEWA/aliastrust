// Authentication System
class AuthSystem {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = this.getCurrentUser();
        this.maxFailedAttempts = 5;
        this.lockoutTime = 15 * 60 * 1000; // 15 minutes
        
        this.initializeEventListeners();
        this.checkAuthentication();
    }

    // Load users from localStorage
    loadUsers() {
        const users = localStorage.getItem('aliasTrustUsers');
        if (users) {
            return JSON.parse(users);
        }
        
        // Default demo users
        const defaultUsers = [
            {
                id: '1',
                firstName: 'Demo',
                lastName: 'Client',
                email: 'client@demo.com',
                password: this.hashPassword('password123'),
                role: 'client',
                accountNumber: 'ATC-2024-001',
                createdAt: new Date().toISOString(),
                lastLogin: null
            },
            {
                id: '2',
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@demo.com',
                password: this.hashPassword('admin123'),
                role: 'admin',
                accountNumber: 'ATC-ADMIN-001',
                createdAt: new Date().toISOString(),
                lastLogin: null
            },
            {
                id: '3',
                firstName: 'Jose',
                lastName: 'Butler',
                email: 'josebutler722@gmail.com',
                password: this.hashPassword('Godwill@722'),
                role: 'client',
                accountNumber: 'ATC-2024-002',
                createdAt: new Date().toISOString(),
                lastLogin: null
            }
        ];
        
        localStorage.setItem('aliasTrustUsers', JSON.stringify(defaultUsers));
        return defaultUsers;
    }

    // Simple password hashing (for demo purposes)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Password strength checker
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => this.checkPasswordStrength(e.target.value));
        }

        // Real-time validation
        this.setupRealTimeValidation();
    }

    // Handle login
    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email').trim();
        const password = formData.get('password');
        const remember = formData.get('remember');

        // Validate inputs
        if (!this.validateEmail(email)) {
            this.showFieldError('email', 'Please enter a valid email address');
            return;
        }

        if (!password) {
            this.showFieldError('password', 'Password is required');
            return;
        }

        // Check if this specific user account is locked
        if (this.isUserLocked(email)) {
            const remainingTime = this.getRemainingLockoutTime(email);
            const minutes = Math.ceil(remainingTime / (60 * 1000));
            this.showMessage(`Account is temporarily locked. Please try again in ${minutes} minutes.`, 'error');
            return;
        }

        // Find user
        const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!user || user.password !== this.hashPassword(password)) {
            this.incrementFailedAttempts(email);
            
            const failedAttempts = this.getFailedAttempts(email);
            const remainingAttempts = this.maxFailedAttempts - failedAttempts;
            
            if (failedAttempts >= this.maxFailedAttempts) {
                this.lockUserAccount(email);
                this.showMessage('Too many failed attempts. Account locked for 15 minutes.', 'error');
            } else {
                this.showMessage(`Invalid credentials. ${remainingAttempts} attempts remaining.`, 'error');
            }
            return;
        }

        // Successful login - reset failed attempts for this user
        this.resetFailedAttempts(email);
        
        // Update last login
        user.lastLogin = new Date().toISOString();
        this.saveUsers();

        // Create session
        const session = {
            userId: user.id,
            email: user.email,
            role: user.role,
            loginTime: new Date().toISOString(),
            remember: remember
        };

        if (remember) {
            localStorage.setItem('aliasTrustSession', JSON.stringify(session));
        } else {
            sessionStorage.setItem('aliasTrustSession', JSON.stringify(session));
        }

        this.currentUser = user;
        this.showMessage('Login successful! Redirecting...', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            if (user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        }, 1500);
    }

    // Handle registration
    async handleRegister(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const userData = {
            firstName: formData.get('firstName').trim(),
            lastName: formData.get('lastName').trim(),
            email: formData.get('email').trim(),
            phone: formData.get('phone').trim(),
            country: formData.get('country'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            terms: formData.get('terms'),
            newsletter: formData.get('newsletter')
        };

        // Validate all fields
        if (!this.validateRegistration(userData)) {
            return;
        }

        // Check if user already exists
        if (this.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
            this.showFieldError('email', 'An account with this email already exists');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            country: userData.country,
            password: this.hashPassword(userData.password),
            role: 'client',
            accountNumber: `ATC-${new Date().getFullYear()}-${String(this.users.length + 1).padStart(3, '0')}`,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            newsletter: userData.newsletter === 'on'
        };

        this.users.push(newUser);
        this.saveUsers();
        // Initialize blank portfolio and trading history for new user
        localStorage.setItem(`portfolio_${newUser.id}`, JSON.stringify({
            totalValue: 0,
            goldHoldings: 0,
            totalReturn: 0,
            storageFees: 0,
            holdings: [],
            performance: []
        }));
        localStorage.setItem(`trading_${newUser.id}`, JSON.stringify([]));

        this.showMessage('Account created successfully! You can now log in.', 'success');
        
        // Clear form
        e.target.reset();
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }

    // Validate registration data
    validateRegistration(userData) {
        let isValid = true;

        // First name
        if (!userData.firstName || userData.firstName.length < 2) {
            this.showFieldError('firstName', 'First name must be at least 2 characters');
            isValid = false;
        }

        // Last name
        if (!userData.lastName || userData.lastName.length < 2) {
            this.showFieldError('lastName', 'Last name must be at least 2 characters');
            isValid = false;
        }

        // Email
        if (!this.validateEmail(userData.email)) {
            this.showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }

        // Phone
        if (!userData.phone || userData.phone.length < 10) {
            this.showFieldError('phone', 'Please enter a valid phone number');
            isValid = false;
        }

        // Country
        if (!userData.country) {
            this.showFieldError('country', 'Please select your country');
            isValid = false;
        }

        // Password
        if (!this.validatePassword(userData.password)) {
            this.showFieldError('password', 'Password must be at least 8 characters with uppercase, lowercase, number, and special character');
            isValid = false;
        }

        // Confirm password
        if (userData.password !== userData.confirmPassword) {
            this.showFieldError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }

        // Terms
        if (!userData.terms) {
            this.showMessage('You must agree to the Terms of Service and Privacy Policy', 'error');
            isValid = false;
        }

        return isValid;
    }

    // Validate email
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate password
    validatePassword(password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }

    // Check password strength
    checkPasswordStrength(password) {
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        
        if (!strengthFill || !strengthText) return;

        let strength = 0;
        let text = '';

        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[@$!%*?&]/.test(password)) strength++;

        strengthFill.className = 'strength-fill';
        
        switch (strength) {
            case 0:
            case 1:
                strengthFill.classList.add('weak');
                text = 'Weak';
                break;
            case 2:
                strengthFill.classList.add('fair');
                text = 'Fair';
                break;
            case 3:
                strengthFill.classList.add('good');
                text = 'Good';
                break;
            case 4:
            case 5:
                strengthFill.classList.add('strong');
                text = 'Strong';
                break;
        }

        strengthText.textContent = text;
    }

    // Setup real-time validation
    setupRealTimeValidation() {
        const inputs = document.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input.name);
            });
        });
    }

    // Validate individual field
    validateField(input) {
        const value = input.value.trim();
        const fieldName = input.name;

        switch (fieldName) {
            case 'email':
                if (value && !this.validateEmail(value)) {
                    this.showFieldError(fieldName, 'Please enter a valid email address');
                }
                break;
            case 'password':
                if (value && !this.validatePassword(value)) {
                    this.showFieldError(fieldName, 'Password must be at least 8 characters with uppercase, lowercase, number, and special character');
                }
                break;
            case 'confirmPassword':
                const password = document.getElementById('password')?.value;
                if (value && value !== password) {
                    this.showFieldError(fieldName, 'Passwords do not match');
                }
                break;
        }
    }

    // Show field error
    showFieldError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}Error`);
        const inputElement = document.getElementById(fieldName);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        if (inputElement) {
            inputElement.classList.add('error');
            inputElement.classList.remove('success');
        }
    }

    // Clear field error
    clearFieldError(fieldName) {
        const errorElement = document.getElementById(`${fieldName}Error`);
        const inputElement = document.getElementById(fieldName);
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        
        if (inputElement) {
            inputElement.classList.remove('error');
        }
    }

    // Show message
    showMessage(message, type = 'info') {
        const messageElement = document.getElementById('loginMessage') || document.getElementById('registerMessage');
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.className = `message ${type}`;
            messageElement.style.display = 'block';
        }
    }

    // Per-user lockout system methods
    
    // Check if specific user account is locked
    isUserLocked(email) {
        const lockoutData = this.getUserLockoutData(email);
        return lockoutData && lockoutData.lockoutUntil && Date.now() < lockoutData.lockoutUntil;
    }

    // Lock specific user account
    lockUserAccount(email) {
        const lockoutData = this.getUserLockoutData(email) || {};
        lockoutData.lockoutUntil = Date.now() + this.lockoutTime;
        this.saveUserLockoutData(email, lockoutData);
    }

    // Get remaining lockout time for a user
    getRemainingLockoutTime(email) {
        const lockoutData = this.getUserLockoutData(email);
        if (lockoutData && lockoutData.lockoutUntil) {
            return Math.max(0, lockoutData.lockoutUntil - Date.now());
        }
        return 0;
    }

    // Increment failed attempts for a specific user
    incrementFailedAttempts(email) {
        const lockoutData = this.getUserLockoutData(email) || {};
        lockoutData.failedAttempts = (lockoutData.failedAttempts || 0) + 1;
        this.saveUserLockoutData(email, lockoutData);
    }

    // Get failed attempts for a specific user
    getFailedAttempts(email) {
        const lockoutData = this.getUserLockoutData(email);
        return lockoutData ? (lockoutData.failedAttempts || 0) : 0;
    }

    // Reset failed attempts for a specific user (on successful login)
    resetFailedAttempts(email) {
        const lockoutData = this.getUserLockoutData(email) || {};
        lockoutData.failedAttempts = 0;
        lockoutData.lockoutUntil = null;
        this.saveUserLockoutData(email, lockoutData);
    }

    // Get user lockout data from localStorage
    getUserLockoutData(email) {
        const allLockouts = this.getAllUserLockouts();
        return allLockouts[email.toLowerCase()] || null;
    }

    // Save user lockout data to localStorage
    saveUserLockoutData(email, lockoutData) {
        const allLockouts = this.getAllUserLockouts();
        allLockouts[email.toLowerCase()] = lockoutData;
        localStorage.setItem('aliasTrustUserLockouts', JSON.stringify(allLockouts));
    }

    // Get all user lockouts from localStorage
    getAllUserLockouts() {
        const lockouts = localStorage.getItem('aliasTrustUserLockouts');
        return lockouts ? JSON.parse(lockouts) : {};
    }

    // Clean up expired lockouts (optional - can be called periodically)
    cleanupExpiredLockouts() {
        const allLockouts = this.getAllUserLockouts();
        const now = Date.now();
        let hasChanges = false;

        Object.keys(allLockouts).forEach(email => {
            const lockoutData = allLockouts[email];
            if (lockoutData.lockoutUntil && lockoutData.lockoutUntil < now) {
                // Lockout has expired, remove it
                delete allLockouts[email];
                hasChanges = true;
            }
        });

        if (hasChanges) {
            localStorage.setItem('aliasTrustUserLockouts', JSON.stringify(allLockouts));
        }
    }

    // Save users
    saveUsers() {
        localStorage.setItem('aliasTrustUsers', JSON.stringify(this.users));
    }

    // Get current user
    getCurrentUser() {
        const session = localStorage.getItem('aliasTrustSession') || sessionStorage.getItem('aliasTrustSession');
        if (session) {
            const sessionData = JSON.parse(session);
            return this.users.find(u => u.id === sessionData.userId);
        }
        return null;
    }

    // Check authentication
    checkAuthentication() {
        if (this.currentUser) {
            // User is logged in
            if (window.location.pathname.includes('login.html') || 
                window.location.pathname.includes('register.html')) {
                window.location.href = 'dashboard.html';
            }
        } else {
            // User is not logged in
            if (window.location.pathname.includes('dashboard.html')) {
                window.location.href = 'login.html';
            }
        }
    }

    // Logout
    logout() {
        localStorage.removeItem('aliasTrustSession');
        sessionStorage.removeItem('aliasTrustSession');
        this.currentUser = null;
        this.showMessage('Logout successful!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// Global functions
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.querySelector('.toggle-password .eye-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        eyeIcon.textContent = '👁️';
    }
}

function toggleConfirmPassword() {
    const passwordInput = document.getElementById('confirmPassword');
    const eyeIcon = document.querySelector('.toggle-password .eye-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        eyeIcon.textContent = '👁️';
    }
}

function logout() {
    if (window.authSystem) {
        window.authSystem.logout();
    }
}

// Initialize authentication system
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
    
    // Clean up any expired lockouts on page load
    if (window.authSystem) {
        window.authSystem.cleanupExpiredLockouts();
    }
}); 