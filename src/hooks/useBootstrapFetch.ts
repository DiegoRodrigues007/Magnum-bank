import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchTransactions } from "../store/transactionsSlice";

export function useBootstrapFetch() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((s) => s.auth.user?.id);
  const itemsCount = useAppSelector((s) => s.transactions.items.length);
  const status = useAppSelector((s) => s.transactions.status);

  useEffect(() => {
    if (userId && status === "idle" && itemsCount === 0) {
      void dispatch(fetchTransactions({ userId }));
    }
  }, [dispatch, userId, itemsCount, status]);
}
