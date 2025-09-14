/**
 * Typing indicator component showing AI is processing
 * @author Peter Boden
 * @version 1.0
 */

import React from 'react'
import { cn } from '../utils/cn'
import type { TypingIndicatorProps } from '../types'

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  className,
  dotCount = 3,
}) => {
  return (
    <div className={cn('typing-indicator flex items-center space-x-1', className)}>
      {Array.from({ length: dotCount }, (_, index) => (
        <div
          key={index}
          className={cn(
            'w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-pulse',
            'typing-dot'
          )}
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: '1.4s',
          }}
        />
      ))}
    </div>
  )
}