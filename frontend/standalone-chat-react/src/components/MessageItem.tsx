/**
 * Individual message item component
 * @author Peter Boden
 * @version 1.0
 */

import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '../utils/cn'
import type { MessageProps } from '../types'

export const MessageItem: React.FC<MessageProps> = ({
  message,
  showTimestamp = true,
  className,
}) => {
  const isUser = message.type === 'user'
  const isError = message.type === 'error'
  const isSystem = message.type === 'system'

  // Format message text with basic markdown support
  const formatMessageText = (text: string) => {
    // Simple markdown processing for code blocks
    if (text.includes('```')) {
      const parts = text.split(/(```[\s\S]*?```)/g)
      return parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const code = part.slice(3, -3).trim()
          const [lang, ...codeLines] = code.split('\n')
          const codeContent = codeLines.join('\n')
          
          return (
            <pre key={index} className="my-3 p-3 bg-slate-900 dark:bg-slate-950 rounded-lg overflow-x-auto">
              {lang && (
                <div className="text-xs text-slate-400 mb-2 font-medium uppercase">
                  {lang}
                </div>
              )}
              <code className="text-sm text-slate-100 font-mono">
                {codeContent}
              </code>
            </pre>
          )
        }
        
        // Handle inline code
        return part.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-sm font-mono">$1</code>')
      })
    }

    // Handle inline code without code blocks
    return text.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-sm font-mono">$1</code>')
  }

  const getMessageIcon = () => {
    if (isError) {
      return (
        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      )
    }

    if (isSystem) {
      return (
        <div className="w-8 h-8 bg-slate-500 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      )
    }

    if (isUser) {
      return (
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      )
    }

    return (
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
          />
        </svg>
      </div>
    )
  }

  const getMessageBubbleClass = () => {
    const baseClasses = 'rounded-2xl px-4 py-3 max-w-[80%] break-words'
    
    if (isUser) {
      return cn(
        baseClasses,
        'bg-blue-600 text-white rounded-br-sm ml-auto'
      )
    }
    
    if (isError) {
      return cn(
        baseClasses,
        'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800 rounded-tl-sm'
      )
    }

    if (isSystem) {
      return cn(
        baseClasses,
        'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-tl-sm'
      )
    }

    return cn(
      baseClasses,
      'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-sm'
    )
  }

  const getContainerClass = () => {
    return cn(
      'message-item flex items-start space-x-3',
      isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row',
      className
    )
  }

  return (
    <div className={getContainerClass()}>
      {getMessageIcon()}
      
      <div className="flex-1 min-w-0">
        <div className={getMessageBubbleClass()}>
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }}
          />
          
          {/* Message metadata */}
          {message.metadata && (
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600 text-xs opacity-75">
              {message.metadata.processingTime && (
                <div>Processing time: {message.metadata.processingTime}ms</div>
              )}
              {message.metadata.tokens && (
                <div>Tokens: {message.metadata.tokens}</div>
              )}
              {message.metadata.similarity && (
                <div>Similarity: {(message.metadata.similarity * 100).toFixed(1)}%</div>
              )}
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        {showTimestamp && (
          <div className={cn(
            'text-xs text-slate-500 dark:text-slate-400 mt-1',
            isUser ? 'text-right' : 'text-left'
          )}>
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </div>
        )}
      </div>
    </div>
  )
}