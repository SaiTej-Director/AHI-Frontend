import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  visible: boolean;
};

export default function TypingIndicator({ visible }: Props) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>…typing</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  text: {
    color: "#777",
    fontSize: 13,
    fontStyle: "italic",
  },
});
