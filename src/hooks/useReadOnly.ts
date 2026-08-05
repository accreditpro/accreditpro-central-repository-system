import { useAuth } from './useAuth';

/**
 * True while a Super Admin is previewing the app through an impersonated
 * account — pages should hide write actions (upload, add, edit, approve…).
 */
export const useReadOnly = (): boolean => {
  const { isImpersonating } = useAuth();
  return isImpersonating;
};
