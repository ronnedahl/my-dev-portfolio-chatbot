/**
 * Main chat hook for managing chat state and API communication
 * @author Peter Boden
 * @version 1.0
 */

import React from 'react'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { ApiService } from '../services/ApiService'
import type {
  ChatState,
  Message,
  MessageType,
  ChatResponse,
  ChatError,
  UseChatReturn,
  ConnectionStatus,
} from '../types'

interface ChatStore extends ChatState {
  // Actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setConnectionStatus: (status: ConnectionStatus) => void
  clearMessages: () => void
  updateMessage: (id: string, updates: Partial<Message>) => void
}

// Zustand store for chat state
const useChatStore = create<ChatStore>()(
  subscribeWithSelector((set) => ({
    // Initial state
    messages: [],
    isLoading: false,
    connectionStatus: 'disconnected',
    conversationId: crypto.randomUUID(),
    error: null,
    messageCount: 0,
    totalTokens: 0,

    // Actions
    addMessage: (messageData) => {
      const message: Message = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        ...messageData,
      }
      
      set((state) => ({
        messages: [...state.messages, message],
        messageCount: state.messageCount + 1,
        totalTokens: (state.totalTokens || 0) + (message.metadata?.tokens || 0),
      }))
    },

    setLoading: (loading) => set({ isLoading: loading }),
    
    setError: (error) => set({ error }),
    
    setConnectionStatus: (status) => set({ connectionStatus: status }),
    
    clearMessages: () => set({ 
      messages: [], 
      messageCount: 0, 
      totalTokens: 0,
      error: null,
    }),
    
    updateMessage: (id, updates) => set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    })),
  }))
)

interface UseChatOptions {
  onError?: (error: ChatError) => void
  onMessage?: (message: Message) => void
}

export const useChat = (options: UseChatOptions = {}): UseChatReturn => {
  const {
    messages,
    isLoading,
    connectionStatus,
    conversationId,
    error,
    messageCount,
    addMessage,
    setLoading,
    setError,
    setConnectionStatus,
    clearMessages,
  } = useChatStore()

  const apiService = React.useMemo(() => new ApiService(), [])
  const [isOnline, setIsOnline] = React.useState(navigator.onLine)

  // Monitor online/offline status
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Check connection status on mount and periodically
  React.useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus('connecting')
        const isHealthy = await apiService.healthCheck()
        setConnectionStatus(isHealthy ? 'connected' : 'error')
      } catch {
        setConnectionStatus('error')
      }
    }

    checkConnection()
    const interval = setInterval(checkConnection, 30000) // Check every 30s

    return () => clearInterval(interval)
  }, [setConnectionStatus])

  // Send message function
  const sendMessage = React.useCallback(async (text: string) => {
    if (!text.trim()) return

    // Add user message immediately
    addMessage({
      text: text.trim(),
      type: 'user' as MessageType,
    })

    setLoading(true)
    setError(null)

    try {
      // Send to API
      const response: ChatResponse = await apiService.sendMessage({
        query: text.trim(),
        conversationId,
        userId: 'anonymous', // Could be made configurable
      })

      // Add AI response
      addMessage({
        text: response.response,
        type: 'ai' as MessageType,
        metadata: {
          retrievedContext: response.retrievedContext,
          processingTime: response.metadata?.processingTime,
          tokens: response.metadata?.tokens,
        },
      })

      // Call onMessage callback if provided
      if (options.onMessage) {
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          text: response.response,
          type: 'ai',
          timestamp: new Date(),
          metadata: {
            retrievedContext: response.retrievedContext,
            processingTime: response.metadata?.processingTime,
            tokens: response.metadata?.tokens,
          },
        }
        options.onMessage(aiMessage)
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message'
      
      // Add error message
      addMessage({
        text: `Error: ${errorMessage}`,
        type: 'error' as MessageType,
      })

      setError(errorMessage)
      
      // Call onError callback if provided
      if (options.onError) {
        const chatError: ChatError = {
          name: 'ChatError',
          message: errorMessage,
          code: 'SEND_MESSAGE_FAILED',
          retryable: true,
        }
        options.onError(chatError)
      }

      throw error
    } finally {
      setLoading(false)
    }
  }, [conversationId, addMessage, setLoading, setError, apiService, options])

  // Retry last message
  const retry = React.useCallback(async () => {
    const lastUserMessage = [...messages]
      .reverse()
      .find((msg) => msg.type === 'user')

    if (lastUserMessage) {
      await sendMessage(lastUserMessage.text)
    }
  }, [messages, sendMessage])

  // Subscribe to message changes for callbacks
  React.useEffect(() => {
    const unsubscribe = useChatStore.subscribe(
      (state) => state.messages,
      (messages, previousMessages) => {
        // Find new messages
        const newMessages = messages.slice(previousMessages.length)
        newMessages.forEach((message) => {
          if (options.onMessage) {
            options.onMessage(message)
          }
        })
      }
    )

    return unsubscribe
  }, [options])

  return {
    state: {
      messages,
      isLoading,
      connectionStatus,
      conversationId,
      error,
      messageCount,
    },
    sendMessage,
    clearMessages,
    retry,
    isOnline,
  }
}