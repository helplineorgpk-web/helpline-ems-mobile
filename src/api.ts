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

export const API_BASE =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") || `http://${guessHost()}:3002`;

type LoginResponse = {
  token: string;
  employee: Employee & { projects: Project[] };
};

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, headers, ...rest } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
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
