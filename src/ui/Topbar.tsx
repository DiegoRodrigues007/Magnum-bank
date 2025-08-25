import { Link } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { selectAccountNumber } from "../store/accountSlice";
import type { RootState } from "../store/index";

export default function Topbar() {
  const name = useAppSelector((s: RootState) => s.auth.user?.name ?? "Cliente");
  const accountNumber = useAppSelector(selectAccountNumber);

  return (
    <header className="sticky top-0 z-10 border-b border-slate-700 bg-[#0f172b] backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div />
        <div className="flex items-center gap-6 text-sm">
          <div className="hidden md:block text-slate-300">
            <span className="font-medium text-slate-100">{name}</span>
            <span className="ml-3 text-slate-400">Conta: {accountNumber}</span>
          </div>
          <Link
            to="/transfer"
            className="rounded-lg bg-indigo-600 px-3 py-2 font-medium text-white hover:bg-indigo-500"
          >
            Nova Transferência
          </Link>
        </div>
      </div>
    </header>
  );
}
