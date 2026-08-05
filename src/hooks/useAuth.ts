import { useAppDispatch, useAppSelector } from '@/store';
import {
  loginAsync,
  logoutAsync,
  clearError,
  initializeAuth,
  startImpersonation as startImpersonationAction,
  stopImpersonation as stopImpersonationAction,
} from '@/store/slices/authSlice';
import { LoginCredentials, LoginResponse, User, UserRole } from '@/types/auth.types';
import { useCallback } from 'react';

/**
 * useAuth — Primary auth hook for the application.
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error, isImpersonating, originalUser } = useAppSelector(
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

  const startImpersonation = useCallback(
    (userToView: User) => {
      dispatch(startImpersonationAction(userToView));
    },
    [dispatch]
  );

  const stopImpersonation = useCallback(() => {
    dispatch(stopImpersonationAction());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    isImpersonating,
    originalUser,
    login,
    logout,
    initialize,
    hasRole,
    resetError,
    startImpersonation,
    stopImpersonation,
  };
};
