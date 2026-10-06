import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
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
    return <BootScreen />;
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
      <View style={[styles.tabDock, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={[styles.tabs, shadow.bar]}>
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
      </View>
    </SafeAreaView>
  );
}

function BootScreen() {
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.94, duration: 900, useNativeDriver: true }),
        ])
      ),
    ]).start();
  }, [opacity, scale]);

  return (
    <LinearGradient colors={[colors.forestDeep, colors.forest]} style={styles.boot}>
      <Animated.View style={[styles.bootMark, { opacity, transform: [{ scale }] }]}>
        <Text style={styles.bootH}>H</Text>
      </Animated.View>
      <ActivityIndicator color={colors.gold} />
      <Text style={styles.bootLabel}>Helpline</Text>
    </LinearGradient>
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
  const scale = useRef(new Animated.Value(active ? 1 : 0.96)).current;

  useEffect(() => {
    Animated.spring(scale, { toValue: active ? 1 : 0.96, speed: 18, bounciness: 5, useNativeDriver: true }).start();
  }, [active, scale]);

  return (
    <Pressable onPress={onPress} style={styles.tabPress}>
      <Animated.View style={[styles.tab, active && styles.tabOn, { transform: [{ scale }] }]}>
        <Ionicons color={active ? colors.leafDark : colors.muted} name={icon} size={20} />
        <Text style={[styles.tabText, active && styles.tabActive]}>{label}</Text>
      </Animated.View>
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
  boot: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  bootMark: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(201,163,92,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  bootH: { color: colors.gold, fontSize: 30, fontWeight: "900" },
  bootLabel: { color: "rgba(255,255,255,0.72)", fontWeight: "700", letterSpacing: 1.4, textTransform: "uppercase", fontSize: 12 },
  tabDock: { backgroundColor: colors.canvas, paddingHorizontal: 14, paddingTop: 4 },
  tabs: {
    flexDirection: "row",
    backgroundColor: colors.paper,
    borderRadius: 26,
    padding: 6,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 4,
  },
  tabPress: { flex: 1 },
  tab: { alignItems: "center", justifyContent: "center", borderRadius: 20, paddingVertical: 8, gap: 2 },
  tabOn: { backgroundColor: colors.leafSoft },
  tabText: { color: colors.muted, fontWeight: "700", fontSize: 11 },
  tabActive: { color: colors.leafDark },
});
