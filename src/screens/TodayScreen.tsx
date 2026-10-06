import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../auth";
import { DutyButtons } from "../components/duty-buttons";
import { Badge, Card, EmptyState, HeroWash, IconWell, Screen, SectionLabel } from "../components/ui";
import { formatTime, formatWeekday, greetingNow } from "../datetime";
import { iconForProject } from "../icons";
import { Pulse, Rise } from "../motion";
import { colors } from "../theme";

export function TodayScreen() {
  const { employee, projects, today, refresh } = useAuth();
  const [busy, setBusy] = useState(false);
  const firstName = employee?.name?.split(" ")[0] || "there";
  const onDuty = Boolean(today?.checkedIn && !today?.checkedOut);

  const onRefresh = useCallback(async () => {
    setBusy(true);
    try {
      await refresh();
    } finally {
      setBusy(false);
    }
  }, [refresh]);

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={busy} tintColor={colors.leaf} />}
      >
        <HeroWash style={styles.hero}>
          <Rise>
            <Text style={styles.date}>{formatWeekday()}</Text>
            <Text style={styles.hello}>
              {greetingNow()}, {firstName}
            </Text>
            <View style={styles.metaRow}>
              <Badge
                icon={employee?.role === "SUPERVISOR" ? "star" : "person"}
                label={employee?.role === "SUPERVISOR" ? "Supervisor" : "Staff"}
                tone="gold"
              />
              <Text style={styles.metaText}>
                {employee?.designation} · {employee?.employeeCode}
              </Text>
            </View>
          </Rise>
        </HeroWash>

        <View style={styles.body}>
          <Rise delay={90}>
          <Card style={styles.attendance}>
            <View style={styles.row}>
              <View>
                <Text style={styles.cardEyebrow}>Today’s attendance</Text>
                <Text style={styles.cardTitle}>Duty clock</Text>
              </View>
              <Pulse active={onDuty}>
                <Badge
                  icon={today?.checkedOut ? "checkmark-circle" : today?.checkedIn ? "radio-button-on" : "time-outline"}
                  label={today?.checkedOut ? "Checked out" : today?.checkedIn ? "On duty" : "Not in"}
                  tone={today?.checkedOut ? "muted" : today?.checkedIn ? "gold" : "danger"}
                />
              </Pulse>
            </View>

            <View style={styles.times}>
              <View style={styles.timeTile}>
                <IconWell name="log-in-outline" tone="leaf" />
                <View>
                  <Text style={styles.timeLabel}>Check-in</Text>
                  <Text style={styles.time}>
                    {today?.attendance?.checkInAt ? formatTime(today.attendance.checkInAt) : "—"}
                  </Text>
                </View>
              </View>
              <View style={styles.timeTile}>
                <IconWell name="log-out-outline" tone={today?.checkedOut ? "leaf" : "muted"} />
                <View>
                  <Text style={styles.timeLabel}>Check-out</Text>
                  <Text style={styles.time}>
                    {today?.attendance?.checkOutAt ? formatTime(today.attendance.checkOutAt) : "—"}
                  </Text>
                </View>
              </View>
            </View>

            <DutyButtons />
            <View style={styles.note}>
              <IconWell name={onDuty ? "leaf-outline" : today?.checkedOut ? "checkmark-done-outline" : "time-outline"} size={36} />
              <Text style={styles.noteText}>
                {!today?.checkedIn
                  ? "Tap Check in when you start work. Check out asks for today's report."
                  : today.checkedOut
                    ? "Duty is closed for today. Check in again when you return."
                    : "You are on duty. Check out opens your daily report, then ends duty."}
              </Text>
            </View>
          </Card>
          </Rise>

          <SectionLabel>Assigned projects</SectionLabel>
          {projects.length === 0 ? (
            <EmptyState
              hint="Ask admin to assign you from the Helpline dashboard."
              icon="briefcase-outline"
              title="No project yet"
            />
          ) : (
            projects.map((project, index) => (
              <Rise key={project.id} delay={140 + index * 60}>
                <Card style={styles.project}>
                  <IconWell name={iconForProject(project.type)} />
                  <View style={{ flex: 1 }}>
                    <Badge label={project.type.replaceAll("_", " ")} />
                    <Text style={styles.projectName}>{project.name}</Text>
                    <Text style={styles.projectMeta}>{project.location || project.code}</Text>
                  </View>
                </Card>
              </Rise>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 28 },
  hero: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 42,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  date: { color: colors.gold, fontWeight: "800", fontSize: 12, letterSpacing: 0.8, textTransform: "uppercase" },
  hello: { color: colors.white, fontSize: 32, fontWeight: "800", marginTop: 8, letterSpacing: -0.7 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14 },
  metaText: { color: "rgba(255,255,255,0.78)", fontWeight: "600", flex: 1 },
  body: { paddingHorizontal: 18, marginTop: -22 },
  attendance: { marginBottom: 22 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  cardEyebrow: { color: colors.muted, fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" },
  cardTitle: { fontSize: 20, fontWeight: "800", color: colors.ink, marginTop: 2 },
  times: { flexDirection: "row", gap: 10, marginVertical: 16 },
  timeTile: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.canvas,
    borderRadius: 18,
    padding: 10,
  },
  timeLabel: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  time: { fontSize: 20, fontWeight: "800", color: colors.ink, marginTop: 2 },
  note: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.leafSoft, borderRadius: 16, padding: 12, marginTop: 12 },
  noteText: { flex: 1, color: colors.forest, fontWeight: "600", lineHeight: 20 },
  project: { flexDirection: "row", gap: 14, alignItems: "center", marginBottom: 10 },
  projectName: { fontSize: 17, fontWeight: "800", color: colors.ink, marginTop: 6 },
  projectMeta: { color: colors.muted, marginTop: 2, fontWeight: "600" },
});
