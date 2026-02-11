import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../services/api";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(localStorage.getItem("token"))
  );

  const login = async (email, password) => {
    const data = await loginRequest(email, password);

    localStorage.setItem("token", data.token);
    setIsAuthenticated(true);
    navigate("/");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
