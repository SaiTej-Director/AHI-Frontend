export type ChatMessage = {
  id: string
  sender: "user" | "ahi"
  text: string
  timestamp: number
}

export type Session = {
  sessionId: string
  createdAt: number
  messages: ChatMessage[]
}
