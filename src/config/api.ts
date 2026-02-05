import { Platform } from "react-native"

// Simple configuration: set your computer's local IP here for mobile development
// For web: uses localhost automatically
// For mobile: uses the IP below (change this when your network changes)
const MOBILE_BACKEND_IP = "192.168.100.3" // ← CHANGE THIS TO YOUR COMPUTER'S LOCAL IP

const BACKEND_HOST = Platform.OS === "web" ? "localhost" : MOBILE_BACKEND_IP

export const API_BASE_URL = `http://${BACKEND_HOST}:3001`
export const CHAT_API_URL = `http://${BACKEND_HOST}:3004/chat`
export const SESSION_OPEN_API_URL = `http://${BACKEND_HOST}:3004/session-open`

