/**
 * Main App component for PeterBot AI Chat
 * @author Peter Boden
 * @version 1.0
 */

import React from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ChatContainer } from './components/ChatContainer'
import { Header } from './components/Header'
import type { ChatError } from './types'

const App: React.FC = () => {
  const handleError = React.useCallback((error: ChatError) => {
    console.error('Chat error:', error)
  }, [])

  return (
    <ErrorBoundary>
      <div className="app min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <ChatContainer 
            className="w-full max-w-4xl h-[600px] shadow-xl rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
            onError={handleError}
          />
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default App