export type TxType = "PIX" | "TED" | "deposit";

export interface Transaction {
  id: number | string;
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
  title?: string;
  subtitle?: string;
}

export type TransactionDb = {
  id: number;
  userId: number;
  type: "PIX" | "TED" | string;
  beneficiary: string;
  document: string;
  amount: number;
  date: string;
  balanceAfter: number;
};

export type TransactionFormValues = {
  type: TxType;
  beneficiary: string;
  document: string;
  bank?: string;
  agency?: string;
  account?: string;
  pixKey?: string;
  amount: number;
  date: string; 
  password: string; 
  description?: string;
};
