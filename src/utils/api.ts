import { API_BASE_URL } from "../config/api"

async function fetchWithTimeout(input: RequestInfo, init?: RequestInit, timeoutMs = 15000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(input, { ...init, signal: controller.signal })
    return res
  } finally {
    clearTimeout(id)
  }
}

export async function apiPost<T>(
  path: string,
  body: any,
  token?: string | null
): Promise<T> {
  const res = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  console.log("AUTH RAW RESPONSE:", text)
  try {
    return JSON.parse(text) as T
  } catch (e) {
    throw new Error("Auth API did not return JSON")
  }
}

export async function apiGet<T>(
  path: string,
  token?: string | null
): Promise<T> {
  const res = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  const text = await res.text()
  console.log("AUTH RAW RESPONSE:", text)
  try {
    return JSON.parse(text) as T
  } catch (e) {
    throw new Error("Auth API did not return JSON")
  }
}

