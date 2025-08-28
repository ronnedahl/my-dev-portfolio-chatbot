/**
 * Main Application Entry Point
 * Initializes the ChatApp when DOM is ready
 * @author Peter Boden
 * @version 1.0
 */

import { ChatApp } from './components/ChatApp.js';
import { Logger } from './utils/Logger.js';

class Application {
    constructor() {
        this.logger = new Logger('Application');
        this.chatApp = null;
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            this.logger.info('Starting PeterBot Chat Application');
            
            // Initialize chat app
            this.chatApp = new ChatApp();
            
            // Set up global error handling
            this.setupGlobalErrorHandling();
            
            // Set up performance monitoring
            this.setupPerformanceMonitoring();
            
            this.logger.success('Application started successfully');
            
        } catch (error) {
            this.logger.error('Failed to start application', { error: error.message });
            this.showFallbackError();
        }
    }

    /**
     * Set up global error handling
     */
    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            this.logger.error('Global error caught', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.logger.error('Unhandled promise rejection', {
                reason: event.reason
            });
        });
    }

    /**
     * Set up performance monitoring
     */
    setupPerformanceMonitoring() {
        if ('performance' in window && 'measure' in performance) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const navigation = performance.getEntriesByType('navigation')[0];
                    if (navigation) {
                        this.logger.info('Page load performance', {
                            loadTime: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
                            domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
                            totalLoadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart)
                        });
                    }
                }, 1000);
            });
        }
    }

    /**
     * Show fallback error when app fails to load
     */
    showFallbackError() {
        const errorHtml = `
            <div class="fallback-error">
                <h2>Kunde inte ladda chatten</h2>
                <p>Ett tekniskt fel inträffade. Försök ladda om sidan.</p>
                <button onclick="window.location.reload()">Ladda om</button>
            </div>
        `;
        
        document.body.innerHTML = errorHtml;
        document.body.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            text-align: center;
            padding: 20px;
        `;
    }

    /**
     * Clean up when page unloads
     */
    cleanup() {
        if (this.chatApp) {
            this.chatApp.destroy();
        }
        this.logger.info('Application cleaned up');
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const app = new Application();
    await app.init();
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        app.cleanup();
    });
});

// Export for potential external use
window.PeterBotApp = Application;