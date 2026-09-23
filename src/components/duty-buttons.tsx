import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useAuth } from "../auth";
import { Button } from "./ui";

export function DutyButtons() {
  const { today, projects, checkin, checkout } = useAuth();
  const [busy, setBusy] = useState<"in" | "out" | null>(null);
  const checkedIn = Boolean(today?.checkedIn);
  const onDuty = Boolean(today?.checkedIn && !today?.checkedOut);

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
    Alert.alert("Check out", "End duty for today?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Check out",
        onPress: async () => {
          setBusy("out");
          try {
            await checkout();
          } catch (err) {
            Alert.alert("Could not check out", err instanceof Error ? err.message : "Try again");
          } finally {
            setBusy(null);
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.row}>
      <View style={styles.col}>
        <Button
          disabled={checkedIn}
          icon="enter-outline"
          label="Check in"
          loading={busy === "in"}
          onPress={onCheckin}
        />
      </View>
      <View style={styles.col}>
        <Button
          disabled={!onDuty}
          icon="exit-outline"
          label="Check out"
          loading={busy === "out"}
          onPress={onCheckout}
          tone="dark"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
  col: { flex: 1 },
});
