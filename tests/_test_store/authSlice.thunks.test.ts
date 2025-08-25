import { configureStore } from "@reduxjs/toolkit";
import reducer, { login, registerUser, loadSession } from "../../src/store/authSlice";

jest.mock("../../src/services/api", () => {
  return {
    api: {
      post: jest.fn(),
      get: jest.fn(),
    },
    tokenStorage: {
      getAccessToken: jest.fn(),
      getRefreshToken: jest.fn(),
      setAccessToken: jest.fn(),
      setRefreshToken: jest.fn(),
    },
  };
});

import { api, tokenStorage } from "../../src/services/api";
const mockedApi = api as jest.Mocked<typeof api>;
const mockedTokens = tokenStorage as jest.Mocked<typeof tokenStorage>;

const makeStore = () =>
  configureStore({
    reducer: { auth: reducer },
  });

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe("authSlice - thunks", () => {
  test("login sucesso atualiza store e localStorage", async () => {
    const store = makeStore();
    mockedApi.post.mockResolvedValueOnce({
      data: {
        accessToken: "atk",
        refreshToken: "rtk",
        user: { id: 1, email: "a@b.com", name: "Alice" },
      },
    } as any);

    await store.dispatch(login({ email: "a@b.com", password: "123" }) as any);

    const st = store.getState().auth;
    expect(st.status).toBe("succeeded");
    expect(st.user?.id).toBe(1);
    expect(st.accessToken).toBe("atk");
    expect(st.refreshToken).toBe("rtk");
    expect(localStorage.getItem("token")).toBe("atk");
    expect(localStorage.getItem("refreshToken")).toBe("rtk");
    expect(localStorage.getItem("user")).toContain("Alice");
    expect(mockedTokens.setAccessToken).toHaveBeenCalledWith("atk");
    expect(mockedTokens.setRefreshToken).toHaveBeenCalledWith("rtk");
  });

  test("registerUser sucesso comporta-se como login", async () => {
    const store = makeStore();
    mockedApi.post.mockResolvedValueOnce({
      data: {
        accessToken: "atk2",
        refreshToken: "rtk2",
        user: { id: 2, email: "b@c.com", name: "Bob" },
      },
    } as any);

    await store.dispatch(
      registerUser({ email: "b@c.com", password: "123", name: "Bob" }) as any
    );

    const st = store.getState().auth;
    expect(st.status).toBe("succeeded");
    expect(st.user?.id).toBe(2);
    expect(st.accessToken).toBe("atk2");
    expect(st.refreshToken).toBe("rtk2");
    expect(localStorage.getItem("token")).toBe("atk2");
  });

  test("loadSession com tokens chama /auth/me e popula user", async () => {
    const store = makeStore();
    mockedTokens.getAccessToken.mockReturnValue("atk");
    mockedTokens.getRefreshToken.mockReturnValue("rtk");
    mockedApi.get.mockResolvedValueOnce({
      data: { id: 3, email: "c@d.com", name: "Carol" },
    } as any);

    await store.dispatch(loadSession() as any);
    const st = store.getState().auth;
    expect(st.status).toBe("succeeded");
    expect(st.user?.id).toBe(3);
  });

  test("loadSession sem tokens retorna null e fica idle", async () => {
    const store = makeStore();
    mockedTokens.getAccessToken.mockReturnValue(null);
    mockedTokens.getRefreshToken.mockReturnValue(null);

    await store.dispatch(loadSession() as any);
    const st = store.getState().auth;
    expect(st.status).toBe("idle");
    expect(st.user).toBeNull();
  });
});
