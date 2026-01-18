import React from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native"

type Props = {
  visible: boolean
  onClose: () => void
}

export default function LeftDrawer({ visible, onClose }: Props) {
  if (!visible) return null

  return (
    <View style={styles.overlay}>
      {/* PANEL — LEFT */}
      <View style={styles.panel}>
        <Text style={styles.title}>Connect-People 🔒</Text>

        <Text style={styles.description}>
          In future, you can connect with like-minded people —
          same or opposite gender — in a calm, safe way.
          Unlocks only after AHI understands you better.
        </Text>
      </View>

      {/* BACKDROP — RIGHT */}
      <TouchableOpacity
        style={styles.backdrop}
        onPress={onClose}
        activeOpacity={1}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    zIndex: 20,
  },
  panel: {
    width: "70%",
    backgroundColor: "#1b1b1b",
    padding: 20,
  },
  backdrop: {
    flex: 1,
  },
  title: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  description: {
    color: "#cccccc",
    fontSize: 14,
    lineHeight: 20,
  },
})
