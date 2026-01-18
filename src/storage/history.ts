import AsyncStorage from "@react-native-async-storage/async-storage"

/* -----------------------------
   Types
------------------------------ */

export type Message = {
  id: string
  sender: "user" | "ahi"
  text: string
  timestamp: number
}

export type Conversation = {
  id: string
  messages: Message[]
  startedAt: number
  lastUpdatedAt: number
}

/* -----------------------------
   Constants
------------------------------ */

const STORAGE_KEY = "ahi_conversations_v1"

/* -----------------------------
   Storage API
------------------------------ */

export async function loadHistory(): Promise<Conversation[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch (e) {
    console.warn("Failed to load history", e)
    return []
  }
}

export async function saveConversation(
  conversation: Conversation
): Promise<void> {
  const existing = await loadHistory()

  const filtered = existing.filter(c => c.id !== conversation.id)

  const updated = [conversation, ...filtered]

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updated)
  )

  console.log("🟢 SESSION SAVED:", {
    id: conversation.id,
    messages: conversation.messages.map(m => m.sender),
  })
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY)
}
