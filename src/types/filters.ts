import type { TxType } from "./txModels"; 

export type FilterType = TxType | "ALL";

export interface TxFilterOptions {
  q: string;
  type: FilterType;
  from: string;
  to: string;
  minValue: string;
  maxValue: string;
  sortAsc: boolean;
}
