import axios, { AxiosError, type AxiosInstance } from "axios";
import { API_URL } from "../config/env";

declare module "axios" {
  export interface InternalAxiosRequestConfig<D = any> {
    _retry?: boolean;
  }
}

const ACCESS_KEYS = ["token", "accessToken"] as const;
const REFRESH_KEY = "refreshToken";

function getAccessToken(): string | null {
  for (const k of ACCESS_KEYS) {
    const v = localStorage.getItem(k);
    if (v) return v;
  }
  return null;
}
function setAccessToken(token: string | null) {
  for (const k of ACCESS_KEYS) {
    if (token) localStorage.setItem(k, token);
    else localStorage.removeItem(k);
  }
}
function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}
function setRefreshToken(token: string | null) {
  if (token) localStorage.setItem(REFRESH_KEY, token);
  else localStorage.removeItem(REFRESH_KEY);
}

const create =
  typeof axios.create === "function" ? axios.create : (_: any) => axios as any;

export const api: AxiosInstance = create({
  baseURL: API_URL || "",
});

const plain: AxiosInstance = create({ baseURL: API_URL || "" });

const hasInterceptors =
  !!(api as any)?.interceptors?.request?.use &&
  !!(api as any)?.interceptors?.response?.use;

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
}

if (hasInterceptors) {
  api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const original = error.config;
      const status = error.response?.status;

      if (!original || status !== 401) {
        return Promise.reject(error);
      }

      const isAuthRefresh = String(original.url || "").includes(
        "/auth/refresh"
      );
      if (isAuthRefresh || original._retry) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              if (original.headers && token) {
                (original.headers as any).Authorization =
                  `Bearer ${token as string}`;
              }
              (original as any)._retry = true;
              resolve(api(original));
            },
            reject,
          });
        });
      }

      (original as any)._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw error;

        const { data } = await plain.post("/auth/refresh", { refreshToken });
        const newAccess = (data as any).accessToken as string;

        setAccessToken(newAccess);
        processQueue(null, newAccess);

        if (original.headers) {
          (original.headers as any).Authorization = `Bearer ${newAccess}`;
        }
        return api(original);
      } catch (err) {
        processQueue(err, null);
        setAccessToken(null);
        setRefreshToken(null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
  );
}

export const tokenStorage = {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
};
