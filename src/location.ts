import * as Location from "expo-location";

export type CheckinPosition = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  // Android only: true when the position comes from a mock-location (fake GPS) app.
  mocked: boolean | null;
};

export type CheckinLocationResult =
  | { status: "OK"; location: CheckinPosition }
  | { status: "DENIED" | "SERVICES_OFF" | "UNAVAILABLE" };

// A fresh fix can take a while indoors; check-in must not hang on it.
const FIX_TIMEOUT_MS = 12_000;
// A recent last-known position is good enough when a fresh fix does not arrive in time.
const LAST_KNOWN_MAX_AGE_MS = 2 * 60_000;

function toPosition(fix: Location.LocationObject): CheckinPosition {
  return {
    latitude: fix.coords.latitude,
    longitude: fix.coords.longitude,
    accuracy: fix.coords.accuracy ?? null,
    mocked: typeof fix.mocked === "boolean" ? fix.mocked : null,
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return Promise.race([promise, new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))]);
}

// Asks for permission the first time, then reads where the phone is. Never throws: check-in goes ahead
// without a position and the reason is sent instead, so the dashboard can say why it is missing.
export async function getCheckinLocation(): Promise<CheckinLocationResult> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== "granted") return { status: "DENIED" };

    if (!(await Location.hasServicesEnabledAsync())) return { status: "SERVICES_OFF" };

    const fix = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }).catch(() => null),
      FIX_TIMEOUT_MS
    );
    if (fix) return { status: "OK", location: toPosition(fix) };

    const last = await Location.getLastKnownPositionAsync({ maxAge: LAST_KNOWN_MAX_AGE_MS }).catch(() => null);
    if (last) return { status: "OK", location: toPosition(last) };

    return { status: "UNAVAILABLE" };
  } catch {
    return { status: "UNAVAILABLE" };
  }
}
