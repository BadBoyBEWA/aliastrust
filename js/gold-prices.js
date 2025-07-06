// Gold Prices Management System
class GoldPricesSystem {
    constructor() {
        this.prices = this.loadPrices();
        this.updateInterval = null;
        this.initializePrices();
        this.startLiveUpdates();
    }

    // Load initial prices
    loadPrices() {
        const savedPrices = localStorage.getItem('goldPricesData');
        if (savedPrices) {
            return JSON.parse(savedPrices);
        }
        
        // Default prices
        return {
            goldSpot: 2450.50,
            goldFutures: 2452.75,
            silverSpot: 28.45,
            platinumSpot: 1050.00,
            palladiumSpot: 1250.00,
            lastUpdate: new Date().toISOString(),
            changes: {
                goldSpot: { value: 12.30, percentage: 0.50 },
                goldFutures: { value: 8.45, percentage: 0.35 },
                silverSpot: { value: -0.15, percentage: -0.52 },
                platinumSpot: { value: 5.20, percentage: 0.50 },
                palladiumSpot: { value: -8.75, percentage: -0.70 }
            }
        };
    }

    // Initialize prices display
    initializePrices() {
        this.updatePriceDisplay();
        this.updateChangeDisplay();
    }

    // Update price display
    updatePriceDisplay() {
        const elements = {
            'gold-spot': this.prices.goldSpot,
            'gold-futures': this.prices.goldFutures,
            'silver-spot': this.prices.silverSpot,
            'goldSpotPrice': this.prices.goldSpot,
            'goldFuturesPrice': this.prices.goldFutures,
            'silverSpotPrice': this.prices.silverSpot
        };

        Object.entries(elements).forEach(([id, price]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = this.formatCurrency(price);
            }
        });
    }

    // Update change display
    updateChangeDisplay() {
        const elements = {
            'gold-change': this.prices.changes.goldSpot,
            'futures-change': this.prices.changes.goldFutures,
            'silver-change': this.prices.changes.silverSpot,
            'goldSpotChange': this.prices.changes.goldSpot,
            'goldFuturesChange': this.prices.changes.goldFutures,
            'silverSpotChange': this.prices.changes.silverSpot
        };

        Object.entries(elements).forEach(([id, change]) => {
            const element = document.getElementById(id);
            if (element) {
                const sign = change.value >= 0 ? '+' : '';
                const color = change.value >= 0 ? 'positive' : 'negative';
                element.textContent = `${sign}${this.formatCurrency(change.value)} (${sign}${change.percentage.toFixed(2)}%)`;
                element.className = `change ${color}`;
            }
        });
    }

    // Start live price updates
    startLiveUpdates() {
        this.updateInterval = setInterval(() => {
            this.simulatePriceMovement();
            this.updatePriceDisplay();
            this.updateChangeDisplay();
            this.savePrices();
        }, 30000); // Update every 30 seconds
    }

    // Simulate price movement
    simulatePriceMovement() {
        const volatility = 0.002; // 0.2% volatility
        
        // Update gold spot price
        const goldSpotChange = (Math.random() - 0.5) * this.prices.goldSpot * volatility;
        this.prices.goldSpot += goldSpotChange;
        
        // Update gold futures (slightly correlated with spot)
        const goldFuturesChange = goldSpotChange * (0.8 + Math.random() * 0.4);
        this.prices.goldFutures += goldFuturesChange;
        
        // Update silver price
        const silverChange = (Math.random() - 0.5) * this.prices.silverSpot * volatility * 2;
        this.prices.silverSpot += silverChange;
        
        // Update platinum price
        const platinumChange = (Math.random() - 0.5) * this.prices.platinumSpot * volatility;
        this.prices.platinumSpot += platinumChange;
        
        // Update palladium price
        const palladiumChange = (Math.random() - 0.5) * this.prices.palladiumSpot * volatility * 1.5;
        this.prices.palladiumSpot += palladiumChange;
        
        // Update changes
        this.prices.changes.goldSpot = {
            value: goldSpotChange,
            percentage: (goldSpotChange / (this.prices.goldSpot - goldSpotChange)) * 100
        };
        
        this.prices.changes.goldFutures = {
            value: goldFuturesChange,
            percentage: (goldFuturesChange / (this.prices.goldFutures - goldFuturesChange)) * 100
        };
        
        this.prices.changes.silverSpot = {
            value: silverChange,
            percentage: (silverChange / (this.prices.silverSpot - silverChange)) * 100
        };
        
        this.prices.changes.platinumSpot = {
            value: platinumChange,
            percentage: (platinumChange / (this.prices.platinumSpot - platinumChange)) * 100
        };
        
        this.prices.changes.palladiumSpot = {
            value: palladiumChange,
            percentage: (palladiumChange / (this.prices.palladiumSpot - palladiumChange)) * 100
        };
        
        this.prices.lastUpdate = new Date().toISOString();
        
        // Add visual feedback for price changes
        this.addPriceChangeEffect();
    }

    // Add visual feedback for price changes
    addPriceChangeEffect() {
        const priceElements = [
            'gold-spot', 'gold-futures', 'silver-spot',
            'goldSpotPrice', 'goldFuturesPrice', 'silverSpotPrice'
        ];
        
        priceElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.transition = 'all 0.3s ease';
                element.style.transform = 'scale(1.05)';
                element.style.color = '#f59e0b';
                
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                    element.style.color = '';
                }, 300);
            }
        });
    }

    // Get current gold price
    getCurrentGoldPrice() {
        return this.prices.goldSpot;
    }

    // Get price history (simulated)
    getPriceHistory(days = 30) {
        const history = [];
        const basePrice = this.prices.goldSpot;
        
        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            // Simulate realistic price movement
            const volatility = 0.015; // 1.5% daily volatility
            const trend = Math.sin(i * 0.1) * 0.01; // Slight trend
            const random = (Math.random() - 0.5) * volatility;
            
            const price = basePrice * (1 + trend + random);
            
            history.push({
                date: date.toISOString().split('T')[0],
                price: price,
                volume: Math.random() * 1000000 + 500000 // Random volume
            });
        }
        
        return history;
    }

    // Calculate price statistics
    getPriceStats() {
        const history = this.getPriceHistory(30);
        const prices = history.map(h => h.price);
        
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
        const change = prices[prices.length - 1] - prices[0];
        const changePercent = (change / prices[0]) * 100;
        
        return {
            current: this.prices.goldSpot,
            min: min,
            max: max,
            average: avg,
            change: change,
            changePercent: changePercent,
            volatility: this.calculateVolatility(prices)
        };
    }

    // Calculate volatility
    calculateVolatility(prices) {
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push((prices[i] - prices[i-1]) / prices[i-1]);
        }
        
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
        
        return Math.sqrt(variance) * Math.sqrt(252) * 100; // Annualized volatility
    }

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    }

    // Save prices to localStorage
    savePrices() {
        localStorage.setItem('goldPricesData', JSON.stringify(this.prices));
    }

    // Stop live updates
    stopLiveUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    // Get market sentiment (simulated)
    getMarketSentiment() {
        const stats = this.getPriceStats();
        const volatility = stats.volatility;
        const change = stats.changePercent;
        
        if (change > 2 && volatility < 15) {
            return { sentiment: 'bullish', confidence: 'high' };
        } else if (change > 0 && volatility < 20) {
            return { sentiment: 'bullish', confidence: 'medium' };
        } else if (change < -2 && volatility < 15) {
            return { sentiment: 'bearish', confidence: 'high' };
        } else if (change < 0 && volatility < 20) {
            return { sentiment: 'bearish', confidence: 'medium' };
        } else {
            return { sentiment: 'neutral', confidence: 'low' };
        }
    }

    // Get trading recommendations (simulated)
    getTradingRecommendations() {
        const sentiment = this.getMarketSentiment();
        const stats = this.getPriceStats();
        
        let recommendation = '';
        let confidence = '';
        
        if (sentiment.sentiment === 'bullish') {
            if (stats.current < stats.average) {
                recommendation = 'BUY';
                confidence = 'Strong buy signal - price below average with bullish sentiment';
            } else {
                recommendation = 'HOLD';
                confidence = 'Price above average but sentiment remains bullish';
            }
        } else if (sentiment.sentiment === 'bearish') {
            if (stats.current > stats.average) {
                recommendation = 'SELL';
                confidence = 'Strong sell signal - price above average with bearish sentiment';
            } else {
                recommendation = 'HOLD';
                confidence = 'Price below average but sentiment remains bearish';
            }
        } else {
            recommendation = 'HOLD';
            confidence = 'Neutral market conditions - wait for clearer signals';
        }
        
        return {
            recommendation: recommendation,
            confidence: confidence,
            sentiment: sentiment.sentiment,
            currentPrice: stats.current,
            averagePrice: stats.average,
            volatility: stats.volatility
        };
    }
}

// Initialize gold prices system
let goldPricesSystem;

document.addEventListener('DOMContentLoaded', () => {
    goldPricesSystem = new GoldPricesSystem();
    
    // Add price update indicators
    addPriceUpdateIndicators();
});

// Add price update indicators
function addPriceUpdateIndicators() {
    const priceElements = document.querySelectorAll('.price, .ticker-price');
    
    priceElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.style.cursor = 'pointer';
            element.title = 'Click to refresh prices';
        });
        
        element.addEventListener('click', () => {
            if (goldPricesSystem) {
                goldPricesSystem.simulatePriceMovement();
                goldPricesSystem.updatePriceDisplay();
                goldPricesSystem.updateChangeDisplay();
                
                // Add refresh animation
                element.style.transform = 'rotate(360deg)';
                element.style.transition = 'transform 0.5s ease';
                
                setTimeout(() => {
                    element.style.transform = 'rotate(0deg)';
                }, 500);
            }
        });
    });
}

// Export functions for global use
window.getCurrentGoldPrice = () => goldPricesSystem?.getCurrentGoldPrice();
window.getPriceHistory = (days) => goldPricesSystem?.getPriceHistory(days);
window.getPriceStats = () => goldPricesSystem?.getPriceStats();
window.getMarketSentiment = () => goldPricesSystem?.getMarketSentiment();
window.getTradingRecommendations = () => goldPricesSystem?.getTradingRecommendations(); 