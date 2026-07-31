import {
  LoginCredentials,
  LoginResponse,
  LoginResponseData,
  AuthTokens,
  User,
  ApiResponse,
} from '@/types/auth.types';
import { apiService } from './api.service';
import axios from 'axios';

const TOKEN_KEY = 'accreditpro-tokens';
const USER_KEY = 'accreditpro-user';

/**
 * Typed error for auth operations.
 * `reason` distinguishes between token expiry and network failures
 * so callers can handle them differently.
 */
export class AuthError extends Error {
  reason: 'EXPIRED' | 'NETWORK';
  constructor(message: string, reason: 'EXPIRED' | 'NETWORK') {
    super(message);
    this.name = 'AuthError';
    this.reason = reason;
  }
}

/**
 * AuthService — Handles all authentication operations against the
 * Spring Boot backend. No mock data. Pure API integration.
 *
 * Endpoints consumed:
 * - POST /api/auth/login  → returns user + tokens
 * - GET  /api/auth/me     → returns current user (validates token)
 * - POST /api/auth/logout → invalidates token server-side
 */
class AuthService {
  /**
   * Authenticate user with email/password.
   * POST /api/auth/login
   *
   * On success: persists tokens + user to localStorage, returns LoginResponse.
   * On failure: throws Error with backend message.
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // apiService.post already unwraps ApiResponse<LoginResponseData>
      const data = await apiService.post<LoginResponseData>('/auth/login', credentials);

      // Extract user (without token fields) and tokens separately
      const { accessToken, refreshToken, tokenType, ...userFields } = data;
      const user: User = {
        id: userFields.id,
        email: userFields.email,
        firstName: userFields.firstName,
        lastName: userFields.lastName,
        role: userFields.role,
        institutionId: userFields.institutionId,
        institutionName: userFields.institutionName,
        department: userFields.department,
        departmentId: userFields.departmentId,
      };
      const tokens: AuthTokens = { accessToken, refreshToken, tokenType };

      // Persist session
      this.setStoredSession(user, tokens);

      return { user, tokens };
    } catch (error) {
      // Extract meaningful error message from Axios/ApiResponse errors
      const message = this.extractErrorMessage(error, 'Login failed');
      throw new Error(message);
    }
  }

  /**
   * Fetch current user from the backend using stored token.
   * GET /api/auth/me
   *
   * Used during app initialization to validate stored session.
   * If the token is expired/invalid, the backend returns data: null
   * or a 401 — both result in clearing the local session.
   */
  async getCurrentUser(): Promise<User> {
    let data: ApiResponse<User>;
    try {
      data = await apiService.raw<User>('/auth/me');
    } catch (error) {
      // If we get a 401, token is expired/invalid
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        this.clearStoredSession();
        throw new AuthError('Session expired', 'EXPIRED');
      }
      // Other errors are network issues — let them propagate
      throw error;
    }

    if (!data.success || data.data === null) {
      this.clearStoredSession();
      throw new AuthError('Session expired', 'EXPIRED');
    }

    // Refresh cached user data in localStorage with fresh backend data
    const user = data.data;
    const tokensStr = localStorage.getItem(TOKEN_KEY);
    if (tokensStr) {
      const tokens = JSON.parse(tokensStr) as AuthTokens;
      this.setStoredSession(user, tokens);
    }

    return user;
  }

  /**
   * Log out user — invalidates token server-side, then clears local storage.
   * POST /api/auth/logout
   */
  async logout(): Promise<void> {
    try {
      await apiService.post<null>('/auth/logout');
    } catch {
      // Even if backend call fails, clear local session
    } finally {
      this.clearStoredSession();
    }
  }

  /**
   * Get stored session from localStorage.
   * Returns null if no valid session exists.
   * Does NOT auto-login — that was removed for production.
   */
  getStoredSession(): LoginResponse | null {
    try {
      const tokensStr = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);

      if (tokensStr && userStr) {
        const tokens = JSON.parse(tokensStr) as AuthTokens;
        const user = JSON.parse(userStr) as User;

        // Basic validation — ensure required fields exist
        if (tokens?.accessToken && user?.email && user?.role) {
          return { user, tokens };
        }
      }
    } catch {
      // Malformed storage — clear it
      this.clearStoredSession();
    }

    return null;
  }

  /** Check if user has stored tokens */
  isAuthenticated(): boolean {
    return this.getStoredSession() !== null;
  }

  // ── Private helpers ──

  private setStoredSession(user: User, tokens: AuthTokens): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  }

  private clearStoredSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Extract a human-readable error message from various error types.
   */
  private extractErrorMessage(error: unknown, fallback: string): string {
    // Axios error with backend response
    if (axios.isAxiosError(error)) {
      const backendMessage = error.response?.data?.message;
      if (backendMessage) return backendMessage;
    }
    // Standard Error
    if (error instanceof Error) {
      return error.message;
    }
    return fallback;
  }
}

export const authService = new AuthService();
