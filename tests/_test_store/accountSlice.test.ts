/** @jest-environment jsdom */

import { configureStore } from "@reduxjs/toolkit";
import accountReducer, {
  fetchMyAccount,
  clearAccount,
} from "../../src/store/accountSlice";
import { api } from "../../src/services/api";

jest.mock("../../src/services/api", () => ({
  api: {
    get: jest.fn(),
  },
}));

type MockedApi = { get: jest.Mock };
const mockedApi = api as unknown as MockedApi;

const makeStore = () =>
  configureStore({
    reducer: { account: accountReducer },
  });

beforeEach(() => {
  jest.clearAllMocks();
  try {
    localStorage.clear();
  } catch {}
});

describe("accountSlice", () => {
  test("fetchMyAccount sucesso popula current e zera status", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: { userId: 1, number: "0001-9", agency: "1234-5", balance: 999.99 },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    });

    const store = makeStore();
    await store.dispatch(fetchMyAccount() as any);

    const st = store.getState().account;
    expect(st.status).toBe("idle");
    expect(st.error).toBeNull();
    expect(st.current).toEqual({
      userId: 1,
      number: "0001-9",
      agency: "1234-5",
      balance: 999.99,
    });
  });

  test("fetchMyAccount erro popula error", async () => {
    mockedApi.get.mockRejectedValueOnce({
      response: { data: { message: "Falha ao carregar conta" } },
    });

    const store = makeStore();
    await store.dispatch(fetchMyAccount() as any);

    const st = store.getState().account;
    expect(st.status).toBe("failed");
    expect(st.error).toBe("Falha ao carregar conta");
  });

  test("clearAccount reseta estado", () => {
    const pre = {
      current: { userId: 1, number: "0001-9", agency: "1234-5", balance: 10 },
      status: "idle" as const,
      error: "x",
    };
    const st = accountReducer(pre as any, clearAccount());
    expect(st.current).toBeNull();
    expect(st.status).toBe("idle");
    expect(st.error).toBeNull();
  });
});
