import { server } from "../../src/mocks/server"; 
import { jpost, resetTokens } from "./http";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(async () => {
  resetTokens();
  await jpost("/__test/reset", {}, { noAuth: true });
});
