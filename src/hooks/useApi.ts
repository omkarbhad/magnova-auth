import { useState, useEffect, useCallback } from 'react';
import axios, { type AxiosResponse, type AxiosError } from 'axios';
import type { ApiResponse, ApiError, ApiHeaders } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export interface UseApiOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  headers?: ApiHeaders;
}

export interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  execute: (params?: Record<string, unknown>) => Promise<T>;
  reset: () => void;
}

export function useApi<T = unknown>(
  url: string,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(async (params?: Record<string, unknown>): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const response: AxiosResponse<ApiResponse<T>> = await axios.get(
        `${API_BASE_URL}${url}`,
        {
          params,
          headers: options.headers as unknown as Record<string, string>,
        }
      );

      const result = response.data.data;
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const apiError: ApiError = {
        message: (err as AxiosError).message || 'An error occurred',
        status: (err as AxiosError).response?.status || 500,
        code: (err as AxiosError).code,
      };
      setError(apiError);
      options.onError?.(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, [execute, options.immediate]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

export async function apiRequest<T>(
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: unknown;
    headers?: ApiHeaders;
    params?: Record<string, unknown>;
  } = {}
): Promise<T> {
  const { method = 'GET', data, headers, params } = options;

  try {
    const response: AxiosResponse<ApiResponse<T>> = await axios.request({
      method,
      url: `${API_BASE_URL}${url}`,
      data,
      headers: headers as unknown as Record<string, string>,
      params,
    });

    return response.data.data;
  } catch (err) {
    const apiError: ApiError = {
      message: (err as AxiosError).message || 'An error occurred',
      status: (err as AxiosError).response?.status || 500,
      code: (err as AxiosError).code,
      details: (err as AxiosError).response?.data,
    };
    throw apiError;
  }
}
