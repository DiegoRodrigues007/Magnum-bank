import { ArrowUpRight, type LucideIcon } from "lucide-react";
import type { Transaction } from "../types/transaction";

type TxKind = Transaction["type"];

export type TypeMeta = {
  label: string;
  Icon: LucideIcon;
  className: string;
};

export const typeMeta: Record<Extract<TxKind, "PIX" | "TED">, TypeMeta> = {
  PIX: { label: "PIX", Icon: ArrowUpRight, className: "text-cyan-600" },
  TED: { label: "TED", Icon: ArrowUpRight, className: "text-indigo-600" },
};

export const defaultTypeMeta: TypeMeta = {
  label: "Mov.",
  Icon: ArrowUpRight,
  className: "text-slate-300",
};
