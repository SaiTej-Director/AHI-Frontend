import React from "react"
import { View, Text, StyleSheet } from "react-native"

export default function LockedAction() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.button}>
        <Text style={styles.buttonText}>Unlock Connect-People</Text>
      </View>
      <Text style={styles.lockedText}>Currently locked</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center"
  },
  button: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    marginBottom: 8
  },
  buttonText: {
    color: "#8E8E8E",
    fontSize: 14
  },
  lockedText: {
    color: "#6F6F6F",
    fontSize: 12
  }
})
