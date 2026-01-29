import React, { useEffect, useRef } from "react"
import { FlatList, View } from "react-native"
import MessageBubble from "./MessageBubble"
import { Message } from "../../storage/history"
import TypingIndicator from "./TypingIndicator"

type Props = {
  messages: Message[]
  selectedMessageIds: Set<string>
  onPressMessage: (id: string) => void
  onLongPressMessage: (id: string) => void
  isDeleteMode: boolean
}

export default function MessageList({
  messages,
  selectedMessageIds,
  onPressMessage,
  onLongPressMessage,
  isDeleteMode,
}: Props) {
  const listRef = useRef<FlatList<Message>>(null)
  const hasInitialScrollRef = useRef(false)

  useEffect(() => {
    if (messages.length === 0) return
    const shouldAnimate = hasInitialScrollRef.current
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: shouldAnimate })
    })
    hasInitialScrollRef.current = true
  }, [messages.length])

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <FlatList
        ref={listRef}
        style={{ flex: 1 }}
        data={messages}
        keyExtractor={(item, index) => item.id ?? index.toString()}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          flexGrow: 1,
          padding: 16,
          paddingBottom: 12,
          justifyContent: "flex-start",
        }}
        keyboardDismissMode="interactive"
        scrollEnabled={!isDeleteMode}
        renderItem={({ item, index }) => {
          const messageId = item.id ?? index.toString()
          if (item.__typing) {
            return (
              <View style={{ alignSelf: "flex-start", marginVertical: 4, marginLeft: 6 }}>
                <TypingIndicator visible />
              </View>
            )
          }
          return (
            <MessageBubble
              message={item}
              isSelected={selectedMessageIds.has(messageId)}
              onPress={() => onPressMessage(messageId)}
              onLongPress={() => onLongPressMessage(messageId)}
            />
          )
        }}
      />
    </View>
  )
}
