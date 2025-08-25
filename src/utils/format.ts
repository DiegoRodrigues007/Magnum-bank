export type ISODateInput = string | Date;

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const DATE_BR = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const isDateOnly = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

const toLocalDate = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const brl = (v: number) => {
  if (v < 0) {
    const abs = Math.abs(v);
    const formattedAbs = BRL.format(abs);
    return formattedAbs.replace(/^R\$\s?/, "R$ -");
  }
  return BRL.format(v);
};
export const currency = brl;

export const dt = (iso: ISODateInput) => {
  if (iso instanceof Date) return new Date(iso.getTime());
  if (typeof iso === "string" && isDateOnly(iso)) return toLocalDate(iso);
  return new Date(iso);
};

export const formatDate = (iso: ISODateInput) => {
  const d = dt(iso);
  return Number.isNaN(d.getTime()) ? String(iso) : DATE_BR.format(d);
};

export const formatDateTime = (iso: ISODateInput) => {
  const d = dt(iso);
  return Number.isNaN(d.getTime())
    ? String(iso)
    : `${DATE_BR.format(d)} ${d.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
};
