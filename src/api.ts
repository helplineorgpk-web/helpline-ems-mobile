import Constants from "expo-constants";
import { Platform } from "react-native";
import type { Attendance, DailyReport, Employee, Project, TeamMember, TodayStatus } from "./types";

function guessHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.linkingUri?.replace(/^exp:\/\//, "").replace(/\/.*$/, "") ||
    "";
  const host = hostUri.split(":")[0];
  if (host && host !== "localhost" && host !== "127.0.0.1") return host;
  if (Platform.OS === "android") return "10.0.2.2";
  return "127.0.0.1";
}

const PRODUCTION_API = "https://ams.helplinewelfaretrust.org";

function resolveApiBase() {
  const configured = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");
  if (__DEV__) return configured || `http://${guessHost()}:3002`;
  // Store builds must never point at a developer machine or plain http.
  return configured?.startsWith("https://") ? configured : PRODUCTION_API;
}

export const API_BASE = resolveApiBase();

type LoginResponse = {
  token: string;
  employee: Employee & { projects: Project[] };
};

// status is 0 when the server could not be reached at all.
export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

// Offline or server trouble: worth retrying, and no reason to sign the user out.
export function isTemporaryError(err: unknown) {
  return err instanceof ApiError && (err.status === 0 || err.status >= 500);
}

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, headers, ...rest } = options;
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {}),
      },
    });
  } catch {
    throw new ApiError(
      __DEV__
        ? "Could not reach the staff server. Start the admin app on this computer, then try again."
        : "Could not reach the server. Check your internet connection and try again.",
      0
    );
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && token) {
    // The saved session expired or the account was deactivated.
    onUnauthorized?.();
    throw new ApiError("Your session has ended. Please sign in again.", 401);
  }
  if (!res.ok) {
    throw new ApiError((data as { error?: string }).error || `Request failed (${res.status})`, res.status);
  }
  return data as T;
}

export const api = {
  login(email: string, password: string) {
    return request<LoginResponse>("/api/app/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  me(token: string) {
    return request<{ employee: Employee; projects: Project[]; today: TodayStatus }>("/api/app/me", {
      token,
    });
  },
  projects(token: string) {
    return request<{ projects: Project[] }>("/api/app/projects", { token });
  },
  checkin(token: string, projectId?: string) {
    return request<{ attendance: Attendance; alreadyCheckedIn: boolean }>("/api/app/checkin", {
      method: "POST",
      token,
      body: JSON.stringify(projectId ? { projectId } : {}),
    });
  },
  checkout(token: string) {
    return request<{ attendance: Attendance; alreadyCheckedOut: boolean }>("/api/app/checkout", {
      method: "POST",
      token,
    });
  },
  submitReport(
    token: string,
    payload: { projectId: string; summary: string; details: string }
  ) {
    return request<{ report: DailyReport; attendance: Attendance | null }>("/api/app/reports", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },
  reports(token: string) {
    return request<{ reports: DailyReport[] }>("/api/app/reports", { token });
  },
  attendance(token: string) {
    return request<{ records: Attendance[] }>("/api/app/attendance", { token });
  },
  team(token: string) {
    return request<{ date: string; team: TeamMember[] }>("/api/app/team", { token });
  },
};
