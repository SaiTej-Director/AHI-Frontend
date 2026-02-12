import React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import ChatScreen from "../screens/ChatScreen"
import AuthScreen from "../screens/AuthScreen"
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen"
import TermsScreen from "../screens/TermsScreen"

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
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
