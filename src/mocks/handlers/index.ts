import { authHandlers } from "./auth";
import { accountHandlers } from "./accounts";
import { transactionHandlers } from "./transactions";

export const handlers = [
  ...authHandlers,
  ...accountHandlers,
  ...transactionHandlers,
];
