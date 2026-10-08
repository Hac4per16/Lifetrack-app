import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "@/contexts/AuthContext";
import LoginScreen from "@/screens/auth/LoginScreen";
import SignupScreen from "@/screens/auth/SignupScreen";
import TabNavigator from "@/navigation/TabNavigator";
import ConversationScreen from "@/screens/ConversationScreen";
import FamilyConnectScreen from "@/screens/FamilyConnectScreen";
import HealthScreen from "@/screens/category/HealthScreen";
import FinanceScreen from "@/screens/category/FinanceScreen";
import GoalsScreen from "@/screens/category/GoalsScreen";

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  MainTabs: undefined;
  Conversation: { conversationId: string; title: string };
  FamilyConnect: undefined;
  Health: undefined;
  Finance: undefined;
  Goals: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) return null; // could render a splash/loading screen here

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShadowVisible: false }}>
        {!session ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ title: "Create account" }} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="Conversation" component={ConversationScreen} options={({ route }) => ({ title: route.params.title })} />
            <Stack.Screen name="FamilyConnect" component={FamilyConnectScreen} options={{ title: "Connect family" }} />
            <Stack.Screen name="Health" component={HealthScreen} options={{ title: "Health" }} />
            <Stack.Screen name="Finance" component={FinanceScreen} options={{ title: "Finance" }} />
            <Stack.Screen name="Goals" component={GoalsScreen} options={{ title: "Goals" }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
