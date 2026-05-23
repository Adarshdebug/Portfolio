import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { request } from "../lib/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("portfolio_token");
    if (!token) {
      setBooting(false);
      return;
    }

    request("/auth/me")
      .then((data) => setAdmin(data.admin))
      .catch(() => localStorage.removeItem("portfolio_token"))
      .finally(() => setBooting(false));
  }, []);

  const value = useMemo(
    () => ({
      admin,
      booting,
      login: async (email, password) => {
        const data = await request("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password })
        });
        localStorage.setItem("portfolio_token", data.token);
        setAdmin(data.admin);
      },
      logout: () => {
        localStorage.removeItem("portfolio_token");
        setAdmin(null);
      }
    }),
    [admin, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
