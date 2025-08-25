import { useCallback, useState } from "react";
import { useAppDispatch } from "../store/hooks";
import { createTransaction, fetchTransactions } from "../store/transactionsSlice";

export default function useTransactionSubmit(userId?: number) {
  const dispatch = useAppDispatch();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalKind, setModalKind] = useState<"success" | "error">("success");
  const [lastTxId, setLastTxId] = useState<number | undefined>(undefined);

  const submit = useCallback(
    async (payload: any) => {
      try {
        const tx = await (dispatch as any)(createTransaction(payload)).unwrap();
        setLastTxId(tx?.id);
        setModalKind("success");
        setModalOpen(true);
        if (userId) dispatch(fetchTransactions({ userId }));
        return { ok: true, tx };
      } catch (error) {
        setModalKind("error");
        setModalOpen(true);
        return { ok: false, error };
      }
    },
    [dispatch, userId]
  );

  return { submit, modalOpen, setModalOpen, modalKind, lastTxId };
}
