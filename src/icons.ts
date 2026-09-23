import { Ionicons } from "@expo/vector-icons";
import { colors } from "./theme";

export type IconName = keyof typeof Ionicons.glyphMap;

export const projectTypeIcon: Record<string, IconName> = {
  SCHOOL: "school-outline",
  MASJID: "moon-outline",
  VTC: "construct-outline",
  ORPHAN: "heart-outline",
  WELFARE: "leaf-outline",
  OTHER: "grid-outline",
};

export function iconForProject(type?: string): IconName {
  return projectTypeIcon[type || ""] || "briefcase-outline";
}

export const tabIcons: Record<string, { on: IconName; off: IconName }> = {
  today: { on: "home", off: "home-outline" },
  report: { on: "document-text", off: "document-text-outline" },
  history: { on: "time", off: "time-outline" },
  team: { on: "people", off: "people-outline" },
  profile: { on: "person", off: "person-outline" },
};

export { Ionicons, colors };
