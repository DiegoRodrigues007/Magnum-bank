import { useMemo } from "react";
import type { Transaction, TxType } from "../types/transaction"; 
import { dt } from "../utils/format";
import type { TxFilterOptions } from "../types/filters";

const parseDec = (v: string, fallback: number) => {
  if (v === "" || v == null) return fallback;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
};

const haystack = (t: Transaction) =>
  `${t.beneficiary ?? ""} ${t.document ?? ""} ${t.bank ?? ""} ${t.agency ?? ""} ${t.account ?? ""} ${t.pixKey ?? ""}`
    .toLowerCase()
    .trim();

export function filterAndSortTransactions(
  data: Transaction[],
  opts: TxFilterOptions
): Transaction[] {
  const { q, type, from, to, minValue, maxValue, sortAsc } = opts;

  const qLower = q.toLowerCase();
  const start = from ? dt(from + "T00:00:00") : new Date(0);
  const end = to ? dt(to + "T23:59:59") : new Date(8640000000000000);
  const min = parseDec(minValue, 0);
  const max = parseDec(maxValue, Infinity);

  const byType = (t: Transaction) => (type === "ALL" ? true : t.type === (type as TxType));
  const byQuery = (t: Transaction) => (qLower ? haystack(t).includes(qLower) : true);
  const byDate = (t: Transaction) => {
    const d = dt(t.date);
    return d >= start && d <= end;
  };
  const byAmount = (t: Transaction) => {
    const v = Math.abs(t.amount);
    return v >= min && v <= max;
  };
  const bySort = (a: Transaction, b: Transaction) =>
    (sortAsc ? 1 : -1) * (dt(a.date).getTime() - dt(b.date).getTime());

  return data.filter(byType).filter(byQuery).filter(byDate).filter(byAmount).sort(bySort);
}

export default function useFilteredTransactions(
  data: Transaction[],
  opts: TxFilterOptions
) {
  const { q, type, from, to, minValue, maxValue, sortAsc } = opts;

  return useMemo(
    () => filterAndSortTransactions(data, opts),
    [data, q, type, from, to, minValue, maxValue, sortAsc]
  );
}
