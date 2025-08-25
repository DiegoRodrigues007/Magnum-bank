import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

export async function startMocks() {
  await worker.start({
    serviceWorker: { url: "/mockServiceWorker.js" }, 
    onUnhandledRequest: "bypass",
  });
}
