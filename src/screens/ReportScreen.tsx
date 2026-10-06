import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../auth";
import { api } from "../api";
import { DutyButtons } from "../components/duty-buttons";
import { Badge, Button, Card, EmptyState, Field, Icon, IconWell, Screen, SectionLabel, Title } from "../components/ui";
import { Rise } from "../motion";
import { formatTime } from "../datetime";
import { iconForProject } from "../icons";
import { colors } from "../theme";
import { FormScroll } from "../keyboard";

export function ReportScreen() {
  const { token, projects, today, refresh } = useAuth();
  const [projectId, setProjectId] = useState(projects[0]?.id || "");
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId && projects[0]?.id) setProjectId(projects[0].id);
  }, [projectId, projects]);

  async function submit() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      await api.submitReport(token, { projectId, summary, details });
      setSummary("");
      setDetails("");
      await refresh();
      Alert.alert("Report sent", "Your report was saved. Use Check out when you finish work.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit report");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <FormScroll contentContainerStyle={styles.content}>
        <Rise>
        <Title>Daily report</Title>
        <Text style={styles.lead}>
          Check in when you start. You can send more than one report today, then check out when you leave.
        </Text>

        <View style={{ marginTop: 8, marginBottom: 8 }}>
          <DutyButtons />
        </View>

        {today?.reports?.length ? (
          <View style={{ marginTop: 8 }}>
            <SectionLabel>Submitted today ({today.reports.length})</SectionLabel>
            {today.reports.map((report) => (
              <Card key={report.id} style={styles.doneCard}>
                <View style={styles.doneHead}>
                  <IconWell name="checkmark-circle" />
                  <View style={{ flex: 1 }}>
                    <Badge icon="checkmark" label={formatTime(report.createdAt)} />
                    <Text style={styles.doneTitle}>{report.project.name}</Text>
                  </View>
                </View>
                <Text style={styles.doneBody}>{report.summary}</Text>
                <Text style={styles.doneDetails}>{report.details}</Text>
              </Card>
            ))}
          </View>
        ) : null}

        {projects.length === 0 ? (
          <EmptyState
            hint="Ask admin to assign you from the Helpline dashboard."
            icon="briefcase-outline"
            title="No project assigned"
          />
        ) : (
          <View style={{ marginTop: 8 }}>
            <SectionLabel>Add another report</SectionLabel>
            {projects.map((project) => {
              const active = projectId === project.id;
              return (
                <Pressable key={project.id} onPress={() => setProjectId(project.id)}>
                  <Card style={[styles.choice, active && styles.choiceOn]}>
                    <IconWell name={iconForProject(project.type)} tone={active ? "leaf" : "muted"} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.choiceTitle}>{project.name}</Text>
                      <Text style={styles.choiceMeta}>{project.type.replaceAll("_", " ")}</Text>
                    </View>
                    <Icon
                      color={active ? colors.leaf : colors.line}
                      name={active ? "radio-button-on" : "radio-button-off-outline"}
                    />
                  </Card>
                </Pressable>
              );
            })}
            {error ? (
              <View style={styles.error}>
                <Icon color={colors.danger} name="alert-circle" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            <Field icon="reader-outline" label="Short summary" onChangeText={setSummary} value={summary} />
            <Field
              label="Full details"
              multiline
              onChangeText={setDetails}
              placeholder="Classes taken, visits, tasks completed…"
              value={details}
            />
            <Button
              disabled={!projectId || summary.trim().length < 5 || details.trim().length < 10}
              icon="send-outline"
              label="Submit report"
              loading={loading}
              onPress={submit}
            />
          </View>
        )}
        </Rise>
      </FormScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40 },
  lead: { color: colors.muted, marginTop: 6, marginBottom: 10, lineHeight: 21, fontSize: 15 },
  choice: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  choiceOn: { borderColor: colors.leaf, backgroundColor: colors.leafSoft, borderLeftWidth: 3, borderLeftColor: colors.gold },
  choiceTitle: { fontWeight: "800", color: colors.ink, fontSize: 16 },
  choiceMeta: { color: colors.muted, marginTop: 2, fontWeight: "600", fontSize: 12 },
  error: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    backgroundColor: colors.dangerSoft,
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  errorText: { color: colors.danger, fontWeight: "600", flex: 1 },
  doneCard: { marginBottom: 10 },
  doneHead: { flexDirection: "row", gap: 12, alignItems: "center" },
  doneTitle: { fontSize: 17, fontWeight: "800", color: colors.ink, marginTop: 6 },
  doneBody: { fontSize: 16, color: colors.ink, marginTop: 12, fontWeight: "600" },
  doneDetails: { color: colors.muted, marginTop: 6, lineHeight: 21 },
});
