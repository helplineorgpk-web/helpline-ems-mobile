import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../auth";
import { API_BASE } from "../api";
import { Avatar, Button, Card, Icon, IconWell, Screen } from "../components/ui";
import { colors } from "../theme";

export function ProfileScreen() {
  const { employee, logout } = useAuth();

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient colors={[colors.forestDeep, colors.forest]} style={styles.hero}>
          <Avatar name={employee?.name} size={76} />
          <Text style={styles.name}>{employee?.name}</Text>
          <Text style={styles.role}>
            {employee?.role === "SUPERVISOR" ? "Supervisor" : "Staff"} · {employee?.designation}
          </Text>
        </LinearGradient>

        <View style={styles.body}>
          <Card>
            <Row icon="id-card-outline" label="Employee code" value={employee?.employeeCode} />
            <Row icon="mail-outline" label="Email" value={employee?.email} />
            <Pressable
              onPress={() => employee?.phone && Linking.openURL(`tel:${employee.phone}`)}
              disabled={!employee?.phone}
            >
              <Row
                icon="call-outline"
                label="Contact"
                last
                trailing={employee?.phone ? "call-outline" : undefined}
                value={employee?.phone || "—"}
              />
            </Pressable>
          </Card>

          <Card style={{ marginTop: 12 }}>
            <View style={styles.note}>
              <IconWell name="information-circle-outline" />
              <Text style={styles.noteText}>
                This account is created by admin on the Helpline dashboard. Password resets are done there.
              </Text>
            </View>
          </Card>

          <View style={{ height: 18 }} />
          <Button
            icon="log-out-outline"
            label="Log out"
            onPress={() =>
              Alert.alert("Log out", "Sign out of the staff app?", [
                { text: "Cancel", style: "cancel" },
                { text: "Log out", style: "destructive", onPress: () => logout() },
              ])
            }
            tone="danger"
          />
          <Text style={styles.api}>Connected to {API_BASE.replace(/^https?:\/\//, "")}</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

function Row({
  icon,
  label,
  value,
  last,
  trailing,
}: {
  icon: "id-card-outline" | "mail-outline" | "call-outline";
  label: string;
  value?: string | null;
  last?: boolean;
  trailing?: "call-outline";
}) {
  return (
    <View style={[styles.row, !last && styles.border]}>
      <IconWell name={icon} size={40} />
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      {trailing ? <Icon color={colors.leaf} name={trailing} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 36 },
  hero: {
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 36,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  name: { color: colors.white, fontSize: 24, fontWeight: "800", marginTop: 14 },
  role: { color: "rgba(255,255,255,0.72)", marginTop: 4, fontWeight: "600" },
  body: { paddingHorizontal: 20, marginTop: -18 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  border: { borderBottomWidth: 1, borderBottomColor: colors.line },
  label: { color: colors.muted, fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6 },
  value: { color: colors.ink, fontSize: 16, fontWeight: "700", marginTop: 3 },
  note: { flexDirection: "row", gap: 12, alignItems: "center" },
  noteText: { flex: 1, color: colors.muted, lineHeight: 20 },
  api: { color: colors.muted, textAlign: "center", marginTop: 16, fontSize: 11 },
});
