import { configureStore } from "@reduxjs/toolkit";
import reducer, { fetchMyAccount, clearAccount } from "../../src/store/accountSlice";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const makeStore = () =>
  configureStore({
    reducer: { account: reducer },
  });

beforeEach(() => {
  jest.clearAllMocks();
});

describe("accountSlice", () => {
  test("fetchMyAccount sucesso popula current e zera status", async () => {
    const store = makeStore();

    mockedAxios.get.mockResolvedValueOnce({
      data: { userId: 1, number: "0001-9", agency: "1234-5", balance: 999.99 },
    });

    await store.dispatch(fetchMyAccount() as any);

    const st = store.getState().account;
    expect(st.status).toBe("idle");
    expect(st.error).toBeNull();
    expect(st.current?.userId).toBe(1);
    expect(st.current?.balance).toBe(999.99);
  });

  test("fetchMyAccount erro popula error", async () => {
    const store = makeStore();

    mockedAxios.get.mockRejectedValueOnce({
      response: { data: { message: "Falha ao carregar conta" } },
    });

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
    const st = reducer(pre as any, clearAccount());
    expect(st.current).toBeNull();
    expect(st.status).toBe("idle");
    expect(st.error).toBeNull();
  });
});
