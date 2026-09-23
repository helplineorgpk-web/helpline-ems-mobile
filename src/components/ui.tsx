import {
  ActivityIndicator,
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

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
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
        { width: size, height: size, borderRadius: size / 2.6, backgroundColor: palette.bg },
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
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.34 }]}>{initials}</Text>
    </View>
  );
}

export function Field({
  label,
  icon,
  ...props
}: TextInputProps & { label: string; icon?: IconName }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        {icon ? <Ionicons name={icon} size={18} color={colors.muted} style={styles.inputIcon} /> : null}
        <TextInput
          placeholderTextColor={colors.muted}
          style={[styles.input, icon && styles.inputWithIcon, props.multiline && styles.textarea]}
          {...props}
        />
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
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        tone === "primary" && styles.btnPrimary,
        tone === "dark" && styles.btnDark,
        tone === "ghost" && styles.btnGhost,
        tone === "danger" && styles.btnDanger,
        (disabled || loading) && styles.btnDisabled,
        pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={light ? colors.forest : colors.white} />
      ) : (
        <View style={styles.btnInner}>
          {icon ? (
            <Ionicons name={icon} size={18} color={tone === "danger" ? colors.danger : light ? colors.ink : colors.white} />
          ) : null}
          <Text
            style={[
              styles.btnText,
              tone === "ghost" && { color: colors.ink },
              tone === "danger" && { color: colors.danger },
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
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
      <IconWell name={icon} tone="muted" size={52} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Muted>{hint}</Muted>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  padded: { paddingHorizontal: 20, paddingTop: 8 },
  card: {
    backgroundColor: colors.paper,
    borderColor: "rgba(226,221,211,0.9)",
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.ink,
    letterSpacing: -0.4,
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
  input: {
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: colors.ink,
  },
  inputWithIcon: { paddingLeft: 42 },
  textarea: { minHeight: 120, textAlignVertical: "top", paddingTop: 14 },
  btn: {
    minHeight: 52,
    width: "100%",
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  btnInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  btnPrimary: { backgroundColor: colors.leaf },
  btnDark: { backgroundColor: colors.forest },
  btnGhost: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.line },
  btnDanger: { backgroundColor: colors.dangerSoft },
  btnDisabled: { opacity: 0.5 },
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
  empty: { alignItems: "flex-start", gap: 8, marginTop: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "800", color: colors.ink, marginTop: 4 },
});
