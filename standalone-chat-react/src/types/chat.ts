/**
 * Chat related TypeScript interfaces and types
 * @author Peter Boden
 * @version 1.0
 */

// Message Types
export type MessageType = 'user' | 'ai' | 'error' | 'system'
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error'

// Core Message Interface
export interface Message {
  readonly id: string
  readonly text: string
  readonly type: MessageType
  readonly timestamp: Date
  readonly metadata?: MessageMetadata
}

// Message Metadata
export interface MessageMetadata {
  readonly similarity?: number
  readonly retrievedContext?: RetrievedContext[]
  readonly processingTime?: number
  readonly tokens?: number
}

// Retrieved Context from Vector Search
export interface RetrievedContext {
  readonly id: string
  readonly text: string
  readonly similarity: number
  readonly metadata?: Record<string, unknown>
}

// Chat Request/Response Types
export interface ChatRequest {
  readonly query: string
  readonly conversationId: string
  readonly userId: string
  readonly additionalContext?: Record<string, unknown>
}

export interface ChatResponse {
  readonly response: string
  readonly conversationId: string
  readonly retrievedContext: RetrievedContext[]
  readonly metadata?: {
    readonly processingTime?: number
    readonly model?: string
    readonly tokens?: number
  }
}

// Error Types
export interface ApiError {
  readonly message: string
  readonly status?: number
  readonly code?: string
  readonly details?: Record<string, unknown>
}

export interface ChatError extends Error {
  readonly code?: string
  readonly status?: number
  readonly retryable?: boolean
}

// Chat State
export interface ChatState {
  readonly messages: readonly Message[]
  readonly isLoading: boolean
  readonly connectionStatus: ConnectionStatus
  readonly conversationId: string
  readonly error: string | null
  readonly messageCount: number
  readonly totalTokens?: number
}

// Chat Actions
export type ChatAction = 
  | { type: 'SEND_MESSAGE'; payload: { text: string } }
  | { type: 'RECEIVE_MESSAGE'; payload: { response: ChatResponse } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONNECTION_STATUS'; payload: ConnectionStatus }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'RETRY_LAST_MESSAGE' }

// Configuration Types
export interface ApiConfig {
  readonly baseUrl: string
  readonly timeout: number
  readonly maxRetries: number
  readonly endpoints: {
    readonly chat: string
    readonly health: string
    readonly cacheStats: string
    readonly vectorCache: string
  }
}

export interface UiConfig {
  readonly maxMessageLength: number
  readonly warningThreshold: number
  readonly animationDuration: {
    readonly fast: number
    readonly normal: number
    readonly slow: number
  }
  readonly autoScroll: {
    readonly behavior: ScrollBehavior
    readonly delay: number
  }
}

// Component Props Types
export interface ChatContainerProps {
  readonly className?: string
  readonly onError?: (error: ChatError) => void
  readonly onMessage?: (message: Message) => void
}

export interface MessageListProps {
  readonly messages: readonly Message[]
  readonly isLoading?: boolean
  readonly className?: string
}

export interface MessageProps {
  readonly message: Message
  readonly isLatest?: boolean
  readonly showTimestamp?: boolean
  readonly className?: string
}

export interface MessageInputProps {
  readonly onSendMessage: (text: string) => void
  readonly isLoading?: boolean
  readonly placeholder?: string
  readonly maxLength?: number
  readonly className?: string
  readonly disabled?: boolean
}

export interface StatusIndicatorProps {
  readonly status: ConnectionStatus
  readonly className?: string
  readonly showText?: boolean
}

export interface TypingIndicatorProps {
  readonly className?: string
  readonly dotCount?: number
}

export interface ErrorBannerProps {
  readonly error: string | null
  readonly onClose?: () => void
  readonly className?: string
  readonly autoHide?: boolean
  readonly duration?: number
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T]
export type OptionalKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? K : never }[keyof T]

// Generic API Response
export interface ApiResponse<TData = unknown> {
  readonly data?: TData
  readonly error?: ApiError
  readonly success: boolean
  readonly timestamp: string
}

// Health Check Response
export interface HealthCheckResponse {
  readonly status: 'healthy' | 'unhealthy'
  readonly version: string
  readonly uptime: number
  readonly timestamp: string
}

// Cache Statistics
export interface CacheStats {
  readonly hits: number
  readonly misses: number
  readonly hitRate: number
  readonly cacheSize: number
  readonly lastCleared?: string
}

export interface VectorCacheInfo {
  readonly cachedDocuments: number
  readonly cacheAgeSeconds: number
  readonly cacheTtlSeconds: number
  readonly cacheFresh: boolean
  readonly lastRefresh?: string
}

// Event Handler Types
export type MessageHandler = (message: Message) => void
export type ErrorHandler = (error: ChatError) => void
export type ConnectionHandler = (status: ConnectionStatus) => void
export type LoadingHandler = (loading: boolean) => void

// Storage Types
export interface ChatStorage {
  readonly conversationId?: string
  readonly lastMessage?: string
  readonly userPreferences?: UserPreferences
}

export interface UserPreferences {
  readonly theme?: 'light' | 'dark' | 'system'
  readonly animationsEnabled?: boolean
  readonly soundEnabled?: boolean
  readonly fontSize?: 'small' | 'medium' | 'large'
}

// Validation Types
export interface ValidationResult {
  readonly isValid: boolean
  readonly errors: readonly string[]
  readonly warnings?: readonly string[]
}

export interface MessageValidation extends ValidationResult {
  readonly length: number
  readonly wordCount: number
}

// Performance Monitoring Types
export interface PerformanceMetrics {
  readonly messagesSent: number
  readonly averageResponseTime: number
  readonly errorRate: number
  readonly cacheHitRate: number
  readonly totalSessions: number
}

// Accessibility Types
export interface A11yConfig {
  readonly announceMessages: boolean
  readonly highContrast: boolean
  readonly reducedMotion: boolean
  readonly screenReaderOptimized: boolean
}

// Export commonly used unions
export type ChatEventType = 'message' | 'error' | 'connection' | 'loading'
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
export type ThemeMode = 'light' | 'dark' | 'system'