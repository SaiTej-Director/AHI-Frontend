import React from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"

type Props = {
  title: string
  onLeftPress: () => void
  onRightPress: () => void
  onTitlePress: () => void
  rightIcon?: string
  rightLabel?: string
  rightColor?: string
  rightDisabled?: boolean
}

export default function ChatHeader({
  title,
  onLeftPress,
  onRightPress,
  onTitlePress,
  rightIcon,
  rightLabel,
  rightColor,
  rightDisabled,
}: Props) {
  const rightText = rightLabel ?? rightIcon ?? "☰"
  const isRightLabel = Boolean(rightLabel)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* LEFT ICON */}
        <Pressable
          onPress={onLeftPress}
          hitSlop={14}
          style={[styles.iconButton, { left: 12 }]}
        >
          <Text style={styles.icon}>☰</Text>
        </Pressable>

        {/* TITLE (ONLY THIS IS EDITABLE) */}
        <Pressable
          onPress={onTitlePress}
          hitSlop={6}
          style={styles.titleWrapper}
        >
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.title}
          >
            {title}
          </Text>
        </Pressable>

        {/* RIGHT ICON */}
        <Pressable
          onPress={onRightPress}
          disabled={rightDisabled}
          hitSlop={14}
          style={[
            isRightLabel ? styles.actionButton : styles.iconButton,
            { right: 12 },
          ]}
        >
          <Text
            style={[
              isRightLabel ? styles.actionText : styles.icon,
              rightColor ? { color: rightColor } : null,
              rightDisabled && styles.iconDisabled,
            ]}
          >
            {rightText}
          </Text>
        </Pressable>
      </View>

      {/* DIVIDER */}
      <View style={styles.divider} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
  },

  header: {
    height: 52,
    justifyContent: "center",
  },

  iconButton: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  actionButton: {
    position: "absolute",
    top: 0,
    bottom: 0,
    paddingHorizontal: 10,
    // Root cause: action text used icon layout without width parity,
    // leading to slight misalignment vs other header actions.
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    color: "#ffffff",
    fontSize: 22,
  },

  actionText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
    includeFontPadding: false,
  },

  iconDisabled: {
    color: "#666666",
  },

  titleWrapper: {
    alignSelf: "center",
    maxWidth: "70%",
  },

  title: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },

  divider: {
    height: 1,
    backgroundColor: "#1f1f1f",
  },
})
