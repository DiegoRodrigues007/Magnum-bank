import { dt, formatDate } from "./format";

export type ISODateInput = string | Date;

type Grouped<T> = [label: string, items: T[]];

export function groupByDayBR<T>(
  items: T[],
  getDate: (item: T) => ISODateInput,
  opts?: { descending?: boolean }
): Array<Grouped<T>> {
  const descending = opts?.descending !== false;
  const map = new Map<string, { items: T[]; dayTs: number }>();

  for (const it of items) {
    const d = dt(getDate(it));
    const label = formatDate(d);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayTs = dayStart.getTime();

    const bucket = map.get(label);
    if (!bucket) {
      map.set(label, { items: [it], dayTs });
    } else {
      bucket.items.push(it);
    }
  }

  const arr = Array.from(map.entries());
  arr.sort((a, b) =>
    descending ? b[1].dayTs - a[1].dayTs : a[1].dayTs - b[1].dayTs
  );

  return arr.map(([label, { items }]) => [label, items]);
}
