import React from "react"
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native"

type Props = {
  visible: boolean
  onClose: () => void
}

const STAGES = [
  {
    title: "Early Understanding",
    description: "AHI is getting familiar with how you talk and think.",
  },
  {
    title: "Growing Understanding",
    description: "Patterns start forming. Responses feel more 'you'.",
  },
  {
    title: "Deep Understanding",
    description: "AHI understands context, emotions, and continuity.",
  },
  {
    title: "Ready to Connect",
    description: "Enough understanding to match with others safely.",
  },
]

export default function UnderstandingLevelsModal({ visible, onClose }: Props) {
  if (!visible) return null

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Understanding Levels</Text>
          <Pressable onPress={onClose} hitSlop={8} style={styles.closeButton}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {STAGES.map(stage => (
            <View key={stage.title} style={styles.stageRow}>
              <View style={styles.stageHeader}>
                <LevelIcon title={stage.title} />
                <Text style={styles.stageTitle}>{stage.title}</Text>
              </View>
              <Text style={styles.stageDescription}>{stage.description}</Text>
            </View>
          ))}

          <View style={styles.noteBlock}>
            <Text style={styles.noteText}>
              Progress happens naturally through conversation.
            </Text>
            <Text style={styles.noteText}>No scores. No pressure.</Text>
            <Text style={styles.noteText}>Nothing unlocks suddenly.</Text>
            <Text style={styles.noteText}>
              Connect With unlocks only after sufficient understanding.
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  card: {
    position: "absolute",
    left: "10%",
    right: "10%",
    top: "8%",
    height: "72%",
    backgroundColor: "#181818",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#242424",
    zIndex: 30,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#222",
  },
  closeText: { color: "#e5e5e5", fontSize: 18, lineHeight: 18 },
  content: {
    paddingBottom: 16,
  },
  stageRow: {
    marginBottom: 16,
  },
  stageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  stageTitle: {
    color: "#EAEAEA",
    fontSize: 15,
    fontWeight: "600",
  },
  stageDescription: {
    color: "#BEBEBE",
    fontSize: 13,
    lineHeight: 18,
  },
  noteBlock: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#262626",
    gap: 6,
  },
  noteText: {
    color: "#9A9A9A",
    fontSize: 12,
    lineHeight: 16,
  },
  iconWrap: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  iconRing: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#7A7A7A",
  },
  iconRingSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#6B6B6B",
    marginRight: 4,
  },
  iconStack: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#6B6B6B",
  },
  iconCheck: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#7A7A7A",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCheckLine: {
    width: 6,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#7A7A7A",
  },
})

function LevelIcon({ title }: { title: string }) {
  const variant =
    title === "Early Understanding"
      ? "early"
      : title === "Growing Understanding"
        ? "growing"
        : title === "Deep Understanding"
          ? "deep"
          : "ready"

  return (
    <View style={styles.iconWrap}>
      {variant === "early" && <View style={styles.iconRing} />}
      {variant === "growing" && (
        <View style={styles.iconStack}>
          <View style={styles.iconRingSmall} />
          <View style={styles.iconRing} />
        </View>
      )}
      {variant === "deep" && <View style={styles.iconCore} />}
      {variant === "ready" && (
        <View style={styles.iconCheck}>
          <View style={styles.iconCheckLine} />
        </View>
      )}
    </View>
  )
}
