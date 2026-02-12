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

export async function clearAllConversations(): Promise<void> {
  await clearHistory()
}

export async function deleteByPredicate(
  predicate: (c: Conversation) => boolean
): Promise<void> {
  const existing = await loadHistory()
  const filtered = existing.filter(c => !predicate(c))
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

export async function deleteConversation(id: string): Promise<void> {
  await deleteByPredicate(c => c.id === id)
}

/* -----------------------------
   Helpers
------------------------------ */

function getDayBoundaries() {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const startOfYesterday = startOfToday.getTime() - 24 * 60 * 60 * 1000
  return { startOfToday: startOfToday.getTime(), startOfYesterday }
}

export function getTodaySessions(
  conversations: Conversation[]
): Conversation[] {
  const { startOfToday } = getDayBoundaries()
  return conversations.filter(c => c.lastUpdatedAt >= startOfToday)
}

export function getYesterdaySessions(
  conversations: Conversation[]
): Conversation[] {
  const { startOfToday, startOfYesterday } = getDayBoundaries()
  return conversations.filter(
    c =>
      c.lastUpdatedAt >= startOfYesterday && c.lastUpdatedAt < startOfToday
  )
}

export function getEarlierSessions(
  conversations: Conversation[]
): Conversation[] {
  const { startOfYesterday } = getDayBoundaries()
  return conversations.filter(c => c.lastUpdatedAt < startOfYesterday)
}