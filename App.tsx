import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from "react-native";
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
import { useKeyboardHeight } from "./src/keyboard";
import { Button } from "./src/components/ui";

const splashMark = require("./assets/splash-icon.png");

type Tab = "today" | "report" | "history" | "team" | "profile";

function Root() {
  const { ready, token, employee, bootError, retryBoot, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("today");
  const isSupervisor = employee?.role === "SUPERVISOR";
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardHeight();

  useEffect(() => {
    setTab("today");
  }, [token]);

  if (!ready) {
    return <BootScreen />;
  }

  if (bootError) {
    return <BootScreen error={bootError} onRetry={retryBoot} onSignOut={logout} />;
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
      {keyboard.height === 0 ? <View style={[styles.tabDock, { paddingBottom: Math.max(insets.bottom, 12) }]}>
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
      </View> : null}
    </SafeAreaView>
  );
}

function BootScreen({
  error,
  onRetry,
  onSignOut,
}: {
  error?: string;
  onRetry?: () => void;
  onSignOut?: () => void;
} = {}) {
  // Starts exactly where the native splash leaves off (same mark, size and background), then comes alive.
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Started separately: the error state drops the pulse, which stops the loop,
    // and a shared Animated.parallel would then freeze the footer mid-fade.
    Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 0.95, duration: 900, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity, scale]);

  return (
    <View style={styles.boot}>
      <StatusBar style="dark" />
      <Animated.Image
        source={splashMark}
        style={error ? styles.bootMarkSmall : [styles.bootMark, { transform: [{ scale }] }]}
      />
      <Animated.View style={[styles.bootFooter, error && styles.bootFooterInline, { opacity }]}>
        <Text style={styles.bootTitle}>Helpline Staff</Text>
        <Text style={styles.bootLabel}>Helpline Welfare Trust</Text>
        {error ? (
          <View style={styles.bootError}>
            <Text style={styles.bootErrorText}>{error}</Text>
            {onRetry ? <Button icon="refresh-outline" label="Try again" onPress={onRetry} /> : null}
            {onSignOut ? <Button label="Sign out" onPress={onSignOut} tone="ghost" /> : null}
          </View>
        ) : (
          <ActivityIndicator color={colors.leaf} style={styles.bootSpinner} />
        )}
      </Animated.View>
    </View>
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
        <Text adjustsFontSizeToFit minimumFontScale={0.75} numberOfLines={1} style={[styles.tabText, active && styles.tabActive]}>
          {label}
        </Text>
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
  boot: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.white },
  bootMark: { width: 200, height: 200 },
  bootMarkSmall: { width: 140, height: 140 },
  bootFooter: { position: "absolute", left: 0, right: 0, bottom: 84, alignItems: "center" },
  bootFooterInline: { position: "relative", bottom: 0, alignSelf: "stretch", marginTop: 8 },
  bootTitle: { color: colors.forest, fontSize: 22, fontWeight: "800", letterSpacing: 0.2 },
  bootLabel: { color: colors.leafDark, fontWeight: "800", letterSpacing: 1.6, textTransform: "uppercase", fontSize: 11, marginTop: 6 },
  bootSpinner: { marginTop: 22 },
  bootError: { alignSelf: "stretch", paddingHorizontal: 24, marginTop: 18, gap: 8 },
  bootErrorText: { color: colors.muted, textAlign: "center", lineHeight: 20, marginBottom: 6 },
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
