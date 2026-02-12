import AsyncStorage from "@react-native-async-storage/async-storage"
import Constants from "expo-constants"
import { getApp, getApps, initializeApp } from "firebase/app"
import { getReactNativePersistence, initializeAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey ?? "",
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain ?? "",
  projectId: Constants.expoConfig?.extra?.firebaseProjectId ?? "",
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket ?? "",
  messagingSenderId:
    Constants.expoConfig?.extra?.firebaseMessagingSenderId ?? "",
  appId: Constants.expoConfig?.extra?.firebaseAppId ?? "",
}

console.log("Firebase config loaded:", firebaseConfig)

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
})
