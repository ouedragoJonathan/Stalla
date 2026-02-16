import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { clearSession, getToken, getUser } from "../core/storage";
import type { AuthUser } from "../core/types";
import { login, registerAdmin } from "../features/auth/authService";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginAdmin: (identifier: string, password: string) => Promise<{ ok: boolean; message: string }>;
  registerAdmin: (name: string, email: string, password: string) => Promise<{ ok: boolean; message: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getUser());
  const hasToken = !!getToken();

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user && hasToken,
      isAdmin: user?.role === "ADMIN",
      loginAdmin: async (identifier, password) => {
        const response = await login({ identifier, password });
        if (!response.success) return { ok: false, message: response.message };
        if (response.data.user.role !== "ADMIN") {
          clearSession();
          setUser(null);
          return { ok: false, message: "Accès refusé: compte non administrateur." };
        }
        setUser(response.data.user);
        return { ok: true, message: response.message };
      },
      registerAdmin: async (name, email, password) => {
        const response = await registerAdmin({ name, email, password });
        if (!response.success) return { ok: false, message: response.message };
        return { ok: true, message: response.message };
      },
      logout: () => {
        clearSession();
        setUser(null);
      },
    }),
    [user, hasToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
