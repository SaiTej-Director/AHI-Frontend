export type Message = {
  id: string
  sender: "user" | "ahi"
  text: string
}

export type ActionState = {
  selectedIds: string[]
  selectionMode: boolean
}

// Long press ALWAYS starts selection
export function handleLongPress(
  messageId: string
): ActionState {
  return {
    selectionMode: true,
    selectedIds: [messageId]
  }
}

// Tap toggles ONLY if selection mode is active
export function handleTap(
  state: ActionState,
  messageId: string
): ActionState {
  if (!state.selectionMode) return state

  if (state.selectedIds.includes(messageId)) {
    const remaining = state.selectedIds.filter(id => id !== messageId)
    return {
      selectionMode: remaining.length > 0,
      selectedIds: remaining
    }
  }

  return {
    selectionMode: true,
    selectedIds: [...state.selectedIds, messageId]
  }
}

export function cancelSelection(): ActionState {
  return {
    selectionMode: false,
    selectedIds: []
  }
}

export function deleteSelectedMessages(
  messages: Message[],
  selectedIds: string[]
): Message[] {
  return messages.filter(m => !selectedIds.includes(m.id))
}
