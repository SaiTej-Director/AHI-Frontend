import React, { useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import { useAuth } from "../../auth/AuthContext"
import { updateProfile } from "firebase/auth"
import { auth } from "../../firebase/config"

type Props = {
  visible: boolean
  currentName: string
  currentPhotoUrl?: string | null
  onClose: () => void
}

export default function EditProfileModal({
  visible,
  currentName,
  currentPhotoUrl,
  onClose,
}: Props) {
  const { refreshAuthUserProfile, logout } = useAuth()
  const [newName, setNewName] = useState(currentName)
  const [newPhotoUrl, setNewPhotoUrl] = useState<string | null>(
    currentPhotoUrl || null
  )
  const [busy, setBusy] = useState(false)
  const [logoutBusy, setLogoutBusy] = useState(false)

  const previewPhoto = useMemo(() => newPhotoUrl || null, [newPhotoUrl])

  useEffect(() => {
    if (!visible) return
    setNewName(currentName || "You")
    setNewPhotoUrl(currentPhotoUrl || null)
  }, [visible, currentName, currentPhotoUrl])

  async function handleChangePhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) return

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.9,
    })

    if (result.canceled) return
    const selectedUri = result.assets?.[0]?.uri
    if (!selectedUri) return
    setNewPhotoUrl(selectedUri)
  }

  async function handleSave() {
    if (busy) return
    const trimmedName = newName.trim() || "You"
    setBusy(true)

    try {
      if (auth.currentUser) {
        const finalPhoto = newPhotoUrl || null
        await updateProfile(auth.currentUser, {
          displayName: trimmedName,
          photoURL: finalPhoto,
        })
        await auth.currentUser.reload()
        await refreshAuthUserProfile(
          auth.currentUser.displayName,
          auth.currentUser.photoURL
        )
      } else {
        await refreshAuthUserProfile(trimmedName, newPhotoUrl || null)
      }
      onClose()
    } finally {
      setBusy(false)
    }
  }

  async function handleLogout() {
    if (busy || logoutBusy) return
    setLogoutBusy(true)
    try {
      await logout()
      onClose()
    } finally {
      setLogoutBusy(false)
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Edit profile</Text>

          <TextInput
            value={newName}
            onChangeText={setNewName}
            autoFocus
            placeholder="Your name"
            placeholderTextColor="#777"
            editable={!busy && !logoutBusy}
            style={styles.input}
          />

          <View style={styles.photoRow}>
            {previewPhoto ? (
              <Image source={{ uri: previewPhoto }} style={styles.photoCircle} />
            ) : (
              <View style={styles.photoCirclePlaceholder} />
            )}
            <Pressable
              disabled={busy || logoutBusy}
              style={[styles.ghostBtn, (busy || logoutBusy) && styles.disabledBtn]}
              onPress={handleChangePhoto}
            >
              <Text style={styles.ghostBtnText}>Change Photo</Text>
            </Pressable>
          </View>

          <View style={styles.actions}>
            <Pressable
              disabled={busy || logoutBusy}
              onPress={onClose}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              disabled={busy || logoutBusy}
              onPress={handleSave}
              style={[styles.saveBtn, (busy || logoutBusy) && styles.disabledBtn]}
            >
              {busy ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.logoutSection}>
            <View style={styles.divider} />
            <Pressable
              disabled={busy || logoutBusy}
              onPress={handleLogout}
              style={[styles.logoutBtn, (busy || logoutBusy) && styles.disabledBtn]}
            >
              {logoutBusy ? (
                <ActivityIndicator color="#D48383" size="small" />
              ) : (
                <Text style={styles.logoutText}>Logout</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#181818",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#262626",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 14,
  },
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },
  photoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  photoCirclePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "transparent",
  },
  ghostBtn: {
    backgroundColor: "#1F1F1F",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2D2D2D",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  ghostBtnText: {
    color: "#EAEAEA",
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 14,
    backgroundColor: "#121212",
    marginBottom: 14,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  logoutSection: {
    marginTop: 22,
  },
  divider: {
    height: 1,
    backgroundColor: "#2A2A2A",
    marginBottom: 14,
  },
  logoutBtn: {
    width: "100%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#5A3636",
    backgroundColor: "rgba(136, 72, 72, 0.08)",
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: "#D48383",
    fontSize: 14,
    fontWeight: "600",
  },
  disabledBtn: {
    opacity: 0.72,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  cancelText: {
    color: "#AFAFAF",
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: "#2B2B2B",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 84,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
})
