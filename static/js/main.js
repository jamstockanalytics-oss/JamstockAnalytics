// JamStockAnalytics - Main JavaScript
// Optimized for minimal data usage and fast loading

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        animationDuration: 300,
        scrollOffset: 100,
        debounceDelay: 100
    };
    
    // Utility Functions
    const utils = {
        // Debounce function for performance
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        // Smooth scroll to element
        smoothScrollTo: function(element) {
            if (element) {
                const offsetTop = element.offsetTop - CONFIG.scrollOffset;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        },
        
        // Add loading animation
        addLoadingAnimation: function() {
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.5s ease-in-out';
            setTimeout(() => {
                document.body.style.opacity = '1';
            }, 100);
        },
        
        // Track analytics events
        trackEvent: function(eventName, data = {}) {
            console.log('Analytics Event:', eventName, data);
            // Add your analytics tracking code here
        }
    };
    
    // Navigation Handler
    const navigation = {
        init: function() {
            // Smooth scrolling for anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href').substring(1);
                    const target = document.getElementById(targetId);
                    if (target) {
                        utils.smoothScrollTo(target);
                        utils.trackEvent('navigation', { target: targetId });
                    }
                });
            });
        }
    };
    
    // Interactive Features
    const interactions = {
        init: function() {
            // Add hover effects to feature cards
            document.querySelectorAll('.feature-card').forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-10px) scale(1.02)';
                    this.style.transition = 'transform 0.3s ease';
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0) scale(1)';
                });
            });
            
            // Add click tracking for buttons
            document.querySelectorAll('.btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    utils.trackEvent('button_click', { 
                        text: this.textContent.trim(),
                        href: this.href || 'button'
                    });
                });
            });
        }
    };
    
    // Performance Optimizations
    const performance = {
        init: function() {
            // Lazy load images when they come into view
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            if (img.dataset.src) {
                                img.src = img.dataset.src;
                                img.removeAttribute('data-src');
                                imageObserver.unobserve(img);
                            }
                        }
                    });
                });
                
                document.querySelectorAll('img[data-src]').forEach(img => {
                    imageObserver.observe(img);
                });
            }
            
            // Preload critical resources
            this.preloadCriticalResources();
        },
        
        preloadCriticalResources: function() {
            // Preload critical CSS
            const criticalCSS = document.createElement('link');
            criticalCSS.rel = 'preload';
            criticalCSS.href = 'static/css/main.css';
            criticalCSS.as = 'style';
            document.head.appendChild(criticalCSS);
        }
    };
    
    // Error Handling
    const errorHandler = {
        init: function() {
            window.addEventListener('error', function(e) {
                console.error('JavaScript Error:', e.error);
                utils.trackEvent('javascript_error', {
                    message: e.error.message,
                    filename: e.filename,
                    lineno: e.lineno
                });
            });
            
            window.addEventListener('unhandledrejection', function(e) {
                console.error('Unhandled Promise Rejection:', e.reason);
                utils.trackEvent('promise_rejection', {
                    reason: e.reason
                });
            });
        }
    };
    
    // Accessibility Features
    const accessibility = {
        init: function() {
            // Add keyboard navigation support
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Tab') {
                    document.body.classList.add('keyboard-navigation');
                }
            });
            
            document.addEventListener('mousedown', function() {
                document.body.classList.remove('keyboard-navigation');
            });
            
            // Add focus indicators for better accessibility
            this.addFocusIndicators();
        },
        
        addFocusIndicators: function() {
            const style = document.createElement('style');
            style.textContent = `
                .keyboard-navigation *:focus {
                    outline: 2px solid #667eea;
                    outline-offset: 2px;
                }
            `;
            document.head.appendChild(style);
        }
    };
    
    // Progressive Enhancement
    const progressiveEnhancement = {
        init: function() {
            // Check for modern browser features
            if ('serviceWorker' in navigator) {
                this.registerServiceWorker();
            }
            
            if ('IntersectionObserver' in window) {
                this.addScrollAnimations();
            }
        },
        
        registerServiceWorker: function() {
            // Service worker registration would go here
            console.log('Service Worker support detected');
        },
        
        addScrollAnimations: function() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in');
                    }
                });
            }, { threshold: 0.1 });
            
            document.querySelectorAll('.feature-card, .stats').forEach(el => {
                observer.observe(el);
            });
        }
    };
    
    // Initialize everything when DOM is ready
    function init() {
        // Core functionality
        navigation.init();
        interactions.init();
        performance.init();
        errorHandler.init();
        accessibility.init();
        progressiveEnhancement.init();
        
        // Add loading animation
        utils.addLoadingAnimation();
        
        // Track page load
        utils.trackEvent('page_load', {
            url: window.location.href,
            timestamp: Date.now()
        });
        
        console.log('JamStockAnalytics initialized successfully');
    }
    
    // Start the application
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Expose utilities globally for debugging
    window.JamStockAnalytics = {
        utils: utils,
        config: CONFIG
    };
    
})();
