const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  chat: `${API_BASE_URL}/chat/`,
  documents: `${API_BASE_URL}/documents/`,
  search: `${API_BASE_URL}/search/`,
  health: `${API_BASE_URL}/health`,
  admin: {
    cacheStats: `${API_BASE_URL}/admin/cache/stats`,
    cacheClear: `${API_BASE_URL}/admin/cache/clear`,
    cacheCleanup: `${API_BASE_URL}/admin/cache/cleanup`,
    vectorCacheInfo: `${API_BASE_URL}/admin/vector-cache/info`
  }
};

export const getDefaultHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export class APIError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
  timeout = 30000
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: response.statusText };
      }
      
      throw new APIError(
        errorData.detail || `Error: ${response.status}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();
    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new APIError('Request timeout', 408);
    }
    
    if (error instanceof APIError) {
      throw error;
    }
    
    throw new APIError(
      error.message || 'Network error',
      0
    );
  }
}

export interface ChatRequest {
  query: string;
  conversation_id?: string;
  user_id?: string;
  additional_context?: string;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  retrieved_context: Array<{
    id: string;
    text: string;
    similarity: number;
  }>;
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  return apiFetch<ChatResponse>(API_ENDPOINTS.chat, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify(request),
  });
}

export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  return apiFetch(API_ENDPOINTS.health);
}

export async function getCacheStats(token: string) {
  return apiFetch(API_ENDPOINTS.admin.cacheStats, {
    headers: getDefaultHeaders(token),
  });
}

export async function clearCache(token: string) {
  return apiFetch(API_ENDPOINTS.admin.cacheClear, {
    method: 'POST',
    headers: getDefaultHeaders(token),
  });
}

export async function cleanupCache(token: string) {
  return apiFetch(API_ENDPOINTS.admin.cacheCleanup, {
    method: 'POST',
    headers: getDefaultHeaders(token),
  });
}

export async function getVectorCacheInfo(token: string) {
  return apiFetch(API_ENDPOINTS.admin.vectorCacheInfo, {
    headers: getDefaultHeaders(token),
  });
}