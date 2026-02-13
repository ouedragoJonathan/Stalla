import React from "react";
import ReactDOM from "react-dom/client";
<<<<<<< HEAD
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./app/AuthContext";
import { router } from "./app/routes";
import "./styles.css";
=======
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./app/AuthContext";
import { App } from "./App";
import "./index.css";
>>>>>>> temp-sync-web

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
<<<<<<< HEAD
      <RouterProvider router={router} />
=======
      <BrowserRouter>
        <App />
      </BrowserRouter>
>>>>>>> temp-sync-web
    </AuthProvider>
  </React.StrictMode>,
);
