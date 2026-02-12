import React from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAppearance } from "../context/AppearanceContext"

export default function TermsScreen() {
  const navigation = useNavigation<any>()
  const insets = useSafeAreaInsets()
  const { resolvedTheme } = useAppearance()
  const isLight = resolvedTheme === "light"

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isLight ? "#F5F5F5" : "#121212", paddingTop: insets.top + 8 },
      ]}
    >
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={[styles.backText, { color: isLight ? "#2A2A2A" : "#EAEAEA" }]}>
          {"\u2190"} Back
        </Text>
      </Pressable>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: isLight ? "#121212" : "#FFFFFF" }]}>
          Terms of Service
        </Text>
        <Text style={[styles.updatedAt, { color: isLight ? "#5A5A5A" : "#A8A8A8" }]}>
          Last updated: February 12, 2026
        </Text>

        <Text style={[styles.sectionTitle, { color: isLight ? "#171717" : "#F2F2F2" }]}>
          1. Informational Use Only
        </Text>
        <Text style={[styles.body, { color: isLight ? "#2D2D2D" : "#D6D6D6" }]}>
          AHI provides conversational support for informational and wellbeing-oriented use. Content
          is not medical advice, diagnosis, or treatment.
        </Text>

        <Text style={[styles.sectionTitle, { color: isLight ? "#171717" : "#F2F2F2" }]}>
          2. No Guarantee of Accuracy
        </Text>
        <Text style={[styles.body, { color: isLight ? "#2D2D2D" : "#D6D6D6" }]}>
          Responses may contain limitations or inaccuracies. We do not guarantee completeness,
          reliability, or fitness for any specific purpose.
        </Text>

        <Text style={[styles.sectionTitle, { color: isLight ? "#171717" : "#F2F2F2" }]}>
          3. User Responsibility
        </Text>
        <Text style={[styles.body, { color: isLight ? "#2D2D2D" : "#D6D6D6" }]}>
          You are responsible for your decisions and how you use app content. Seek qualified
          professionals when you need expert medical, legal, or financial guidance.
        </Text>

        <Text style={[styles.sectionTitle, { color: isLight ? "#171717" : "#F2F2F2" }]}>
          4. Account and Access
        </Text>
        <Text style={[styles.body, { color: isLight ? "#2D2D2D" : "#D6D6D6" }]}>
          We may suspend or terminate accounts that violate these terms, misuse the service, or
          create safety risks.
        </Text>

        <Text style={[styles.sectionTitle, { color: isLight ? "#171717" : "#F2F2F2" }]}>
          5. Changes to Terms
        </Text>
        <Text style={[styles.body, { color: isLight ? "#2D2D2D" : "#D6D6D6" }]}>
          We may update these terms over time. Continued use of the app after updates constitutes
          acceptance of the revised terms.
        </Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  backText: {
    fontSize: 14,
    fontWeight: "500",
  },
  content: {
    paddingBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
  },
  updatedAt: {
    fontSize: 12,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
})
