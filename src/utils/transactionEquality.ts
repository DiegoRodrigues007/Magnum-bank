import type { Transaction } from "../types/transaction";

export function areTransactionsEqual(a: Transaction, b: Transaction): boolean {
  if (a === b) return true;

  return (
    a.id === b.id &&
    a.userId === b.userId &&
    a.type === b.type &&
    a.beneficiary === b.beneficiary &&
    a.document === b.document &&
    (a.bank ?? null) === (b.bank ?? null) &&
    (a.agency ?? null) === (b.agency ?? null) &&
    (a.account ?? null) === (b.account ?? null) &&
    (a.pixKey ?? null) === (b.pixKey ?? null) &&
    a.amount === b.amount &&
    a.date === b.date &&
    a.balanceAfter === b.balanceAfter
  );
}
