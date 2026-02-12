import React from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAppearance } from "../context/AppearanceContext"

export default function PrivacyPolicyScreen() {
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
          Privacy Policy
        </Text>
        <Text style={[styles.updatedAt, { color: isLight ? "#5A5A5A" : "#A8A8A8" }]}>
          Last updated: February 12, 2026
        </Text>

        <Text style={[styles.sectionTitle, { color: isLight ? "#171717" : "#F2F2F2" }]}>
          1. Data We Collect
        </Text>
        <Text style={[styles.body, { color: isLight ? "#2D2D2D" : "#D6D6D6" }]}>
          If you create an account, we may store your email address and basic account profile details
          needed to provide sign-in and account management features.
        </Text>

        <Text style={[styles.sectionTitle, { color: isLight ? "#171717" : "#F2F2F2" }]}>
          2. Chat Data Storage
        </Text>
        <Text style={[styles.body, { color: isLight ? "#2D2D2D" : "#D6D6D6" }]}>
          Chat history is stored locally on your device by default. If you use authenticated features,
          certain account-related metadata may be associated with your profile to support app
          functionality.
        </Text>

        <Text style={[styles.sectionTitle, { color: isLight ? "#171717" : "#F2F2F2" }]}>
          3. Data Sharing and Sales
        </Text>
        <Text style={[styles.body, { color: isLight ? "#2D2D2D" : "#D6D6D6" }]}>
          We do not sell your personal data. We do not share personal information for commercial
          resale.
        </Text>

        <Text style={[styles.sectionTitle, { color: isLight ? "#171717" : "#F2F2F2" }]}>
          4. Security and Retention
        </Text>
        <Text style={[styles.body, { color: isLight ? "#2D2D2D" : "#D6D6D6" }]}>
          We take reasonable steps to protect account data. Local chat data remains on your device
          until you clear your history or remove the app data.
        </Text>

        <Text style={[styles.sectionTitle, { color: isLight ? "#171717" : "#F2F2F2" }]}>
          5. Contact
        </Text>
        <Text style={[styles.body, { color: isLight ? "#2D2D2D" : "#D6D6D6" }]}>
          For privacy questions, contact: support@ahiapp.com
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
