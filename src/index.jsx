import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import "./assets/Styles.scss";
import App from "./App";
import AnalyticsConsent from "./components/AnalyticsConsent";
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import { BrowserRouter } from "react-router-dom";

i18next.init({
  interpolation: { escapeValue: false },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18next}>
      <BrowserRouter>
        <App />
        <AnalyticsConsent />
      </BrowserRouter>
    </I18nextProvider>
  </React.StrictMode>
);
