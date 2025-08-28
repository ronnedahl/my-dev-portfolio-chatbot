/**
 * Application Constants
 * Centralized configuration for the chat application
 * @author Peter Boden
 * @version 1.0
 */

export const API_CONFIG = {
    BASE_URL: {
        DEVELOPMENT: 'http://localhost:8000',
        PRODUCTION: 'https://api.peterbod.dev'
    },
    ENDPOINTS: {
        HEALTH: '/health',
        CHAT: '/chat/',
        CACHE_STATS: '/admin/cache/stats',
        VECTOR_CACHE: '/admin/vector-cache/info'
    },
    TIMEOUT: 30000, // 30 seconds
    MAX_RETRIES: 2
};

export const UI_CONFIG = {
    ANIMATION_DURATION: {
        FAST: 150,
        NORMAL: 300,
        SLOW: 500
    },
    MESSAGE_LIMITS: {
        MAX_LENGTH: 500,
        WARNING_THRESHOLD: 400
    },
    AUTO_SCROLL: {
        BEHAVIOR: 'smooth',
        DELAY: 100
    },
    TYPING_INDICATOR: {
        DOTS_COUNT: 3,
        ANIMATION_DURATION: 1400
    }
};

export const MESSAGE_TYPES = {
    USER: 'user',
    AI: 'ai',
    ERROR: 'error',
    SYSTEM: 'system'
};

export const CONNECTION_STATES = {
    CONNECTED: 'connected',
    CONNECTING: 'connecting',
    DISCONNECTED: 'disconnected',
    ERROR: 'error'
};

export const STORAGE_KEYS = {
    CONVERSATION_ID: 'chat_conversation_id',
    USER_PREFERENCES: 'chat_user_preferences',
    LAST_MESSAGE: 'chat_last_message'
};

export const ERROR_MESSAGES = {
    NETWORK: 'Kunde inte ansluta till servern. Kontrollera internetanslutningen.',
    SERVER: 'Ett serverfel inträffade. Försök igen senare.',
    TIMEOUT: 'Begäran tog för lång tid. Försök igen.',
    GENERIC: 'Ett oväntat fel inträffade. Försök igen.',
    EMPTY_MESSAGE: 'Skriv ett meddelande innan du skickar.',
    MESSAGE_TOO_LONG: 'Meddelandet är för långt. Maximalt 500 tecken.'
};

export const SUCCESS_MESSAGES = {
    CONNECTION_RESTORED: 'Anslutningen återställdes.',
    MESSAGE_SENT: 'Meddelande skickat.',
    CACHE_CLEARED: 'Cache rensad.'
};

export const ARIA_LABELS = {
    SEND_BUTTON: 'Skicka meddelande',
    CLOSE_ERROR: 'Stäng felmeddelande',
    MESSAGE_INPUT: 'Skriv ditt meddelande här',
    CHAT_CONTAINER: 'Chattkonversation',
    USER_AVATAR: 'Användare',
    AI_AVATAR: 'AI-assistent',
    ERROR_AVATAR: 'Fel'
};

export const CSS_CLASSES = {
    // State classes
    HIDDEN: 'u-hidden',
    LOADING: 'is-loading',
    ERROR: 'is-error',
    SUCCESS: 'is-success',
    DISABLED: 'is-disabled',
    
    // Component classes
    CHAT: 'chat',
    MESSAGE: 'message',
    INPUT: 'chat__input-field',
    BUTTON: 'chat__send-button',
    ERROR_BANNER: 'error-banner',
    TYPING: 'typing-indicator',
    
    // Modifier classes
    MESSAGE_USER: 'message--user',
    MESSAGE_AI: 'message--ai',
    MESSAGE_ERROR: 'message--error',
    ERROR_SHOW: 'error-banner--show',
    INPUT_WARNING: 'chat__input-field--warning',
    STATUS_DISCONNECTED: 'status-indicator--disconnected'
};