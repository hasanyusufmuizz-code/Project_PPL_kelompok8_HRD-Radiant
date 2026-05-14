import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../../lib/api";

interface AuthUser {
  id: number;
  email: string;
  namaLengkap: string;
  role: string;
  avatarUrl: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("hrd_token");
    if (!token) {
      setLoading(false);
      return;
    }
    // Verifikasi token dengan server
    api
      .get<AuthUser>("/auth/me")
      .then((u) => setUser(u))
      .catch(() => localStorage.removeItem("hrd_token"))
      .finally(() => setLoading(false));
  }, []);

  function login(token: string, userData: AuthUser) {
    localStorage.setItem("hrd_token", token);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("hrd_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
