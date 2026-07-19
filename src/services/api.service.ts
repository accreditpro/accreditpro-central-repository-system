import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosError,
} from 'axios';
import { ApiResponse } from '@/types/auth.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const TOKEN_KEY = 'accreditpro-tokens';

/**
 * Custom event name dispatched when a non-auth API call receives a 401.
 * React components (AuthEventListener in App.tsx) listen for this and
 * handle the logout flow gracefully via React Router — no full page reload.
 */
export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized';

/**
 * Centralized HTTP client for the AccreditPro backend.
 *
 * Features:
 * - Automatic Bearer token injection from localStorage
 * - Automatic ApiResponse<T> unwrapping (returns `data` field directly)
 * - 401 handling: emits a global event so React can gracefully redirect
 *   via React Router (no destructive window.location.href reload).
 * - Request/response interceptor chain for cross-cutting concerns
 */
class ApiService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
    });

    // ── Request Interceptor: attach Bearer token, handle FormData ──
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // If data is FormData, remove Content-Type so the browser sets it
        // with the correct multipart boundary.
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
        }

        try {
          const tokensStr = localStorage.getItem(TOKEN_KEY);
          if (tokensStr) {
            const { accessToken } = JSON.parse(tokensStr);
            if (accessToken) {
              config.headers.Authorization = `Bearer ${accessToken}`;
            }
          }
        } catch {
          // Malformed token storage — silently ignore
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // ── Response Interceptor: handle 401 without destroying state ──
    // Previously this interceptor cleared localStorage and did a
    // window.location.href redirect — which caused a full page reload,
    // wiped Redux state, and resulted in the user being logged out.
    //
    // Now: for non-auth-me 401s, we emit a global DOM event. The React
    // layer (AuthEventListener in App.tsx) listens for this event and
    // handles logout + redirect gracefully via React Router.
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse<unknown>>) => {
        if (error.response?.status === 401) {
          const requestUrl = error.config?.url || '';
          // Skip ALL auth-related endpoints — /auth/me, /auth/login,
          // /auth/logout. Auth endpoints are handled by authService.ts
          // which manages session clearing and error propagation without
          // triggering the global unauthorized handler.
          //
          // Without this exclusion, the logout call (/auth/logout) returning
          // a 401 would re-fire this event, creating an infinite loop.
          const isAuthRequest = requestUrl.includes('/auth/');

          if (!isAuthRequest) {
            // Emit a global DOM event — the React layer picks this up
            // (AuthEventListener in App.tsx) and handles session
            // invalidation + redirect via React Router — no page reload.
            window.dispatchEvent(
              new CustomEvent(AUTH_UNAUTHORIZED_EVENT, {
                detail: { url: requestUrl },
              })
            );
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // ── Generic methods that unwrap ApiResponse<T> → T ──

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  /**
   * Raw request — returns the full Axios response including
   * the ApiResponse wrapper. Useful when you need the message/timestamp.
   */
  async raw<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  /**
   * Download a file as a blob. Uses the underlying axios instance so auth
   * tokens and interceptors (401 handling) are automatically applied.
   *
   * Attempts to extract the filename from Content-Disposition headers;
   * falls back to the provided `filename` param or a default name.
   */
  async download(url: string, filename?: string): Promise<void> {
    const response = await this.instance.get(url, { responseType: 'blob' });

    // Try to extract filename from Content-Disposition header
    const disposition = response.headers['content-disposition'];
    let name = filename;
    if (!name && disposition) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match) name = match[1].replace(/['"]/g, '');
    }

    const blob = response.data;
    const blobUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = name || 'download';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(blobUrl);
  }
}

export const apiService = new ApiService();