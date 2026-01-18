// ConversationManager.ts
// v1.1 — owns conversation lifecycle and persistence

import { saveConversation } from "../storage/history"

export type Message = {
  id: string
  sender: "user" | "ahi"
  text: string
}

export type Conversation = {
  id: string
  date: string
  messages: Message[]
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export class ConversationManager {
  private conversation: Conversation | null = null

  /* ---------- LIFECYCLE ---------- */

  openNewConversation() {
    this.conversation = {
      id: this.generateId(),
      date: today(),
      messages: []
    }
  }

  appendMessage(message: Message) {
    if (!this.conversation) {
      throw new Error("Conversation not initialized")
    }
    this.conversation.messages.push(message)
  }

  getMessages(): Message[] {
    return this.conversation ? [...this.conversation.messages] : []
  }

  closeConversation() {
    if (!this.conversation) return

    // do not save empty conversations
    if (this.conversation.messages.length > 0) {
      saveConversation(this.conversation)
    }

    this.conversation = null
  }

  /* ---------- INTERNAL ---------- */

  private generateId(): string {
    return (
      Date.now().toString() +
      "-" +
      Math.random().toString(36).slice(2)
    )
  }
}
