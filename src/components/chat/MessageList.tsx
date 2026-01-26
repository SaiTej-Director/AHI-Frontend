import React from "react"
import { FlatList, View } from "react-native"
import MessageBubble from "./MessageBubble"
import { Message } from "../../storage/history"

type Props = {
  messages: Message[]
  selectedMessageIds: Set<string>
  onPressMessage: (id: string) => void
  onLongPressMessage: (id: string) => void
}

export default function MessageList({
  messages,
  selectedMessageIds,
  onPressMessage,
  onLongPressMessage,
}: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 24,
        }}
        keyboardDismissMode="interactive"
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isSelected={selectedMessageIds.has(item.id)}
            onPress={() => onPressMessage(item.id)}
            onLongPress={() => onLongPressMessage(item.id)}
          />
        )}
      />
    </View>
  )
}
