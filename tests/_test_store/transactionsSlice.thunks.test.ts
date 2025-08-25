import { configureStore } from "@reduxjs/toolkit";
import reducer, { fetchTransactions, createTransaction, setFilters } from "../../src/store/transactionsSlice";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const authReducer = (state = { user: { id: 1 }, token: "atk" }) => state;

const makeStore = () =>
  configureStore({
    reducer: {
      transactions: reducer,
      auth: authReducer,
    },
  });

beforeEach(() => {
  jest.clearAllMocks();
});

describe("transactionsSlice - thunks", () => {
  test("fetchTransactions sucesso popula items", async () => {
    const store = makeStore();

    mockedAxios.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          userId: 1,
          type: "PIX",
          beneficiary: "Alice",
          document: "000",
          amount: 100,
          date: "2025-08-24",
          balanceAfter: 900,
          bank: null,
          agency: null,
          account: null,
          pixKey: "a@x.com",
        },
      ],
    });

    await store.dispatch(fetchTransactions({ userId: 1 }) as any);
    const st = store.getState().transactions;

    expect(st.status).toBe("idle");
    expect(st.items).toHaveLength(1);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  test("fetchTransactions monta query conforme filtros", async () => {
    const store = makeStore();

    store.dispatch(setFilters({ type: "PIX" as any, amountFrom: 10, amountTo: 200 }));

    mockedAxios.get.mockResolvedValueOnce({ data: [] });

    await store.dispatch(fetchTransactions({ userId: 1 }) as any);

    const url = mockedAxios.get.mock.calls[0][0] as string;
    expect(url).toContain("userId=1");
    expect(url).toContain("type=PIX");
    expect(url).toContain("amount_gte=10");
    expect(url).toContain("amount_lte=200");
    expect(url).toContain("_sort=date");
    expect(url).toContain("_order=desc");
  });

  test("createTransaction sucesso inclui item e realiza patch", async () => {
    const store = makeStore();

    mockedAxios.get.mockResolvedValueOnce({
      data: { id: 9, userId: 1, balance: 1000 },
    });

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        id: 77,
        userId: 1,
        type: "PIX",
        beneficiary: "Carol",
        document: "333",
        amount: 100,
        date: "2025-08-24",
        balanceAfter: 900,
        bank: null,
        agency: null,
        account: null,
        pixKey: "carol@x.com",
      },
    });

    mockedAxios.patch.mockResolvedValueOnce({ data: { balance: 900 } });

    await store.dispatch(
      createTransaction({
        type: "PIX",
        beneficiary: "Carol",
        document: "333",
        amount: 100,
        date: "2025-08-24",
        password: "1234",
        pixKey: "carol@x.com",
      } as any) as any
    );

    const st = store.getState().transactions;
    expect(st.items[0]?.id).toBe(77);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.patch).toHaveBeenCalledTimes(1);
  });
});
