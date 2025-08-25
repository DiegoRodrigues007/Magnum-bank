export type TxType = "PIX" | "TED" | "deposit";

export interface Transaction {
  id: number;           
  userId: number;
  type: TxType;
  beneficiary: string;
  document: string;
  bank?: string | null;
  agency?: string | null;
  account?: string | null;
  pixKey?: string | null;
  amount: number;        
  date: string;          
  balanceAfter: number;  
}

export interface AccountForTx {
  id: number;
  userId: number;
  balance: number;
}

export type Period = 7 | 15 | 30 | 90;

export interface TransactionsFilters {
  type?: TxType | "ALL";
  period?: Period;
  dateFrom?: string;
  dateTo?: string;
  amountFrom?: number;
  amountTo?: number;
  sort?: "asc" | "desc";
}

export interface TransactionsState {
  items: Transaction[];
  status: "idle" | "loading" | "failed";
  error: string | null;
  filters: TransactionsFilters;
}

export interface BuildTxQueryParams extends TransactionsFilters {
  userId: number;
}

export type FetchTransactionsArg = { userId?: number };

export type CreateTxInput = Omit<Transaction, "id" | "userId" | "balanceAfter"> & {
  password: string;
};
