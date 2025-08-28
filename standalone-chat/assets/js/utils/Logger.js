/**
 * Logger Utility
 * Centralized logging with different levels and formatting
 * @author Peter Boden
 * @version 1.0
 */

export class Logger {
    constructor(context = 'App') {
        this.context = context;
        this.isDevelopment = this.isDevelopmentMode();
    }

    /**
     * Check if we're in development mode
     * @returns {boolean}
     */
    isDevelopmentMode() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.search.includes('debug=true');
    }

    /**
     * Format log message with timestamp and context
     * @param {string} level - Log level
     * @param {string} message - Log message
     * @param {Object} data - Additional data
     * @returns {Array} Formatted log arguments
     */
    formatMessage(level, message, data) {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const prefix = `[${timestamp}] ${this.context}:`;
        
        if (data && Object.keys(data).length > 0) {
            return [`%c${prefix} ${message}`, `color: ${this.getLevelColor(level)}`, data];
        }
        
        return [`%c${prefix} ${message}`, `color: ${this.getLevelColor(level)}`];
    }

    /**
     * Get color for log level
     * @param {string} level - Log level
     * @returns {string} CSS color
     */
    getLevelColor(level) {
        const colors = {
            debug: '#6B7280',
            info: '#3B82F6',
            warn: '#F59E0B',
            error: '#EF4444',
            success: '#10B981'
        };
        return colors[level] || colors.info;
    }

    /**
     * Debug level logging (only in development)
     * @param {string} message - Log message
     * @param {Object} data - Additional data
     */
    debug(message, data) {
        if (this.isDevelopment) {
            console.debug(...this.formatMessage('debug', message, data));
        }
    }

    /**
     * Info level logging
     * @param {string} message - Log message
     * @param {Object} data - Additional data
     */
    info(message, data) {
        if (this.isDevelopment) {
            console.info(...this.formatMessage('info', message, data));
        }
    }

    /**
     * Warning level logging
     * @param {string} message - Log message
     * @param {Object} data - Additional data
     */
    warn(message, data) {
        console.warn(...this.formatMessage('warn', message, data));
    }

    /**
     * Error level logging
     * @param {string} message - Log message
     * @param {Object} data - Additional data
     */
    error(message, data) {
        console.error(...this.formatMessage('error', message, data));
    }

    /**
     * Success level logging
     * @param {string} message - Log message
     * @param {Object} data - Additional data
     */
    success(message, data) {
        if (this.isDevelopment) {
            console.log(...this.formatMessage('success', message, data));
        }
    }

    /**
     * Group logging - start a collapsible group
     * @param {string} title - Group title
     */
    group(title) {
        if (this.isDevelopment) {
            console.group(`${this.context}: ${title}`);
        }
    }

    /**
     * End logging group
     */
    groupEnd() {
        if (this.isDevelopment) {
            console.groupEnd();
        }
    }

    /**
     * Time a function execution
     * @param {string} label - Timer label
     * @param {Function} fn - Function to time
     * @returns {Promise|any} Function result
     */
    async time(label, fn) {
        if (this.isDevelopment) {
            console.time(`${this.context}: ${label}`);
        }
        
        try {
            const result = await fn();
            return result;
        } finally {
            if (this.isDevelopment) {
                console.timeEnd(`${this.context}: ${label}`);
            }
        }
    }

    /**
     * Log performance metrics
     * @param {string} operation - Operation name
     * @param {number} startTime - Start timestamp
     * @param {Object} metadata - Additional metadata
     */
    performance(operation, startTime, metadata = {}) {
        if (this.isDevelopment) {
            const duration = Date.now() - startTime;
            this.info(`Performance: ${operation} took ${duration}ms`, {
                duration,
                operation,
                ...metadata
            });
        }
    }
}