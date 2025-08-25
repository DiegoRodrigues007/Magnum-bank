import { useMemo } from "react";
import type { Transaction, TxType } from "../types/transaction";
import { dt } from "../utils/format";
import type { TxFilterOptions } from "../types/filters";

const parseDec = (v: unknown, fallback: number) => {
  if (v === "" || v == null) return fallback;
  const n =
    typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? Number(n) : fallback;
};

const haystack = (t: Transaction) =>
  `${t.beneficiary ?? ""} ${t.document ?? ""} ${t.bank ?? ""} ${t.agency ?? ""} ${t.account ?? ""} ${t.pixKey ?? ""}`
    .toLowerCase()
    .trim();

export function filterAndSortTransactions(
  rawData: unknown,
  opts: TxFilterOptions
): Transaction[] {
  const data: Transaction[] = Array.isArray(rawData) ? rawData : [];
  if (data.length === 0) return [];

  const q = (opts.q ?? "").toString();
  const type = (opts.type ?? "ALL") as TxType | "ALL";
  const from = (opts.from ?? "").toString();
  const to = (opts.to ?? "").toString();
  const minValue = opts.minValue ?? "";
  const maxValue = opts.maxValue ?? "";
  const sortAsc = Boolean(opts.sortAsc);

  const qLower = q.toLowerCase().trim();

  const start = from ? dt(`${from}T00:00:00`) : new Date(0);
  const end = to ? dt(`${to}T23:59:59`) : new Date(8640000000000000);

  const min = parseDec(minValue, 0);
  const max = parseDec(maxValue, Infinity);

  const byType = (t: Transaction) => (type === "ALL" ? true : t.type === (type as TxType));
  const byQuery = (t: Transaction) => (qLower ? haystack(t).includes(qLower) : true);
  const byDate = (t: Transaction) => {
    const d = dt(t.date);
    const ts = d.getTime();
    return Number.isFinite(ts) && d >= start && d <= end;
  };
  const byAmount = (t: Transaction) => {
    const v = Math.abs(Number(t.amount));
    return Number.isFinite(v) && v >= min && v <= max;
  };
  const bySort = (a: Transaction, b: Transaction) => {
    const aTs = dt(a.date).getTime();
    const bTs = dt(b.date).getTime();
    const dir = sortAsc ? 1 : -1;
    return dir * (aTs - bTs);
  };

  return data
    .filter(byType)
    .filter(byQuery)
    .filter(byDate)
    .filter(byAmount)
    .sort(bySort);
}

export default function useFilteredTransactions(
  data: unknown,               
  opts: TxFilterOptions
) {
  const { q, type, from, to, minValue, maxValue, sortAsc } = opts;

  return useMemo(
    () => filterAndSortTransactions(data, opts),
    [data, q, type, from, to, minValue, maxValue, sortAsc]
  );
}
