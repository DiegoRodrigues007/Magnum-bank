import type { Transaction } from "../types/transaction";
import { areTransactionsEqual } from "../utils/transactionEquality"; 

export type TxProps = {
  transactions?: ReadonlyArray<Transaction> | null;
  balance?: number | null;
};

export function areArraysEqual<T>(
  a?: ReadonlyArray<T> | null,
  b?: ReadonlyArray<T> | null,
  eq?: (x: T, y: T) => boolean
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;

  if (!eq) return a.every((v, i) => Object.is(v, b[i]));

  for (let i = 0; i < a.length; i++) {
    if (!eq(a[i], b[i])) return false;
  }
  return true;
}

export function areTxPropsEqual(prev: TxProps, next: TxProps): boolean {
  if ((prev.balance ?? null) !== (next.balance ?? null)) return false;

  return areArraysEqual(
    prev.transactions,
    next.transactions,
    areTransactionsEqual
  );
}
