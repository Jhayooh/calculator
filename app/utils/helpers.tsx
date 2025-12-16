import { Animated, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const keepInsideScreen = (pos: Animated.ValueXY) => {
  pos.flattenOffset(); // finalize drag offset

  // Read current numeric values safely
  const x = (pos.x as any)._value;
  const y = (pos.y as any)._value;

  Animated.spring(pos, {
    toValue: {
      x: Math.min(Math.max(0, x), width - 80),
      y: Math.min(Math.max(0, y), height - 200),
    },
    useNativeDriver: false,
  }).start();
};
