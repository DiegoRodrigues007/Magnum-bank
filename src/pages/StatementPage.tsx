import React, { useCallback, useEffect, useMemo, useState, memo } from "react";
import { Wallet, FileText, SortAsc, SortDesc } from "lucide-react";
import { shallowEqual, useSelector } from "react-redux";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchTransactions } from "../store/transactionsSlice";
import type { Transaction } from "../types/transaction";

import { currency, formatDate } from "../utils/format";
import { typeMeta, defaultTypeMeta } from "../features/txTypeMeta";
import StatementFilters from "../ui/StatementFilters";
import type { FilterType } from "../types/filters";
import useFilteredTransactions from "../hooks/useFilteredTransactions";
import { groupByDayBR } from "../utils/transactions";
import { areTxPropsEqual } from "../utils/propsComparators";

interface StatementPageProps {
  transactions?: Transaction[];
  balance?: number;
}

const HOJE = new Date();
const PRIMEIRO_DIA_MES = new Date(HOJE.getFullYear(), HOJE.getMonth(), 1);

const StatementPage: React.FC<StatementPageProps> = ({ transactions }) => {
  const dispatch = useAppDispatch();

  const userId = useAppSelector((s) => s.auth.user?.id);
  const storeTx = useSelector(
    (s: any) => s.transactions.items as Transaction[] | undefined,
    shallowEqual
  );
  const txStatus = useAppSelector((s) => s.transactions.status);
  const txError = useAppSelector((s) => s.transactions.error);

  const data: Transaction[] = Array.isArray(transactions)
    ? transactions
    : Array.isArray(storeTx)
    ? storeTx
    : [];

  useEffect(() => {
    if (userId && txStatus === "idle" && data.length === 0) {
      dispatch(fetchTransactions({ userId }));
    }
  }, [dispatch, userId, txStatus]);

  const [q, setQ] = useState("");
  const [type, setType] = useState<FilterType>("ALL");
  const [from, setFrom] = useState<string>(
    PRIMEIRO_DIA_MES.toISOString().slice(0, 10)
  );
  const [to, setTo] = useState<string>(HOJE.toISOString().slice(0, 10));
  const [minValue, setMinValue] = useState<string>("");
  const [maxValue, setMaxValue] = useState<string>("");
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [period, setPeriod] = useState<string>("");

  const handleQueryChange = useCallback((v: string) => setQ(v), []);
  const handleTypeChange = useCallback((v: FilterType) => setType(v), []);
  const handleFromChange = useCallback((v: string) => setFrom(v), []);
  const handleToChange = useCallback((v: string) => setTo(v), []);
  const handleMinChange = useCallback((v: string) => setMinValue(v), []);
  const handleMaxChange = useCallback((v: string) => setMaxValue(v), []);

  const applyPeriod = useCallback((days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1);
    setFrom(start.toISOString().slice(0, 10));
    setTo(end.toISOString().slice(0, 10));
    setPeriod(String(days));
  }, []);

  const toggleSort = useCallback(() => setSortAsc((s) => !s), []);

  const filtered = useFilteredTransactions(data, {
    q,
    type,
    from,
    to,
    minValue,
    maxValue,
    sortAsc,
  });

  const grouped = useMemo(
    () => groupByDayBR(filtered, (t) => t.date),
    [filtered]
  );

  return (
    <div className="min-h-screen bg-[#0f172b] text-slate-100">
      <header className="sticky top-0 z-20 backdrop-blur border-b border-slate-800 bg-[#0f172b]/80">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-indigo-400" />
            <h1 className="text-xl font-semibold">Histórico de Transações</h1>
          </div>
          <button
            onClick={toggleSort}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
          >
            {sortAsc ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            Ordenar por Data
          </button>
        </div>
      </header>

      <StatementFilters
        q={q}
        onQueryChange={handleQueryChange}
        type={type}
        onTypeChange={handleTypeChange}
        period={period as "" | "7" | "15" | "30" | "90"}
        onPeriodSelect={applyPeriod}
        from={from}
        to={to}
        onFromChange={handleFromChange}
        onToChange={handleToChange}
        minValue={minValue}
        maxValue={maxValue}
        onMinChange={handleMinChange}
        onMaxChange={handleMaxChange}
      />

      <section className="mx-auto max-w-5xl px-4 mt-6 pb-24">
        {txStatus === "loading" && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
            Carregando transações...
          </div>
        )}

        {txStatus === "failed" && (
          <div className="rounded-2xl border border-rose-700 bg-rose-900/20 p-6 text-center text-sm text-rose-300">
            {txError || "Erro ao carregar transações."}
          </div>
        )}

        {txStatus !== "loading" && grouped.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-10 text-center">
            <FileText className="mx-auto h-10 w-10 text-slate-500" />
            <p className="mt-3 text-slate-300">
              Nenhuma movimentação encontrada para os filtros aplicados.
            </p>
          </div>
        ) : (
          txStatus !== "loading" && (
            <div className="space-y-6">
              {grouped.map(([day, txs]) => (
                <div key={day}>
                  <div className="mb-2 text-sm text-slate-400">{day}</div>
                  <div className="overflow-hidden rounded-2xl border border-slate-800">
                    <ul className="divide-y divide-slate-800">
                      {txs.map((t: Transaction, i) => {
                        const k = `${t.id ?? i}`;
                        const meta =
                          typeMeta[t.type as keyof typeof typeMeta] ??
                          defaultTypeMeta;
                        const amount = Math.abs(t.amount);
                        const isInflow = t.amount >= 0;

                        return (
                          <li
                            key={k}
                            className="bg-slate-900/30 hover:bg-slate-900/60 transition-colors"
                          >
                            <div className="flex items-center gap-4 px-4 py-3">
                              <div
                                className={`flex h-9 w-9 items-center justify-center rounded-full bg-slate-800/60 ${meta.className}`}
                              >
                                <meta.Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="truncate font-medium text-slate-100">
                                    {t.beneficiary || meta.label}
                                  </p>
                                  <span
                                    className={`whitespace-nowrap font-medium ${isInflow ? "text-emerald-400" : "text-rose-400"}`}
                                  >
                                    {isInflow ? "+" : "-"}
                                    {currency(amount)}
                                  </span>
                                </div>
                                <div className="mt-0.5 flex flex-wrap items-center justify-between text-xs text-slate-400">
                                  <span className="truncate">
                                    {meta.label} • {formatDate(t.date)}
                                  </span>
                                  <span className="truncate">
                                    Saldo: {currency(t.balanceAfter!)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </section>
    </div>
  );
};

export default memo(StatementPage, areTxPropsEqual);
