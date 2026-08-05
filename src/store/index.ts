import { configureStore, Middleware } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import uiReducer from './slices/uiSlice';
import evidenceReviewReducer, { persistReviews, setReview } from './slices/evidenceReviewSlice';
import iqacReducer, { persistIQAC } from './slices/iqacSlice';
import iqacVerificationReducer, { persistVerification } from './slices/iqacVerificationSlice';

// Persist HOD review decisions to localStorage outside the reducer (reducers stay pure).
const evidenceReviewPersistence: Middleware = (api) => (next) => (action) => {
  const result = next(action);
  if (
    action &&
    typeof action === 'object' &&
    'type' in action &&
    (action as { type: string }).type === setReview.type
  ) {
    persistReviews(api.getState().evidenceReview.reviews);
  }
  return result;
};

// Persist IQAC-owned state (observations / initiatives / documents).
const iqacPersistence: Middleware = (api) => (next) => (action) => {
  const result = next(action);
  if (
    action &&
    typeof action === 'object' &&
    'type' in action &&
    (action as { type: string }).type.startsWith('iqac/')
  ) {
    persistIQAC(api.getState().iqac);
  }
  return result;
};

// Persist IQAC evidence verification decisions (verify / observations).
const iqacVerificationPersistence: Middleware = (api) => (next) => (action) => {
  const result = next(action);
  if (
    action &&
    typeof action === 'object' &&
    'type' in action &&
    (action as { type: string }).type.startsWith('iqacVerification/')
  ) {
    persistVerification(api.getState().iqacVerification);
  }
  return result;
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    ui: uiReducer,
    evidenceReview: evidenceReviewReducer,
    iqac: iqacReducer,
    iqacVerification: iqacVerificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/login/fulfilled'],
      },
    }).concat(evidenceReviewPersistence, iqacPersistence, iqacVerificationPersistence),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;