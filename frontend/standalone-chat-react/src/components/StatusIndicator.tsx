/**
 * Connection status indicator component
 * @author Peter Boden
 * @version 1.0
 */

import React from 'react'
import { cn } from '../utils/cn'
import type { StatusIndicatorProps } from '../types'

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  className,
  showText = false,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          color: 'bg-green-500',
          text: 'Connected',
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ),
          animate: false,
        }
      case 'connecting':
        return {
          color: 'bg-yellow-500',
          text: 'Connecting...',
          icon: (
            <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          ),
          animate: true,
        }
      case 'disconnected':
        return {
          color: 'bg-slate-400',
          text: 'Disconnected',
          icon: (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728"
              />
            </svg>
          ),
          animate: false,
        }
      case 'error':
        return {
          color: 'bg-red-500',
          text: 'Connection Error',
          icon: (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          animate: false,
        }
      default:
        return {
          color: 'bg-slate-400',
          text: 'Unknown',
          icon: null,
          animate: false,
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div className={cn('status-indicator flex items-center space-x-2', className)}>
      <div className="relative">
        <div
          className={cn(
            'w-2 h-2 rounded-full',
            config.color,
            config.animate && 'animate-pulse'
          )}
        />
        {status === 'connected' && (
          <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75" />
        )}
      </div>
      
      {showText && (
        <span className={cn(
          'text-sm font-medium',
          status === 'connected' && 'text-green-700 dark:text-green-400',
          status === 'connecting' && 'text-yellow-700 dark:text-yellow-400',
          status === 'disconnected' && 'text-slate-600 dark:text-slate-400',
          status === 'error' && 'text-red-700 dark:text-red-400'
        )}>
          {config.text}
        </span>
      )}
      
      {config.icon && showText && (
        <div className={cn(
          'text-current opacity-75',
          status === 'connected' && 'text-green-600 dark:text-green-400',
          status === 'connecting' && 'text-yellow-600 dark:text-yellow-400',
          status === 'disconnected' && 'text-slate-500 dark:text-slate-400',
          status === 'error' && 'text-red-600 dark:text-red-400'
        )}>
          {config.icon}
        </div>
      )}
    </div>
  )
}