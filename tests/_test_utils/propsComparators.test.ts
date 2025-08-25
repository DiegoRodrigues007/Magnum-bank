import { areArraysEqual, areTxPropsEqual } from "../../src/utils/propsComparators";
import type { Transaction } from "../../src/types/transaction";

const makeTx = (id: number, amount = 10): Transaction => ({
  id,
  userId: 1,
  type: "PIX",
  beneficiary: "João",
  document: "00000000000",
  bank: null,
  agency: null,
  account: null,
  pixKey: null,
  date: "2025-08-24",
  amount,
  balanceAfter: 1000, 
});

describe("utils/propsComparators::areArraysEqual", () => {
  test("true para mesma referência", () => {
    const arr = [1, 2, 3];
    expect(areArraysEqual(arr, arr)).toBe(true);
  });

  test("false para tamanhos diferentes", () => {
    expect(areArraysEqual([1, 2], [1])).toBe(false);
  });

  test("usa eq customizado quando fornecido", () => {
    const a = [{ x: 1 }, { x: 2 }];
    const b = [{ x: 1 }, { x: 2 }];
    const eq = (m: { x: number }, n: { x: number }) => m.x === n.x;
    expect(areArraysEqual(a, b, eq)).toBe(true);
  });
});

describe("utils/propsComparators::areTxPropsEqual", () => {
  test("true quando balance e transações são iguais", () => {
    const prev = { balance: 1000, transactions: [makeTx(1), makeTx(2)] };
    const next = { balance: 1000, transactions: [makeTx(1), makeTx(2)] };
    expect(areTxPropsEqual(prev, next)).toBe(true);
  });

  test("false quando balance muda", () => {
    const prev = { balance: 1000, transactions: [makeTx(1)] };
    const next = { balance: 999, transactions: [makeTx(1)] };
    expect(areTxPropsEqual(prev, next)).toBe(false);
  });

  test("false quando alguma transação muda (ex.: amount)", () => {
    const prev = { balance: 1000, transactions: [makeTx(1, 10), makeTx(2, 5)] };
    const next = { balance: 1000, transactions: [makeTx(1, 10), makeTx(2, 7)] }; 
    expect(areTxPropsEqual(prev, next)).toBe(false);
  });
});
