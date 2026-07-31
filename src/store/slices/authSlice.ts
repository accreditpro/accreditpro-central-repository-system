import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, LoginCredentials, LoginResponse, User } from '@/types/auth.types';
import { authService, AuthError } from '@/services/auth.service';

/**
 * Initial auth state.
 * isLoading starts as true because we must restore any persisted session
 * from localStorage BEFORE rendering protected routes. See AppInitializer
 * and initializeAuth thunk for the init flow.
 */
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true, // ← intentional: blocks rendering until session is checked
  error: null,
};

/**
 * Login thunk — calls POST /api/auth/login via authService.
 * On success: stores user + tokens in Redux and localStorage.
 * On failure: returns rejectWithValue with error message.
 */
export const loginAsync = createAsyncThunk<LoginResponse, LoginCredentials>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      return rejectWithValue(message);
    }
  }
);

/**
 * Logout thunk — calls POST /api/auth/logout via authService.
 * Always clears local state regardless of backend response.
 */
export const logoutAsync = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

/**
 * Initialize auth thunk — runs on app startup.
 *
 * Flow:
 * 1. Check localStorage for stored session (user + tokens)
 * 2. If found, set authenticated state immediately (no loading flash)
 * 3. Then call GET /api/auth/me in background to validate token
 *    and refresh user data from backend
 * 4. If /me fails (expired token), clear session
 */
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    const session = authService.getStoredSession();
    if (!session) {
      return rejectWithValue('No stored session');
    }

    try {
      // Validate token against backend via GET /api/auth/me
      const freshUser = await authService.getCurrentUser();
      return { user: freshUser, tokens: session.tokens };
    } catch (error) {
      // Distinguish between expired token and network error
      if (error instanceof AuthError && error.reason === 'EXPIRED') {
        return rejectWithValue('Session expired');
      }
      // Network error — keep stored session, user stays authenticated
      // with cached data. They can retry on next page load.
      return {
        user: session.user,
        tokens: session.tokens,
      };
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: builder => {
    builder
      // ── Login ──
      .addCase(loginAsync.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // ── Logout ──
      .addCase(logoutAsync.fulfilled, state => {
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // ── Initialize ──
      .addCase(initializeAuth.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(initializeAuth.rejected, state => {
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
