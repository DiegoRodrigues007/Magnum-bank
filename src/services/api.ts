import axios, { AxiosError } from "axios";
import type { AxiosInstance } from "axios";
import { API_URL } from "../config/env"; 

declare module "axios" {
  export interface InternalAxiosRequestConfig<D = any> {
    _retry?: boolean;
  }
}

function getAccessToken() {
  return localStorage.getItem("accessToken");
}
function setAccessToken(token: string | null) {
  if (token) localStorage.setItem("accessToken", token);
  else localStorage.removeItem("accessToken");
}
function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}
function setRefreshToken(token: string | null) {
  if (token) localStorage.setItem("refreshToken", token);
  else localStorage.removeItem("refreshToken");
}

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
});

const plain = axios.create({ baseURL: API_URL });

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(p => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
}

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
    const original = error.config!;
    const status = error.response?.status;

    if (status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              if (original.headers && token) {
                original.headers.Authorization = `Bearer ${token as string}`;
              }
              resolve(api(original));
            },
            reject,
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw error;

        const { data } = await plain.post("/auth/refresh", { refreshToken });
        const newAccess = (data as any).accessToken as string;

        setAccessToken(newAccess);
        processQueue(null, newAccess);

        if (original.headers) {
          original.headers.Authorization = `Bearer ${newAccess}`;
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

    return Promise.reject(error);
  }
);

export const tokenStorage = {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
};
