import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, LoginCredentials, LoginResponse, User } from '@/types/auth.types';
import { authService } from '@/services/auth.service';
import { clearImpersonation, loadImpersonation, saveImpersonation } from '@/services/impersonation.service';

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isImpersonating: false,
  originalUser: null,
};

export const loginAsync = createAsyncThunk<LoginResponse, LoginCredentials>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      return rejectWithValue(message);
    }
  }
);

export const logoutAsync = createAsyncThunk('auth/logout', async () => {
  authService.logout();
});

export const initializeAuth = createAsyncThunk('auth/initialize', async (_, { rejectWithValue }) => {
  try {
    const session = authService.getStoredSession();
    if (session) {
      return session;
    }
    return rejectWithValue('No stored session');
  } catch {
    return rejectWithValue('Failed to initialize auth');
  }
});

// Clears an active impersonation preview (in-memory + persisted sessionStorage).
const resetImpersonationState = (state: AuthState) => {
  clearImpersonation();
  state.originalUser = null;
  state.isImpersonating = false;
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<LoginResponse>) => {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
    },
    // Swap the active user with a synthetic impersonated user, remembering who
    // started the preview so it can be restored. The real account is persisted
    // to sessionStorage so the preview survives a page reload (localStorage is
    // left untouched — the real session always stays intact).
    startImpersonation: (state, action: PayloadAction<User>) => {
      if (!state.user) return;
      state.originalUser = state.user;
      state.user = action.payload;
      state.isImpersonating = true;
      saveImpersonation(state.originalUser, action.payload);
    },
    stopImpersonation: (state) => {
      clearImpersonation();
      if (state.originalUser) {
        state.user = state.originalUser;
      }
      state.originalUser = null;
      state.isImpersonating = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        // A fresh login always starts from a clean (non-impersonating) session.
        resetImpersonationState(state);
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.error = null;
        // Never leak an active preview into the next session.
        resetImpersonationState(state);
      })
      .addCase(initializeAuth.pending, (state) => {
        // Only set loading if not already authenticated (avoid flicker after login)
        if (!state.isAuthenticated) {
          state.isLoading = true;
        }
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.isLoading = false;
        // Restore an active impersonation preview across page reloads, but only
        // if the restored real account is the one that started it.
        const persisted = loadImpersonation();
        if (persisted && persisted.originalUser.id === action.payload.user.id) {
          state.originalUser = persisted.originalUser;
          state.user = persisted.impersonatedUser;
          state.isImpersonating = true;
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { clearError, setUser, startImpersonation, stopImpersonation } = authSlice.actions;
export default authSlice.reducer;