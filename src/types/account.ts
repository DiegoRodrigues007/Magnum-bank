export interface Account {
  userId: number;
  number: string;   
  agency: string;   
  balance: number;  
}

export interface ApiAccount {
  userId: number | string;
  number: string | number;
  agency: string | number;
  balance?: number | string | null;
}

export type AccountStatus = "idle" | "loading" | "succeeded" | "failed";

export interface AccountState {
  current: Account | null;
  status: AccountStatus;
  error: string | null;
}