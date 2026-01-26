import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import LeftPanel from "../panels/LeftPanel";

type Props = {
  visible: boolean;
  onClose: () => void;
  onPressAuth?: () => void;
  isAuthenticated?: boolean;
  accountName?: string | null;
};

export default function LeftDrawer({
  visible,
  onClose,
  onPressAuth,
  isAuthenticated,
  accountName,
}: Props) {
  if (!visible) return null;

  return (
    <>
      {/* Dimmed backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* Drawer */}
      <View style={styles.drawer}>
        <LeftPanel
          onPressAuth={() => {
            // Close drawer first so popup overlays correctly
            onClose()
            onPressAuth?.()
          }}
          isAuthenticated={isAuthenticated}
          accountName={accountName}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 9,
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "70%", // unchanged
    backgroundColor: "#121212",
    zIndex: 10,
  },
});
