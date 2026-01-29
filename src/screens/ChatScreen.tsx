import React, { useEffect, useRef, useState } from "react"
import { View, KeyboardAvoidingView, Platform, Text } from "react-native"
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context"
import { useWindowDimensions } from "react-native"

import ChatHeader from "../components/header/ChatHeader"
import MessageList from "../components/chat/MessageList"
import InputBar from "../components/chat/InputBar"
import LeftDrawer from "../components/drawers/LeftDrawer"
import HistoryPanel from "../components/history/HistoryPanel"
import EditNameModal from "../components/modals/EditNameModal"
import AuthModal from "../components/modals/AuthModal"
import ConnectWithModal from "../components/modals/ConnectWithModal"
import UnderstandingLevelsModal from "../components/modals/UnderstandingLevelsModal"

import { saveConversation, Message, Conversation } from "../storage/history"
import { useAuth } from "../auth/AuthContext"

/* ------------------ helpers ------------------ */
function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// NOTE: Android emulator cannot reach host machine via localhost.
// This is intentionally minimal (no UI changes) and only affects networking.
const CHAT_API = "http://192.168.100.3:3004/chat";

/* ------------------ component ------------------ */
export default function ChatScreen() {
  const insets = useSafeAreaInsets()
  const { height: windowHeight } = useWindowDimensions()
  const { isAuthenticated, headerName, accountName, setHeaderName } = useAuth()
  /* ---------- USER ---------- */
  const [editNameOpen, setEditNameOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authContextMessage, setAuthContextMessage] = useState<string | null>(null)
  const [connectWithOpen, setConnectWithOpen] = useState(false)
  const [understandingOpen, setUnderstandingOpen] = useState(false)

  /* ---------- PANELS ---------- */
  const [leftOpen, setLeftOpen] = useState(false)
  const [rightOpen, setRightOpen] = useState(false)
  // Close drawers/panels but not modal popups.
  const closeAllOverlays = () => {
    setLeftOpen(false)
    setRightOpen(false)
  }

  /* ---------- SESSION ---------- */
  const sessionIdRef = useRef(genId())
  const sessionStartRef = useRef(Date.now())

  /* ---------- CHAT ---------- */
  const [messages, setMessages] = useState<Message[]>([])
  const hasMessages = messages.length > 0
  // Intentional UX: initial empty state rests lower, then lifts once
  // the conversation starts (do not "fix" this as a bug).
  const initialInputBarOffset = 12

  /* ---------- DELETE MODE ---------- */
  const [isDeleteMode, setIsDeleteMode] = useState(false)
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(
    new Set()
  )
  const hasLoggedInsetsRef = useRef(false)

  // Diagnosis: selection instability came from messages without ids (undefined keys)
  // and scroll remaining enabled during selection, which interfered with long-press.

  const exitDeleteMode = () => {
    setIsDeleteMode(false)
    setSelectedMessageIds(new Set())
  }

  function toggleSelectedMessage(id: string) {
    setSelectedMessageIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  /* ---------- TYPING ---------- */
  const [ahiTyping, setAhiTyping] = useState(false)
  const typingMessage = {
    id: "typing-indicator",
    role: "assistant",
    content: "",
    __typing: true,
  }

  /* ---------- SEND MESSAGE ---------- */
  async function handleSend(text: string) {
    const message = text
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
    }
    setMessages(prev => [...prev, userMessage])
    setAhiTyping(true)

    try {
      const res = await fetch(CHAT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
        cache: "no-store",
      })

      const raw = await res.text()
      if (!raw) {
        setAhiTyping(false)
        return
      }

      const data = JSON.parse(raw)
      setMessages(prev => [...prev, ...data.messages])
    } catch (e) {
      console.error(e)
    } finally {
      setAhiTyping(false)
    }
  }

  function persistConversation(nextMessages: Message[]) {
    const conversation: Conversation = {
      id: sessionIdRef.current,
      messages: nextMessages,
      startedAt: sessionStartRef.current,
      lastUpdatedAt: Date.now(),
    }
    saveConversation(conversation)
  }

  function handleMessagePress(id: string) {
    if (!isDeleteMode) return
    toggleSelectedMessage(id)
  }

  function handleMessageLongPress(id: string) {
    if (!isDeleteMode) {
      setIsDeleteMode(true)
      setSelectedMessageIds(new Set([id]))
      return
    }
    toggleSelectedMessage(id)
  }

  function handleDeleteSelected() {
    if (selectedMessageIds.size === 0) {
      exitDeleteMode()
      return
    }
    setMessages(prev => {
      // Root cause: AHI messages can lack ids, so selection uses index fallback
      // while deletion only checked message.id, leaving AHI selections untouched.
      const nextMessages = prev.filter(
        (message, index) =>
          !selectedMessageIds.has(message.id ?? index.toString())
      )
      persistConversation(nextMessages)
      return nextMessages
    })
    exitDeleteMode()
  }

  /* ---------- SAVE SESSION ON UNMOUNT ---------- */
  useEffect(() => {
    if (__DEV__ && !hasLoggedInsetsRef.current) {
      console.log("ChatScreen initial insets", {
        top: insets.top,
        bottom: insets.bottom,
        windowHeight,
        keyboardVerticalOffset: 0,
      })
      hasLoggedInsetsRef.current = true
    }
  }, [insets.top, insets.bottom, windowHeight])

  useEffect(() => {
    return () => {
      persistConversation(messages)
    }
  }, [messages])

  useEffect(() => {
    return () => {
      exitDeleteMode()
    }
  }, [])

  /* ------------------ RENDER ------------------ */
  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#121212" }}
        edges={["top", "bottom"]}
        onStartShouldSetResponder={() => isDeleteMode}
        onResponderRelease={event => {
          if (!isDeleteMode) return
          if (event.target === event.currentTarget) {
            exitDeleteMode()
          }
        }}
      >
      {/* HEADER */}
      <ChatHeader
        title={headerName}
        onLeftPress={() => {
          exitDeleteMode()
          closeAllOverlays()
          setLeftOpen(true)
        }}
        onRightPress={() => {
          if (isDeleteMode) {
            if (selectedMessageIds.size === 0) return
            handleDeleteSelected()
            return
          }
          exitDeleteMode()
          closeAllOverlays()
          setRightOpen(true)
        }}
        onTitlePress={() => {
          closeAllOverlays()
          setEditNameOpen(true)
        }}
        rightIcon={isDeleteMode ? undefined : "☰"}
        rightLabel={isDeleteMode ? "Delete" : undefined}
        rightColor={isDeleteMode ? "#EF4444" : undefined}
        rightDisabled={isDeleteMode && selectedMessageIds.size === 0}
      />

      {/* CHAT + INPUT */}
      <KeyboardAvoidingView
        style={{
          flex: 1,
          backgroundColor: "#121212",
        }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <MessageList
          messages={ahiTyping ? [...messages, typingMessage] : messages}
          selectedMessageIds={selectedMessageIds}
          onPressMessage={handleMessagePress}
          onLongPressMessage={handleMessageLongPress}
          isDeleteMode={isDeleteMode}
        />

        <View style={!hasMessages ? { paddingTop: initialInputBarOffset } : null}>
          <InputBar
            onSend={handleSend}
            disabled={ahiTyping}
            isDeleteMode={isDeleteMode}
            onDeleteSelected={handleDeleteSelected}
          />
        </View>
      </KeyboardAvoidingView>

      {/* EDIT NAME MODAL */}
      <EditNameModal
        visible={editNameOpen}
        currentName={headerName}
        onClose={() => setEditNameOpen(false)}
        onSave={name => {
          setHeaderName(name)
          setEditNameOpen(false)
        }}
      />

      {/* 🔥 PANELS MUST BE LAST 🔥 */}
      <LeftDrawer
        visible={leftOpen}
        onClose={() => setLeftOpen(false)}
        onPressAuth={() => {
          setAuthContextMessage(null)
          // Ensure drawers closed before opening auth modal
          closeAllOverlays()
          setAuthOpen(true)
        }}
        onPressConnect={() => {
          setConnectWithOpen(true)
        }}
        onPressUnderstanding={() => {
          setUnderstandingOpen(true)
        }}
        isAuthenticated={isAuthenticated}
        accountName={accountName}
      />

      <HistoryPanel
        visible={rightOpen}
        onClose={() => setRightOpen(false)}
      />

      <AuthModal
        visible={authOpen}
        onClose={() => {
          setAuthOpen(false)
          setAuthContextMessage(null)
        }}
        contextMessage={authContextMessage}
      />

      <ConnectWithModal
        visible={connectWithOpen}
        onClose={() => setConnectWithOpen(false)}
      />

      <UnderstandingLevelsModal
        visible={understandingOpen}
        onClose={() => setUnderstandingOpen(false)}
      />
      </SafeAreaView>

      <Text
        style={{
          position: "absolute",
          bottom: 8,
          alignSelf: "center",
          color: "#7A7A7A",
          fontSize: 11,
          opacity: 0.25,
        }}
      >
        You can chat in any language
      </Text>
    </View>
  )
}
