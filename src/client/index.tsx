import "./clarity";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app.js";

try {
  const registration = await navigator.serviceWorker.register(
    "/service-worker.js",
    { type: "module" },
  );

  registration.onupdatefound = () => {
    const installing = registration.installing;
    if (installing) {
      installing.onstatechange = () => {
        if (
          installing.state === "activated" &&
          // 古いService Workerが存在する場合
          navigator.serviceWorker.controller
        ) {
          location.reload();
        }
      };
    }
  };
} catch (exception) {
  console.error(exception);
}

const container = document.createElement("div");
document.body.append(container);
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
