import reducer, { initFromStorage, logout } from "../../src/store/authSlice";

describe("authSlice - reducers", () => {
  const USER = { id: 1, email: "a@b.com", name: "Alice" };

  beforeEach(() => {
    localStorage.clear();
  });

  test("initFromStorage lê tokens/usuário do localStorage", () => {
    localStorage.setItem("token", "atk");
    localStorage.setItem("refreshToken", "rtk");
    localStorage.setItem("user", JSON.stringify(USER));

    const state = reducer(undefined, initFromStorage());
    expect(state.accessToken).toBe("atk");
    expect(state.token).toBe("atk");
    expect(state.refreshToken).toBe("rtk");
    expect(state.user).toEqual(USER);
  });

  test("logout limpa store e localStorage", () => {
    const pre = {
      user: USER,
      token: "atk",
      accessToken: "atk",
      refreshToken: "rtk",
      status: "succeeded" as const,
      error: null as string | null,
    };
    const state = reducer(pre as any, logout());

    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.status).toBe("idle");
    expect(state.error).toBeNull();

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });
});
