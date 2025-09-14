/**
 * Message list component for displaying chat messages
 * @author Peter Boden
 * @version 1.0
 */

import React from 'react'
import { MessageItem } from './MessageItem'
import { TypingIndicator } from './TypingIndicator'
import { cn } from '../utils/cn'
import type { MessageListProps } from '../types'

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading = false,
  className,
}) => {
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Empty state
  if (messages.length === 0 && !isLoading) {
    return (
      <div className={cn(
        'message-list flex flex-col items-center justify-center text-center p-8',
        className
      )}>
        <div className="max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Welcome to PeterBot AI
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Start a conversation by typing a message below. I can help you with programming questions,
            provide information about my technical skills, or just have a friendly chat.
          </p>
          <div className="text-sm text-slate-500 dark:text-slate-400 space-y-2">
            <p>💡 <strong>Try asking:</strong></p>
            <ul className="text-left space-y-1 mt-2">
              <li>• "What are your technical skills?"</li>
              <li>• "What is your tech stack?"</li>
              <li>• "Tell me about your experience"</li>
              <li>• "Help me with React development"</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      className={cn(
        'message-list flex-1 overflow-y-auto scroll-smooth',
        className
      )}
    >
      <div className="p-4 space-y-4">
        {messages.map((message, index) => (
          <MessageItem
            key={message.id}
            message={message}
            isLatest={index === messages.length - 1}
            showTimestamp={true}
          />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
                <TypingIndicator />
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-1">
                PeterBot is thinking...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}