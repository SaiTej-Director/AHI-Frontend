import React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import ChatScreen from "../screens/ChatScreen"
import AuthScreen from "../screens/AuthScreen"

const Stack = createNativeStackNavigator()

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Chat"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
