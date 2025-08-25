import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "./index";

import type {
  TxType,
  Transaction,
  AccountForTx,
  TransactionsFilters as Filters,
  TransactionsState as State,
  BuildTxQueryParams,
  FetchTransactionsArg,
  CreateTxInput,
} from "../types/txModels";
import { API_URL } from "../config/env";

const API = API_URL;

const initialState: State = {
  items: [],
  status: "idle",
  error: null,
  filters: { sort: "desc", type: "ALL" },
};

function authHeaders(getState: () => RootState) {
  const token = getState().auth.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildTxQuery(params: BuildTxQueryParams) {
  const usp = new URLSearchParams();

  usp.set("userId", String(params.userId));
  if (params.type && params.type !== "ALL") usp.set("type", params.type);
  if (params.dateFrom) usp.set("date_gte", params.dateFrom);
  if (params.dateTo) usp.set("date_lte", params.dateTo);
  if (typeof params.amountFrom === "number") usp.set("amount_gte", String(params.amountFrom));
  if (typeof params.amountTo === "number") usp.set("amount_lte", String(params.amountTo));

  const sortOrder = params.sort ?? "desc";
  usp.set("_sort", "date");
  usp.set("_order", sortOrder);

  return usp.toString();
}

export const fetchTransactions = createAsyncThunk<
  Transaction[],
  FetchTransactionsArg,
  { state: RootState; rejectValue: string }
>("tx/fetch", async (arg, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const authUserId = state.auth.user?.id;
    const userId =
      arg && typeof arg === "object" && "userId" in arg && arg.userId
        ? (arg.userId as number)
        : authUserId;

    if (!userId) return rejectWithValue("Usuário não autenticado");

    const { filters } = state.transactions;
    const qs = buildTxQuery({
      userId,
      sort: filters.sort,
      type: filters.type,
      period: filters.period,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      amountFrom: filters.amountFrom,
      amountTo: filters.amountTo,
    });

    const { data } = await axios.get<Transaction[]>(`${API}/transactions?${qs}`, {
      headers: authHeaders(getState),
    });

    return data;
  } catch (e: any) {
    const message = e?.response?.data?.message ?? "Falha ao carregar transações";
    return rejectWithValue(message);
  }
});

export const createTransaction = createAsyncThunk<
  Transaction,
  CreateTxInput,
  { state: RootState; rejectValue: string }
>("tx/create", async (payload, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const headers = authHeaders(getState);
    const userId = state.auth.user?.id;

    if (!userId) return rejectWithValue("Usuário não autenticado");

    const accRes = await axios.get<AccountForTx[] | AccountForTx>(
      `${API}/accounts?userId=${userId}`,
      { headers }
    );
    const account: AccountForTx | undefined = Array.isArray(accRes.data)
      ? accRes.data[0]
      : accRes.data;

    if (!account) return rejectWithValue("Conta não encontrada");

    const newBalance = Number((Number(account.balance) - Number(payload.amount)).toFixed(2));
    if (Number.isNaN(newBalance)) return rejectWithValue("Valor inválido");

    const txBody: Omit<Transaction, "id"> = {
      userId,
      type: payload.type as TxType,
      beneficiary: payload.beneficiary,
      document: payload.document,
      bank: payload.bank ?? null,
      agency: payload.agency ?? null,
      account: payload.account ?? null,
      pixKey: payload.pixKey ?? null,
      amount: Number(payload.amount),
      date: payload.date,
      balanceAfter: newBalance,
    };

    const txRes = await axios.post<Transaction>(`${API}/transactions`, txBody, { headers });

    await axios.patch(`${API}/accounts/${account.id}`, { balance: newBalance }, { headers });

    return txRes.data;
  } catch (e: any) {
    const message = e?.response?.data?.message ?? e?.message ?? "Falha ao criar transação";
    return rejectWithValue(message);
  }
});

const slice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<Filters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchTransactions.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (s, a) => {
        s.status = "idle"; 
        s.items = a.payload;
      })
      .addCase(fetchTransactions.rejected, (s, a) => {
        s.status = "failed";
        s.error = (a.payload as string) ?? "Erro ao carregar transações";
      })

      .addCase(createTransaction.pending, (s) => {
        s.error = null;
      })
      .addCase(createTransaction.fulfilled, (s, a) => {
        s.items.unshift(a.payload);
      })
      .addCase(createTransaction.rejected, (s, a) => {
        s.error = (a.payload as string) ?? "Erro ao criar transação";
      });
  },
});

export const { setFilters, clearError } = slice.actions;
export default slice.reducer;

export const selectTxState = (s: RootState) => s.transactions;
export const selectTransactions = (s: RootState) => s.transactions.items;
export const selectTxStatus = (s: RootState) => s.transactions.status;
export const selectTxError = (s: RootState) => s.transactions.error;
export const selectTxFilters = (s: RootState) => s.transactions.filters;
