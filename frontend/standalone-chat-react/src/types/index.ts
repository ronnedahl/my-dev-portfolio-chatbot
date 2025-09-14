/**
 * Central export point for all TypeScript types and interfaces
 * @author Peter Boden
 * @version 1.0
 */

// Re-export all chat types
export type {
  // Core types
  Message,
  MessageType,
  ConnectionStatus,
  MessageMetadata,
  RetrievedContext,
  
  // Request/Response types
  ChatRequest,
  ChatResponse,
  ApiError,
  ChatError,
  
  // State management
  ChatState,
  ChatAction,
  
  // Configuration types
  ApiConfig,
  UiConfig,
  
  // Component props
  ChatContainerProps,
  MessageListProps,
  MessageProps,
  MessageInputProps,
  StatusIndicatorProps,
  TypingIndicatorProps,
  ErrorBannerProps,
  
  // Utility types
  Optional,
  RequiredKeys,
  OptionalKeys,
  
  // API response types
  ApiResponse,
  HealthCheckResponse,
  CacheStats,
  VectorCacheInfo,
  
  // Event handlers
  MessageHandler,
  ErrorHandler,
  ConnectionHandler,
  LoadingHandler,
  
  // Storage types
  ChatStorage,
  UserPreferences,
  
  // Validation types
  ValidationResult,
  MessageValidation,
  
  // Performance types
  PerformanceMetrics,
  
  // Accessibility types
  A11yConfig,
  
  // Common unions
  ChatEventType,
  LogLevel,
  ThemeMode,
} from './chat'

// Re-export all API types
export type {
  // HTTP types
  HttpMethod,
  RequestConfig,
  
  // Response types
  ApiResponseWrapper,
  ApiErrorResponse,
  ApiResult,
  
  // Interceptor types
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
  
  // Configuration types
  ApiClientConfig,
  RetryConfig,
  EndpointConfig,
  RateLimitConfig,
  CacheConfig,
  
  // Request/Response metadata
  RequestContext,
  ResponseMetadata,
  CachedResponse,
  
  // Queue types
  QueuedRequest,
  
  // Metrics
  ApiMetrics,
  
  // Error types
  NetworkError,
  TimeoutError,
  RateLimitError,
  ValidationError,
  ApiErrorType,
  
  // Environment
  EnvironmentConfig,
  FeatureFlags,
  
  // Service interface
  ApiServiceInterface,
  
  // Webhook types
  WebhookPayload,
  WebhookConfig,
  
  // Upload types
  UploadConfig,
  UploadResponse,
  
  // Pagination
  PaginationParams,
  PaginatedResponse,
  
  // Search
  SearchParams,
  SearchResponse,
} from './api'

// Global type augmentations
declare global {
  interface Window {
    __PETERBOT_DEBUG__?: boolean
    __APP_VERSION__?: string
  }
  
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string
    readonly VITE_WS_BASE_URL?: string
    readonly VITE_ENABLE_ANALYTICS?: string
    readonly VITE_ENVIRONMENT: 'development' | 'staging' | 'production'
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

// Branded types for better type safety
export type Brand<T, B> = T & { readonly __brand: B }

export type UserId = Brand<string, 'UserId'>
export type ConversationId = Brand<string, 'ConversationId'>
export type MessageId = Brand<string, 'MessageId'>
export type Timestamp = Brand<number, 'Timestamp'>

// Utility type helpers
export type NonEmptyArray<T> = [T, ...T[]]
export type Primitive = string | number | boolean | null | undefined
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends Primitive
    ? T[P]
    : T[P] extends Array<infer U>
    ? ReadonlyArray<DeepReadonly<U>>
    : DeepReadonly<T[P]>
}

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>

// Event system types (forward declarations to avoid circular deps)
export interface EventMap {
  message: import('./chat').Message
  error: import('./chat').ChatError
  connectionChange: import('./chat').ConnectionStatus
  loadingChange: boolean
}

export type EventListener<T = unknown> = (event: T) => void
export type EventUnsubscribe = () => void

// Component ref types for better type safety
export interface ChatContainerRef {
  readonly scrollToBottom: () => void
  readonly clearMessages: () => void
  readonly sendMessage: (text: string) => Promise<void>
  readonly focus: () => void
}

export interface MessageInputRef {
  readonly focus: () => void
  readonly clear: () => void
  readonly setValue: (value: string) => void
  readonly getValue: () => string
}

// Context types
export interface ChatContextValue {
  readonly state: import('./chat').ChatState
  readonly actions: {
    readonly sendMessage: (text: string) => Promise<void>
    readonly clearMessages: () => void
    readonly setError: (error: string | null) => void
    readonly retry: () => Promise<void>
  }
}

// Hook return types
export interface UseChatReturn {
  readonly state: import('./chat').ChatState
  readonly sendMessage: (text: string) => Promise<void>
  readonly clearMessages: () => void
  readonly retry: () => Promise<void>
  readonly isOnline: boolean
}

export interface UseApiReturn<TData, TError = import('./chat').ApiError> {
  readonly data: TData | null
  readonly error: TError | null
  readonly loading: boolean
  readonly refetch: () => Promise<void>
}

// Form types
export interface ChatFormData {
  readonly message: string
}

export interface ContactFormData {
  readonly name: string
  readonly email: string
  readonly message: string
}

// Configuration presets
export interface ConfigPreset {
  readonly name: string
  readonly description: string
  readonly config: Partial<import('./chat').ApiConfig & import('./chat').UiConfig>
}

// Export commonly used constants as types
export const MESSAGE_TYPES = {
  USER: 'user',
  AI: 'ai', 
  ERROR: 'error',
  SYSTEM: 'system',
} as const

export const CONNECTION_STATES = {
  CONNECTED: 'connected',
  CONNECTING: 'connecting', 
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
} as const

export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const