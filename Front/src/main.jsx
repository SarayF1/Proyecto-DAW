// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { ThemeProvider } from "@mui/material";
import { theme } from "./theme/theme";
import { GoogleOAuthProvider } from "@react-oauth/google";

const client_id = "798420012132-75ftcllpv2hje8lokrmhmgp85i58o760.apps.googleusercontent.com"

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider theme={theme}>
    <GoogleOAuthProvider clientId={client_id}> 
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
    </GoogleOAuthProvider>
  </ThemeProvider>
);
