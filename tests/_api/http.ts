import axios from "axios";

const base = "http://localhost";
type HeadersLike = Record<string, string> | undefined;

export const jpost = async (
  url: string,
  body: unknown,
  init?: { headers?: HeadersLike }
) => {
  const res = await axios.post(base + url, body, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    validateStatus: () => true,
  });
  return { res: { status: res.status }, data: res.data };
};

export const jget = async (
  url: string,
  init?: { headers?: HeadersLike }
) => {
  const res = await axios.get(base + url, {
    headers: { ...(init?.headers || {}) },
    validateStatus: () => true,
  });
  return { res: { status: res.status }, data: res.data };
};

export const jpatch = async (
  url: string,
  body: unknown,
  init?: { headers?: HeadersLike }
) => {
  const res = await axios.patch(base + url, body, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    validateStatus: () => true,
  });
  return { res: { status: res.status }, data: res.data };
};
