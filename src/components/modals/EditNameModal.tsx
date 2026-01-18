import React, { useState, useEffect } from "react"
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity
} from "react-native"

type Props = {
  visible: boolean
  currentName: string
  onSaved: (name: string) => void
  onClose: () => void
}

export default function EditNameModal({
  visible,
  currentName,
  onSaved,
  onClose
}: Props) {
  const [value, setValue] = useState(currentName)

  // 🔒 Always sync when modal opens
  useEffect(() => {
    if (visible) {
      setValue(currentName)
    }
  }, [visible, currentName])

  function handleSave() {
    onSaved(value.trim())
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <View
          style={{
            width: "85%",
            backgroundColor: "#1E1E1E",
            padding: 16,
            borderRadius: 8
          }}
        >
          <Text style={{ color: "#EAEAEA", marginBottom: 8 }}>
            Enter your name
          </Text>

          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="Your name"
            placeholderTextColor="#777"
            style={{
              borderBottomWidth: 1,
              borderColor: "#444",
              color: "#EAEAEA",
              paddingVertical: 6
            }}
            autoFocus
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              marginTop: 16
            }}
          >
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: "#777", marginRight: 16 }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSave}>
              <Text style={{ color: "#4FC3F7" }}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}
