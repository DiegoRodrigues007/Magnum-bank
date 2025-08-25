import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../services/api";
import type { RootState } from "./index";
import type { Account, ApiAccount, AccountState } from "../types/account";

const initialState: AccountState = {
  current: null,
  status: "idle",
  error: null,
};

const normalizeAccount = (data: ApiAccount): Account => ({
  userId: Number(data.userId),
  number: String(data.number),
  agency: String(data.agency),
  balance: Number(data.balance ?? 0),
});

export const fetchMyAccount = createAsyncThunk<
  Account,
  void,
  { state: RootState; rejectValue: string }
>("account/fetchMyAccount", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get<ApiAccount>("/account/me");
    return normalizeAccount(data);
  } catch (err: any) {
    const msg: string = err?.response?.data?.message ?? "Falha ao carregar conta";
    return rejectWithValue(msg);
  }
});

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    clearAccount(state) {
      state.current = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyAccount.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMyAccount.fulfilled, (state, action: PayloadAction<Account>) => {
        state.status = "idle";
        state.current = action.payload;
        state.error = null;
      })
      .addCase(fetchMyAccount.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Erro ao carregar conta";
      });
  },
});

export const { clearAccount } = accountSlice.actions;

export const selectAccount = (s: RootState) => s.account.current;
export const selectAccountNumber = (s: RootState) => s.account.current?.number ?? "—";
export const selectAccountStatus = (s: RootState) => s.account.status;

export default accountSlice.reducer;
