// Dashboard Management System
class DashboardSystem {
    constructor() {
        this.currentUser = this.getCurrentUser();
        
        // Redirect to login if not authenticated
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return;
        }
        
        this.portfolioData = this.loadPortfolioData();
        this.tradingHistory = this.loadTradingHistory();
        this.goldPrices = this.loadGoldPrices();
        
        this.initializeDashboard();
        this.setupEventListeners();
        this.startPriceUpdates();
    }

    // Get current user from session
    getCurrentUser() {
        const session = localStorage.getItem('aliasTrustSession') || sessionStorage.getItem('aliasTrustSession');
        if (session) {
            const sessionData = JSON.parse(session);
            const users = JSON.parse(localStorage.getItem('aliasTrustUsers') || '[]');
            return users.find(u => u.id === sessionData.userId);
        }
        return null;
    }

    // Load portfolio data
    loadPortfolioData() {
        const portfolio = localStorage.getItem(`portfolio_${this.currentUser?.id}`);
        if (portfolio) {
            return JSON.parse(portfolio);
        }
        
        // Default portfolio data
        return {
            totalValue: 1247850.00,
            goldHoldings: 507.5,
            totalReturn: 89250.00,
            storageFees: 2450.00,
            holdings: [
                {
                    type: '1 oz Gold Bars',
                    quantity: 250,
                    value: 612625.00,
                    return: 45250.00
                },
                {
                    type: '10 oz Gold Bars',
                    quantity: 25,
                    value: 612625.00,
                    return: 44000.00
                },
                {
                    type: 'Gold Coins',
                    quantity: 7.5,
                    value: 22600.00,
                    return: 0.00
                }
            ],
            performance: [
                { date: '2024-01', value: 1158600.00 },
                { date: '2024-02', value: 1189200.00 },
                { date: '2024-03', value: 1214500.00 },
                { date: '2024-04', value: 1198000.00 },
                { date: '2024-05', value: 1223000.00 },
                { date: '2024-06', value: 1247850.00 }
            ]
        };
    }

    // Load trading history
    loadTradingHistory() {
        const history = localStorage.getItem(`trading_${this.currentUser?.id}`);
        if (history) {
            return JSON.parse(history);
        }
        
        // Default trading history
        return [
            {
                id: 1,
                type: 'buy',
                quantity: 5.0,
                price: 2445.00,
                date: new Date().toISOString(),
                status: 'completed'
            },
            {
                id: 2,
                type: 'sell',
                quantity: 2.5,
                price: 2448.50,
                date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                status: 'completed'
            },
            {
                id: 3,
                type: 'buy',
                quantity: 10.0,
                price: 2440.00,
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'completed'
            }
        ];
    }

    // Load gold prices
    loadGoldPrices() {
        return {
            goldSpot: 2450.50,
            goldFutures: 2452.75,
            silverSpot: 28.45,
            lastUpdate: new Date().toISOString()
        };
    }

    // Initialize dashboard
    initializeDashboard() {
        this.updateUserInfo();
        this.updatePortfolioSummary();
        this.updateLivePrices();
        this.updateHoldingsTable();
        this.updateTradingHistory();
        this.initializeChart();
        this.updateLastLogin();
    }

    // Update user information
    updateUserInfo() {
        if (!this.currentUser) return;

        const userNameElement = document.getElementById('userName');
        const accountNumberElement = document.getElementById('accountNumber');
        
        if (userNameElement) {
            userNameElement.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        }
        
        if (accountNumberElement) {
            accountNumberElement.textContent = this.currentUser.accountNumber;
        }
    }

    // Update portfolio summary
    updatePortfolioSummary() {
        const totalValueElement = document.getElementById('totalValue');
        const goldHoldingsElement = document.getElementById('goldHoldings');
        const totalReturnElement = document.getElementById('totalReturn');
        const storageFeesElement = document.getElementById('storageFees');

        if (totalValueElement) {
            totalValueElement.textContent = this.formatCurrency(this.portfolioData.totalValue);
        }
        
        if (goldHoldingsElement) {
            goldHoldingsElement.textContent = `${this.portfolioData.goldHoldings} oz`;
        }
        
        if (totalReturnElement) {
            totalReturnElement.textContent = this.formatCurrency(this.portfolioData.totalReturn);
        }
        
        if (storageFeesElement) {
            storageFeesElement.textContent = this.formatCurrency(this.portfolioData.storageFees);
        }
    }

    // Update live prices
    updateLivePrices() {
        const goldSpotElement = document.getElementById('goldSpotPrice');
        const goldFuturesElement = document.getElementById('goldFuturesPrice');
        const silverSpotElement = document.getElementById('silverSpotPrice');
        const goldSpotChangeElement = document.getElementById('goldSpotChange');
        const goldFuturesChangeElement = document.getElementById('goldFuturesChange');
        const silverSpotChangeElement = document.getElementById('silverSpotChange');

        if (goldSpotElement) {
            goldSpotElement.textContent = this.formatCurrency(this.goldPrices.goldSpot);
        }
        
        if (goldFuturesElement) {
            goldFuturesElement.textContent = this.formatCurrency(this.goldPrices.goldFutures);
        }
        
        if (silverSpotElement) {
            silverSpotElement.textContent = this.formatCurrency(this.goldPrices.silverSpot);
        }

        // Simulate price changes
        this.simulatePriceChanges();
    }

    // Simulate price changes
    simulatePriceChanges() {
        const changes = [
            { id: 'goldSpotChange', value: 12.30, positive: true },
            { id: 'goldFuturesChange', value: 8.45, positive: true },
            { id: 'silverSpotChange', value: 0.15, positive: false }
        ];

        changes.forEach(change => {
            const element = document.getElementById(change.id);
            if (element) {
                const sign = change.positive ? '+' : '-';
                const color = change.positive ? 'positive' : 'negative';
                element.textContent = `${sign}${this.formatCurrency(change.value)}`;
                element.className = `ticker-change ${color}`;
            }
        });
    }

    // Update holdings table
    updateHoldingsTable() {
        const holdingsTable = document.querySelector('.holdings-table');
        if (!holdingsTable) return;

        // Clear existing rows (except header)
        const rows = holdingsTable.querySelectorAll('.table-row');
        rows.forEach(row => row.remove());

        // Add holdings data
        this.portfolioData.holdings.forEach(holding => {
            const row = document.createElement('div');
            row.className = 'table-row';
            
            const returnClass = holding.return > 0 ? 'positive' : holding.return < 0 ? 'negative' : 'neutral';
            const returnSign = holding.return > 0 ? '+' : '';
            
            row.innerHTML = `
                <span>${holding.type}</span>
                <span>${holding.quantity} ${holding.type.includes('Bars') ? 'oz' : 'oz'}</span>
                <span>${this.formatCurrency(holding.value)}</span>
                <span class="${returnClass}">${returnSign}${this.formatCurrency(holding.return)}</span>
            `;
            
            holdingsTable.appendChild(row);
        });
    }

    // Update trading history
    updateTradingHistory() {
        const tradesList = document.querySelector('.trades-list');
        if (!tradesList) return;

        tradesList.innerHTML = '';

        this.tradingHistory.slice(0, 5).forEach(trade => {
            const tradeItem = document.createElement('div');
            tradeItem.className = 'trade-item';
            
            const date = new Date(trade.date);
            const formattedDate = this.formatDate(date);
            
            tradeItem.innerHTML = `
                <div class="trade-info">
                    <span class="trade-type ${trade.type}">${trade.type.toUpperCase()}</span>
                    <span class="trade-quantity">${trade.quantity} oz</span>
                    <span class="trade-price">${this.formatCurrency(trade.price)}</span>
                </div>
                <div class="trade-date">${formattedDate}</div>
            `;
            
            tradesList.appendChild(tradeItem);
        });
    }

    // Store initial chart data for reset
    initialChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr'],
        data: [1200000, 1230000, 1250000, 1247850]
    };
    realtimeInterval = null;

    // Initialize chart with Chart.js
    initializeChart() {
        const chartContainer = document.getElementById('portfolioChart');
        if (!chartContainer) return;

        // Remove any previous chart instance if present
        if (chartContainer.chartInstance) {
            chartContainer.chartInstance.destroy();
        }

        // Use stored or initial data
        if (!this.currentChartData) {
            this.currentChartData = {
                labels: [...this.initialChartData.labels],
                data: [...this.initialChartData.data]
            };
        }

        const ctx = chartContainer.getContext('2d');
        const chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.currentChartData.labels,
                datasets: [{
                    label: 'Portfolio Value',
                    data: this.currentChartData.data,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59,130,246,0.1)',
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#3b82f6',
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: function(context) {
                                return ' $' + context.parsed.y.toLocaleString();
                            }
                        }
                    },
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'xy',
                            modifierKey: 'ctrl',
                        },
                        zoom: {
                            wheel: { enabled: true },
                            pinch: { enabled: true },
                            mode: 'xy',
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                hover: {
                    mode: 'nearest',
                    intersect: false
                },
                onClick: (e, elements) => {
                    if (elements.length > 0) {
                        const idx = elements[0].index;
                        const value = chartInstance.data.datasets[0].data[idx];
                        const label = chartInstance.data.labels[idx];
                        // Show styled modal
                        const modal = document.getElementById('chartValueModal');
                        document.getElementById('chartValueModalLabel').textContent = label;
                        document.getElementById('chartValueModalValue').textContent = '$' + value.toLocaleString();
                        modal.style.display = 'flex';
                    }
                },
                onHover: (event, chartElement) => {
                    event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
        chartContainer.chartInstance = chartInstance;

        // Add button handler for adding new data points interactively
        const addDataBtn = document.getElementById('addDataBtn');
        if (addDataBtn) {
            addDataBtn.onclick = () => {
                const nextMonth = 'Month ' + (chartInstance.data.labels.length + 1);
                const lastValue = chartInstance.data.datasets[0].data[chartInstance.data.datasets[0].data.length - 1];
                const newValue = lastValue + Math.round(Math.random() * 20000 - 10000); // Simulate change
                this.updatePortfolioChart(nextMonth, newValue);
            };
        }

        // Real-time update button
        const realtimeBtn = document.getElementById('realtimeBtn');
        if (realtimeBtn) {
            realtimeBtn.onclick = () => {
                if (this.realtimeInterval) {
                    clearInterval(this.realtimeInterval);
                    this.realtimeInterval = null;
                    realtimeBtn.textContent = 'Start Real-Time Update';
                } else {
                    this.realtimeInterval = setInterval(() => {
                        const chart = chartContainer.chartInstance;
                        const nextMonth = 'Month ' + (chart.data.labels.length + 1);
                        const lastValue = chart.data.datasets[0].data[chart.data.datasets[0].data.length - 1];
                        const newValue = lastValue + Math.round(Math.random() * 20000 - 10000);
                        this.updatePortfolioChart(nextMonth, newValue);
                    }, 2000);
                    realtimeBtn.textContent = 'Stop Real-Time Update';
                }
            };
        }

        // Reset button
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.onclick = () => {
                this.currentChartData = {
                    labels: [...this.initialChartData.labels],
                    data: [...this.initialChartData.data]
                };
                if (this.realtimeInterval) {
                    clearInterval(this.realtimeInterval);
                    this.realtimeInterval = null;
                    if (realtimeBtn) realtimeBtn.textContent = 'Start Real-Time Update';
                }
                this.initializeChart();
            };
        }
    }

    // Example: Method to update chart data interactively
    updatePortfolioChart(newLabel, newValue) {
        const chartContainer = document.getElementById('portfolioChart');
        if (!chartContainer || !chartContainer.chartInstance) return;
        const chart = chartContainer.chartInstance;
        chart.data.labels.push(newLabel);
        chart.data.datasets[0].data.push(newValue);
        if (this.currentChartData) {
            this.currentChartData.labels.push(newLabel);
            this.currentChartData.data.push(newValue);
        }
        chart.update();
    }

    // Update last login
    updateLastLogin() {
        const lastLoginElement = document.getElementById('lastLogin');
        if (lastLoginElement && this.currentUser?.lastLogin) {
            const lastLogin = new Date(this.currentUser.lastLogin);
            const now = new Date();
            const diff = now - lastLogin;
            
            if (diff < 24 * 60 * 60 * 1000) {
                lastLoginElement.textContent = 'Today at ' + lastLogin.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            } else {
                lastLoginElement.textContent = lastLogin.toLocaleDateString() + ' at ' + lastLogin.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            }
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Trading form
        const tradeForm = document.getElementById('tradeForm');
        if (tradeForm) {
            tradeForm.addEventListener('submit', (e) => this.handleTrade(e));
        }

        // Order calculation
        const quantityInput = document.getElementById('orderQuantity');
        const priceInput = document.getElementById('orderPrice');
        
        if (quantityInput && priceInput) {
            [quantityInput, priceInput].forEach(input => {
                input.addEventListener('input', () => this.calculateOrder());
            });
        }

        // Modal trade form
        const modalTradeForm = document.getElementById('modalTradeForm');
        if (modalTradeForm) {
            modalTradeForm.addEventListener('submit', (e) => this.handleModalTrade(e));
        }

        // Logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLogoutModal();
            });
        }
    }

    // Handle trade submission
    handleTrade(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const orderType = formData.get('orderType');
        const quantity = parseFloat(formData.get('orderQuantity'));
        const price = parseFloat(formData.get('orderPrice'));

        if (!quantity || !price) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        // Create new trade
        const newTrade = {
            id: Date.now(),
            type: orderType,
            quantity: quantity,
            price: price,
            date: new Date().toISOString(),
            status: 'pending'
        };

        this.tradingHistory.unshift(newTrade);
        this.saveTradingHistory();
        this.updateTradingHistory();

        // Update portfolio
        this.updatePortfolioAfterTrade(newTrade);
        
        this.showMessage('Order placed successfully!', 'success');
        e.target.reset();
        this.calculateOrder();
    }

    // Handle modal trade
    handleModalTrade(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const orderType = formData.get('orderType');
        const quantity = parseFloat(formData.get('orderQuantity'));
        const price = parseFloat(formData.get('orderPrice'));
        const notes = formData.get('orderNotes');

        if (!quantity || !price) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        // Create new trade
        const newTrade = {
            id: Date.now(),
            type: orderType,
            quantity: quantity,
            price: price,
            notes: notes,
            date: new Date().toISOString(),
            status: 'pending'
        };

        this.tradingHistory.unshift(newTrade);
        this.saveTradingHistory();
        this.updateTradingHistory();

        // Update portfolio
        this.updatePortfolioAfterTrade(newTrade);
        
        this.showMessage('Order placed successfully!', 'success');
        this.closeTradeModal();
        e.target.reset();
    }

    // Update portfolio after trade
    updatePortfolioAfterTrade(trade) {
        const totalValue = trade.quantity * trade.price;
        
        if (trade.type === 'buy') {
            this.portfolioData.goldHoldings += trade.quantity;
            this.portfolioData.totalValue += totalValue;
        } else {
            this.portfolioData.goldHoldings -= trade.quantity;
            this.portfolioData.totalValue -= totalValue;
        }

        this.savePortfolioData();
        this.updatePortfolioSummary();
        this.updateHoldingsTable();
    }

    // Calculate order
    calculateOrder() {
        const quantity = parseFloat(document.getElementById('orderQuantity')?.value) || 0;
        const price = parseFloat(document.getElementById('orderPrice')?.value) || 0;
        
        const totalValue = quantity * price;
        const commission = totalValue * 0.01; // 1% commission
        const totalCost = totalValue + commission;

        const orderTotalElement = document.getElementById('orderTotal');
        const orderCommissionElement = document.getElementById('orderCommission');
        const orderTotalCostElement = document.getElementById('orderTotalCost');

        if (orderTotalElement) {
            orderTotalElement.textContent = this.formatCurrency(totalValue);
        }
        
        if (orderCommissionElement) {
            orderCommissionElement.textContent = this.formatCurrency(commission);
        }
        
        if (orderTotalCostElement) {
            orderTotalCostElement.textContent = this.formatCurrency(totalCost);
        }
    }

    // Start price updates
    startPriceUpdates() {
        setInterval(() => {
            this.updateGoldPrices();
            this.updateLivePrices();
        }, 30000); // Update every 30 seconds
    }

    // Update gold prices
    updateGoldPrices() {
        // Simulate price fluctuations
        const fluctuation = (Math.random() - 0.5) * 20; // ±$10 fluctuation
        
        this.goldPrices.goldSpot += fluctuation;
        this.goldPrices.goldFutures += fluctuation * 0.8;
        this.goldPrices.silverSpot += (Math.random() - 0.5) * 0.5;
        
        this.goldPrices.lastUpdate = new Date().toISOString();
        this.saveGoldPrices();
    }

    // Utility functions
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    }

    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        
        if (diff < 24 * 60 * 60 * 1000) {
            return 'Today ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        } else if (diff < 2 * 24 * 60 * 60 * 1000) {
            return 'Yesterday ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        } else {
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }
    }

    showMessage(message, type = 'info') {
        // Create temporary message element
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 3000;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            animation: slideInRight 0.3s ease;
        `;

        if (type === 'success') {
            messageElement.style.backgroundColor = '#059669';
        } else if (type === 'error') {
            messageElement.style.backgroundColor = '#dc2626';
        } else {
            messageElement.style.backgroundColor = '#3b82f6';
        }

        document.body.appendChild(messageElement);

        setTimeout(() => {
            messageElement.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(messageElement);
            }, 300);
        }, 3000);
    }

    // Save functions
    savePortfolioData() {
        localStorage.setItem(`portfolio_${this.currentUser?.id}`, JSON.stringify(this.portfolioData));
    }

    saveTradingHistory() {
        localStorage.setItem(`trading_${this.currentUser?.id}`, JSON.stringify(this.tradingHistory));
    }

    saveGoldPrices() {
        localStorage.setItem('goldPrices', JSON.stringify(this.goldPrices));
    }

    // Show logout modal
    showLogoutModal() {
        const modal = document.getElementById('logoutModal');
        const userNameElement = document.getElementById('logoutUserName');
        const userAccountElement = document.getElementById('logoutUserAccount');
        
        if (modal && this.currentUser) {
            // Populate user info
            if (userNameElement) {
                userNameElement.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
            }
            if (userAccountElement) {
                userAccountElement.textContent = `Account: ${this.currentUser.accountNumber}`;
            }
            
            modal.style.display = 'block';
        }
    }

    // Hide logout modal
    hideLogoutModal() {
        const modal = document.getElementById('logoutModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Confirm logout
    confirmLogout() {
        // Clear session data
        localStorage.removeItem('aliasTrustSession');
        sessionStorage.removeItem('aliasTrustSession');
        
        // Hide modal
        this.hideLogoutModal();
        
        // Show logout message
        this.showMessage('Logout successful!', 'success');
        
        // Redirect to homepage after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// Global functions
function openTradeModal() {
    const modal = document.getElementById('tradeModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeTradeModal() {
    const modal = document.getElementById('tradeModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function exportPortfolio() {
    if (!window.dashboardSystem) return;
    
    const data = {
        user: window.dashboardSystem.currentUser,
        portfolio: window.dashboardSystem.portfolioData,
        tradingHistory: window.dashboardSystem.tradingHistory,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio_${window.dashboardSystem.currentUser?.accountNumber}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    window.dashboardSystem.showMessage('Portfolio exported successfully!', 'success');
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const tradeModal = document.getElementById('tradeModal');
    const logoutModal = document.getElementById('logoutModal');
    
    if (e.target === tradeModal) {
        closeTradeModal();
    }
    
    if (e.target === logoutModal) {
        closeLogoutModal();
    }
});

// Global logout modal functions
function closeLogoutModal() {
    if (window.dashboardSystem) {
        window.dashboardSystem.hideLogoutModal();
    }
}

function confirmLogout() {
    if (window.dashboardSystem) {
        window.dashboardSystem.confirmLogout();
    }
}

// Initialize dashboard system
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardSystem = new DashboardSystem();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style); 