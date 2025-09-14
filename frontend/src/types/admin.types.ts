export interface LoadSuccessResponse {
  message: string;
  source: string;
}

export interface ErrorResponse {
  error: string;
}

export interface StatusMessageType {
  text: string;
  type: 'info' | 'success' | 'error' | '';
}

export interface CacheStats {
  size: number;
  totalSize: number;
}

export interface CleanupResult {
  removed: number;
}