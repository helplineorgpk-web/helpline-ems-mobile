import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AuthProvider, useAuth } from "./src/auth";
import { LoginScreen } from "./src/screens/LoginScreen";
import { TodayScreen } from "./src/screens/TodayScreen";
import { ReportScreen } from "./src/screens/ReportScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { TeamScreen } from "./src/screens/TeamScreen";
import { tabIcons } from "./src/icons";
import { colors, shadow } from "./src/theme";

type Tab = "today" | "report" | "history" | "team" | "profile";

function Root() {
  const { ready, token, employee } = useAuth();
  const [tab, setTab] = useState<Tab>("today");
  const isSupervisor = employee?.role === "SUPERVISOR";
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setTab("today");
  }, [token]);

  if (!ready) {
    return (
      <View style={styles.boot}>
        <View style={styles.bootMark}>
          <Text style={styles.bootH}>H</Text>
        </View>
        <ActivityIndicator color={colors.leaf} size="large" />
      </View>
    );
  }

  if (!token) {
    return (
      <View style={styles.safe}>
        <StatusBar style="light" />
        <LoginScreen />
      </View>
    );
  }

  const tabs: Tab[] = isSupervisor
    ? ["today", "report", "history", "team", "profile"]
    : ["today", "report", "history", "profile"];

  const darkChrome = tab === "today" || tab === "profile";

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: darkChrome ? colors.forestDeep : colors.canvas }]} edges={["top"]}>
      <StatusBar style={darkChrome ? "light" : "dark"} />
      <View style={styles.body}>
        {tab === "today" ? <TodayScreen /> : null}
        {tab === "report" ? <ReportScreen /> : null}
        {tab === "history" ? <HistoryScreen /> : null}
        {tab === "team" && isSupervisor ? <TeamScreen /> : null}
        {tab === "profile" ? <ProfileScreen /> : null}
      </View>
      <View style={[styles.tabs, shadow.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {tabs.map((item) => (
          <TabButton
            key={item}
            active={tab === item}
            icon={tabIcons[item][tab === item ? "on" : "off"]}
            label={item[0].toUpperCase() + item.slice(1)}
            onPress={() => setTab(item)}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

function TabButton({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.tab}>
      <View style={[styles.tabIcon, active && styles.tabIconOn]}>
        <Ionicons color={active ? colors.leafDark : colors.muted} name={icon} size={20} />
      </View>
      <Text style={[styles.tabText, active && styles.tabActive]}>{label}</Text>
    </Pressable>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.forestDeep },
  body: { flex: 1, backgroundColor: colors.canvas },
  boot: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.forest, gap: 18 },
  bootMark: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  bootH: { color: colors.gold, fontSize: 28, fontWeight: "900" },
  tabs: {
    flexDirection: "row",
    backgroundColor: colors.paper,
    paddingTop: 8,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 4 },
  tabIcon: { width: 42, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  tabIconOn: { backgroundColor: colors.leafSoft },
  tabText: { color: colors.muted, fontWeight: "700", fontSize: 11, marginTop: 2 },
  tabActive: { color: colors.leafDark },
});
