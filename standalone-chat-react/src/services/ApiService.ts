/**
 * API service for chat communication
 * @author Peter Boden
 * @version 1.0
 */

import type {
  ChatRequest,
  ChatResponse,
  HealthCheckResponse,
  ApiServiceInterface,
  RequestConfig,
  ApiError,
  CacheStats,
  VectorCacheInfo,
} from '../types'

export class ApiService implements ApiServiceInterface {
  private readonly baseURL: string
  private readonly timeout: number
  private readonly defaultHeaders: Record<string, string>

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    this.timeout = 30000 // 30 seconds
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }

  // Health check endpoint
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get<HealthCheckResponse>('/health')
      return response.status === 'healthy'
    } catch {
      return false
    }
  }

  // Send chat message
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.post<ChatResponse, ChatRequest>('/chat', request)
  }

  // Get cache statistics
  async getCacheStats(): Promise<CacheStats> {
    return this.get<CacheStats>('/cache-stats')
  }

  // Get vector cache info
  async getVectorCacheInfo(): Promise<VectorCacheInfo> {
    return this.get<VectorCacheInfo>('/vector-cache-info')
  }

  // Clear caches
  async clearCaches(): Promise<void> {
    await this.post('/clear-caches', {})
  }

  // Generic HTTP methods
  async get<TResponse = unknown>(
    url: string,
    config?: RequestConfig
  ): Promise<TResponse> {
    return this.request<TResponse>('GET', url, undefined, config)
  }

  async post<TResponse = unknown, TData = unknown>(
    url: string,
    data?: TData,
    config?: RequestConfig
  ): Promise<TResponse> {
    return this.request<TResponse>('POST', url, data, config)
  }

  async put<TResponse = unknown, TData = unknown>(
    url: string,
    data?: TData,
    config?: RequestConfig
  ): Promise<TResponse> {
    return this.request<TResponse>('PUT', url, data, config)
  }

  async delete<TResponse = unknown>(
    url: string,
    config?: RequestConfig
  ): Promise<TResponse> {
    return this.request<TResponse>('DELETE', url, undefined, config)
  }

  async patch<TResponse = unknown, TData = unknown>(
    url: string,
    data?: TData,
    config?: RequestConfig
  ): Promise<TResponse> {
    return this.request<TResponse>('PATCH', url, data, config)
  }

  // Core request method
  private async request<TResponse>(
    method: string,
    url: string,
    data?: unknown,
    config: RequestConfig = {}
  ): Promise<TResponse> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`
    
    const requestConfig: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...config.headers,
      },
      signal: config.signal || AbortSignal.timeout(config.timeout || this.timeout),
    }

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestConfig.body = JSON.stringify(data)
    }

    try {
      const response = await fetch(fullUrl, requestConfig)

      if (!response.ok) {
        await this.handleErrorResponse(response)
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        return {} as TResponse
      }

      const responseData = await response.json()
      return responseData as TResponse

    } catch (error) {
      if (error instanceof Error) {
        throw this.createApiError(error.message, { originalError: error })
      }
      throw this.createApiError('Unknown error occurred')
    }
  }

  // Handle error responses
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`
    let errorDetails: Record<string, unknown> = {}

    try {
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const errorData = await response.json()
        errorMessage = errorData.error?.message || errorData.message || errorMessage
        errorDetails = errorData.error?.details || errorData.details || {}
      }
    } catch {
      // Ignore JSON parsing errors for error responses
    }

    throw this.createApiError(errorMessage, {
      status: response.status,
      statusText: response.statusText,
      ...errorDetails,
    })
  }

  // Create standardized API error
  private createApiError(message: string, details: Record<string, unknown> = {}): ApiError {
    return {
      message,
      status: details['status'] as number,
      code: details['code'] as string,
      details,
    }
  }

  // Utility method to create abort controller for requests
  createAbortController(timeoutMs?: number): AbortController {
    const controller = new AbortController()
    
    if (timeoutMs) {
      setTimeout(() => {
        controller.abort('Request timeout')
      }, timeoutMs)
    }

    return controller
  }

  // Check if error is retryable
  isRetryableError(error: ApiError): boolean {
    // Network errors and 5xx server errors are generally retryable
    return (
      !error.status || // Network error
      error.status >= 500 || // Server error
      error.status === 429 // Rate limit (should retry with delay)
    )
  }

  // Get API base URL (useful for debugging)
  getBaseURL(): string {
    return this.baseURL
  }
}