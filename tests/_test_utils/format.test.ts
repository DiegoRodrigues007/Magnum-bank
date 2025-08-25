import { currency, formatDate, dt } from "../../src/utils/format";

const normalizeSpaces = (s: string) => s.replace(/\u00A0/g, " ");

describe("utils/format", () => {
  test("currency formata em pt-BR com símbolo de R$", () => {
    expect(normalizeSpaces(currency(0))).toBe("R$ 0,00");
    expect(normalizeSpaces(currency(1234.5))).toBe("R$ 1.234,50");
    expect(normalizeSpaces(currency(-99.99))).toBe("R$ -99,99");
  });

  test("formatDate formata yyyy-mm-dd para dd/mm/yyyy", () => {
    expect(formatDate("2025-08-24")).toBe("24/08/2025");
    expect(formatDate("1999-01-01")).toBe("01/01/1999");
  });

  test("dt cria Date consistente a partir de string ou Date", () => {
    const d1 = dt("2025-08-24");
    expect(d1.getFullYear()).toBe(2025);
    expect(d1.getMonth()).toBe(7); 
    expect(d1.getDate()).toBe(24);

    const d2 = dt(d1); 
    expect(d2.getTime()).toBe(d1.getTime());

    expect(dt("2025-01-01").toString()).not.toBe("");
  });
});
