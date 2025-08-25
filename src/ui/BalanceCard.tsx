import { memo, useMemo } from "react";
import { Eye, EyeOff, CreditCard } from "lucide-react";

type Props = {
  balance: number;
  accountNumber: string;
  hide?: boolean;
  onToggle?: () => void;
};

function BalanceCard({ balance, accountNumber, hide = false, onToggle }: Props) {
  const masked = "••••••••";

  const formattedBalance = useMemo(
    () =>
      balance.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    [balance]
  );

  return (
    <section
      className="rounded-2xl border border-slate-700  bg-[#1d293d] p-6 text-white shadow-md"
      aria-label="Saldo e informações da conta"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm/5 text-white/80">Saldo disponível</p>

          <div className="mt-2 flex items-center gap-3">
            <p
              className="text-3xl font-extrabold tracking-tight"
              aria-live="polite"
            >
              {hide ? masked : formattedBalance}
            </p>

            <button
              type="button"
              onClick={onToggle}
              className="rounded-full p-1 text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label={hide ? "Mostrar saldo" : "Ocultar saldo"}
              aria-pressed={!hide}
              title={hide ? "Mostrar saldo" : "Ocultar saldo"}
            >
              {hide ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <p className="mt-1 text-xs text-white/80">
            Conta: {accountNumber || "—"}
          </p>
        </div>

        <div className="hidden md:block opacity-90">
          <CreditCard size={48} />
        </div>
      </div>
    </section>
  );
}

export default memo(BalanceCard);
