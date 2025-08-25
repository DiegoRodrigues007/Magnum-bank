import React, { memo, useCallback } from "react";
import {
  Calendar as CalendarIcon,
  Filter as FilterIcon,
  Search as SearchIcon,
} from "lucide-react";
import type { FilterType } from "../types/filters";

type PeriodValue = "" | "7" | "15" | "30" | "90";

export interface StatementFiltersProps {
  q: string;
  onQueryChange: (value: string) => void;

  type: FilterType;
  onTypeChange: (value: FilterType) => void;

  period: PeriodValue;
  onPeriodSelect: (days: number) => void;

  from: string; 
  to: string;   
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;

  minValue: string;
  maxValue: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
}

function StatementFilters({
  q,
  onQueryChange,
  type,
  onTypeChange,
  period,
  onPeriodSelect,
  from,
  to,
  onFromChange,
  onToChange,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
}: StatementFiltersProps) {
  const handleType = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      onTypeChange(e.target.value as FilterType),
    [onTypeChange]
  );

  const handleQuery = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onQueryChange(e.target.value),
    [onQueryChange]
  );

  const handlePeriod = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const v = e.target.value as PeriodValue;
      if (v === "") return;
      onPeriodSelect(parseInt(v, 10));
    },
    [onPeriodSelect]
  );

  const handleFrom = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onFromChange(e.target.value),
    [onFromChange]
  );

  const handleTo = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onToChange(e.target.value),
    [onToChange]
  );

  const handleMin = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onMinChange(e.target.value),
    [onMinChange]
  );

  const handleMax = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onMaxChange(e.target.value),
    [onMaxChange]
  );

  return (
    <section className="mx-auto max-w-5xl px-4 mt-6 space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 grid gap-3 md:grid-cols-6">
        <label className="md:col-span-2 relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={q}
            onChange={handleQuery}
            placeholder="Buscar por favorecido, doc., banco, agência, conta ou chave PIX"
            className="w-full rounded-xl bg-slate-950/60 border border-slate-800 pl-9 pr-3 py-2 text-sm"
          />
        </label>

        <label className="relative">
          <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <select
            value={type}
            onChange={handleType}
            className="w-full appearance-none rounded-xl bg-slate-950/60 border border-slate-800 pl-9 pr-8 py-2 text-sm"
          >
            <option value="ALL">Todos os tipos</option>
            <option value="PIX">PIX</option>
            <option value="TED">TED</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            ▾
          </span>
        </label>

        <label>
          <span className="sr-only">Período</span>
          <select
            value={period}
            onChange={handlePeriod}
            className="w-full rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-2 text-sm"
          >
            <option value="">Período</option>
            <option value="7">Últimos 7 dias</option>
            <option value="15">Últimos 15 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-slate-400" />
          <input
            type="date"
            value={from}
            onChange={handleFrom}
            className="w-full rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-slate-400" />
          <input
            type="date"
            value={to}
            onChange={handleTo}
            className="w-full rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-2 text-sm"
          />
        </label>

        <div className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={minValue}
            onChange={handleMin}
            placeholder="Valor mín"
            className="w-full rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-2 text-sm"
          />
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={maxValue}
            onChange={handleMax}
            placeholder="Valor máx"
            className="w-full rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-2 text-sm"
          />
        </div>
      </div>
    </section>
  );
}

export default memo(StatementFilters);
