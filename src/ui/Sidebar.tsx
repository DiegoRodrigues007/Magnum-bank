import React, { memo, useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { logout } from "../store/authSlice";
import {
  Home,
  ArrowLeftRight,
  Clock,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: true;
};

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);

  const navItems: NavItem[] = [
    { to: "/", label: "Início", icon: Home, end: true },
    { to: "/transfer", label: "Transferir", icon: ArrowLeftRight },
    { to: "/history", label: "Extrato", icon: Clock },
  ];

  const handleLogout = async () => {
    try {
      await dispatch(logout() as any);
    } finally {
      navigate("/login");
    }
  };

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const base =
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition";
  const active = "bg-indigo-600 text-white shadow-md";
  const idle = "text-slate-400 hover:bg-slate-800 hover:text-white";

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-[#1d293d] text-slate-200 px-4 py-3 shadow">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center rounded-md p-2 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Abrir menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white font-bold">
            M
          </div>
          <span className="text-lg font-semibold text-white">Magnum Bank</span>
        </div>

        <div className="w-6" />
      </div>

      <div
        className={`md:hidden fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`fixed inset-0 bg-black/40 transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`fixed inset-y-0 left-0 w-72 bg-[#1d293d] text-slate-200 shadow-xl transform transition-transform ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white font-bold">
                M
              </div>
              <span className="text-lg font-semibold text-white">
                Magnum Bank
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-2 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-2 flex flex-col gap-1 px-3">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `${base} ${isActive ? active : idle}`
                }
              >
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto px-3 pb-4 pt-2">
            <button
              onClick={async () => {
                setOpen(false);
                await handleLogout();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-rose-600 hover:text-white"
            >
              <LogOut className="h-5 w-5" />
              Sair
            </button>
          </div>
        </aside>
      </div>

      <aside className="hidden md:flex h-screen w-64 shrink-0 bg-[#1d293d] text-slate-200 md:flex-col">
        <div className="flex items-center gap-2 px-6 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white font-bold">
            M
          </div>
          <span className="text-lg font-semibold text-white">Magnum Bank</span>
        </div>

        <nav className="mt-4 flex flex-1 flex-col gap-1 px-4">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `${base} ${isActive ? active : idle}`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto px-4 pb-6">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-rose-600 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}

export default memo(Sidebar);
