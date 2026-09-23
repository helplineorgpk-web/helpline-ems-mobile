import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../auth";
import { colors } from "../theme";
import { Button, Field } from "../components/ui";
import { Ionicons } from "@expo/vector-icons";

export function LoginScreen() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("ahmed@helpline.org");
  const [password, setPassword] = useState("Emp@123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.wrap}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={[colors.forestDeep, colors.forest, "#1f5a36"]} style={[styles.hero, { paddingTop: Math.max(insets.top, 20) + 28 }]}>
          <View style={styles.mark}>
            <Text style={styles.markText}>H</Text>
          </View>
          <Text style={styles.brand}>HELPLINE</Text>
          <Text style={styles.heroTitle}>Welfare Trust</Text>
          <Text style={styles.heroSub}>Staff attendance and daily reports, in one place.</Text>
        </LinearGradient>

        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Sign in to duty</Text>
          <Text style={styles.sheetSub}>Use the email and password given by admin.</Text>
          {error ? (
            <View style={styles.error}>
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          <Field
            autoCapitalize="none"
            autoCorrect={false}
            icon="mail-outline"
            keyboardType="email-address"
            label="Work email"
            onChangeText={setEmail}
            value={email}
          />
          <Field icon="lock-closed-outline" label="Password" onChangeText={setPassword} secureTextEntry value={password} />
          <Button icon="log-in-outline" label="Continue" loading={loading} onPress={onSubmit} />
          <View style={styles.hint}>
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.leafDark} />
            <Text style={styles.hintText}>Check-in starts automatically when the app opens.</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingBottom: 40 },
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  mark: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(196,163,90,0.45)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  markText: { color: colors.gold, fontSize: 26, fontWeight: "900" },
  brand: { color: colors.gold, fontSize: 12, fontWeight: "900", letterSpacing: 2.2 },
  heroTitle: { color: colors.white, fontSize: 34, fontWeight: "800", marginTop: 4, letterSpacing: -0.6 },
  heroSub: { color: "rgba(255,255,255,0.72)", marginTop: 8, fontSize: 15, lineHeight: 22, maxWidth: 280 },
  sheet: { paddingHorizontal: 22, paddingTop: 26 },
  sheetTitle: { fontSize: 24, fontWeight: "800", color: colors.ink, letterSpacing: -0.3 },
  sheetSub: { color: colors.muted, marginTop: 6, marginBottom: 20, lineHeight: 20 },
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
  hint: { flexDirection: "row", gap: 8, alignItems: "center", marginTop: 16, paddingHorizontal: 4 },
  hintText: { color: colors.muted, flex: 1, fontSize: 13, lineHeight: 18 },
});
