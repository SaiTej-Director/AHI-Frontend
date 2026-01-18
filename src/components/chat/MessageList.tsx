import React from "react"
import { View, FlatList, StyleSheet } from "react-native"
import MessageBubble from "./MessageBubble"
import { Message } from "../../storage/history"

type Props = {
  messages: Message[]
  selectedIds: string[]
  onToggleSelect: (id: string) => void
}

export default function MessageList({
  messages,
  selectedIds,
  onToggleSelect,
}: Props) {
  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isSelected={selectedIds.includes(item.id)}
            onToggleSelect={() => onToggleSelect(item.id)}
          />
        )}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,            // 🔒 THIS IS CRITICAL
  },
  content: {
    padding: 12,
    paddingBottom: 8,
  },
})
