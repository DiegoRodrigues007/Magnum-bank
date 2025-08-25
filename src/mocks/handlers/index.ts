import { authHandlers } from "./auth";
import { accountHandlers } from "./accounts";
import { transactionHandlers } from "./transactions";
import { testUtilsHandlers } from "./test-utils";

export const handlers = [
  ...authHandlers,
  ...accountHandlers,
  ...transactionHandlers,
  ...testUtilsHandlers, 
];
