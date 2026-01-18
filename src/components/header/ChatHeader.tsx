import React from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native"
import { Ionicons } from "@expo/vector-icons"

type Props = {
  title: string
  onLeftPress: () => void
  onRightPress: () => void
}

export default function ChatHeader({
  title,
  onLeftPress,
  onRightPress
}: Props) {
  return (
    <View style={styles.container}>
      {/* Left icon */}
      <TouchableOpacity
        onPress={onLeftPress}
        style={styles.iconButton}
        activeOpacity={0.6}
      >
        <Ionicons name="menu" size={22} color="#EAEAEA" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {/* Right icon */}
      <TouchableOpacity
        onPress={onRightPress}
        style={styles.iconButton}
        activeOpacity={0.6}
      >
        <Ionicons name="time-outline" size={22} color="#EAEAEA" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    backgroundColor: "#121212"
  },

  title: {
    fontSize: 21,
    fontWeight: "600",
    color: "#EAEAEA",
    maxWidth: "70%",
    textAlign: "center"
  },

  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  }
})
