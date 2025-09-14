/**
 * API related TypeScript interfaces and types
 * @author Peter Boden
 * @version 1.0
 */

// HTTP Method Types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// Request Configuration
export interface RequestConfig {
  readonly method?: HttpMethod
  readonly headers?: Record<string, string>
  readonly timeout?: number
  readonly retries?: number
  readonly body?: unknown
  readonly signal?: AbortSignal
}

// API Response Wrapper
export interface ApiResponseWrapper<TData = unknown> {
  readonly data: TData
  readonly success: true
  readonly timestamp: string
  readonly version?: string
}

export interface ApiErrorResponse {
  readonly error: {
    readonly message: string
    readonly code?: string
    readonly details?: Record<string, unknown>
  }
  readonly success: false
  readonly timestamp: string
}

export type ApiResult<TData = unknown> = ApiResponseWrapper<TData> | ApiErrorResponse

// Request/Response Interceptors
export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
export type ResponseInterceptor<T = unknown> = (response: T) => T | Promise<T>
export type ErrorInterceptor = (error: Error) => Error | Promise<Error>

// API Client Configuration
export interface ApiClientConfig {
  readonly baseURL: string
  readonly timeout: number
  readonly defaultHeaders: Record<string, string>
  readonly requestInterceptors: readonly RequestInterceptor[]
  readonly responseInterceptors: readonly ResponseInterceptor[]
  readonly errorInterceptors: readonly ErrorInterceptor[]
  readonly retryConfig: RetryConfig
}

// Retry Configuration
export interface RetryConfig {
  readonly maxRetries: number
  readonly retryDelay: number
  readonly exponentialBackoff: boolean
  readonly retryCondition: (error: Error) => boolean
}

// Endpoint Configuration
export interface EndpointConfig {
  readonly path: string
  readonly method: HttpMethod
  readonly timeout?: number
  readonly retries?: number
  readonly headers?: Record<string, string>
}

// Rate Limiting
export interface RateLimitConfig {
  readonly maxRequests: number
  readonly windowMs: number
  readonly skipSuccessfulRequests?: boolean
  readonly skipFailedRequests?: boolean
}

// Request Queue
export interface QueuedRequest {
  readonly id: string
  readonly config: RequestConfig
  readonly resolve: (value: unknown) => void
  readonly reject: (reason: unknown) => void
  readonly timestamp: number
  readonly priority: number
}

// Cache Configuration
export interface CacheConfig {
  readonly enabled: boolean
  readonly ttl: number
  readonly maxSize: number
  readonly keyGenerator: (config: RequestConfig) => string
  readonly shouldCache: (config: RequestConfig) => boolean
}

// Cached Response
export interface CachedResponse<TData = unknown> {
  readonly data: TData
  readonly timestamp: number
  readonly ttl: number
  readonly key: string
}

// API Metrics
export interface ApiMetrics {
  readonly totalRequests: number
  readonly successfulRequests: number
  readonly failedRequests: number
  readonly averageResponseTime: number
  readonly cacheHitRate: number
  readonly retryCount: number
}

// Request Context
export interface RequestContext {
  readonly requestId: string
  readonly startTime: number
  readonly endpoint: string
  readonly method: HttpMethod
  readonly userAgent?: string
  readonly correlationId?: string
}

// Response Metadata
export interface ResponseMetadata {
  readonly requestId: string
  readonly responseTime: number
  readonly fromCache: boolean
  readonly retryCount: number
  readonly rateLimit?: {
    readonly remaining: number
    readonly reset: number
    readonly limit: number
  }
}

// Error Types
export interface NetworkError extends Error {
  readonly name: 'NetworkError'
  readonly code: 'NETWORK_ERROR'
  readonly isNetworkError: true
}

export interface TimeoutError extends Error {
  readonly name: 'TimeoutError'
  readonly code: 'TIMEOUT_ERROR'
  readonly timeout: number
}

export interface RateLimitError extends Error {
  readonly name: 'RateLimitError'
  readonly code: 'RATE_LIMIT_EXCEEDED'
  readonly retryAfter: number
}

export interface ValidationError extends Error {
  readonly name: 'ValidationError'
  readonly code: 'VALIDATION_ERROR'
  readonly field?: string
  readonly value?: unknown
}

export type ApiErrorType = NetworkError | TimeoutError | RateLimitError | ValidationError

// Environment Configuration
export interface EnvironmentConfig {
  readonly name: 'development' | 'staging' | 'production'
  readonly apiBaseUrl: string
  readonly wsBaseUrl?: string
  readonly enableLogging: boolean
  readonly enableMetrics: boolean
  readonly enableCaching: boolean
}

// Feature Flags
export interface FeatureFlags {
  readonly enableNewChat: boolean
  readonly enableVectorSearch: boolean
  readonly enableRealTimeUpdates: boolean
  readonly enableAnalytics: boolean
  readonly enableExperiments: boolean
}

// API Service Interface
export interface ApiServiceInterface {
  readonly get: <TResponse = unknown>(url: string, config?: RequestConfig) => Promise<TResponse>
  readonly post: <TResponse = unknown, TData = unknown>(
    url: string,
    data?: TData,
    config?: RequestConfig
  ) => Promise<TResponse>
  readonly put: <TResponse = unknown, TData = unknown>(
    url: string,
    data?: TData,
    config?: RequestConfig
  ) => Promise<TResponse>
  readonly delete: <TResponse = unknown>(url: string, config?: RequestConfig) => Promise<TResponse>
  readonly patch: <TResponse = unknown, TData = unknown>(
    url: string,
    data?: TData,
    config?: RequestConfig
  ) => Promise<TResponse>
}

// Webhook Types
export interface WebhookPayload {
  readonly event: string
  readonly data: Record<string, unknown>
  readonly timestamp: string
  readonly signature?: string
}

export interface WebhookConfig {
  readonly url: string
  readonly secret?: string
  readonly events: readonly string[]
  readonly retries: number
}

// Upload Configuration
export interface UploadConfig {
  readonly maxSize: number
  readonly allowedTypes: readonly string[]
  readonly uploadUrl: string
  readonly onProgress?: (progress: number) => void
}

export interface UploadResponse {
  readonly fileId: string
  readonly url: string
  readonly filename: string
  readonly size: number
  readonly contentType: string
}

// Pagination
export interface PaginationParams {
  readonly page: number
  readonly limit: number
  readonly sort?: string
  readonly order?: 'asc' | 'desc'
}

export interface PaginatedResponse<TData = unknown> {
  readonly data: readonly TData[]
  readonly pagination: {
    readonly currentPage: number
    readonly totalPages: number
    readonly totalItems: number
    readonly itemsPerPage: number
    readonly hasNext: boolean
    readonly hasPrev: boolean
  }
}

// Search Parameters
export interface SearchParams {
  readonly query: string
  readonly filters?: Record<string, unknown>
  readonly facets?: readonly string[]
  readonly highlight?: boolean
}

export interface SearchResponse<TData = unknown> {
  readonly results: readonly TData[]
  readonly total: number
  readonly facets?: Record<string, unknown[]>
  readonly suggestions?: readonly string[]
  readonly queryTime: number
}