import { useEffect, useState } from "react";
import { Alert, Dimensions, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../api";
import { useAuth } from "../auth";
import { colors, radii, shadow } from "../theme";
import { FormScroll, useKeyboardHeight } from "../keyboard";
import { Button, Field } from "./ui";

export function DutyButtons() {
  const { token, today, projects, checkin, checkout } = useAuth();
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardHeight();
  const [busy, setBusy] = useState<"in" | "out" | null>(null);
  const [open, setOpen] = useState(false);
  const [projectId, setProjectId] = useState(projects[0]?.id || "");
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [reportSaved, setReportSaved] = useState(false);
  const onDuty = Boolean(today?.checkedIn && !today?.checkedOut);
  const canSubmit = reportSaved || (Boolean(projectId) && summary.trim().length >= 5 && details.trim().length >= 10);

  useEffect(() => {
    if (!projectId && projects[0]?.id) setProjectId(projects[0].id);
  }, [projectId, projects]);

  async function onCheckin() {
    setBusy("in");
    try {
      await checkin(projects[0]?.id);
    } catch (err) {
      Alert.alert("Could not check in", err instanceof Error ? err.message : "Try again");
    } finally {
      setBusy(null);
    }
  }

  function onCheckout() {
    if (!today?.checkedIn) {
      Alert.alert("Check in first", "Start duty before you check out.");
      return;
    }
    setError(null);
    setReportSaved(false);
    setOpen(true);
  }

  function close() {
    if (busy === "out") return;
    setOpen(false);
  }

  async function submitAndCheckout() {
    if (!token || !canSubmit) return;
    setBusy("out");
    setError(null);
    try {
      if (!reportSaved) {
        const alreadyWrote = today?.reports?.some((report) => report.project?.id === projectId);
        try {
          await api.submitReport(token, { projectId, summary: summary.trim(), details: details.trim() });
        } catch (err) {
          if (!alreadyWrote) throw err;
        }
        setReportSaved(true);
      }
      await checkout();
      setSummary("");
      setDetails("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not check out");
    } finally {
      setBusy(null);
    }
  }

  return (
    <View style={styles.row}>
      <View style={styles.col}>
        <Button disabled={onDuty} icon="enter-outline" label="Check in" loading={busy === "in"} onPress={onCheckin} />
      </View>
      <View style={styles.col}>
        <Button icon="exit-outline" label="Check out" loading={busy === "out" && !open} onPress={onCheckout} tone="dark" />
      </View>

      <Modal animationType="slide" onRequestClose={close} transparent visible={open}>
        <View style={styles.modal}>
          <Pressable accessibilityLabel="Close report" onPress={close} style={styles.backdrop} />
          <View
            style={[
              styles.sheet,
              shadow.bar,
              {
                marginBottom: keyboard.height,
                maxHeight: Dimensions.get("window").height - keyboard.height - insets.top - 12,
                paddingBottom: keyboard.height > 0 ? 12 : Math.max(insets.bottom, 16),
              },
            ]}
          >
            <View style={styles.handle} />
            <FormScroll
              contentContainerStyle={styles.sheetContent}
              fill={false}
              padForKeyboard={false}
              style={{ maxHeight: Math.max(240, Dimensions.get("window").height - keyboard.height - insets.top - 72) }}
            >
              <Text style={styles.title}>Daily report</Text>
              <Text style={styles.lead}>Write today's report to finish checkout. Duty stays open until this is sent.</Text>
              {projects.length > 1 ? (
                <View style={styles.projects}>
                  {projects.map((project) => {
                    const active = projectId === project.id;
                    return (
                      <Pressable
                        key={project.id}
                        onPress={() => setProjectId(project.id)}
                        style={[styles.chip, active && styles.chipOn]}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextOn]}>{project.name}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Field
                icon="reader-outline"
                label="Short summary"
                onChangeText={setSummary}
                placeholder="What you completed today"
                value={summary}
              />
              <Field
                label="Full details"
                multiline
                onChangeText={setDetails}
                placeholder="Classes taken, visits, tasks completed…"
                value={details}
              />
              <Text style={styles.hint}>Summary needs 5 characters. Details need 10.</Text>
              <Button
                disabled={!canSubmit}
                icon="exit-outline"
                label="Save report and check out"
                loading={busy === "out"}
                onPress={submitAndCheckout}
              />
              <View style={styles.cancelGap} />
              <Button label="Cancel" onPress={close} tone="ghost" />
            </FormScroll>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
  col: { flex: 1 },
  modal: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(12,34,24,0.45)" },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "88%",
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  sheetContent: { paddingBottom: 8 },
  handle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    marginBottom: 14,
  },
  title: { fontSize: 24, fontWeight: "800", color: colors.ink, letterSpacing: -0.4 },
  lead: { color: colors.muted, marginTop: 6, marginBottom: 16, lineHeight: 21 },
  projects: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  chip: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.canvas,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipOn: { backgroundColor: colors.leafSoft, borderColor: colors.leaf },
  chipText: { color: colors.muted, fontWeight: "700", fontSize: 13 },
  chipTextOn: { color: colors.leafDark },
  error: {
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    borderRadius: 12,
    overflow: "hidden",
    padding: 12,
    marginBottom: 12,
    fontWeight: "600",
  },
  hint: { color: colors.muted, fontSize: 12, marginTop: -4, marginBottom: 12 },
  cancelGap: { height: 8 },
});
