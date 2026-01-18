import React, { useState } from "react"
import { View, Text, TextInput, Button } from "react-native"
import { setDisplayName } from "../storage/userProfile"
import { useNavigation } from "@react-navigation/native"

export default function NamePromptScreen() {
  const [name, setName] = useState("")
  const navigation = useNavigation<any>()

  async function continueWithName() {
    const finalName = name.trim() || "You"
    await setDisplayName(finalName)
    navigation.replace("Chat")
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>
        What should AHI call you?
      </Text>

      <TextInput
        placeholder="Type a name (or leave blank)"
        value={name}
        onChangeText={setName}
        style={{
          borderWidth: 1,
          borderColor: "#ddd",
          padding: 10,
          marginBottom: 16
        }}
      />

      <Button title="Continue" onPress={continueWithName} />
    </View>
  )
}
