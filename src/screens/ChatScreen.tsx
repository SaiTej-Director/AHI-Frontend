import React, { useEffect, useRef, useState } from "react"
import { View, KeyboardAvoidingView, Platform, Text } from "react-native"
import { useNavigation } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
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
import ConnectWithModal from "../components/modals/ConnectWithModal"
import UnderstandingLevelsModal from "../components/modals/UnderstandingLevelsModal"
import EditProfileModal from "../components/profile/EditProfileModal"
import SideOverlay from "../components/common/SideOverlay"

import {
  saveConversation,
  Message as StoredMessage,
  Conversation,
} from "../storage/history"
import { CHAT_API_URL, SESSION_OPEN_API_URL } from "../config/api"
import { useAuth } from "../auth/AuthContext"
import { useAppearance } from "../context/AppearanceContext"

/* ------------------ helpers ------------------ */
function genId() {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

let sessionOpenShown = false

// NOTE: Android emulator cannot reach host machine via localhost.
// This is intentionally minimal (no UI changes) and only affects networking.
const CHAT_API = CHAT_API_URL
const BACKEND_URL = CHAT_API
const SESSION_OPEN_API = SESSION_OPEN_API_URL

type ChatMessage = {
  id?: string
  role?: "user" | "assistant"
  sender?: "user" | "ahi"
  content?: string
  text?: string
  timestamp?: number
  __typing?: boolean
}

type OverlayType = "connect" | "history" | "understanding" | "profile" | null

/* ------------------ component ------------------ */
export default function ChatScreen() {
  const navigation = useNavigation<any>()
  const insets = useSafeAreaInsets()
  const { height: windowHeight } = useWindowDimensions()
  const { accountName, profilePhoto } = useAuth()
  const { resolvedTheme } = useAppearance()
  const appBackground = resolvedTheme === "light" ? "#F5F5F5" : "#121212"
  const footerColor = resolvedTheme === "light" ? "#676767" : "#7A7A7A"
  const [headerName, setHeaderName] = useState("AHI")
  /* ---------- USER ---------- */
  const [editNameOpen, setEditNameOpen] = useState(false)
  const [activeOverlay, setActiveOverlay] = useState<OverlayType>(null)

  /* ---------- PANELS ---------- */
  const [leftOpen, setLeftOpen] = useState(false)
  // Close drawers/panels but not modal popups.
  const closeAllOverlays = () => {
    setLeftOpen(false)
    setActiveOverlay(null)
  }

  /* ---------- SESSION ---------- */
  const sessionIdRef = useRef(genId())
  const sessionStartRef = useRef(Date.now())
  const sessionOpenRequestedRef = useRef(false)
  const sessionOpenPromiseRef = useRef<Promise<void> | null>(null)
  const [sessionReady, setSessionReady] = useState(true)

  /* ---------- CHAT ---------- */
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const hasMessages = messages.length > 0
  // Intentional UX: initial empty state rests lower, then lifts once
  // the conversation starts (do not "fix" this as a bug).
  const initialInputBarOffset = 12

  function startNewSession() {
    sessionIdRef.current = genId()
    sessionStartRef.current = Date.now()
    sessionOpenRequestedRef.current = false
    sessionOpenPromiseRef.current = null
    setSessionReady(true)
  }

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
  const deliveryIdRef = useRef(0)
  const pendingTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const pendingResolversRef = useRef<((active: boolean) => void)[]>([])
  const activeRequestIdRef = useRef(0)
  const typingMessage = {
    id: "typing-indicator",
    role: "assistant",
    content: "",
    __typing: true,
  }

  function clearPendingTimers() {
    pendingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    pendingTimeoutsRef.current = []
  }

  function cancelPendingDelivery() {
    deliveryIdRef.current += 1
    clearPendingTimers()
    pendingResolversRef.current.forEach(resolve => resolve(false))
    pendingResolversRef.current = []
    setAhiTyping(false)
  }

  function randomBetween(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  function wordCount(text: string) {
    return text.trim().split(/\s+/).filter(Boolean).length
  }

  function typingDelayFor(text: string) {
    const count = wordCount(text)
    if (count <= 10) return randomBetween(400, 600)
    if (count <= 20) return randomBetween(700, 1000)
    return randomBetween(1200, 1600)
  }

  function pauseBetweenMessages() {
    return randomBetween(300, 500)
  }

  function wait(ms: number, deliveryId: number) {
    return new Promise<boolean>(resolve => {
      pendingResolversRef.current.push(resolve)
      const timeout = setTimeout(() => {
        pendingResolversRef.current = pendingResolversRef.current.filter(
          r => r !== resolve
        )
        resolve(deliveryId === deliveryIdRef.current)
      }, ms)
      pendingTimeoutsRef.current.push(timeout)
    })
  }

  function normalizeMessageText(message: any) {
    return (message?.content ?? message?.text ?? "").toString()
  }

  async function requestSessionOpenMessage() {
    if (sessionOpenShown) return
    if (sessionOpenPromiseRef.current) {
      await sessionOpenPromiseRef.current
      return
    }
    if (!sessionIdRef.current) {
      startNewSession()
    }
    const work = (async () => {
      if (sessionOpenShown || sessionOpenRequestedRef.current) return
      sessionOpenRequestedRef.current = true
      try {
        const res = await fetch(SESSION_OPEN_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            sessionStart: sessionStartRef.current,
          }),
          cache: "no-store",
        })
        const raw = await res.text()
        if (!raw) {
          sessionOpenShown = true
          return
        }
        const data = JSON.parse(raw)
        const text = (data?.message ?? "").toString().trim()
        if (text) {
          setMessages(prev => [
            ...prev,
            {
              id: `session-open-${Date.now()}`,
              role: "assistant",
              content: text,
            },
          ])
        }
        sessionOpenShown = true
      } catch (e) {
        console.error("FRONTEND: session-open error", e)
      }
    })()
    sessionOpenPromiseRef.current = work
    await work
    sessionOpenPromiseRef.current = null
  }

  /* ---------- SEND MESSAGE ---------- */
  async function handleSend(text: string) {
    console.log("FRONTEND: sendMessage triggered");
    cancelPendingDelivery()
    const requestId = ++activeRequestIdRef.current
    const message = text
    console.log("FRONTEND: outgoing message =", message);
    await requestSessionOpenMessage()
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
    }
    setMessages(prev => [...prev, userMessage])
    setAhiTyping(true)

    try {
      console.log("FRONTEND: calling backend URL =", BACKEND_URL);
      const res = await fetch(CHAT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sessionId: sessionIdRef.current,
          sessionStart: sessionStartRef.current,
        }),
        cache: "no-store",
      })

      const raw = await res.text()
      if (!raw) {
        setAhiTyping(false)
        return
      }

      const data = JSON.parse(raw)
      if (requestId !== activeRequestIdRef.current) return

      const incoming = Array.isArray(data.messages) ? data.messages : []
      const responseMode = data.responseMode
      const allowMultiMessage =
        data.allowMultiMessage ??
        ["DEEP_EXPLANATION", "EMOTIONAL_SUPPORT", "SAFETY_CONTAINMENT"].includes(
          responseMode
        )

      if (!incoming.length) {
        setAhiTyping(false)
        return
      }

      if (!allowMultiMessage || incoming.length === 1) {
        setMessages(prev => [...prev, incoming[0]])
        setAhiTyping(false)
        return
      }

      const deliveryId = deliveryIdRef.current
      for (let i = 0; i < incoming.length; i += 1) {
        if (deliveryId !== deliveryIdRef.current) return
        const textChunk = normalizeMessageText(incoming[i])
        setAhiTyping(true)
        const ok = await wait(typingDelayFor(textChunk), deliveryId)
        if (!ok) return
        setMessages(prev => [...prev, incoming[i]])
        setAhiTyping(false)
        if (i < incoming.length - 1) {
          const okPause = await wait(pauseBetweenMessages(), deliveryId)
          if (!okPause) return
        }
      }
    } catch (e) {
      console.error("FRONTEND: chat request error", e)
    } finally {
      if (requestId === activeRequestIdRef.current) {
        setAhiTyping(false)
      }
    }
  }

  function toStoredMessage(
    message: ChatMessage,
    index: number,
    now: number
  ): StoredMessage | null {
    const normalizedText = (message?.text ?? message?.content ?? "")
      .toString()
      .trim()
    if (!normalizedText) return null

    const normalizedSender =
      message?.sender || (message?.role === "user" ? "user" : "ahi")

    return {
      id: String(message?.id ?? `${sessionIdRef.current}-${index}`),
      sender: normalizedSender === "user" ? "user" : "ahi",
      text: normalizedText,
      timestamp:
        typeof message?.timestamp === "number" ? message.timestamp : now,
    }
  }

  function persistConversation(nextMessages: ChatMessage[]) {
    const now = Date.now()
    const normalizedMessages = nextMessages
      .map((message, index) => toStoredMessage(message, index, now))
      .filter((message): message is StoredMessage => message !== null)

    console.log("Persisting messages count:", normalizedMessages.length)
    if (normalizedMessages.length === 0) return

    const conversation: Conversation = {
      id: sessionIdRef.current,
      messages: normalizedMessages,
      startedAt: sessionStartRef.current,
      lastUpdatedAt: now,
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
      if (nextMessages.length === 0) {
        startNewSession()
      }
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
    if (!sessionReady || messages.length === 0) return
    persistConversation(messages)
  }, [messages, sessionReady])

  useEffect(() => {
    return () => {
      persistConversation(messages)
    }
  }, [])

  /* ---------- SESSION OPEN ---------- */
  useEffect(() => {
    if (!sessionReady) return
    requestSessionOpenMessage()
  }, [sessionReady])

  useEffect(() => {
    return () => {
      exitDeleteMode()
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      const savedHeaderName = await AsyncStorage.getItem("headerName")
      if (savedHeaderName && savedHeaderName.trim()) {
        setHeaderName(savedHeaderName)
      }
    })()
  }, [])

  /* ------------------ RENDER ------------------ */
  return (
    <View style={{ flex: 1, backgroundColor: appBackground }}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: appBackground }}
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
          setActiveOverlay("history")
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
          backgroundColor: appBackground,
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
            disabled={false}
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
        onSave={async name => {
          const nextHeaderName = name.trim() || "AHI"
          setHeaderName(nextHeaderName)
          await AsyncStorage.setItem("headerName", nextHeaderName)
          setEditNameOpen(false)
        }}
      />

      {/* 🔥 PANELS MUST BE LAST 🔥 */}
      <LeftDrawer
        visible={leftOpen}
        onClose={() => setLeftOpen(false)}
        onPressAuth={() => {
          closeAllOverlays()
          navigation.navigate("Auth")
        }}
        onPressConnect={() => {
          setActiveOverlay("connect")
        }}
        onPressUnderstanding={() => {
          setActiveOverlay("understanding")
        }}
        onPressProfile={() => {
          setActiveOverlay("profile")
        }}
        accountName={accountName}
      />

      <HistoryPanel
        visible={activeOverlay === "history"}
        onClose={() => setActiveOverlay(null)}
      />

      <ConnectWithModal
        visible={activeOverlay === "connect"}
        onClose={() => setActiveOverlay(null)}
      />

      <UnderstandingLevelsModal
        visible={activeOverlay === "understanding"}
        onClose={() => setActiveOverlay(null)}
      />

      <SideOverlay
        visible={activeOverlay === "profile"}
        side="left"
        onClose={() => setActiveOverlay(null)}
      >
        <EditProfileModal
          visible={activeOverlay === "profile"}
          currentName={accountName || "You"}
          currentPhotoUrl={profilePhoto}
          onClose={() => setActiveOverlay(null)}
        />
      </SideOverlay>
      </SafeAreaView>

      <Text
        style={{
          position: "absolute",
          bottom: 8,
          alignSelf: "center",
          color: footerColor,
          fontSize: 11,
          opacity: 0.25,
        }}
      >
        You can chat in any language
      </Text>
    </View>
  )
}
