import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { api, tokenStorage } from "../services/api";
import type { RootState } from "./index";
import type {
  User,
  AuthResponse,
  AuthState,
  LoginPayload,
  RegisterPayload,
} from "../types/auth";
import { API_URL } from "../config/env";

const API = API_URL;

const initialState: AuthState = {
  user: null,
  token: null,
  accessToken: null,
  refreshToken: null,
  status: "idle",
  error: null,
};

export const login = createAsyncThunk<
  AuthResponse,
  LoginPayload,
  { rejectValue: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post<AuthResponse>(`${API}/auth/login`, payload);
    return data;
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message ?? "Falha no login");
  }
});

export const registerUser = createAsyncThunk<
  AuthResponse,
  RegisterPayload,
  { rejectValue: string }
>("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post<AuthResponse>(
      `${API}/auth/register`,
      payload
    );
    return data;
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message ?? "Falha no registro");
  }
});

export const loadSession = createAsyncThunk<
  User | null,
  void,
  { rejectValue: string }
>("auth/loadSession", async (_, { rejectWithValue }) => {
  try {
    const access = tokenStorage.getAccessToken();
    const refresh = tokenStorage.getRefreshToken();
    if (!access || !refresh) return null;

    const { data } = await api.get<User>(`${API}/auth/me`);
    return data;
  } catch {
    return rejectWithValue("Não foi possível carregar a sessão");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    initFromStorage(state) {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      const refresh = localStorage.getItem("refreshToken");

      if (token) {
        state.token = token;
        state.accessToken = token;
        tokenStorage.setAccessToken(token);
      }
      if (refresh) {
        state.refreshToken = refresh;
        tokenStorage.setRefreshToken(refresh);
      }
      if (user) {
        try {
          state.user = JSON.parse(user) as User;
        } catch {
          state.user = null;
        }
      }
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.status = "idle";
      state.error = null;

      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      tokenStorage.setAccessToken(null as unknown as string);
      tokenStorage.setRefreshToken(null as unknown as string);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.status = "succeeded";
          state.user = action.payload.user;

          state.token = action.payload.accessToken;
          state.accessToken = action.payload.accessToken;
          if (action.payload.refreshToken) {
            state.refreshToken = action.payload.refreshToken;
          }

          localStorage.setItem("token", action.payload.accessToken);
          localStorage.setItem("user", JSON.stringify(action.payload.user));
          if (action.payload.refreshToken) {
            localStorage.setItem("refreshToken", action.payload.refreshToken);
            tokenStorage.setRefreshToken(action.payload.refreshToken);
          }
          tokenStorage.setAccessToken(action.payload.accessToken);
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Erro ao fazer login";
      })

      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        registerUser.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.status = "succeeded";
          state.user = action.payload.user;

          state.token = action.payload.accessToken;
          state.accessToken = action.payload.accessToken;
          if (action.payload.refreshToken) {
            state.refreshToken = action.payload.refreshToken;
          }

          localStorage.setItem("token", action.payload.accessToken);
          localStorage.setItem("user", JSON.stringify(action.payload.user));
          if (action.payload.refreshToken) {
            localStorage.setItem("refreshToken", action.payload.refreshToken);
            tokenStorage.setRefreshToken(action.payload.refreshToken);
          }
          tokenStorage.setAccessToken(action.payload.accessToken);
        }
      )
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Erro ao registrar";
      })

      .addCase(loadSession.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadSession.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          state.status = "succeeded";
        } else {
          state.status = "idle";
        }
        state.error = null;
      })
      .addCase(loadSession.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload ?? null;
      });
  },
});

export const { logout, initFromStorage } = authSlice.actions;
export default authSlice.reducer;

export const selectAuth = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) =>
  Boolean(state.auth.accessToken || state.auth.token);
