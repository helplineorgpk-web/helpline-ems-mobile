import { useEffect, useRef, useState } from "react";
import { Animated, Easing, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../auth";
import { colors, shadow } from "../theme";
import { Button, Field, HeroWash } from "../components/ui";
import { Pop, Rise } from "../motion";
import { Ionicons } from "@expo/vector-icons";

export function LoginScreen() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.wrap}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <HeroWash style={[styles.hero, { paddingTop: Math.max(insets.top, 20) + 18 }]}>
          <Pop>
            <View style={styles.mark}>
              <Text style={styles.markText}>H</Text>
            </View>
          </Pop>
          <Rise delay={80}>
            <Text style={styles.brand}>HELPLINE</Text>
            <Text style={styles.heroTitle}>Welfare Trust</Text>
            <Text style={styles.heroSub}>Staff attendance and daily reports, in one calm place.</Text>
          </Rise>
        </HeroWash>

        <Animated.View style={[styles.sheet, shadow.card, { opacity: sheetOpacity, transform: [{ translateY: sheet }] }]}>
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
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingBottom: 36 },
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 72,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  mark: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(201,163,92,0.55)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  markText: { color: colors.gold, fontSize: 28, fontWeight: "900" },
  brand: { color: colors.gold, fontSize: 12, fontWeight: "900", letterSpacing: 2.4 },
  heroTitle: { color: colors.white, fontSize: 36, fontWeight: "800", marginTop: 4, letterSpacing: -0.8 },
  heroSub: { color: "rgba(255,255,255,0.74)", marginTop: 8, fontSize: 15, lineHeight: 22, maxWidth: 280 },
  sheet: {
    marginHorizontal: 16,
    marginTop: -40,
    backgroundColor: colors.paper,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(235,228,214,0.9)",
  },
  sheetTitle: { fontSize: 24, fontWeight: "800", color: colors.ink, letterSpacing: -0.4 },
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
  hint: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginTop: 16,
    backgroundColor: colors.leafSoft,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  hintText: { color: colors.forest, flex: 1, fontSize: 13, lineHeight: 18, fontWeight: "600" },
});
