import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../auth";
import { api } from "../api";
import { Avatar, Badge, Card, EmptyState, IconWell, Screen, Title } from "../components/ui";
import { formatDate, formatTime } from "../datetime";
import type { TeamMember } from "../types";
import { colors } from "../theme";

export function TeamScreen() {
  const { token } = useAuth();
  const [date, setDate] = useState("");
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const data = await api.team(token);
      setDate(data.date);
      setTeam(data.team);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load team");
    } finally {
      setBusy(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const present = team.filter((m) => m.checkedIn).length;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl onRefresh={load} refreshing={busy} tintColor={colors.leaf} />}
      >
        <Title>Team</Title>
        <Text style={styles.lead}>
          Staff on your projects · {date ? formatDate(date) : "today"} · Pakistan time
        </Text>

        {team.length > 0 ? (
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{team.length}</Text>
              <Text style={styles.statLabel}>People</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{present}</Text>
              <Text style={styles.statLabel}>Checked in</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{team.filter((m) => m.reports.length > 0).length}</Text>
              <Text style={styles.statLabel}>Reports</Text>
            </View>
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {team.length === 0 && !busy && !error ? (
          <EmptyState
            hint="Assign staff to the same projects from the dashboard."
            icon="people-outline"
            title="No team yet"
          />
        ) : null}

        {team.map((member) => (
          <Card key={member.id} style={styles.card}>
            <View style={styles.row}>
              <Avatar name={member.name} size={48} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{member.name}</Text>
                <Text style={styles.sub}>
                  {member.employeeCode} · {member.designation}
                </Text>
              </View>
              <Badge
                icon={member.checkedOut ? "log-out-outline" : member.checkedIn ? "radio-button-on" : "remove-circle-outline"}
                label={member.checkedOut ? "Out" : member.checkedIn ? "In" : "Absent"}
                tone={member.checkedOut ? "muted" : member.checkedIn ? "gold" : "danger"}
              />
            </View>
            <View style={styles.times}>
              <View style={styles.timeChip}>
                <IconWell name="log-in-outline" size={32} />
                <Text style={styles.chipText}>{member.checkInAt ? formatTime(member.checkInAt) : "—"}</Text>
              </View>
              <View style={styles.timeChip}>
                <IconWell name="log-out-outline" size={32} tone="muted" />
                <Text style={styles.chipText}>{member.checkOutAt ? formatTime(member.checkOutAt) : "—"}</Text>
              </View>
            </View>
            <Text style={styles.projects}>{member.projects.map((p) => p.name).join(" · ")}</Text>
            {member.reports.length === 0 ? (
              <Text style={styles.noReport}>No report yet today.</Text>
            ) : (
              member.reports.map((report) => (
                <View key={report.id} style={styles.report}>
                  <Text style={styles.reportTitle}>{report.project.name}</Text>
                  <Text style={styles.reportBody}>{report.summary}</Text>
                </View>
              ))
            )}
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 36 },
  lead: { color: colors.muted, marginTop: 6, marginBottom: 14, lineHeight: 21 },
  stats: { flexDirection: "row", gap: 8, marginBottom: 8 },
  stat: {
    flex: 1,
    backgroundColor: colors.paper,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  statNum: { fontSize: 22, fontWeight: "800", color: colors.forest },
  statLabel: { color: colors.muted, fontWeight: "700", fontSize: 11, marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 },
  card: { marginTop: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  name: { color: colors.ink, fontSize: 17, fontWeight: "800" },
  sub: { color: colors.muted, marginTop: 2, fontWeight: "600", fontSize: 13 },
  times: { flexDirection: "row", gap: 10, marginTop: 14 },
  timeChip: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  chipText: { fontWeight: "800", color: colors.ink },
  projects: { color: colors.muted, marginTop: 12, fontWeight: "600" },
  noReport: { color: colors.muted, marginTop: 8, fontStyle: "italic" },
  report: { marginTop: 10, backgroundColor: colors.leafSoft, borderRadius: 14, padding: 12 },
  reportTitle: { fontWeight: "800", color: colors.forest, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  reportBody: { color: colors.ink, marginTop: 4, fontWeight: "600" },
  error: {
    marginTop: 8,
    backgroundColor: colors.dangerSoft,
    color: colors.danger,
    padding: 12,
    borderRadius: 12,
    overflow: "hidden",
    fontWeight: "600",
  },
});
