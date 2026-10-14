import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, isTemporaryError, setUnauthorizedHandler } from "./api";
import { clearStoredToken, getStoredToken, setStoredToken } from "./storage";
import type { Employee, Project, TodayStatus } from "./types";

type AuthState = {
  ready: boolean;
  token: string | null;
  employee: Employee | null;
  projects: Project[];
  today: TodayStatus | null;
  error: string | null;
  bootError: string | null;
  retryBoot: () => Promise<void>;
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
  const [bootError, setBootError] = useState<string | null>(null);

  const hydrate = useCallback(async (nextToken: string) => {
    const data = await api.me(nextToken);
    setEmployee(data.employee);
    setProjects(data.projects);
    setToday(data.today);
    setToken(nextToken);
    setError(null);
  }, []);

  const boot = useCallback(async () => {
    setReady(false);
    setBootError(null);
    try {
      const stored = await getStoredToken();
      if (stored) await hydrate(stored);
    } catch (err) {
      if (isTemporaryError(err)) {
        // Keep the saved session so staff with weak signal are not signed out.
        setBootError(err instanceof Error ? err.message : "Could not reach the server");
      } else {
        await clearStoredToken();
        setToken(null);
      }
    } finally {
      setReady(true);
    }
  }, [hydrate]);

  useEffect(() => {
    boot();
  }, [boot]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.login(email.trim(), password);
      await setStoredToken(res.token);
      await hydrate(res.token);
    },
    [hydrate]
  );

  const clearSession = useCallback(async () => {
    await clearStoredToken();
    setToken(null);
    setEmployee(null);
    setProjects([]);
    setToday(null);
    setBootError(null);
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    await clearSession();
  }, [clearSession]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setError("Your session has ended. Please sign in again.");
      clearSession();
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

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
      bootError,
      retryBoot: boot,
      login,
      logout,
      refresh,
      checkin,
      checkout,
    }),
    [ready, token, employee, projects, today, error, bootError, boot, login, logout, refresh, checkin, checkout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
