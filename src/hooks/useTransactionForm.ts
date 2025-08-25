import { useMemo } from "react";
import { useForm } from "react-hook-form";
import type { TransactionFormValues } from "../types/transaction";

export default function useTransactionForm(balance: number) {
  const form = useForm<TransactionFormValues>({
    defaultValues: {
      type: "TED",
      beneficiary: "",
      document: "",
      bank: "",
      agency: "",
      account: "",
      pixKey: "",
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      password: "",
      description: "",
    },
  });

  const amount = form.watch("amount") || 0;
  const type = form.watch("type");
  const insufficient = useMemo(() => amount > balance, [amount, balance]);

  return { ...form, amount, type, insufficient };
}
