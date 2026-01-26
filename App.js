import React, { useEffect } from "react";
import RootNavigator from "./src/navigation/RootNavigator";
import * as Updates from "expo-updates";
import { AuthProvider } from "./src/auth/AuthContext";

async function safeOTA() {
  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  } catch (e) {
    // OTA failed — app continues normally
    console.log("OTA skipped");
  }
}

export default function App() {
  useEffect(() => {
    safeOTA(); // runs once when app launches
  }, []);

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
