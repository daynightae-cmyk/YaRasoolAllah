import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(<App />);

// Progressive web app: register the institution service worker in production
// builds only, so the Vite dev server keeps serving fresh modules. The worker
// never caches /api/* — live provider-governed content stays live.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline caching is an enhancement; failure must not break the app.
    });
  });
}
