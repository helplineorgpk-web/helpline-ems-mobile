import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { clearStoredToken, getStoredToken, setStoredToken } from "./storage";
import type { Employee, Project, TodayStatus } from "./types";

type AuthState = {
  ready: boolean;
  token: string | null;
  employee: Employee | null;
  projects: Project[];
  today: TodayStatus | null;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  checkin: (projectId?: string) => Promise<void>;
  checkout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [today, setToday] = useState<TodayStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hydrate = useCallback(async (nextToken: string) => {
    const data = await api.me(nextToken);
    setEmployee(data.employee);
    setProjects(data.projects);
    setToday(data.today);
    setToken(nextToken);
    setError(null);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const stored = await getStoredToken();
        if (stored) await hydrate(stored);
      } catch {
        await clearStoredToken();
        setToken(null);
      } finally {
        setReady(true);
      }
    })();
  }, [hydrate]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.login(email.trim(), password);
      await setStoredToken(res.token);
      await hydrate(res.token);
    },
    [hydrate]
  );

  const logout = useCallback(async () => {
    await clearStoredToken();
    setToken(null);
    setEmployee(null);
    setProjects([]);
    setToday(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!token) return;
    await hydrate(token);
  }, [hydrate, token]);

  const checkin = useCallback(
    async (projectId?: string) => {
      if (!token) return;
      await api.checkin(token, projectId);
      await hydrate(token);
    },
    [hydrate, token]
  );

  const checkout = useCallback(async () => {
    if (!token) return;
    await api.checkout(token);
    await hydrate(token);
  }, [hydrate, token]);

  const value = useMemo(
    () => ({
      ready,
      token,
      employee,
      projects,
      today,
      error,
      login,
      logout,
      refresh,
      checkin,
      checkout,
    }),
    [ready, token, employee, projects, today, error, login, logout, refresh, checkin, checkout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
