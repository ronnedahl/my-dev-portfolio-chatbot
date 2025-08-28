/**
 * Message input component with send functionality
 * @author Peter Boden
 * @version 1.0
 */

import React from 'react'
import { cn } from '../utils/cn'
import type { MessageInputProps, MessageInputRef } from '../types'

export const MessageInput = React.forwardRef<MessageInputRef, MessageInputProps>(
  ({
    onSendMessage,
    isLoading = false,
    placeholder = 'Type your message...',
    maxLength = 1000,
    className,
    disabled = false,
  }, ref) => {
    const [message, setMessage] = React.useState('')
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    // Expose methods via ref
    React.useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
      clear: () => setMessage(''),
      setValue: (value: string) => setMessage(value),
      getValue: () => message,
    }), [message])

    // Auto-resize textarea
    const adjustTextareaHeight = React.useCallback(() => {
      const textarea = textareaRef.current
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
      }
    }, [])

    React.useEffect(() => {
      adjustTextareaHeight()
    }, [message, adjustTextareaHeight])

    const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
      e.preventDefault()
      
      const trimmedMessage = message.trim()
      if (!trimmedMessage || isLoading || disabled) {
        return
      }

      setMessage('')
      
      try {
        await onSendMessage(trimmedMessage)
      } catch (error) {
        // Re-set message on error so user can retry
        setMessage(trimmedMessage)
        console.error('Failed to send message:', error)
      }
    }, [message, onSendMessage, isLoading, disabled])

    const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit(e)
      }
    }, [handleSubmit])

    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      if (value.length <= maxLength) {
        setMessage(value)
      }
    }, [maxLength])

    const isNearLimit = message.length > maxLength * 0.9
    const charactersRemaining = maxLength - message.length

    return (
      <form onSubmit={handleSubmit} className={cn('message-input', className)}>
        <div className="flex items-end space-x-3 p-4">
          {/* Text input area */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              rows={1}
              className={cn(
                'w-full px-4 py-3 pr-12 border border-slate-300 dark:border-slate-600 rounded-2xl',
                'bg-white dark:bg-slate-700 text-slate-900 dark:text-white',
                'placeholder-slate-500 dark:placeholder-slate-400',
                'resize-none scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors duration-200'
              )}
              style={{ minHeight: '52px' }}
            />
            
            {/* Character count */}
            {isNearLimit && (
              <div className={cn(
                'absolute -top-6 right-2 text-xs',
                charactersRemaining < 50 ? 'text-red-500' : 'text-amber-500'
              )}>
                {charactersRemaining} chars left
              </div>
            )}

            {/* Send button (overlay) */}
            <button
              type="submit"
              disabled={!message.trim() || isLoading || disabled}
              className={cn(
                'absolute bottom-2 right-2 p-2 rounded-xl transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-700',
                message.trim() && !isLoading && !disabled
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                  : 'bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              )}
              title={
                !message.trim() 
                  ? 'Enter a message to send' 
                  : disabled 
                  ? 'Chat is disabled'
                  : isLoading
                  ? 'Sending...'
                  : 'Send message (Enter)'
              }
            >
              {isLoading ? (
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Helper text */}
        <div className="px-4 pb-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Press Enter to send, Shift+Enter for new line
            {maxLength && ` • ${message.length}/${maxLength} characters`}
          </p>
        </div>
      </form>
    )
  }
)

MessageInput.displayName = 'MessageInput'