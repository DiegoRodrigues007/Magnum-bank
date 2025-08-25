import { groupByDayBR } from "../../src/utils/transactions";
import { formatDate } from "../../src/utils/format";
import type { Transaction } from "../../src/types/transaction";

const tx = (partial: Partial<Transaction>, i: number): Transaction => ({
  id: i,
  userId: partial.userId ?? 1,
  type: partial.type ?? "PIX",
  beneficiary: partial.beneficiary ?? "Fulano",
  document: partial.document ?? "00000000000",
  bank: partial.bank ?? null,
  agency: partial.agency ?? null,
  account: partial.account ?? null,
  pixKey: partial.pixKey ?? null,
  date: partial.date ?? "2025-08-24",
  amount: partial.amount ?? 10,
  balanceAfter: partial.balanceAfter ?? 1000,
});

describe("utils/transactions::groupByDayBR", () => {
  test("agrupa por dia em pt-BR e mantém ordem cronológica desc por padrão", () => {
    const data: Transaction[] = [
      tx({ date: "2025-08-24", amount: 100 }, 1),
      tx({ date: "2025-08-24", amount: -50 }, 2),
      tx({ date: "2025-08-23", amount: 10 }, 3),
      tx({ date: "2025-08-22", amount: 5 }, 4),
      tx({ date: "2025-08-23", amount: -1 }, 5),
    ];

    const grouped = groupByDayBR(data, (t) => t.date);

    const label = (d: string) => formatDate(d);

    expect(Array.isArray(grouped)).toBe(true);
    expect(grouped.length).toBe(3);

    expect(grouped[0][0]).toBe(label("2025-08-24"));
    expect(grouped[1][0]).toBe(label("2025-08-23"));
    expect(grouped[2][0]).toBe(label("2025-08-22"));

    expect(grouped[0][1]).toHaveLength(2);
    expect(grouped[1][1]).toHaveLength(2);
    expect(grouped[2][1]).toHaveLength(1);
  });
});
