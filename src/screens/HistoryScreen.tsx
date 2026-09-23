import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../auth";
import { api } from "../api";
import { Badge, Card, EmptyState, IconWell, Screen, SectionLabel, Title } from "../components/ui";
import { durationBetween, formatDate, formatTime } from "../datetime";
import { iconForProject } from "../icons";
import type { Attendance, DailyReport } from "../types";
import { colors } from "../theme";

export function HistoryScreen() {
  const { token } = useAuth();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [records, setRecords] = useState<Attendance[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    try {
      const [r, a] = await Promise.all([api.reports(token), api.attendance(token)]);
      setReports(r.reports);
      setRecords(a.records);
    } finally {
      setBusy(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl onRefresh={load} refreshing={busy} tintColor={colors.leaf} />}
      >
        <Title>History</Title>
        <Text style={styles.lead}>Check-in times and reports in Pakistan time.</Text>

        <SectionLabel>Attendance</SectionLabel>
        {records.length === 0 ? (
          <EmptyState hint="Your first check-in will appear here." icon="time-outline" title="No attendance yet" />
        ) : (
          records.map((row) => (
            <Card key={row.id} style={styles.card}>
              <View style={styles.row}>
                <IconWell name={row.checkOutAt ? "checkmark-circle-outline" : "radio-button-on"} tone={row.checkOutAt ? "muted" : "gold"} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.strong}>{formatDate(row.date)}</Text>
                  <Text style={styles.meta}>
                    In {formatTime(row.checkInAt)}
                    {row.checkOutAt
                      ? `  ·  Out ${formatTime(row.checkOutAt)}  ·  ${durationBetween(row.checkInAt, row.checkOutAt)}`
                      : "  ·  Still on duty"}
                  </Text>
                </View>
                <Badge label={row.checkOutAt ? "Out" : "On duty"} tone={row.checkOutAt ? "muted" : "gold"} />
              </View>
            </Card>
          ))
        )}

        <SectionLabel>Reports</SectionLabel>
        {reports.length === 0 ? (
          <EmptyState hint="Submit a daily report from the Report tab." icon="document-text-outline" title="No reports yet" />
        ) : (
          reports.map((report) => (
            <Card key={report.id} style={styles.card}>
              <View style={styles.row}>
                <IconWell name={iconForProject(report.project.type)} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.strong}>{formatDate(report.date)}</Text>
                  <Text style={styles.meta}>{report.project.name}</Text>
                </View>
              </View>
              <Text style={styles.body}>{report.summary}</Text>
              <Text style={styles.details}>{report.details}</Text>
            </Card>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 36 },
  lead: { color: colors.muted, marginTop: 6, marginBottom: 8, lineHeight: 21 },
  card: { marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  strong: { fontWeight: "800", color: colors.ink, fontSize: 16 },
  meta: { color: colors.muted, marginTop: 3, fontWeight: "600", fontSize: 13 },
  body: { marginTop: 12, color: colors.ink, fontSize: 15, lineHeight: 22, fontWeight: "600" },
  details: { marginTop: 4, color: colors.muted, lineHeight: 21 },
});
