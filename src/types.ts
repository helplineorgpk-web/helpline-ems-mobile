export type AppRole = "STAFF" | "SUPERVISOR";

export type Employee = {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string | null;
  designation: string;
  role: AppRole;
  status: string;
};

export type TeamMember = {
  id: string;
  name: string;
  employeeCode: string;
  designation: string;
  role: AppRole;
  phone: string | null;
  projects: { id: string; name: string; type: string }[];
  checkedIn: boolean;
  checkedOut: boolean;
  checkInAt: string | null;
  checkOutAt: string | null;
  reports: { id: string; summary: string; project: { id: string; name: string } }[];
};

export type Project = {
  id: string;
  name: string;
  code: string;
  type: string;
  location: string | null;
  description: string | null;
  status: string;
};

export type Attendance = {
  id: string;
  date: string;
  checkInAt: string;
  checkOutAt: string | null;
  project?: Project | null;
};

export type DailyReport = {
  id: string;
  date: string;
  summary: string;
  details: string;
  createdAt: string;
  project: Project;
};

export type TodayStatus = {
  date: string;
  attendance: Attendance | null;
  reports: DailyReport[];
  checkedIn: boolean;
  checkedOut: boolean;
};
