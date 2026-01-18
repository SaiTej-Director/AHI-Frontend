import React from "react"
import { View, Text, StyleSheet } from "react-native"
import LockedAction from "./LockedAction"

export default function ConnectPeoplePanel() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔒 Connect-People</Text>

      <Text style={styles.description}>
        In future, you may connect with like-minded people — same gender or
        opposite gender — safely and at your own pace. This unlocks only after
        AHI naturally gets to know you over time.
      </Text>

      <LockedAction />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          AHI will never push connections.
        </Text>
        <Text style={styles.footerText}>
          You decide if and when.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  title: {
    color: "#EAEAEA",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 16
  },
  description: {
    color: "#B0B0B0",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 28
  },
  footer: {
    marginTop: "auto",
    paddingBottom: 16
  },
  footerText: {
    color: "#7A7A7A",
    fontSize: 12,
    lineHeight: 16
  }
})
