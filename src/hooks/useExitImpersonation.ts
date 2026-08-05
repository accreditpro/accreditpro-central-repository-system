import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * Returns a callback that ends an active read-only preview and returns the
 * Super Admin to the institutions page (where impersonation is started).
 */
export const useExitImpersonation = (): (() => void) => {
  const { stopImpersonation } = useAuth();
  const navigate = useNavigate();

  return useCallback(() => {
    stopImpersonation();
    navigate('/admin/institutions');
  }, [stopImpersonation, navigate]);
};
