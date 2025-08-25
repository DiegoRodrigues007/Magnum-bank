import { useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchTransactions } from "../store/transactionsSlice";
import { fetchMyAccount } from "../store/accountSlice";
import Modal from "../ui/Modal";

import useTransactionForm from "../hooks/useTransactionForm";
import useTransactionSubmit from "../hooks/useTransactionSubmit";
import type { TransactionFormValues } from "../types/transaction";
import { brl } from "../utils/format";

export default function TransactionPage() {
  const dispatch = useAppDispatch();

  const userId = useAppSelector((s) => s.auth.user?.id);
  const account = useAppSelector((s) => s.account?.current);
  const accountStatus = useAppSelector((s) => s.account?.status);
  const balance = account?.balance ?? 0;

  const txStatus = useAppSelector((s) => s.transactions?.status) as
    | "idle"
    | "loading"
    | "succeeded"
    | "failed"
    | undefined;
  const txError = useAppSelector((s) => s.transactions?.error) as
    | string
    | null
    | undefined;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    amount,
    type,
    insufficient,
  } = useTransactionForm(balance);

  const { submit, modalOpen, setModalOpen, modalKind, lastTxId } =
    useTransactionSubmit(userId);

  useEffect(() => {
    if (userId) {
      dispatch(fetchMyAccount());
      dispatch(fetchTransactions({ userId }));
    }
  }, [dispatch, userId]);

  const onSubmit = async (values: TransactionFormValues) => {
    const payload = {
      type: values.type,
      beneficiary: values.beneficiary.trim(),
      document: values.document.trim(),
      pixKey: values.type === "PIX" ? values.pixKey?.trim() : undefined,
      bank: values.type === "TED" ? values.bank?.trim() : undefined,
      agency: values.type === "TED" ? values.agency?.trim() : undefined,
      account: values.type === "TED" ? values.account?.trim() : undefined,
      amount: Number(values.amount),
      date: values.date,
      password: values.password,
      description: values.description?.trim() || undefined,
    };

    const res = await submit(payload);

    setValue("password", "");
    setValue("description", "");

    if (userId) {
      dispatch(fetchTransactions({ userId }));
      dispatch(fetchMyAccount());
    }

    void res;
  };

  const projected = useMemo(() => balance - (amount || 0), [balance, amount]);
  const isAccountLoading = accountStatus === "loading" && !account;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-10 px-4">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-800">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              Nova Transação
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
              Envie um TED ou PIX. Preencha os dados e confira o resumo.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Saldo disponível
            </p>

            {isAccountLoading ? (
              <div className="mt-2 h-7 w-28 animate-pulse rounded bg-slate-700/40" />
            ) : (
              <p className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                {brl(balance)}
              </p>
            )}

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Após transferência:{" "}
              <span
                className={
                  amount > balance
                    ? "text-rose-500"
                    : "text-slate-700 dark:text-slate-200"
                }
              >
                {brl(projected)}
              </span>
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800"
          >
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Tipo de transação
              </label>
              <div className="flex gap-3">
                <label
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition
                    ${
                      type === "TED"
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                        : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                    }`}
                >
                  <input
                    type="radio"
                    value="TED"
                    {...register("type")}
                    className="accent-indigo-600"
                  />
                  TED
                </label>

                <label
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition
                    ${
                      type === "PIX"
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                        : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                    }`}
                >
                  <input
                    type="radio"
                    value="PIX"
                    {...register("type")}
                    className="accent-indigo-600"
                  />
                  PIX
                </label>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
                  Nome do favorecido
                </label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  placeholder="Ex.: João da Silva"
                  {...register("beneficiary", {
                    required: "Informe o nome do favorecido",
                  })}
                />
                {errors.beneficiary && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors.beneficiary.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
                  CPF/CNPJ
                </label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  placeholder="Digite o documento"
                  {...register("document", {
                    required: "Informe o CPF/CNPJ",
                    minLength: { value: 11, message: "Documento inválido" },
                  })}
                />
                {errors.document && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors.document.message}
                  </p>
                )}
              </div>
            </div>

            {type === "TED" ? (
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
                    Banco
                  </label>
                  <input
                    placeholder="Ex.: 001 - Banco do Brasil"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    {...register("bank", { required: "Informe o banco" })}
                  />
                  {errors.bank && (
                    <p className="mt-1 text-xs text-rose-500">
                      {errors.bank.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
                    Agência
                  </label>
                  <input
                    placeholder="Ex.: 1234-5"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    {...register("agency", { required: "Informe a agência" })}
                  />
                  {errors.agency && (
                    <p className="mt-1 text-xs text-rose-500">
                      {errors.agency.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
                    Conta
                  </label>
                  <input
                    placeholder="Ex.: 000123-4"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    {...register("account", { required: "Informe a conta" })}
                  />
                  {errors.account && (
                    <p className="mt-1 text-xs text-rose-500">
                      {errors.account.message}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
                  Chave PIX
                </label>
                <input
                  placeholder="CPF, CNPJ, email, telefone ou aleatória"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  {...register("pixKey", { required: "Informe a chave PIX" })}
                />
                {errors.pixKey && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors.pixKey.message}
                  </p>
                )}
              </div>
            )}

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Controller
                control={control}
                name="amount"
                rules={{
                  required: "Informe o valor",
                  min: { value: 0.01, message: "Valor mínimo é R$ 0,01" },
                }}
                render={({ field }) => {
                  const formatted =
                    typeof field.value === "number" &&
                    !Number.isNaN(field.value)
                      ? (field.value as number).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      : "";

                  const handleMaskedChange = (
                    e: React.ChangeEvent<HTMLInputElement>
                  ) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    if (!digits) {
                      field.onChange(undefined);
                      return;
                    }
                    const value = Number(digits) / 100;
                    field.onChange(value);
                  };

                  return (
                    <div>
                      <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
                        Valor a transferir
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        placeholder="R$ 0,00"
                        value={formatted}
                        onChange={handleMaskedChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                      {errors.amount && (
                        <p className="mt-1 text-xs text-rose-500">
                          {errors.amount.message}
                        </p>
                      )}
                      {insufficient && (
                        <p className="mt-1 text-xs text-rose-500">
                          Saldo insuficiente para esta operação.
                        </p>
                      )}
                    </div>
                  );
                }}
              />

              <div>
                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
                  Data da transação
                </label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  {...register("date", { required: "Informe a data" })}
                />
                {errors.date && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors.date.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
                Descrição (opcional)
              </label>
              <input
                placeholder="Ex.: pagamento do aluguel"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                {...register("description")}
              />
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
                Senha de transação
              </label>
              <input
                type="password"
                placeholder="••••••"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                {...register("password", {
                  required: "Informe sua senha de transação",
                  minLength: { value: 4, message: "Mínimo 4 dígitos" },
                })}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={txStatus === "loading" || insufficient}
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white shadow-md transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {txStatus === "loading"
                  ? "Processando..."
                  : "Confirmar transferência"}
              </button>
            </div>
          </form>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800">
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
              Resumo
            </h2>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-300">Tipo</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {type}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-300">
                  Favorecido
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {watch("beneficiary") || "-"}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-300">
                  Documento
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {watch("document") || "-"}
                </span>
              </li>

              {type === "TED" ? (
                <>
                  <li className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-300">
                      Banco
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {watch("bank") || "-"}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-300">
                      Agência
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {watch("agency") || "-"}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-300">
                      Conta
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {watch("account") || "-"}
                    </span>
                  </li>
                </>
              ) : (
                <li className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-300">
                    Chave PIX
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">
                    {watch("pixKey") || "-"}
                  </span>
                </li>
              )}

              <li className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-300">
                  Valor
                </span>
                <span
                  className={`font-semibold ${insufficient ? "text-rose-600" : "text-slate-800 dark:text-slate-100"}`}
                >
                  {brl(Number(amount || 0))}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-300">Data</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {watch("date")}
                </span>
              </li>
              {watch("description") && (
                <li className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-300">
                    Descrição
                  </span>
                  <span className="max-w-[55%] text-right text-slate-800 dark:text-slate-100">
                    {watch("description")}
                  </span>
                </li>
              )}
            </ul>

            <hr className="my-4 border-slate-200 dark:border-slate-700" />
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Confira os dados antes de confirmar. Em produção, a autenticação
              forte (2FA) pode ser exigida.
            </div>
          </aside>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          modalKind === "success"
            ? "Transferência realizada"
            : "Falha na transferência"
        }
        footer={
          modalKind === "success" ? (
            <button
              onClick={() => setModalOpen(false)}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              OK
            </button>
          ) : (
            <button
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/50"
            >
              Tentar novamente
            </button>
          )
        }
      >
        {modalKind === "success" ? (
          <div className="space-y-2">
            <p className="text-emerald-600 dark:text-emerald-400 font-medium">
              Tudo certo! 🎉
            </p>
            <p>O valor foi enviado e seu saldo já foi atualizado.</p>
            {lastTxId && (
              <p className="text-xs text-slate-500">
                Protocolo: <span className="font-mono">{lastTxId}</span>
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-rose-600 dark:text-rose-400 font-medium">
              Não foi possível concluir.
            </p>
            <p className="text-sm">
              {txError || "Verifique os dados e tente novamente."}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
