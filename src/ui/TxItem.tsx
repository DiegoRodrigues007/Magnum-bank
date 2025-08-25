import React, { memo, useMemo } from "react";
import type { Transaction } from "../types/txModels"; 
import { areTransactionsEqual } from "../utils/transactionEquality";
import { ArrowDown, ArrowUp } from "lucide-react";

type Props = { tx: Transaction };

function TxItem({ tx }: Props) {
  const positive = tx.amount > 0;

  const label = useMemo(() => {
    switch (tx.type) {
      case "PIX":
        return "Transferência PIX";
      case "TED":
        return "TED para conta corrente";
      default:
        return "Depósito";
    }
  }, [tx.type]);

  const subtitle = useMemo(
    () => (tx.beneficiary ? `Para: ${tx.beneficiary}` : ""),
    [tx.beneficiary]
  );

  const dateStr = useMemo(
    () => new Date(tx.date as any).toLocaleDateString("pt-BR"),
    [tx.date]
  );

  const chip = tx.type;

  return (
    <div className="rounded-xl border border-slate-700 bg-[#192437] px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              positive ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
            }`}
          >
            {positive ? (
              <ArrowUp size={16} strokeWidth={2.5} />
            ) : (
              <ArrowDown size={16} strokeWidth={2.5} />
            )}
          </span>

          <div>
            <div className="font-semibold">{label}</div>
            <div className="text-xs text-slate-400">
              {subtitle && `${subtitle} • `}{dateStr}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className={`font-semibold ${positive ? "text-emerald-500" : "text-rose-500"}`}>
            {tx.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
          <div className="mt-0.5 inline-flex rounded-full border border-slate-600 px-2 py-0.5 text-[11px] text-slate-300">
            {chip}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(TxItem, (prev, next) => areTransactionsEqual(prev.tx, next.tx));
