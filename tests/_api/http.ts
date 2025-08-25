import axios from "axios";

type HeadersLike = Record<string, string> | undefined;

const BASE = "http://localhost"; 

let ACCESS_TOKEN: string | null = null;
let REFRESH_TOKEN: string | null = null;

const SEED_EMAIL = "diego@teste.com";
const SEED_PASS  = "123456";

function withBase(url: string) {
  return /^https?:\/\//i.test(url) ? url : BASE + url;
}
function isAuthUrl(url: string) {
  return /\/auth\/(login|register|refresh|logout)$/.test(url);
}
function captureTokensFromAuthResponse(data: any) {
  if (!data) return;
  if (typeof data.accessToken === "string") ACCESS_TOKEN = data.accessToken;
  if (typeof data.refreshToken === "string") REFRESH_TOKEN = data.refreshToken;
}
function buildHeaders(base: HeadersLike, opts?: { noAuth?: boolean }) {
  return {
    ...(base || {}),
    ...(opts?.noAuth ? {} : ACCESS_TOKEN ? { Authorization: `Bearer ${ACCESS_TOKEN}` } : {}),
  };
}

async function ensureAuth() {
  if (ACCESS_TOKEN) return;

  let res = await axios.post(withBase("/auth/login"), {
    email: SEED_EMAIL,
    password: SEED_PASS,
  }, { headers: { "content-type": "application/json" }, validateStatus: () => true });

  if (res.status === 200) {
    captureTokensFromAuthResponse(res.data);
    return;
  }

  if (res.status === 401) {
    const reg = await axios.post(withBase("/auth/register"), {
      name: "Diego",
      email: SEED_EMAIL,
      password: SEED_PASS,
    }, { headers: { "content-type": "application/json" }, validateStatus: () => true });

    if (reg.status === 201) {
      captureTokensFromAuthResponse(reg.data);
      return;
    }
    if (reg.status === 409) {
      res = await axios.post(withBase("/auth/login"), {
        email: SEED_EMAIL,
        password: SEED_PASS,
      }, { headers: { "content-type": "application/json" }, validateStatus: () => true });

      if (res.status === 200) {
        captureTokensFromAuthResponse(res.data);
        return;
      }
    }
  }

  throw new Error(`Auto-login falhou: ${res.status} ${JSON.stringify(res.data)}`);
}

export const jpost = async (
  url: string,
  body?: unknown,
  opts?: { headers?: HeadersLike; noAuth?: boolean }
) => {
  if (!opts?.noAuth && !isAuthUrl(url) && !ACCESS_TOKEN) {
    await ensureAuth();
  }

  const res = await axios.post(withBase(url), body ?? {}, {
    headers: buildHeaders({ "content-type": "application/json", ...(opts?.headers || {}) }, opts),
    validateStatus: () => true,
  });

  if (isAuthUrl(url)) captureTokensFromAuthResponse(res.data);

  return { res: { status: res.status }, data: res.data };
};

export const jget = async (url: string, opts?: { headers?: HeadersLike; noAuth?: boolean }) => {
  if (!opts?.noAuth && !isAuthUrl(url) && !ACCESS_TOKEN) {
    await ensureAuth();
  }
  const res = await axios.get(withBase(url), {
    headers: buildHeaders(opts?.headers, opts),
    validateStatus: () => true,
  });
  return { res: { status: res.status }, data: res.data };
};

export const jpatch = async (
  url: string,
  body?: unknown,
  opts?: { headers?: HeadersLike; noAuth?: boolean }
) => {
  if (!opts?.noAuth && !isAuthUrl(url) && !ACCESS_TOKEN) {
    await ensureAuth();
  }
  const res = await axios.patch(withBase(url), body ?? {}, {
    headers: buildHeaders({ "content-type": "application/json", ...(opts?.headers || {}) }, opts),
    validateStatus: () => true,
  });
  return { res: { status: res.status }, data: res.data };
};

export const tokens = () => ({ accessToken: ACCESS_TOKEN, refreshToken: REFRESH_TOKEN });
export const resetTokens = () => { ACCESS_TOKEN = null; REFRESH_TOKEN = null; };
export const setTokens = (access?: string | null, refresh?: string | null) => {
  if (typeof access !== "undefined") ACCESS_TOKEN = access;
  if (typeof refresh !== "undefined") REFRESH_TOKEN = refresh;
};
