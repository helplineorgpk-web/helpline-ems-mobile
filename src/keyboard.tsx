import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Keyboard,
  Platform,
  ScrollView,
  type StyleProp,
  type View,
  type ViewStyle,
} from "react-native";

type RevealTarget = View | null;

type KeyboardScroll = {
  reveal: (node: RevealTarget) => void;
};

const KeyboardScrollContext = createContext<KeyboardScroll | null>(null);

export function useKeyboardHeight() {
  const [height, setHeight] = useState(0);
  const [windowHeight, setWindowHeight] = useState(Dimensions.get("window").height);
  const fullHeight = useRef(Dimensions.get("window").height);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const show = Keyboard.addListener(showEvent, (event) => setHeight(event.endCoordinates.height));
    const hide = Keyboard.addListener(hideEvent, () => setHeight(0));
    const dimensions = Dimensions.addEventListener("change", ({ window }) => setWindowHeight(window.height));
    return () => {
      show.remove();
      hide.remove();
      dimensions.remove();
    };
  }, []);

  const windowShrunk = windowHeight < fullHeight.current - 80;
  return { height, windowShrunk };
}

export function FormScroll({
  children,
  style,
  contentContainerStyle,
  padForKeyboard = true,
  fill = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  padForKeyboard?: boolean;
  fill?: boolean;
}) {
  const ref = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const focused = useRef<RevealTarget>(null);
  const keyboard = useKeyboardHeight();
  const keyboardRef = useRef(keyboard);
  keyboardRef.current = keyboard;

  const api = useMemo<KeyboardScroll>(
    () => ({
      reveal(node) {
        if (node) focused.current = node;
        const target = focused.current;
        if (!target) return;
        setTimeout(() => {
          target.measureInWindow((_x, y, _width, height) => {
            const { height: keyboardHeight, windowShrunk } = keyboardRef.current;
            const covered = padForKeyboard && !windowShrunk ? keyboardHeight : 0;
            const visibleBottom = Dimensions.get("window").height - covered - 12;
            const overflow = y + height + 20 - visibleBottom;
            if (overflow > 8) {
              ref.current?.scrollTo({ y: Math.max(0, scrollY.current + overflow), animated: true });
            }
          });
        }, 280);
      },
    }),
    [padForKeyboard]
  );

  useEffect(() => {
    if (keyboard.height === 0) return;
    const timer = setTimeout(() => api.reveal(null), 320);
    return () => clearTimeout(timer);
  }, [api, keyboard.height]);

  const extraPad = padForKeyboard && !keyboard.windowShrunk ? keyboard.height : 0;

  return (
    <KeyboardScrollContext.Provider value={api}>
      <ScrollView
        ref={ref}
        automaticallyAdjustKeyboardInsets={false}
        contentContainerStyle={[contentContainerStyle, extraPad > 0 ? { paddingBottom: extraPad + 24 } : null]}
        contentInsetAdjustmentBehavior="never"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        onScroll={(event) => {
          scrollY.current = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={[fill && { flex: 1 }, style]}
      >
        {children}
      </ScrollView>
    </KeyboardScrollContext.Provider>
  );
}

export function useRevealField() {
  return useContext(KeyboardScrollContext);
}
