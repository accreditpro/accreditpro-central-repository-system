import { useAppDispatch, useAppSelector } from '@/store';
import { toggleTheme as toggleThemeAction, setTheme, ThemeMode } from '@/store/slices/themeSlice';
import { useCallback, useEffect } from 'react';

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const { mode } = useAppSelector((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  const toggle = useCallback(() => {
    dispatch(toggleThemeAction());
  }, [dispatch]);

  const set = useCallback(
    (newTheme: ThemeMode) => {
      dispatch(setTheme(newTheme));
    },
    [dispatch]
  );

  // Return both naming conventions for backward compatibility
  return { mode, theme: mode, toggle, toggleTheme: toggle, set, setTheme: set };
};