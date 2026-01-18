import AsyncStorage from "@react-native-async-storage/async-storage"

const KEY = "ahi_user_display_name"

// Get saved name
export async function getDisplayName(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEY)
  } catch {
    return null
  }
}

// Save name
export async function saveDisplayName(name: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, name)
  } catch {
    // silently fail for v1
  }
}
