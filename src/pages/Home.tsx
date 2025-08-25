import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { shallowEqual, useSelector } from "react-redux";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { fetchMyAccount } from "../store/accountSlice";
import { fetchTransactions } from "../store/transactionsSlice";
import BalanceCard from "../ui/BalanceCard";
import QuickAction from "../ui/QuickAction";
import TxItem from "../ui/TxItem";

function Home() {
  const dispatch = useAppDispatch();

  const user = useAppSelector((s) => s.auth.user);
  const account = useAppSelector((s) => s.account.current);

  const items = useSelector((s: any) => s.transactions.items, shallowEqual) as
    | any[]
    | undefined;

  const recentTx = useMemo(() => (items ?? []).slice(0, 3), [items]);

  const [hide, setHide] = useState(false);
  const toggleHide = useCallback(() => setHide((v) => !v), []);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchMyAccount());
      dispatch(fetchTransactions({ userId: user.id }));
    }
  }, [user?.id, dispatch]);

  return (
    <div className="flex h-full w-full flex-col bg-slate-900 text-slate-100">
      <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-6">
        <h1 className="mb-3 text-2xl font-semibold">
          Olá, {user?.name ?? "Cliente"}
        </h1>

        <BalanceCard
          balance={account?.balance ?? 0}
          accountNumber={account?.number ?? "—"}
          hide={hide}
          onToggle={toggleHide}
        />

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <QuickAction
            to="/transfer"
            title="Transferir"
            subtitle="PIX ou TED"
            icon="arrow"
            color="indigo"
          />
          <QuickAction
            to="/history"
            title="Extrato"
            subtitle="Histórico de transações"
            icon="down"
            color="green"
          />
          <QuickAction
            to="#"
            title="Investimentos"
            subtitle="Em breve"
            icon="wallet"
            color="amber"
            disabled
          />
        </div>

        <section className="mt-6 flex-1 rounded-2xl border border-slate-700 bg-[#1d293d] p-4 shadow-sm">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-xl font-semibold">Últimas transações</h2>
              <p className="text-sm text-slate-400">
                Suas movimentações mais recentes
              </p>
            </div>
            <Link
              to="/history"
              className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-900/20"
            >
              Ver todo o extrato
            </Link>
          </div>

          <div className="mt-3 space-y-3">
            {recentTx.length ? (
              recentTx.map((t) => <TxItem key={t.id} tx={t} />)
            ) : (
              <div className="p-6 text-center text-sm text-slate-400">
                Sem transações recentes.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default memo(Home);
