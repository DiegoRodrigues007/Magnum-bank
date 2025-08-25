import React, { memo, useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { registerUser } from "../store/authSlice";
import { UserRound, Eye, EyeOff, Loader2 } from "lucide-react";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const status = useAppSelector((s) => s.auth.status);
  const error = useAppSelector((s) => s.auth.error);
  const loading = status === "loading";

  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const passwordValue = watch("password");
  const NEXT = "/";

  const toggleShowPass = useCallback(() => setShowPass((s) => !s), []);

  const onSubmit = useCallback(
    async (data: RegisterForm) => {
      const { confirmPassword, ...payload } = data;
      try {
        await dispatch(registerUser(payload as any)).unwrap();
        navigate(NEXT, { replace: true });
      } catch {}
    },
    [dispatch, navigate]
  );

  const strength = useMemo(() => {
    if (!passwordValue) return "";
    if (passwordValue.length < 6) return "fraca";
    if (passwordValue.length < 10) return "média";
    return "forte";
  }, [passwordValue]);

  const submitBtnClass = useMemo(
    () =>
      "group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70",
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 ring-1 ring-white/10">
            <UserRound className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            Criar conta
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Preencha seus dados para começar
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm text-white/80"
              >
                Nome
              </label>
              <input
                id="name"
                placeholder="Seu nome"
                className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white outline-none ring-1 ring-white/10 placeholder-white/40 transition focus:ring-2 focus:ring-indigo-500 ${
                  errors.name ? "ring-2 ring-rose-500" : ""
                }`}
                {...register("name", { required: "Informe seu nome" })}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-rose-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm text-white/80"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                autoComplete="email"
                className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white outline-none ring-1 ring-white/10 placeholder-white/40 transition focus:ring-2 focus:ring-indigo-500 ${
                  errors.email ? "ring-2 ring-rose-500" : ""
                }`}
                {...register("email", {
                  required: "Informe seu email",
                  pattern: { value: /\S+@\S+\.\S+/, message: "Email inválido" },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm text-white/80"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={`w-full rounded-xl bg-white/5 px-4 py-3 pr-12 text-white outline-none ring-1 ring-white/10 placeholder-white/40 transition focus:ring-2 focus:ring-indigo-500 ${
                    errors.password ? "ring-2 ring-rose-500" : ""
                  }`}
                  {...register("password", {
                    required: "Informe uma senha",
                    minLength: { value: 6, message: "Mínimo de 6 caracteres" },
                  })}
                />
                <button
                  type="button"
                  onClick={toggleShowPass}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/60 hover:text-white/90"
                  aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPass ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-400">
                  {errors.password.message}
                </p>
              )}
              {passwordValue && (
                <p className="mt-1 text-xs text-white/60">Força: {strength}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm text-white/80"
              >
                Confirmar senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white outline-none ring-1 ring-white/10 placeholder-white/40 transition focus:ring-2 focus:ring-indigo-500 ${
                  errors.confirmPassword ? "ring-2 ring-rose-500" : ""
                }`}
                {...register("confirmPassword", {
                  validate: (v) =>
                    v === passwordValue || "As senhas não conferem",
                })}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-rose-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {error && (
              <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className={submitBtnClass}>
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>Criar conta</>
              )}
            </button>

            <div className="text-right text-sm text-white/70">
              Já tem conta?{" "}
              <Link
                to="/login"
                className="text-indigo-300 hover:text-white underline underline-offset-4"
              >
                Entrar
              </Link>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-white/50">
          Ao continuar, você concorda com os termos de uso.
        </p>
      </div>
    </div>
  );
}

export default memo(Register);
