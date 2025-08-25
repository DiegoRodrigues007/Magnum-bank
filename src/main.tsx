import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import { initFromStorage, loadSession } from "./store/authSlice";
import { fetchMyAccount } from "./store/accountSlice";
import App from "./App";
import "./styles/globals.css";

declare global {
  interface Window {
    __APP_BOOTSTRAPPED__?: boolean;
  }
}

async function startMocks() {
  if (process.env.VITE_USE_MOCKS === "true") {
    const { worker } = await import("./mocks/browser");
    await worker.start({
      serviceWorker: { url: "/mockServiceWorker.js" },
      onUnhandledRequest: "bypass",
    });
    if ("serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.ready;
      } catch {}
    }
  }
}

const root = ReactDOM.createRoot(document.getElementById("root")!);

function renderApp() {
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  );
}

async function bootstrap() {
  if (window.__APP_BOOTSTRAPPED__) return;
  window.__APP_BOOTSTRAPPED__ = true;

  await startMocks();

  store.dispatch(initFromStorage());

  try {
    await store.dispatch(loadSession()).unwrap();
  } catch {}

  const s = store.getState();
  if (s.auth.user?.id) {
    try {
      await store.dispatch(fetchMyAccount()).unwrap();
    } catch {}
  }

  renderApp();
}

bootstrap().catch((err) => {
  console.warn("[App] Bootstrap warning:", err);
  renderApp();
});
