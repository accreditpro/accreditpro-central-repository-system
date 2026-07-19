import { useAppDispatch, useAppSelector } from '@/store';
import { loginAsync, logoutAsync, clearError, initializeAuth } from '@/store/slices/authSlice';
import { LoginCredentials, LoginResponse, UserRole } from '@/types/auth.types';
import { useCallback } from 'react';

/**
 * useAuth — Primary auth hook for the application.
 *
 * Provides:
 * - Auth state (user, isAuthenticated, isLoading, error)
 * - Actions: login, logout, initialize, resetError
 * - Helper: hasRole for role-based access checks
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth
  );

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<LoginResponse> => {
      const result = await dispatch(loginAsync(credentials)).unwrap();
      return result;
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    await dispatch(logoutAsync());
  }, [dispatch]);

  const initialize = useCallback(async () => {
    await dispatch(initializeAuth());
  }, [dispatch]);

  const hasRole = useCallback(
    (roles: UserRole[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  const resetError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    initialize,
    hasRole,
    resetError,
  };
};