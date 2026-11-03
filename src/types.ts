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
  // Closed by the 8 PM auto check-out rather than by the employee.
  autoCheckedOut?: boolean | null;
  project?: Project | null;
};

export type DailyReport = {
  id: string;
  date: string;
  summary: string;
  details: string;
  submittedLate?: boolean | null;
  createdAt: string;
  project: Project;
};

export type TodayStatus = {
  date: string;
  attendance: Attendance | null;
  reports: DailyReport[];
  checkedIn: boolean;
  checkedOut: boolean;
  // Optional: older servers do not send these.
  autoCheckedOut?: boolean;
  checkinClosed?: boolean;
  autoCheckoutTime?: string;
};

// A day in the last few the employee checked in but sent no report.
export type MissedReportDay = {
  date: string;
  month: string;
  monthLabel: string;
  usedInMonth: number;
  remainingInMonth: number;
  canAdd: boolean;
};

export type MissedReports = {
  windowDays: number;
  limitPerMonth: number;
  days: MissedReportDay[];
};
