import reducer, { setFilters, clearError } from "../../src/store/transactionsSlice";

describe("transactionsSlice - reducers", () => {
  test("setFilters mescla filtros", () => {
    const st1 = reducer(undefined, { type: "@@INIT" });
    const st2 = reducer(st1, setFilters({ type: "PIX" as any, amountFrom: 50 }));
    expect(st2.filters.type).toBe("PIX");
    expect(st2.filters.amountFrom).toBe(50);
    expect(st2.filters.sort).toBe("desc"); 
  });

  test("clearError limpa error", () => {
    const st1 = reducer(undefined, { type: "@@INIT" });
    const stErr = reducer(st1, { type: "tx/fetch/rejected", payload: "Falha" });
    expect(stErr.error).toBe("Falha");

    const st2 = reducer(stErr, clearError());
    expect(st2.error).toBeNull();
  });
});
