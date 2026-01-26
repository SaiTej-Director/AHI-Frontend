// AHI UI V1 — Layout & Interaction Locked
import React from "react"
import { View, Pressable, Animated, Dimensions } from "react-native"

const SCREEN_WIDTH = Dimensions.get("window").width
const PANEL_WIDTH = SCREEN_WIDTH * 0.7

type Props = {
  visible: boolean
  side: "left" | "right"
  onClose: () => void
  children: React.ReactNode
}

export default function SideOverlay({
  visible,
  side,
  onClose,
  children,
}: Props) {
  const translateX = React.useRef(
    new Animated.Value(
      side === "left" ? -PANEL_WIDTH : PANEL_WIDTH
    )
  ).current

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: visible ? 0 : side === "left" ? -PANEL_WIDTH : PANEL_WIDTH,
      duration: 220,
      useNativeDriver: true,
    }).start()
  }, [visible])

  if (!visible) return null

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      {/* Dimmed area */}
      {side === "right" && (
        <Pressable
          onPress={onClose}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }}
        />
      )}

      {/* Sliding panel */}
      <Animated.View
        style={{
          width: PANEL_WIDTH,
          height: "72%",
          backgroundColor: "#181818",
          borderRadius: 18,
          overflow: "hidden",
          transform: [{ translateX }],
          paddingTop: 24,
          paddingHorizontal: 16,
        }}
      >
        {children}
      </Animated.View>

      {side === "left" && (
        <Pressable
          onPress={onClose}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }}
        />
      )}
    </View>
  )
}
