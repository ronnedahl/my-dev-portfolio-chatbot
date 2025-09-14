/**
 * Error banner component for displaying errors
 * @author Peter Boden
 * @version 1.0
 */

import React from 'react'
import { cn } from '../utils/cn'
import type { ErrorBannerProps } from '../types'

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  error,
  onClose,
  className,
  autoHide = false,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    if (error) {
      setIsVisible(true)

      if (autoHide && duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false)
          onClose?.()
        }, duration)

        return () => clearTimeout(timer)
      }
    } else {
      setIsVisible(false)
    }
  }, [error, autoHide, duration, onClose])

  const handleClose = React.useCallback(() => {
    setIsVisible(false)
    onClose?.()
  }, [onClose])

  const handleRetry = React.useCallback(() => {
    // This could trigger a retry mechanism if provided
    handleClose()
  }, [handleClose])

  if (!error || !isVisible) {
    return null
  }

  return (
    <div
      className={cn(
        'error-banner bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4',
        'animate-in slide-in-from-top-2 duration-300',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          
          <div className="flex-1">
            <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
              Connection Error
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {error}
            </p>
            
            <div className="mt-3 flex space-x-3">
              <button
                onClick={handleRetry}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 dark:text-red-200 bg-red-100 dark:bg-red-800/50 hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-slate-800 transition-colors"
              >
                <svg
                  className="w-3 h-3 mr-1"
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
                Try Again
              </button>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-md text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-slate-800 transition-colors"
          aria-label="Dismiss error"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Auto-hide progress bar */}
      {autoHide && duration > 0 && (
        <div className="mt-3 w-full bg-red-200 dark:bg-red-800 rounded-full h-1 overflow-hidden">
          <div
            className="h-1 bg-red-600 dark:bg-red-400 rounded-full animate-progress"
            style={{
              animation: `progress-bar ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  )
}