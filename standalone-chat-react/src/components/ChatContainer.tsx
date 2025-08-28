/**
 * Main chat container component
 * @author Peter Boden
 * @version 1.0
 */

import React from 'react'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { ErrorBanner } from './ErrorBanner'
import { StatusIndicator } from './StatusIndicator'
import { useChat } from '../hooks/useChat'
import { cn } from '../utils/cn'
import type { ChatContainerProps, ChatContainerRef } from '../types'

export const ChatContainer = React.forwardRef<ChatContainerRef, ChatContainerProps>(
  ({ className, onError, onMessage }, ref) => {
    const { state, sendMessage, clearMessages, isOnline } = useChat({
      onError: onError || undefined,
      onMessage: onMessage || undefined,
    })

    const messagesEndRef = React.useRef<HTMLDivElement>(null)

    const scrollToBottom = React.useCallback(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      })
    }, [])

    // Auto-scroll to bottom when new messages arrive
    React.useEffect(() => {
      if (state.messages.length > 0) {
        const timer = setTimeout(scrollToBottom, 100)
        return () => clearTimeout(timer)
      }
    }, [state.messages.length, scrollToBottom])

    // Expose methods via ref
    React.useImperativeHandle(ref, () => ({
      scrollToBottom,
      clearMessages,
      sendMessage,
      focus: () => {
        // Focus will be handled by MessageInput ref
      },
    }), [scrollToBottom, clearMessages, sendMessage])

    const handleSendMessage = React.useCallback(async (text: string) => {
      try {
        await sendMessage(text)
      } catch (error) {
        console.error('Failed to send message:', error)
      }
    }, [sendMessage])

    const handleClearMessages = React.useCallback(() => {
      if (window.confirm('Are you sure you want to clear all messages?')) {
        clearMessages()
      }
    }, [clearMessages])

    return (
      <div className={cn(
        'chat-container flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden',
        className
      )}>
        {/* Header with status and actions */}
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
          <div className="flex items-center space-x-3">
            <StatusIndicator 
              status={state.connectionStatus}
              showText
              className="text-sm"
            />
            {state.messageCount > 0 && (
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {state.messageCount} message{state.messageCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {state.messages.length > 0 && (
              <button
                onClick={handleClearMessages}
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-700"
                title="Clear messages"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Error banner */}
        <ErrorBanner
          error={state.error}
          onClose={() => {/* Handle error close */}}
          autoHide
          duration={5000}
        />

        {/* Messages area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <MessageList
            messages={state.messages}
            isLoading={state.isLoading}
            className="flex-1 overflow-y-auto"
          />
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="border-t border-slate-200 dark:border-slate-600">
          <MessageInput
            onSendMessage={handleSendMessage}
            isLoading={state.isLoading}
            disabled={!isOnline || state.connectionStatus === 'error'}
            placeholder={
              !isOnline 
                ? 'Waiting for connection...'
                : state.connectionStatus === 'error'
                ? 'Connection error - please try again'
                : 'Type your message...'
            }
            className="border-0 bg-transparent"
          />
        </div>
      </div>
    )
  }
)

ChatContainer.displayName = 'ChatContainer'