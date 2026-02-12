import React, { useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Easing,
} from "react-native"

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
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(28)).current

  useEffect(() => {
    if (!visible) return
    opacity.setValue(0)
    translateY.setValue(28)
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start()
  }, [opacity, translateY, visible])

  if (!visible) return null

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.backdropLayer, { opacity }]}>
        <Pressable style={styles.backdrop} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={[styles.card, { opacity, transform: [{ translateY }] }]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>Understanding Levels</Text>
            <Text style={styles.subtitle}>
              Your conversation depth grows naturally over time
            </Text>
          </View>
          <Pressable onPress={onClose} hitSlop={8} style={styles.closeButton}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {STAGES.map((stage, index) => (
            <View
              key={stage.title}
              style={[
                styles.stageCard,
                index === 0 && styles.stageCardActive,
                index === STAGES.length - 1 && styles.stageCardLast,
              ]}
            >
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
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  backdropLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.72)",
  },
  card: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "82%",
    backgroundColor: "#171717",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderBottomWidth: 0,
    zIndex: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  headerRow: {
    marginBottom: 16,
  },
  headerTextWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  subtitle: {
    marginTop: 6,
    color: "rgba(234, 234, 234, 0.62)",
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  closeText: { color: "#e5e5e5", fontSize: 18, lineHeight: 18 },
  content: {
    paddingBottom: 18,
  },
  stageCard: {
    marginBottom: 16,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  stageCardActive: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(177, 220, 255, 0.45)",
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  stageCardLast: {
    marginBottom: 0,
  },
  stageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  stageTitle: {
    color: "#EAEAEA",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  stageDescription: {
    color: "#BEBEBE",
    fontSize: 13,
    lineHeight: 19,
  },
  noteBlock: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    gap: 8,
  },
  noteText: {
    color: "#9A9A9A",
    fontSize: 12,
    lineHeight: 17,
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
