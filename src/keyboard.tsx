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
            const visibleBottom = Dimensions.get("window").height - covered;
            const overflow = y + height + 24 - visibleBottom;
            if (overflow > 8) {
              ref.current?.scrollTo({ y: scrollY.current + overflow, animated: true });
            }
          });
        }, Platform.OS === "ios" ? 60 : 140);
      },
    }),
    [padForKeyboard]
  );

  useEffect(() => {
    if (keyboard.height > 0) api.reveal(null);
  }, [api, keyboard.height]);

  const extraPad = padForKeyboard && !keyboard.windowShrunk ? keyboard.height : 0;

  return (
    <KeyboardScrollContext.Provider value={api}>
      <ScrollView
        ref={ref}
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios" && padForKeyboard}
        contentContainerStyle={[contentContainerStyle, extraPad > 0 && Platform.OS === "android" ? { paddingBottom: extraPad + 28 } : null]}
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
