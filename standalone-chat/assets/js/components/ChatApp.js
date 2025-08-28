/**
 * Chat Application Main Component
 * Orchestrates all chat functionality with clean separation of concerns
 * @author Peter Boden
 * @version 1.0
 */

import { ApiService } from '../services/ApiService.js';
import { MessageFormatter } from '../utils/MessageFormatter.js';
import { Logger } from '../utils/Logger.js';
import { 
    UI_CONFIG, 
    MESSAGE_TYPES, 
    CONNECTION_STATES, 
    CSS_CLASSES, 
    STORAGE_KEYS,
    ERROR_MESSAGES,
    ARIA_LABELS
} from '../config/constants.js';

export class ChatApp {
    constructor() {
        this.logger = new Logger('ChatApp');
        this.apiService = new ApiService();
        this.messageFormatter = new MessageFormatter();
        
        // Application state
        this.state = {
            isLoading: false,
            connectionState: CONNECTION_STATES.DISCONNECTED,
            conversationId: this.generateConversationId(),
            messageCount: 0
        };

        // DOM elements cache
        this.elements = {};
        
        // Event handlers bound to this instance
        this.boundHandlers = {
            handleSendMessage: this.handleSendMessage.bind(this),
            handleInputKeyPress: this.handleInputKeyPress.bind(this),
            handleInputChange: this.handleInputChange.bind(this),
            handleCloseError: this.handleCloseError.bind(this)
        };

        this.initialize();
    }

    /**
     * Initialize the chat application
     */
    async initialize() {
        try {
            this.logger.info('Initializing ChatApp');
            
            this.cacheElements();
            this.setupEventListeners();
            this.setupInitialState();
            
            await this.checkConnection();
            
            this.logger.success('ChatApp initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize ChatApp', { error: error.message });
            this.showError('Kunde inte starta chatten. Försök ladda om sidan.');
        }
    }

    /**
     * Cache DOM elements for performance
     */
    cacheElements() {
        const elements = {
            messagesContainer: 'chat-messages',
            messageInput: 'message-input',
            sendButton: 'send-button',
            errorBanner: 'error-banner',
            statusIndicator: 'status-indicator'
        };

        for (const [key, id] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (!element) {
                throw new Error(`Required element not found: ${id}`);
            }
            this.elements[key] = element;
        }

        this.logger.debug('DOM elements cached', { count: Object.keys(this.elements).length });
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        this.elements.sendButton.addEventListener('click', this.boundHandlers.handleSendMessage);
        this.elements.messageInput.addEventListener('keypress', this.boundHandlers.handleInputKeyPress);
        this.elements.messageInput.addEventListener('input', this.boundHandlers.handleInputChange);
        
        // Error banner close button (if added later)
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-close-error]')) {
                this.boundHandlers.handleCloseError(e);
            }
        });

        // Handle visibility change for connection management
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkConnection();
            }
        });

        this.logger.debug('Event listeners set up');
    }

    /**
     * Set up initial application state
     */
    setupInitialState() {
        this.elements.messageInput.placeholder = 'Skriv ditt meddelande här...';
        this.elements.messageInput.setAttribute('aria-label', ARIA_LABELS.MESSAGE_INPUT);
        this.elements.sendButton.setAttribute('aria-label', ARIA_LABELS.SEND_BUTTON);
        this.elements.messagesContainer.setAttribute('aria-label', ARIA_LABELS.CHAT_CONTAINER);
        
        // Focus input for better UX
        this.elements.messageInput.focus();
        
        this.logger.debug('Initial state configured');
    }

    /**
     * Generate unique conversation ID
     * @returns {string} Conversation ID
     */
    generateConversationId() {
        const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATION_ID);
        if (stored) {
            return stored;
        }

        const id = 'web_chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem(STORAGE_KEYS.CONVERSATION_ID, id);
        return id;
    }

    /**
     * Check API connection
     */
    async checkConnection() {
        this.updateConnectionState(CONNECTION_STATES.CONNECTING);
        
        try {
            await this.apiService.checkHealth();
            this.updateConnectionState(CONNECTION_STATES.CONNECTED);
            this.hideError();
        } catch (error) {
            this.updateConnectionState(CONNECTION_STATES.ERROR);
            this.logger.warn('Connection check failed', { error: error.message });
            this.showError('Anslutning till API misslyckades. Kontrollera att servern körs.');
        }
    }

    /**
     * Update connection state and UI
     * @param {string} state - New connection state
     */
    updateConnectionState(state) {
        this.state.connectionState = state;
        
        const indicator = this.elements.statusIndicator;
        indicator.className = 'status-indicator';
        
        if (state === CONNECTION_STATES.DISCONNECTED || state === CONNECTION_STATES.ERROR) {
            indicator.classList.add(CSS_CLASSES.STATUS_DISCONNECTED);
        }

        this.logger.debug('Connection state updated', { state });
    }

    /**
     * Handle send message action
     */
    async handleSendMessage(event) {
        event?.preventDefault();
        
        const message = this.elements.messageInput.value.trim();
        if (!message || this.state.isLoading) {
            return;
        }

        // Validate message
        const validation = this.messageFormatter.validate(message, {
            required: true,
            maxLength: UI_CONFIG.MESSAGE_LIMITS.MAX_LENGTH
        });

        if (!validation.isValid) {
            this.showError(validation.errors[0]);
            return;
        }

        await this.sendMessage(message);
    }

    /**
     * Handle input keypress events
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleInputKeyPress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.handleSendMessage();
        }
    }

    /**
     * Handle input change events (for character count, etc.)
     * @param {Event} event - Input event
     */
    handleInputChange(event) {
        const length = event.target.value.length;
        const input = this.elements.messageInput;
        
        // Add warning class if approaching limit
        if (length > UI_CONFIG.MESSAGE_LIMITS.WARNING_THRESHOLD) {
            input.classList.add(CSS_CLASSES.INPUT_WARNING);
        } else {
            input.classList.remove(CSS_CLASSES.INPUT_WARNING);
        }
        
        // Update character count display (if implemented)
        this.updateCharacterCount(length);
    }

    /**
     * Handle error banner close
     */
    handleCloseError() {
        this.hideError();
    }

    /**
     * Send message to API
     * @param {string} message - Message text
     */
    async sendMessage(message) {
        const startTime = Date.now();
        
        try {
            // Add user message to UI immediately
            this.addMessage(message, MESSAGE_TYPES.USER);
            this.clearInput();
            this.setLoading(true);
            this.showTypingIndicator();

            // Send to API
            const response = await this.apiService.sendMessage({
                query: message,
                conversationId: this.state.conversationId,
                userId: 'web_user'
            });

            // Handle response
            this.hideTypingIndicator();
            
            if (response.response) {
                this.addMessage(response.response, MESSAGE_TYPES.AI);
                this.state.messageCount++;
                this.hideError();
                
                this.logger.performance('Send message', startTime, {
                    messageLength: message.length,
                    responseLength: response.response.length,
                    messageCount: this.state.messageCount
                });
            } else {
                throw new Error('Received empty response from server');
            }

        } catch (error) {
            this.hideTypingIndicator();
            this.logger.error('Failed to send message', { error: error.message, message });
            
            this.addMessage(
                error.message || ERROR_MESSAGES.GENERIC,
                MESSAGE_TYPES.ERROR
            );
            
            this.showError('Problem med att skicka meddelande');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Add message to chat display
     * @param {string} content - Message content
     * @param {string} type - Message type
     * @param {Object} options - Additional options
     */
    addMessage(content, type, options = {}) {
        const { timestamp = new Date() } = options;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `${CSS_CLASSES.MESSAGE} message--${type}`;
        messageDiv.setAttribute('role', 'log');
        messageDiv.setAttribute('aria-live', 'polite');
        
        const avatarText = this.getAvatarText(type);
        const formattedContent = this.messageFormatter.format(content, {
            allowLinks: type === MESSAGE_TYPES.AI
        });
        
        messageDiv.innerHTML = `
            <div class="message__avatar" aria-label="${this.getAvatarLabel(type)}">${avatarText}</div>
            <div class="message__content">
                ${formattedContent}
                ${options.showTimestamp ? `<div class="message__timestamp">${this.messageFormatter.formatTimestamp(timestamp)}</div>` : ''}
            </div>
        `;
        
        this.elements.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        this.logger.debug('Message added', { type, length: content.length });
    }

    /**
     * Get avatar text for message type
     * @param {string} type - Message type
     * @returns {string} Avatar text
     */
    getAvatarText(type) {
        const avatars = {
            [MESSAGE_TYPES.USER]: 'Du',
            [MESSAGE_TYPES.AI]: 'P',
            [MESSAGE_TYPES.ERROR]: '!',
            [MESSAGE_TYPES.SYSTEM]: 'S'
        };
        return avatars[type] || 'P';
    }

    /**
     * Get avatar label for accessibility
     * @param {string} type - Message type
     * @returns {string} Avatar label
     */
    getAvatarLabel(type) {
        const labels = {
            [MESSAGE_TYPES.USER]: ARIA_LABELS.USER_AVATAR,
            [MESSAGE_TYPES.AI]: ARIA_LABELS.AI_AVATAR,
            [MESSAGE_TYPES.ERROR]: ARIA_LABELS.ERROR_AVATAR,
            [MESSAGE_TYPES.SYSTEM]: 'System'
        };
        return labels[type] || ARIA_LABELS.AI_AVATAR;
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = `${CSS_CLASSES.MESSAGE} message--ai ${CSS_CLASSES.TYPING}`;
        typingDiv.id = 'typing-indicator';
        typingDiv.setAttribute('aria-label', 'AI är skriver...');
        
        typingDiv.innerHTML = `
            <div class="message__avatar">${this.getAvatarText(MESSAGE_TYPES.AI)}</div>
            <div class="message__content">
                <div class="typing-indicator__dots" aria-hidden="true">
                    <div class="typing-indicator__dot"></div>
                    <div class="typing-indicator__dot"></div>
                    <div class="typing-indicator__dot"></div>
                </div>
                <span class="u-sr-only">AI skriver ett svar</span>
            </div>
        `;
        
        this.elements.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    /**
     * Set loading state
     * @param {boolean} loading - Loading state
     */
    setLoading(loading) {
        this.state.isLoading = loading;
        this.elements.sendButton.disabled = loading;
        this.elements.messageInput.disabled = loading;
        
        if (loading) {
            this.elements.messageInput.placeholder = 'Skickar meddelande...';
        } else {
            this.elements.messageInput.placeholder = 'Skriv ditt meddelande här...';
            this.elements.messageInput.focus();
        }

        this.logger.debug('Loading state changed', { loading });
    }

    /**
     * Clear input field
     */
    clearInput() {
        this.elements.messageInput.value = '';
        this.elements.messageInput.classList.remove(CSS_CLASSES.INPUT_WARNING);
        this.updateCharacterCount(0);
    }

    /**
     * Update character count display
     * @param {number} count - Current character count
     */
    updateCharacterCount(count) {
        // Implementation for character counter if needed
        // This could update a counter element in the UI
        this.logger.debug('Character count updated', { count });
    }

    /**
     * Scroll messages to bottom
     */
    scrollToBottom() {
        setTimeout(() => {
            this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
        }, UI_CONFIG.AUTO_SCROLL.DELAY);
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        this.elements.errorBanner.textContent = message;
        this.elements.errorBanner.classList.add(CSS_CLASSES.ERROR_SHOW);
        this.elements.errorBanner.setAttribute('role', 'alert');
        this.elements.errorBanner.setAttribute('aria-live', 'assertive');

        // Auto-hide after 5 seconds for non-critical errors
        if (!message.includes('API') && !message.includes('server')) {
            setTimeout(() => {
                this.hideError();
            }, 5000);
        }

        this.logger.warn('Error shown to user', { message });
    }

    /**
     * Hide error message
     */
    hideError() {
        this.elements.errorBanner.classList.remove(CSS_CLASSES.ERROR_SHOW);
        this.elements.errorBanner.removeAttribute('role');
        this.elements.errorBanner.removeAttribute('aria-live');
    }

    /**
     * Cleanup resources and event listeners
     */
    destroy() {
        this.logger.info('Destroying ChatApp');
        
        // Cancel any pending API requests
        this.apiService.cancelRequest();
        
        // Remove event listeners
        Object.values(this.boundHandlers).forEach((handler, index) => {
            // This would need more specific cleanup based on implementation
        });
        
        // Clear storage if needed
        // localStorage.removeItem(STORAGE_KEYS.CONVERSATION_ID);
        
        this.logger.info('ChatApp destroyed');
    }
}