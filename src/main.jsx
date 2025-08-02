import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import ContextProviders from "./context/ContextProviders";
import client from "./utils/apolloClient.js";
import App from "./App";

if (import.meta.env.VITE_ENV === "production") {
  console.error = () => {};
  console.warn = () => {};
  console.log = () => {};
  console.debug = () => {};
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ApolloProvider client={client}>
        <ContextProviders>
          <App />
        </ContextProviders>
      </ApolloProvider>
    </BrowserRouter>
  </React.StrictMode>
);
