import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
} from "react-native"

type Props = {
  visible: boolean
  currentName: string
  onSave: (name: string) => void
  onClose: () => void
}

export default function EditNameModal({
  visible,
  currentName,
  onSave,
  onClose,
}: Props) {
  const [name, setName] = useState(currentName)

  function handleSave() {
    if (!name.trim()) return
    onSave(name.trim())
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Edit your name</Text>

          <TextInput
            value={name}
            onChangeText={setName}
            autoFocus
            placeholder="Your name"
            placeholderTextColor="#777"
            style={styles.input}
          />

          <View style={styles.actions}>
            <Pressable onPress={onClose}>
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>

            <Pressable onPress={handleSave}>
              <Text style={styles.save}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },

  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 20,
  },

  title: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    padding: 10,
    color: "#FFFFFF",
    fontSize: 15,
    marginBottom: 16,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
  },

  cancel: {
    color: "#AAAAAA",
    fontSize: 14,
  },

  save: {
    color: "#4DA6FF",
    fontSize: 14,
  },
})
