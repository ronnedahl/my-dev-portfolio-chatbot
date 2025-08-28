/**
 * Message Formatter Utility
 * Handles message formatting, sanitization and rendering
 * @author Peter Boden
 * @version 1.0
 */

export class MessageFormatter {
    constructor() {
        this.patterns = {
            bold: /\*\*(.*?)\*\*/g,
            italic: /\*(.*?)\*/g,
            code: /`(.*?)`/g,
            lineBreaks: /\n/g,
            urls: /(https?:\/\/[^\s]+)/g
        };
    }

    /**
     * Format message content with markdown-like formatting
     * @param {string} content - Raw message content
     * @param {Object} options - Formatting options
     * @returns {string} Formatted HTML content
     */
    format(content, options = {}) {
        if (!content || typeof content !== 'string') {
            return '';
        }

        const {
            allowHtml = false,
            allowLinks = false,
            maxLength = null
        } = options;

        let formatted = content;

        // Sanitize HTML if not allowed
        if (!allowHtml) {
            formatted = this.escapeHtml(formatted);
        }

        // Truncate if max length specified
        if (maxLength && formatted.length > maxLength) {
            formatted = formatted.substring(0, maxLength) + '...';
        }

        // Apply formatting patterns
        formatted = this.applyFormatting(formatted, allowLinks);

        return formatted;
    }

    /**
     * Escape HTML characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Apply formatting patterns to text
     * @param {string} text - Text to format
     * @param {boolean} allowLinks - Whether to format links
     * @returns {string} Formatted text
     */
    applyFormatting(text, allowLinks = false) {
        // Convert line breaks to <br>
        text = text.replace(this.patterns.lineBreaks, '<br>');

        // Bold text: **text** -> <strong>text</strong>
        text = text.replace(this.patterns.bold, '<strong>$1</strong>');

        // Italic text: *text* -> <em>text</em> (but not already processed bold)
        text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');

        // Inline code: `code` -> <code>code</code>
        text = text.replace(this.patterns.code, '<code>$1</code>');

        // Links (if allowed)
        if (allowLinks) {
            text = text.replace(this.patterns.urls, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        }

        return text;
    }

    /**
     * Strip all formatting from text
     * @param {string} text - Formatted text
     * @returns {string} Plain text
     */
    stripFormatting(text) {
        if (!text) return '';
        
        // Remove HTML tags
        return text.replace(/<[^>]*>/g, '')
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&amp;/g, '&')
                  .replace(/&quot;/g, '"')
                  .replace(/&#39;/g, "'");
    }

    /**
     * Get plain text length (without formatting)
     * @param {string} text - Text with potential formatting
     * @returns {number} Plain text length
     */
    getPlainTextLength(text) {
        return this.stripFormatting(text).length;
    }

    /**
     * Validate message content
     * @param {string} content - Message content
     * @param {Object} constraints - Validation constraints
     * @returns {Object} Validation result
     */
    validate(content, constraints = {}) {
        const {
            minLength = 0,
            maxLength = 500,
            required = false
        } = constraints;

        const errors = [];
        const plainText = this.stripFormatting(content || '').trim();

        if (required && !plainText) {
            errors.push('Message cannot be empty');
        }

        if (plainText.length < minLength) {
            errors.push(`Message must be at least ${minLength} characters`);
        }

        if (plainText.length > maxLength) {
            errors.push(`Message cannot exceed ${maxLength} characters`);
        }

        return {
            isValid: errors.length === 0,
            errors,
            length: plainText.length
        };
    }

    /**
     * Format timestamp for display
     * @param {Date|string|number} timestamp - Timestamp to format
     * @param {Object} options - Formatting options
     * @returns {string} Formatted timestamp
     */
    formatTimestamp(timestamp, options = {}) {
        const {
            format = 'time', // 'time', 'date', 'datetime', 'relative'
            locale = 'sv-SE'
        } = options;

        const date = new Date(timestamp);
        
        if (isNaN(date.getTime())) {
            return '';
        }

        switch (format) {
            case 'time':
                return date.toLocaleTimeString(locale, {
                    hour: '2-digit',
                    minute: '2-digit'
                });

            case 'date':
                return date.toLocaleDateString(locale);

            case 'datetime':
                return date.toLocaleString(locale);

            case 'relative':
                return this.getRelativeTimeString(date);

            default:
                return date.toLocaleString(locale);
        }
    }

    /**
     * Get relative time string (e.g., "2 minutes ago")
     * @param {Date} date - Date to format
     * @returns {string} Relative time string
     */
    getRelativeTimeString(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMinutes < 1) {
            return 'just now';
        } else if (diffMinutes === 1) {
            return '1 minut sedan';
        } else if (diffMinutes < 60) {
            return `${diffMinutes} minuter sedan`;
        } else if (diffHours === 1) {
            return '1 timme sedan';
        } else if (diffHours < 24) {
            return `${diffHours} timmar sedan`;
        } else if (diffDays === 1) {
            return '1 dag sedan';
        } else {
            return `${diffDays} dagar sedan`;
        }
    }
}