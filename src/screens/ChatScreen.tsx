import React, { useEffect, useRef, useState } from "react"
import { View } from "react-native"

import ChatHeader from "../components/header/ChatHeader"
import MessageList from "../components/chat/MessageList"
import InputBar from "../components/chat/InputBar"
import TypingIndicator from "../components/chat/TypingIndicator"
import EditNameModal from "../components/modals/EditNameModal"
import HistoryPanel from "../components/history/HistoryPanel"
import LeftDrawer from "../components/drawers/LeftDrawer"

import { getDisplayName, saveDisplayName } from "../storage/userProfile"
import {
  saveConversation,
  Conversation,
  Message,
} from "../storage/history"

/* -----------------------------
   Helpers
------------------------------ */

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/* -----------------------------
   Component
------------------------------ */

export default function ChatScreen() {
  /* ---------- USER ---------- */
  const [displayName, setDisplayName] = useState("You")
  const [editNameOpen, setEditNameOpen] = useState(false)

  useEffect(() => {
    getDisplayName().then(n => n && setDisplayName(n))
  }, [])

  /* ---------- DRAWERS ---------- */
  const [leftOpen, setLeftOpen] = useState(false)
  const [rightOpen, setRightOpen] = useState(false)

  /* ---------- SESSION ---------- */
  const sessionIdRef = useRef(genId())
  const sessionStartRef = useRef(Date.now())

  /* ---------- CHAT ---------- */
  const [messages, setMessages] = useState<Message[]>([
    {
      id: genId(),
      sender: "ahi",
      text: "Hey. I’m here.",
      timestamp: Date.now(),
    },
  ])

  /* ---------- SELECTION (required by MessageList) ---------- */
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  function onToggleSelect(id: string) {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    )
  }

  /* ---------- TYPING ---------- */
  const [ahiTyping, setAhiTyping] = useState(false)

  function handleSend(text: string) {
    const userMsg: Message = {
      id: genId(),
      sender: "user",
      text,
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMsg])

    setAhiTyping(true)

    setTimeout(() => {
      const ahiMsg: Message = {
        id: genId(),
        sender: "ahi",
        text: "I’m listening.",
        timestamp: Date.now(),
      }

      setMessages(prev => [...prev, ahiMsg])
      setAhiTyping(false)
    }, 1200)
  }

  /* ---------- SAVE SESSION ON UNMOUNT ---------- */
  useEffect(() => {
    return () => {
      const conversation: Conversation = {
        id: sessionIdRef.current,
        messages,
        startedAt: sessionStartRef.current,
        lastUpdatedAt: Date.now(),
      }

      saveConversation(conversation)
    }
  }, [messages])

return (
  <View style={{ flex: 1, backgroundColor: "#121212" }}>
    {/* LEFT PANEL */}
    <LeftDrawer visible={leftOpen} onClose={() => setLeftOpen(false)} />

    {/* TOP BAR */}
    <ChatHeader
      title={displayName}
      showDelete={false}
      onDelete={() => {}}
      onLeftPress={() => setLeftOpen(true)}
      onRightPress={() => setRightOpen(true)}
    />

    {/* CHAT BODY */}
    <View style={{ flex: 1 }}>
      <MessageList
        messages={messages}
        selectedIds={selectedIds}
        onToggleSelect={onToggleSelect}
      />

      <TypingIndicator visible={ahiTyping} />

      <InputBar onSend={handleSend} disabled={ahiTyping} />
    </View>

    {/* RIGHT PANEL */}
    <HistoryPanel
      visible={rightOpen}
      onClose={() => setRightOpen(false)}
    />
  </View>
)

}
