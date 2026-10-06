import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, TextInput, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../auth";
import { colors, shadow } from "../theme";
import { Button, Field, HeroWash } from "../components/ui";
import { FormScroll, useKeyboardHeight } from "../keyboard";
import { Pop, Rise } from "../motion";
import { Ionicons } from "@expo/vector-icons";

export function LoginScreen() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardHeight();
  const compact = keyboard.height > 0;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<TextInput>(null);
  const sheet = useRef(new Animated.Value(28)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(sheet, {
        toValue: 0,
        duration: 620,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(sheetOpacity, {
        toValue: 1,
        duration: 480,
        delay: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [sheet, sheetOpacity]);

  async function onSubmit() {
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.wrap}>
      <StatusBar style="light" />
      <FormScroll contentContainerStyle={styles.content}>
        <HeroWash
          style={[
            styles.hero,
            compact && styles.heroCompact,
            { paddingTop: Math.max(insets.top, 16) + (compact ? 2 : 14) },
          ]}
        >
          <View style={styles.brandRow}>
            <Pop>
              <View style={[styles.mark, compact && styles.markCompact]}>
                <Text style={[styles.markText, compact && styles.markTextCompact]}>H</Text>
              </View>
            </Pop>
            <Rise delay={80}>
              <Text style={styles.brand}>HELPLINE WELFARE TRUST</Text>
              <Text style={[styles.heroTitle, compact && styles.heroTitleCompact]}>{compact ? "Sign in" : "Staff"}</Text>
            </Rise>
          </View>
          {compact ? null : (
            <Text style={styles.heroSub}>Attendance and daily reports for the team on duty.</Text>
          )}
        </HeroWash>

        <Animated.View
          style={[
            styles.sheet,
            shadow.card,
            compact && styles.sheetCompact,
            { opacity: sheetOpacity, transform: [{ translateY: sheet }] },
          ]}
        >
          <Text style={styles.kicker}>Staff portal</Text>
          <Text style={styles.sheetTitle}>Sign in to duty</Text>
          <Text style={styles.sheetSub}>Use the email and password from your admin.</Text>
          {error ? (
            <View style={styles.error}>
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          <Field
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            blurOnSubmit={false}
            icon="mail-outline"
            keyboardType="email-address"
            label="Work email"
            onChangeText={setEmail}
            onSubmitEditing={() => passwordRef.current?.focus()}
            returnKeyType="next"
            textContentType="emailAddress"
            value={email}
          />
          <Field
            ref={passwordRef}
            autoComplete="password"
            icon="lock-closed-outline"
            label="Password"
            onChangeText={setPassword}
            onSubmitEditing={onSubmit}
            returnKeyType="done"
            secureTextEntry
            textContentType="password"
            value={password}
          />
          <Button icon="log-in-outline" label="Continue" loading={loading} onPress={onSubmit} />
        </Animated.View>
      </FormScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.canvas },
  content: { flexGrow: 1, paddingBottom: 28 },
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 56,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroCompact: { paddingBottom: 22 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  mark: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(201,163,92,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  markCompact: { width: 40, height: 40, borderRadius: 14 },
  markText: { color: colors.gold, fontSize: 26, fontWeight: "900" },
  markTextCompact: { fontSize: 18 },
  brand: { color: colors.gold, fontSize: 11, fontWeight: "800", letterSpacing: 1.6 },
  heroTitle: { color: colors.white, fontSize: 34, fontWeight: "800", marginTop: 2, letterSpacing: -0.8 },
  heroTitleCompact: { fontSize: 22, marginTop: 0 },
  heroSub: { color: "rgba(255,255,255,0.74)", marginTop: 14, fontSize: 15, lineHeight: 22, maxWidth: 280 },
  sheet: {
    marginHorizontal: 16,
    marginTop: -28,
    backgroundColor: colors.paper,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(235,228,214,0.9)",
  },
  sheetCompact: { marginTop: -12 },
  kicker: {
    color: colors.leafDark,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  sheetTitle: { fontSize: 26, fontWeight: "800", color: colors.ink, letterSpacing: -0.4 },
  sheetSub: { color: colors.muted, marginTop: 6, marginBottom: 18, lineHeight: 20 },
  error: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    backgroundColor: colors.dangerSoft,
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
  },
  errorText: { color: colors.danger, fontWeight: "600", flex: 1 },
});
