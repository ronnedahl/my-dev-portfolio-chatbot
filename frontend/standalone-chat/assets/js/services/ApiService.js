/**
 * API Service
 * Handles all API communications with the backend
 * @author Peter Boden  
 * @version 1.0
 */

import { API_CONFIG, ERROR_MESSAGES } from '../config/constants.js';
import { Logger } from '../utils/Logger.js';

export class ApiService {
    constructor() {
        this.baseUrl = this.getBaseUrl();
        this.logger = new Logger('ApiService');
        this.controller = null; // For request cancellation
    }

    /**
     * Get the appropriate base URL based on environment
     * @returns {string} Base URL
     */
    getBaseUrl() {
        const hostname = window.location.hostname;
        return hostname === 'localhost' || hostname === '127.0.0.1'
            ? API_CONFIG.BASE_URL.DEVELOPMENT
            : API_CONFIG.BASE_URL.PRODUCTION;
    }

    /**
     * Make HTTP request with error handling and timeout
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} Response data
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        // Cancel previous request if still pending
        if (this.controller) {
            this.controller.abort();
        }
        
        this.controller = new AbortController();
        
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            signal: this.controller.signal,
            ...options
        };

        this.logger.debug('Making request', { url, method: config.method });

        try {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), API_CONFIG.TIMEOUT);
            });

            const fetchPromise = fetch(url, config);
            const response = await Promise.race([fetchPromise, timeoutPromise]);

            if (!response.ok) {
                const errorData = await this.handleErrorResponse(response);
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.logger.debug('Request successful', { url, status: response.status });
            return data;

        } catch (error) {
            this.logger.error('Request failed', { url, error: error.message });
            throw this.handleRequestError(error);
        } finally {
            this.controller = null;
        }
    }

    /**
     * Handle error response from server
     * @param {Response} response - Fetch response
     * @returns {Promise<Object>} Error data
     */
    async handleErrorResponse(response) {
        try {
            return await response.json();
        } catch {
            return {
                message: `Server returned ${response.status}: ${response.statusText}`,
                status: response.status
            };
        }
    }

    /**
     * Handle request errors and map to user-friendly messages
     * @param {Error} error - Original error
     * @returns {Error} Processed error
     */
    handleRequestError(error) {
        if (error.name === 'AbortError') {
            return new Error('Request was cancelled');
        }
        
        if (error.message === 'TIMEOUT') {
            return new Error(ERROR_MESSAGES.TIMEOUT);
        }
        
        if (error.message.includes('fetch')) {
            return new Error(ERROR_MESSAGES.NETWORK);
        }
        
        if (error.message.includes('5')) { // 5xx errors
            return new Error(ERROR_MESSAGES.SERVER);
        }
        
        return new Error(error.message || ERROR_MESSAGES.GENERIC);
    }

    /**
     * Check API health status
     * @returns {Promise<Object>} Health status
     */
    async checkHealth() {
        return this.request(API_CONFIG.ENDPOINTS.HEALTH);
    }

    /**
     * Send chat message to API
     * @param {Object} messageData - Message data
     * @returns {Promise<Object>} Chat response
     */
    async sendMessage(messageData) {
        const { query, conversationId, userId } = messageData;
        
        if (!query || typeof query !== 'string' || !query.trim()) {
            throw new Error(ERROR_MESSAGES.EMPTY_MESSAGE);
        }

        if (query.length > 500) {
            throw new Error(ERROR_MESSAGES.MESSAGE_TOO_LONG);
        }

        return this.request(API_CONFIG.ENDPOINTS.CHAT, {
            method: 'POST',
            body: JSON.stringify({
                query: query.trim(),
                conversation_id: conversationId || 'web_chat_' + Date.now(),
                user_id: userId || 'web_user'
            })
        });
    }

    /**
     * Get cache statistics
     * @returns {Promise<Object>} Cache stats
     */
    async getCacheStats() {
        return this.request(API_CONFIG.ENDPOINTS.CACHE_STATS);
    }

    /**
     * Get vector cache information  
     * @returns {Promise<Object>} Vector cache info
     */
    async getVectorCacheInfo() {
        return this.request(API_CONFIG.ENDPOINTS.VECTOR_CACHE);
    }

    /**
     * Cancel ongoing request
     */
    cancelRequest() {
        if (this.controller) {
            this.controller.abort();
            this.controller = null;
            this.logger.debug('Request cancelled');
        }
    }

    /**
     * Get current base URL
     * @returns {string} Current base URL
     */
    getCurrentBaseUrl() {
        return this.baseUrl;
    }
}