// AHI UI V1 — Layout & Interaction Locked
import React, { useEffect, useRef, useState } from "react"
import {
  View,
  KeyboardAvoidingView,
  Platform,
  Text,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useWindowDimensions } from "react-native"

import ChatHeader from "../components/header/ChatHeader"
import MessageList from "../components/chat/MessageList"
import InputBar from "../components/chat/InputBar"
import TypingIndicator from "../components/chat/TypingIndicator"
import LeftDrawer from "../components/drawers/LeftDrawer"
import HistoryPanel from "../components/history/HistoryPanel"
import EditNameModal from "../components/modals/EditNameModal"
import AuthModal from "../components/modals/AuthModal"

import { saveConversation, Message, Conversation } from "../storage/history"
import { useAuth } from "../auth/AuthContext"

/* ------------------ helpers ------------------ */
function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// NOTE: Android emulator cannot reach host machine via localhost.
// This is intentionally minimal (no UI changes) and only affects networking.
const BACKEND_BASE_URL =
  // Optional override for physical devices (e.g., `EXPO_PUBLIC_BACKEND_URL=http://192.168.1.12:3001`)
  // Keeps behavior unchanged if not set.
  (process.env.EXPO_PUBLIC_BACKEND_URL as string | undefined) ||
  (Platform.OS === "android" ? "http://10.0.2.2:3001" : "http://192.168.1.12:3001")

/* ------------------ component ------------------ */
export default function ChatScreen() {
  const insets = useSafeAreaInsets()
  const { height: windowHeight } = useWindowDimensions()
  const { isAuthenticated, headerName, accountName, setHeaderName } = useAuth()
  /* ---------- USER ---------- */
  const [editNameOpen, setEditNameOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authContextMessage, setAuthContextMessage] = useState<string | null>(null)

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

  /* ---------- DELETE MODE ---------- */
  const [isDeleteMode, setIsDeleteMode] = useState(false)
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(
    new Set()
  )
  const hasLoggedInsetsRef = useRef(false)

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

  /* ---------- SEND MESSAGE ---------- */
  async function handleSend(text: string) {
    const userMsg: Message = {
      id: genId(),
      sender: "user",
      text,
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMsg])
    setAhiTyping(true)

    let scheduledStop = false

    try {
      const res = await fetch(`${BACKEND_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          userId: sessionIdRef.current,
        }),
      })

      const data = await res.json()
      // If backend indicates the response was a fallback (LLM/network issue), note it.
      if (data?.fallback) {
        console.log("[CHAT] Received fallback response from backend")
      }

      const backendMessages: Array<{ text?: string; delayMs?: number }> =
        Array.isArray(data?.messages) ? data.messages : []

      // If server responded but with no messages (or an error shape), show safe fallback.
      if (!res.ok || backendMessages.length === 0) {
        setAhiTyping(false)
        setMessages(prev => [
          ...prev,
          {
            id: genId(),
            sender: "ahi",
            text: "Let’s pause for a moment.",
            timestamp: Date.now(),
          },
        ])
        return
      }

      // Render backend messages in order, respecting optional delayMs.
      let totalDelay = 0
      backendMessages.forEach((m, idx) => {
        const t = typeof m?.text === "string" ? m.text : ""
        if (!t || t.trim().length < 1) {
          throw new Error("EMPTY_BACKEND_TEXT")
        }

        const delayMs = Number.isFinite(m.delayMs) ? Number(m.delayMs) : 0
        totalDelay += Math.max(0, delayMs)

        setTimeout(() => {
          const ahiMsg: Message = {
            id: genId(),
            sender: "ahi",
            text: t,
            timestamp: Date.now(),
          }
          setMessages(prev => [...prev, ahiMsg])
          if (idx === backendMessages.length - 1) {
            scheduledStop = true
            setAhiTyping(false)
          }
        }, totalDelay)
      })
    } catch (err: any) {
      // Network or fetch failure — but we still present a safe fallback to the user.
      // Use warn instead of error so transient network issues don't surface as critical errors in dev consoles.
      console.warn("Chat send failed (network):", err?.message || err)

      // Fallback text ONLY on true failure.
      setMessages(prev => [
        ...prev,
        {
          id: genId(),
          sender: "ahi",
          text: "Let’s pause for a moment.",
          timestamp: Date.now(),
        },
      ])
    } finally {
      // Ensure typing never hangs if we didn't schedule a stop.
      if (!scheduledStop) {
        setAhiTyping(false)
      }
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
      const nextMessages = prev.filter(
        message => !selectedMessageIds.has(message.id)
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

  const safeAreaReady =
    Platform.OS === "web" || insets.top !== 0 || insets.bottom !== 0

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
        rightIcon={isDeleteMode ? "🗑" : "☰"}
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
          messages={messages}
          selectedMessageIds={selectedMessageIds}
          onPressMessage={handleMessagePress}
          onLongPressMessage={handleMessageLongPress}
        />

        <TypingIndicator visible={ahiTyping} />

        {safeAreaReady && (
          <InputBar
            onSend={handleSend}
            disabled={ahiTyping}
            isDeleteMode={isDeleteMode}
            onDeleteSelected={handleDeleteSelected}
          />
        )}
      </KeyboardAvoidingView>

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: insets.bottom + 72,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#9A9A9A",
            fontSize: 12,
            opacity: 0.35,
          }}
        >
          You can chat in any language
        </Text>
      </View>

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
    </View>
  )
}
