import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { LangProvider } from "./lib/i18n.jsx";
import { getModel } from "./lib/model.js";
import { AppProvider } from "./lib/store.jsx";
import "./styles.css";

// Start downloading the AI model right away so it's ready by the time a complaint is written.
getModel().catch(() => {});

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <LangProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </LangProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
