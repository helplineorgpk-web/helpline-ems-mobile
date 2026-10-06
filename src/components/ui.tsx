import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radii, shadow } from "../theme";
import type { IconName } from "../icons";

export function Screen({
  children,
  style,
  padded = true,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}) {
  return <View style={[styles.screen, padded && styles.padded, style]}>{children}</View>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, shadow.card, style]}>{children}</View>;
}

export function HeroWash({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <LinearGradient colors={[colors.forestDeep, colors.forest, "#1c5533"]} style={[styles.heroWash, style]}>
      {children}
    </LinearGradient>
  );
}

export function Title({ children }: { children: React.ReactNode }) {
  return (
    <View>
      <View style={styles.titleRule} />
      <Text style={styles.title}>{children}</Text>
    </View>
  );
}

export function Muted({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.muted, style]}>{children}</Text>;
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.section}>{children}</Text>;
}

export function Icon({
  name,
  size = 20,
  color = colors.ink,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}

export function IconWell({
  name,
  tone = "leaf",
  size = 44,
}: {
  name: IconName;
  tone?: "leaf" | "gold" | "forest" | "muted" | "danger";
  size?: number;
}) {
  const palette = {
    leaf: { bg: colors.leafSoft, fg: colors.leafDark },
    gold: { bg: colors.goldSoft, fg: "#8a6a1f" },
    forest: { bg: "rgba(255,255,255,0.14)", fg: colors.white },
    muted: { bg: "#efebe3", fg: colors.muted },
    danger: { bg: colors.dangerSoft, fg: colors.danger },
  }[tone];
  return (
    <View
      style={[
        styles.well,
        { width: size, height: size, borderRadius: size / 2.4, backgroundColor: palette.bg },
      ]}
    >
      <Ionicons name={name} size={size * 0.42} color={palette.fg} />
    </View>
  );
}

export function Avatar({ name, size = 56 }: { name?: string | null; size?: number }) {
  const initials =
    (name || "H")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "H";
  const inner = size - 8;
  return (
    <View
      style={[
        styles.avatarRing,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <View style={[styles.avatar, { width: inner, height: inner, borderRadius: inner / 2 }]}>
        <Text style={[styles.avatarText, { fontSize: inner * 0.36 }]}>{initials}</Text>
      </View>
    </View>
  );
}

export function Field({
  label,
  icon,
  secureTextEntry,
  ...props
}: TextInputProps & { label: string; icon?: IconName }) {
  const [hidden, setHidden] = useState(Boolean(secureTextEntry));
  const [focused, setFocused] = useState(false);
  const canReveal = Boolean(secureTextEntry);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        {icon ? (
          <Ionicons name={icon} size={18} color={focused ? colors.leafDark : colors.muted} style={styles.inputIcon} />
        ) : null}
        <TextInput
          placeholderTextColor="#8d998f"
          {...props}
          onBlur={(event) => {
            setFocused(false);
            props.onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            props.onFocus?.(event);
          }}
          secureTextEntry={canReveal ? hidden : secureTextEntry}
          style={[
            styles.input,
            focused && styles.inputFocused,
            icon && styles.inputWithIcon,
            canReveal && styles.inputWithToggle,
            props.multiline && styles.textarea,
            props.style,
          ]}
        />
        {canReveal ? (
          <Pressable
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
            hitSlop={8}
            onPress={() => setHidden((value) => !value)}
            style={styles.eyeBtn}
          >
            <Ionicons name={hidden ? "eye-outline" : "eye-off-outline"} size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function Button({
  label,
  onPress,
  disabled,
  tone = "primary",
  loading,
  icon,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: "primary" | "dark" | "ghost" | "danger";
  loading?: boolean;
  icon?: IconName;
}) {
  const light = tone === "ghost" || tone === "danger";
  const filled = tone === "primary" || tone === "dark";
  const scale = useRef(new Animated.Value(1)).current;
  const locked = disabled || loading;

  function pressIn() {
    if (locked) return;
    Animated.spring(scale, { toValue: 0.975, speed: 40, bounciness: 0, useNativeDriver: true }).start();
  }

  function pressOut() {
    Animated.spring(scale, { toValue: 1, speed: 24, bounciness: 4, useNativeDriver: true }).start();
  }

  return (
    <Animated.View style={[styles.btnWrap, { transform: [{ scale }] }, locked && styles.btnDisabled, !locked && filled && shadow.float]}>
      <Pressable disabled={locked} onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} style={[styles.btn, tone === "ghost" && styles.btnGhost, tone === "danger" && styles.btnDanger]}>
        {filled ? (
          <LinearGradient
            colors={tone === "primary" ? [colors.leaf, colors.leafDark] : [colors.forest, colors.forestDeep]}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        {loading ? (
          <ActivityIndicator color={light ? colors.forest : colors.white} />
        ) : (
          <View style={styles.btnInner}>
            {icon ? (
              <Ionicons name={icon} size={18} color={tone === "danger" ? colors.danger : light ? colors.ink : colors.white} />
            ) : null}
            <Text style={[styles.btnText, tone === "ghost" && { color: colors.ink }, tone === "danger" && { color: colors.danger }]}>
              {label}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export function Badge({
  label,
  tone = "leaf",
  icon,
}: {
  label: string;
  tone?: "leaf" | "gold" | "muted" | "danger";
  icon?: IconName;
}) {
  const fg = tone === "gold" ? "#8a6a1f" : tone === "muted" ? colors.muted : tone === "danger" ? colors.danger : colors.leafDark;
  return (
    <View
      style={[
        styles.badge,
        tone === "leaf" && { backgroundColor: colors.leafSoft },
        tone === "gold" && { backgroundColor: colors.goldSoft },
        tone === "muted" && { backgroundColor: "#efebe3" },
        tone === "danger" && { backgroundColor: colors.dangerSoft },
      ]}
    >
      {icon ? <Ionicons name={icon} size={12} color={fg} /> : null}
      <Text style={[styles.badgeText, { color: fg }]}>{label}</Text>
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  hint,
}: {
  icon: IconName;
  title: string;
  hint: string;
}) {
  return (
    <Card style={styles.empty}>
      <IconWell name={icon} tone="gold" size={56} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Muted style={styles.emptyHint}>{hint}</Muted>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  padded: { paddingHorizontal: 20, paddingTop: 16 },
  heroWash: { overflow: "hidden" },
  card: {
    backgroundColor: colors.paper,
    borderColor: "rgba(235,228,214,0.95)",
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: 16,
  },
  titleRule: {
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.gold,
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.ink,
    letterSpacing: -0.6,
  },
  muted: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  section: {
    fontWeight: "800",
    color: colors.muted,
    marginBottom: 12,
    marginTop: 8,
    textTransform: "uppercase",
    fontSize: 11,
    letterSpacing: 1.1,
  },
  well: { alignItems: "center", justifyContent: "center" },
  avatarRing: {
    backgroundColor: colors.goldSoft,
    borderWidth: 1.5,
    borderColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    backgroundColor: colors.forest,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.gold, fontWeight: "800" },
  field: { marginBottom: 14 },
  label: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.9,
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: 7,
  },
  inputWrap: { position: "relative", justifyContent: "center" },
  inputIcon: { position: "absolute", left: 14, zIndex: 1 },
  eyeBtn: {
    position: "absolute",
    right: 8,
    top: 0,
    bottom: 0,
    zIndex: 1,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    backgroundColor: "#fff",
    borderColor: colors.line,
    borderWidth: 1.5,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.ink,
  },
  inputFocused: {
    borderColor: colors.leaf,
    backgroundColor: "#f7fcf8",
  },
  inputWithIcon: { paddingLeft: 42 },
  inputWithToggle: { paddingRight: 46 },
  textarea: { minHeight: 120, textAlignVertical: "top", paddingTop: 14 },
  btnWrap: { width: "100%", borderRadius: radii.md },
  btn: {
    minHeight: 54,
    width: "100%",
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    overflow: "hidden",
  },
  btnInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  btnGhost: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.line },
  btnDanger: { backgroundColor: colors.dangerSoft },
  btnDisabled: { opacity: 0.48 },
  btnText: { color: colors.white, fontWeight: "800", fontSize: 16 },
  badge: {
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  badgeText: { fontSize: 11, fontWeight: "800" },
  empty: { alignItems: "center", gap: 8, marginTop: 8, paddingVertical: 22 },
  emptyTitle: { fontSize: 17, fontWeight: "800", color: colors.ink, marginTop: 4, textAlign: "center" },
  emptyHint: { textAlign: "center" },
});
