import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import ContextProviders from "./context/ContextProviders";
import App from "./App";
import { FIYOGQL_BASE_URI } from "./constants.js";

const client = new ApolloClient({
  uri: FIYOGQL_BASE_URI,
  cache: new InMemoryCache(),
});

createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <ApolloProvider client={client}>
    <ContextProviders>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ContextProviders>
  </ApolloProvider>
  // </React.StrictMode>
);
